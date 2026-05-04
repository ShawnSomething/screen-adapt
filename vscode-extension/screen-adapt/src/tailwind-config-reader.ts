import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export class TailwindConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TailwindConfigError'
  }
}

const UNREADABLE =
  "Screen Adapt couldn't read your Tailwind config. Define `theme.screens` as a plain object to use this feature."

function workspaceRoot(): string {
  const folders = vscode.workspace.workspaceFolders
  if (!folders?.length) throw new TailwindConfigError('No workspace open.')
  return folders[0].uri.fsPath
}

function resolveConfigPath(): string {
  const root = workspaceRoot()
  for (const name of ['tailwind.config.ts', 'tailwind.config.js']) {
    const p = path.join(root, name)
    if (fs.existsSync(p)) return p
  }
  throw new TailwindConfigError('No Tailwind config found in workspace root.')
}

function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
}

function extractBlock(text: string, openIndex: number): string {
  let depth = 0
  let i = openIndex
  while (i < text.length) {
    const ch = text[i]
    if (ch === '"' || ch === "'") {
      const quote = ch
      i++
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i++ 
        i++
      }
    } else if (ch === '`') {
      i++
      while (i < text.length && text[i] !== '`') {
        if (text[i] === '\\') i++
        i++
      }
    } else if (ch === '{') {
      depth++
    } else if (ch === '}') {
      if (--depth === 0) return text.slice(openIndex, i + 1)
    }
    i++
  }
  throw new TailwindConfigError(UNREADABLE)
}

function findKeyBlock(text: string, key: string): string | null {
  const pattern = new RegExp(`['"]?${key}['"]?\\s*:\\s*\\{`)
  const match = pattern.exec(text)
  if (!match) return null
  return extractBlock(text, match.index + match[0].length - 1)
}

function findScreensBlock(text: string): string {
  const themeBlock = findKeyBlock(text, 'theme')
  if (!themeBlock) throw new TailwindConfigError(UNREADABLE)

  const extendBlock = findKeyBlock(themeBlock, 'extend')
  const themeWithoutExtend = extendBlock
    ? themeBlock.replace(extendBlock, '')
    : themeBlock

  const direct = findKeyBlock(themeWithoutExtend, 'screens')
  if (direct) return direct

  if (extendBlock) {
    const extended = findKeyBlock(extendBlock, 'screens')
    if (extended) return extended
  }

  throw new TailwindConfigError(UNREADABLE)
}

function toEm(raw: string): string | null {
  const px = raw.match(/^([\d.]+)px$/)
  if (px) return `${parseFloat(px[1]) / 16}em`

  if (/^[\d.]+em$/.test(raw)) return raw

  const rem = raw.match(/^([\d.]+)rem$/)
  if (rem) return `${rem[1]}em`

  return null
}

function parseScreensBlock(block: string): Map<string, string> {
  if (/\.\.\.[a-zA-Z_$]/.test(block)) throw new TailwindConfigError(UNREADABLE)
  if (/require\s*\(|import\s*\(/.test(block)) throw new TailwindConfigError(UNREADABLE)

  const screens = new Map<string, string>()

  const kv = /['"]?(\w+)['"]?\s*:\s*(?:'([^']*)'|"([^"]*)"|\{([^}]*)\})/g
  let m: RegExpExecArray | null

  while ((m = kv.exec(block)) !== null) {
    const key = m[1]
    const simple = m[2] ?? m[3] 
    const obj = m[4]        

    if (simple !== undefined) {
      const em = toEm(simple)
      if (em) screens.set(key, em)
    } else if (obj !== undefined) {
      const minMatch = obj.match(/['"]?min['"]?\s*:\s*['"]([^'"]+)['"]/)
      if (minMatch) {
        const em = toEm(minMatch[1])
        if (em) screens.set(key, em)
      }
    }
  }

  return screens
}

export function readTailwindBreakpoints(): Map<string, string> {
  const configPath = resolveConfigPath()
  const raw = fs.readFileSync(configPath, 'utf-8')
  const cleaned = stripComments(raw)

  const screensBlock = findScreensBlock(cleaned)
  const screens = parseScreensBlock(screensBlock)

  if (screens.size === 0) throw new TailwindConfigError(UNREADABLE)

  return new Map(
    [...screens.entries()].sort(
      (a, b) => parseFloat(a[1]) - parseFloat(b[1])
    )
  )
}