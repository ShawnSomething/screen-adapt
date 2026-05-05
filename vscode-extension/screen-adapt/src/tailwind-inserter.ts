import type { ClassNameInfo } from './jsx-class-detector'

export function hasExistingVariants(
  classes: string,
  breakpoints: Map<string, string>,
): boolean {
  const names = new Set(breakpoints.keys())
  return classes.split(/\s+/).some(cls => {
    const colon = cls.indexOf(':')
    return colon !== -1 && names.has(cls.slice(0, colon))
  })
}

export function insertVariants(
  text: string,
  info: ClassNameInfo,
  variants: string[],
): string {
  const { classes, start, end } = info
  const updated = classes.trimEnd() + ' ' + variants.join(' ')
  return text.slice(0, start) + updated + text.slice(end)
}

const CHECK_MARKER = '// screen-adapt: review these classes'

function findReturnClose(text: string): number {
  const returnMatch = /\breturn\s*\(/.exec(text)
  if (!returnMatch) return -1

  let depth = 0
  for (let i = returnMatch.index + returnMatch[0].length - 1; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')') {
      if (--depth === 0) return i
    }
  }
  return -1
}

export function insertCheckComment(text: string, flagged: string[]): string {
  if (flagged.length === 0) return text

  const comment = `${CHECK_MARKER}\n// ${flagged.join(', ')}`

  const existing = text.indexOf(CHECK_MARKER)
  if (existing !== -1) {
    const lineEnd = text.indexOf('\n', text.indexOf('\n', existing) + 1)
    const end = lineEnd !== -1 ? lineEnd : text.length
    const stripped = text.slice(0, existing) + text.slice(end).replace(/^\n/, '')
    return insertCheckComment(stripped, flagged)
  }

  const closeIdx = findReturnClose(text)
  if (closeIdx === -1) return text + '\n' + comment

  const indented = comment.split('\n').map(l => '  ' + l).join('\n')
  return text.slice(0, closeIdx + 1) + '\n' + indented + text.slice(closeIdx + 1)
}