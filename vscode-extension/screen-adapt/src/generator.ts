import { CSSProperty } from './properties'
import { ScreenMap } from './parser'

// Base desktop viewport width in px
const BASE_VIEWPORT = 1440

// Extract numeric value and unit from a CSS value string
function parseNumeric(value: string): { num: number; unit: string } | null {
    const match = value.match(/^([\d.]+)(px|em|rem|vw|vh|%)$/)
    if (!match) return null
    return { num: parseFloat(match[1]), unit: match[2] }
}

// Extract the max-width px value from a media query string
function extractMaxWidth(mediaQuery: string): number | null {
    const match = mediaQuery.match(/max-width:\s*([\d.]+)(px|em)/)
    if (!match) return null
    const value = parseFloat(match[1])
    const unit = match[2]
    // Convert em to px (assume 16px base)
    return unit === 'em' ? value * 16 : value
}

const MATH_PROPERTIES = new Set([
    'width', 'height', 'padding', 'margin', 'max-width', 'max-height', 'font-size'
])

const TEMPLATE_PROPERTIES = new Set([
    'grid-template-columns', 'flex-direction', 'display'
])

function scaleProperty(prop: CSSProperty, targetWidth: number): string {
    const parsed = parseNumeric(prop.value)
    if (!parsed) return prop.value

    const { num, unit } = parsed

    if (unit === 'px') {
        if (prop.name === 'width' || prop.name === 'max-width') {
            const vw = Math.min(Math.round((num / targetWidth) * 100), 100)
            return `${vw}vw`
        }
        if (prop.name === 'height' || prop.name === 'max-height') {
            const vh = Math.min(Math.round((num / targetWidth) * 100), 100)
            return `${vh}vh`
        }
        if (prop.name === 'font-size') {
            const scaled = ((num * (targetWidth / BASE_VIEWPORT)) / 16).toFixed(2)
            return `${scaled}em`
        }
        // padding, margin → em, scaled to target
        const em = ((num / 16) * (targetWidth / BASE_VIEWPORT)).toFixed(2)
        return `${em}em`
    }

    return `${num}${unit}`
}

function templateProperty(prop: CSSProperty, screenName: string): string | null {
    const isMobile = screenName.includes('mob')

    if (prop.name === 'grid-template-columns') {
        return isMobile ? '1fr' : 'repeat(2, 1fr)'
    }

    if (prop.name === 'flex-direction' && prop.value === 'row') {
        return isMobile ? 'column' : 'row'
    }

    if (prop.name === 'display' && prop.value === 'grid') {
        return 'grid'
    }

    return null
}

export type GeneratedBlock = {
    screenName: string
    properties: { name: string; value: string; comment?: string }[]
}

export function generateVariants(
    properties: CSSProperty[],
    screens: ScreenMap
): GeneratedBlock[] {
    const blocks: GeneratedBlock[] = []

    for (const [screenName, mediaQuery] of screens) {
        const targetWidth = extractMaxWidth(mediaQuery)
        const scaleFactor = targetWidth ? targetWidth / BASE_VIEWPORT : 0.5

        const generated = properties.map((prop) => {
            if (MATH_PROPERTIES.has(prop.name)) {
                const target = targetWidth ?? BASE_VIEWPORT / 2
                return { name: prop.name, value: scaleProperty(prop, target) }
            }

            if (TEMPLATE_PROPERTIES.has(prop.name)) {
                const templated = templateProperty(prop, screenName)
                if (templated) {
                    return { name: prop.name, value: templated }
                }
            }

            return { name: prop.name, value: prop.value, comment: 'check sizing' }
        })

        blocks.push({ screenName, properties: generated })
    }

    return blocks
}