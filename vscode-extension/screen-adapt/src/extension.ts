import * as vscode from 'vscode'
import { parseScreens } from './parser'
import { getSelectorAtCursor } from './selector'
import { getPropertiesFromSelector } from './properties'
import { generateVariants } from './generator'

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('screen-adapt.helloWorld', () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            vscode.window.showErrorMessage('No active file.')
            return
        }

        const text = editor.document.getText()
        const offset = editor.document.offsetAt(editor.selection.active)
        const screens = parseScreens(text)
        const selector = getSelectorAtCursor(text, offset)

        if (!selector) {
            vscode.window.showErrorMessage('No selector found at cursor.')
            return
        }

        const properties = getPropertiesFromSelector(text, selector)
        const variants = generateVariants(properties, screens)

        const summary = variants.map(block => {
            const props = block.properties
                .map(p => `  ${p.name}: ${p.value}${p.comment ? ` /* ${p.comment} */` : ''}`)
                .join('\n')
            return `@${block.screenName} {\n${props}\n}`
        }).join('\n\n')

        console.log(summary)
        vscode.window.showInformationMessage(`Generated ${variants.length} variants — check the debug console.`)
    })

    context.subscriptions.push(disposable)
}

export function deactivate() {}