export interface ClassNameInfo {
  classes: string
  start: number
  end: number
}

export function getClassNameAtCursor(text: string, offset: number): ClassNameInfo | null {
  const pattern = /className\s*=\s*(?:\{\s*)?(['"])(.*?)\1(?:\s*\})?/g
  let m: RegExpExecArray | null

  while ((m = pattern.exec(text)) !== null) {
    const quote = m[1]
    const classes = m[2]
    const start = m.index + m[0].indexOf(quote) + 1
    const end = start + classes.length

    if (offset >= start && offset <= end) {
      return { classes, start, end }
    }
  }

  return null
}