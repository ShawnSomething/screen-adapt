import { parseScreens, ScreenMap } from './parser'
import { getPropertiesFromSelector } from './properties'
import { generateVariants } from './generator'
import { hasExistingVariants, insertVariants } from './inserter'

const SKIP_COMMENT_START = '/* screen-adapt: skipped selectors (already have variants)'
const SKIP_COMMENT_END = '*/'

export function getAllSelectors(text: string): string[] {
    const selectors: string[] = []
    const lines = text.split('\n')

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue
        if (!trimmed.endsWith('{')) continue

        const selector = trimmed.replace('{', '').trim()
        if (selector) selectors.push(selector)
    }

    return selectors
}

function removeExistingSkipComment(text: string): string {
    const start = text.indexOf(SKIP_COMMENT_START)
    if (start === -1) return text

    const end = text.indexOf(SKIP_COMMENT_END, start)
    if (end === -1) return text

    return text.slice(0, start) + text.slice(end + SKIP_COMMENT_END.length)
}

function buildSkipComment(skipped: string[]): string {
    if (skipped.length === 0) return ''
    const lines = skipped.map(s => `   ${s}`).join('\n')
    return `${SKIP_COMMENT_START}\n${lines}\n${SKIP_COMMENT_END}\n`
}

function insertSkipComment(text: string, comment: string): string {
    // Find the end of the @screens block
    const screensIndex = text.indexOf('@screens')
    if (screensIndex === -1) return text

    const openBrace = text.indexOf('{', screensIndex)
    if (openBrace === -1) return text

    let depth = 1
    let i = openBrace + 1

    while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++
        if (text[i] === '}') depth--
        i++
    }

    // i is just after the closing brace of @screens
    return text.slice(0, i) + '\n' + comment + text.slice(i)
}

export function globalScan(text: string, screens: ScreenMap): string {
    let result = removeExistingSkipComment(text)

    const selectors = getAllSelectors(result)
    const skipped: string[] = []

    for (const selector of selectors) {
        if (hasExistingVariants(result, selector)) {
            skipped.push(selector)
            continue
        }

        const properties = getPropertiesFromSelector(result, selector)
        const variants = generateVariants(properties, screens)
        result = insertVariants(result, selector, variants)
    }

    if (skipped.length > 0) {
        const comment = buildSkipComment(skipped)
        result = insertSkipComment(result, comment)
    }

    return result
}