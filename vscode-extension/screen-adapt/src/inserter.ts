export function hasExistingVariants(text: string, selector: string): boolean {
    const selectorIndex = text.indexOf(selector)
    if (selectorIndex === -1) return false

    const openBrace = text.indexOf('{', selectorIndex)
    if (openBrace === -1) return false

    let depth = 1
    let i = openBrace + 1

    while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++
        if (text[i] === '}') depth--
        i++
    }

    const body = text.slice(openBrace + 1, i - 1)
    return body.includes('@')
}

export function insertVariants(
    text: string,
    selector: string,
    variants: { screenName: string; properties: { name: string; value: string; comment?: string }[] }[]
): string {
    const selectorIndex = text.indexOf(selector)
    if (selectorIndex === -1) return text

    const openBrace = text.indexOf('{', selectorIndex)
    if (openBrace === -1) return text

    let depth = 1
    let i = openBrace + 1

    while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++
        if (text[i] === '}') depth--
        i++
    }

    const closingBraceIndex = i - 1

    const variantText = variants.map(block => {
        const props = block.properties
            .map(p => `    ${p.name}: ${p.value};${p.comment ? ` /* ${p.comment} */` : ''}`)
            .join('\n')
        return `\n\n  @${block.screenName} {\n${props}\n  }`
    }).join('')

    return text.slice(0, closingBraceIndex) + variantText + '\n' + text.slice(closingBraceIndex)
}