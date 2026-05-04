export function parseBaseClasses(classString: string): string[] {
  return classString
    .split(/\s+/)
    .filter(cls => cls.length > 0 && !cls.includes(':'))
}