const BASE_VIEWPORT_EM = 90

const SPACING_SCALE = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14,
  16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
]

const TEXT_SCALE = [
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
]

function toRem(n: number): number {
  return n * 0.25
}

function nearestSpacing(targetRem: number): number {
  return SPACING_SCALE.reduce((best, s) =>
    Math.abs(toRem(s) - targetRem) < Math.abs(toRem(best) - targetRem) ? s : best
  )
}

function isNumeric(s: string): boolean {
  return /^[\d.]+$/.test(s)
}

function scaleSpacing(prefix: string, size: string, factor: number): string {
  if (!isNumeric(size)) return `${prefix}-${size} /* check */`
  return `${prefix}-${nearestSpacing(toRem(parseFloat(size)) * factor)}`
}

function scaleWidth(size: string, factor: number, bpEm: number): string {
  const special = ['full', 'screen', 'auto', 'min', 'max', 'fit']
  if (special.includes(size)) return `w-${size}`
  if (size.includes('/') || !isNumeric(size)) return `w-${size} /* check */`

  const scaledRem = toRem(parseFloat(size)) * factor
  if (scaledRem >= bpEm * 0.85) return 'w-full'
  return `w-${nearestSpacing(scaledRem)}`
}

function scaleHeight(size: string, factor: number): string {
  const special = ['full', 'screen', 'auto', 'min', 'max', 'fit', 'svh', 'dvh', 'lvh']
  if (special.includes(size)) return `h-${size}`
  if (!isNumeric(size)) return `h-${size} /* check */`
  return `h-${nearestSpacing(toRem(parseFloat(size)) * factor)}`
}

function scaleText(size: string, stepDown: number): string {
  const idx = TEXT_SCALE.indexOf(size)
  if (idx === -1) return `text-${size} /* check */`
  return `text-${TEXT_SCALE[Math.max(0, idx - stepDown)]}`
}

function generateClass(
  cls: string,
  factor: number,
  stepDown: number,
  bpEm: number,
  bpIndex: number,
): string {
  const w = cls.match(/^w-(.+)$/)
  if (w) return scaleWidth(w[1], factor, bpEm)

  const h = cls.match(/^h-(.+)$/)
  if (h) return scaleHeight(h[1], factor)

  const minMaxH = cls.match(/^(min-h|max-h)-(.+)$/)
  if (minMaxH) {
    if (!isNumeric(minMaxH[2])) return `${cls} /* check */`
    return `${minMaxH[1]}-${nearestSpacing(toRem(parseFloat(minMaxH[2])) * factor)}`
  }

  const maxW = cls.match(/^max-w-(.+)$/)
  if (maxW) {
    if (!isNumeric(maxW[1])) return `${cls} /* check */`
    return `max-w-${nearestSpacing(toRem(parseFloat(maxW[1])) * factor)}`
  }

  const spacing = cls.match(/^([pm][xytbrl]?)-(.+)$/)
  if (spacing) return scaleSpacing(spacing[1], spacing[2], factor)

  const text = cls.match(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)
  if (text) return scaleText(text[1], stepDown)

  const gridCols = cls.match(/^grid-cols-(\d+)$/)
  if (gridCols) {
    if (bpIndex === 0) return 'grid-cols-1'
    if (bpIndex === 1) return 'grid-cols-2'
    return cls
  }

  if (cls === 'flex-row') return bpIndex === 0 ? 'flex-col' : 'flex-row'
  if (cls === 'flex-col') return 'flex-col'

  return `${cls} /* check */`
}

export function generateTailwindVariants(
  baseClasses: string[],
  breakpoints: Map<string, string>,
): string[] {
  const bpList = [...breakpoints.entries()].map(([name, em]) => ({
    name,
    em: parseFloat(em),
  }))

  const total = bpList.length
  const result: string[] = []

  for (let i = 0; i < bpList.length; i++) {
    const { name, em } = bpList[i]
    const factor = em / BASE_VIEWPORT_EM
    const stepDown = total - i

    for (const cls of baseClasses) {
      result.push(`${name}:${generateClass(cls, factor, stepDown, em, i)}`)
    }
  }

  return result
}