import type { ClassNameInfo } from './jsx-class-detector'
import { parseBaseClasses } from './tailwind-class-parser'
import { generateTailwindVariants } from './tailwind-generator'
import { hasExistingVariants, insertVariants, insertCheckComment } from './tailwind-inserter'

const COMMENT_MARKER = '/* screen-adapt: skipped elements'

function findAllClassNames(text: string): ClassNameInfo[] {
  const pattern = /className\s*=\s*(?:\{\s*)?(['"])(.*?)\1(?:\s*\})?/g
  const results: ClassNameInfo[] = []
  let m: RegExpExecArray | null

  while ((m = pattern.exec(text)) !== null) {
    const quote = m[1]
    const classes = m[2]
    const start = m.index + m[0].indexOf(quote) + 1
    const end = start + classes.length
    results.push({ classes, start, end })
  }

  return results
}

function getTagName(text: string, matchIndex: number): string {
  const preceding = text.slice(0, matchIndex)
  const lastOpen = preceding.lastIndexOf('<')
  if (lastOpen === -1) return 'element'
  const tag = text.slice(lastOpen + 1).match(/^(\w[\w.-]*)/)
  return tag ? tag[1] : 'element'
}

function buildComment(skipped: Array<{ tag: string; preview: string }>): string {
  if (skipped.length === 0) return ''
  const lines = skipped
    .map(({ tag, preview }) => `   <${tag} className="${preview}">`)
    .join('\n')
  return `${COMMENT_MARKER} (already have variants)\n${lines}\n*/`
}

function findAfterImports(text: string): number {
  const lines = text.split('\n')
  let lastImportLine = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s/.test(lines[i])) lastImportLine = i
  }
  if (lastImportLine === -1) return 0
  return lines.slice(0, lastImportLine + 1).join('\n').length + 1
}

function insertOrReplaceComment(text: string, comment: string): string {
  const existing = text.indexOf(COMMENT_MARKER)

  if (existing !== -1) {
    const closeIdx = text.indexOf('*/}', existing)
    const end = closeIdx !== -1 ? closeIdx + 3 : existing
    const stripped = text.slice(0, existing) + text.slice(end).replace(/^\n/, '')
    return comment ? insertOrReplaceComment(stripped, comment) : stripped
  }

  if (!comment) return text
  const insertAt = findAfterImports(text)
  return text.slice(0, insertAt) + comment + '\n' + text.slice(insertAt)
}

export function globalScan(text: string, breakpoints: Map<string, string>): string {
  const allClassNames = findAllClassNames(text)

  const toProcess: ClassNameInfo[] = []
  const skipped: Array<{ tag: string; preview: string }> = []

  for (const info of allClassNames) {
    if (hasExistingVariants(info.classes, breakpoints)) {
      const preview =
        info.classes.length > 80 ? info.classes.slice(0, 80) + '...' : info.classes
      const tag = getTagName(text, info.start)
      skipped.push({ tag, preview })
    } else {
      toProcess.push(info)
    }
  }

  // Process highest offset first so earlier positions stay valid
  toProcess.sort((a, b) => b.start - a.start)

  let result = text
  const allFlagged = new Set<string>()

  for (const info of toProcess) {
    const baseClasses = parseBaseClasses(info.classes)
    if (baseClasses.length === 0) continue
    const { variants, flagged } = generateTailwindVariants(baseClasses, breakpoints)
    flagged.forEach(f => allFlagged.add(f))
    result = insertVariants(result, info, variants)
  }

  result = insertOrReplaceComment(result, buildComment(skipped))
  return insertCheckComment(result, [...allFlagged])
}