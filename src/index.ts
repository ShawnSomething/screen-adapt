import type { Plugin, AtRule, Root} from 'postcss'
import postcss from 'postcss'

type ScreenMap = Map<string, string>

function parseScreens(root: Root): ScreenMap {
    const screens: ScreenMap = new Map()

    root.walkAtRules('screens', (rule) => {
        rule.walkDecls((decl) => {
            screens.set(decl.prop.trim(), decl.value.trim())
        })
        rule.remove()
    })
    return screens
}

function adaptScreens(root: Root, screens:ScreenMap): void {
    root.walkAtRules((rule:AtRule) => {
        if(!screens.has(rule.name))
            return

        const mediaQuery = screens.get(rule.name)!
        const clonedParent = rule.parent!.clone()

        clonedParent.removeAll()
        clonedParent.raws.before = '\n  '

        rule.nodes?.forEach(node => {
            clonedParent.append(node.clone())
        })

        clonedParent.raws.semicolon = true

        clonedParent.raws.after = '\n  '

        const mediaRule = postcss.atRule({
        name: 'media',
        params: mediaQuery,
        nodes: [clonedParent],
        raws: { 
            afterName: ' ',
            between: ' ',
            after: '\n',
            before: '\n'
        }
        })

        mediaRule.raws.after = '\n'

        rule.parent!.after(mediaRule)
        
        rule.remove()
    })
}

const screenAdapt: Plugin = {
    postcssPlugin: 'screen-adapt',
    Once(root: Root) {
        const screens = parseScreens(root)
        if (screens.size === 0) 
            return
        adaptScreens(root, screens)
        
        root.walkRules((rule) => {
            rule.raws.semicolon = true
        })
    }
}

export default screenAdapt