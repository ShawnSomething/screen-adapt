export const DEFAULT_SCREENS_BLOCK = `@screens {
  mob-ver: (max-width: 30em) and (orientation: portrait);      /* ~480px */
  mob-hor: (max-width: 52.75em) and (orientation: landscape);  /* ~844px */
  tab-ver: (max-width: 64em) and (orientation: portrait);      /* ~1024px */
  tab-hor: (max-width: 64em) and (orientation: landscape);     /* ~1024px */
  desk-ver: (min-width: 65em) and (orientation: portrait);     /* ~1040px */
}\n\n`

export function hasScreensBlock(text: string): boolean {
    return text.includes('@screens')
}

export function insertScreensBlock(text: string): string {
    return DEFAULT_SCREENS_BLOCK + text
}