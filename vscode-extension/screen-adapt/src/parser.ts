export type ScreenMap = Map<string, string>

export function parseScreens(text: string): ScreenMap {
    const screens: ScreenMap = new Map()

    const blockMatch = text.match(/@screens\s*\{([^}]*)\}/)
    if (!blockMatch) 
        return screens

    const block = blockMatch[1]
    const lines = block.split('\n')

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*'))
            continue

        const colonIndex = trimmed.indexOf(':')
        if (colonIndex === -1)
            continue

        const name = trimmed.slice(0, colonIndex).trim()
        const value = trimmed.slice(colonIndex + 1)
            .replace(/;.*$/, '')  // strip semicolon and anything after
            .replace(/\/\*.*?\*\//g, '')  // strip inline comments
            .trim()

        if (name && value)
            screens.set(name, value)
    }

    return screens
}