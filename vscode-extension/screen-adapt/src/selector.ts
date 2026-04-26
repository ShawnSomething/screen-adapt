export function getSelectorAtCursor(text: string, offset: number): string | null {
    // Walk backwards from cursor to find the opening brace
    let braceDepth = 0
    let i = offset

    while (i >= 0) {
        const char = text[i]

        if (char === '}') {
            braceDepth++
        } else if (char === '{') {
            if (braceDepth === 0) {
                // This is the opening brace of our selector
                // Now grab the selector name before it
                const before = text.slice(0, i).trimEnd()
                const newlineIndex = before.lastIndexOf('\n')
                const selector = before.slice(newlineIndex + 1).trim()

                // Make sure it's a real selector, not an at-rule
                if (selector && !selector.startsWith('@')) {
                    return selector
                }
                return null
            }
            braceDepth--
        }
        i--
    }

    return null
}