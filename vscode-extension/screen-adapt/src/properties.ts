export type CSSProperty = {
    name: string
    value: string
}

export function getPropertiesFromSelector(text: string, selector: string): CSSProperty[] {
    const properties: CSSProperty[] = []

    // Find the selector in the text
    const selectorIndex = text.indexOf(selector)
    if (selectorIndex === -1) return properties

    // Find the opening brace after the selector
    const openBrace = text.indexOf('{', selectorIndex)
    if (openBrace === -1) return properties

    // Walk forward to find the matching closing brace (depth-aware)
    let depth = 1
    let i = openBrace + 1
    let bodyStart = i

    while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++
        if (text[i] === '}') depth--
        i++
    }

    const body = text.slice(bodyStart, i - 1)

    // Extract only top-level declarations (skip nested blocks like @pa-mob-ver)
    const lines = body.split('\n')
    let insideBlock = false

    for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.includes('{')) { insideBlock = true; continue }
        if (trimmed.includes('}')) { insideBlock = false; continue }
        if (insideBlock || !trimmed || !trimmed.includes(':')) continue

        const colonIndex = trimmed.indexOf(':')
        const name = trimmed.slice(0, colonIndex).trim()
        const value = trimmed.slice(colonIndex + 1).replace(/;$/, '').trim()

        if (name && value) properties.push({ name, value })
    }

    return properties
}