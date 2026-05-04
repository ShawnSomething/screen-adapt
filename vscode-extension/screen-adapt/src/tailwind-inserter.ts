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