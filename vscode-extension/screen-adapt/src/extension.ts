import * as vscode from 'vscode'
import { parseScreens } from './parser'
import { getSelectorAtCursor } from './selector'
import { getPropertiesFromSelector } from './properties'
import { generateVariants } from './generator'
import { insertVariants, hasExistingVariants } from './inserter'
import { globalScan } from './scanner'

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('screen-adapt.scaffoldVariants', () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            vscode.window.showErrorMessage('No active file.')
            return
        }

        const document = editor.document
        const text = document.getText()
        const offset = document.offsetAt(editor.selection.active)
        const screens = parseScreens(text)
        const selector = getSelectorAtCursor(text, offset)

        if (!selector) {
            vscode.window.showErrorMessage('No selector found at cursor.')
            return
        }

        const properties = getPropertiesFromSelector(text, selector)

        if (hasExistingVariants(text, selector)) {
            vscode.window.showWarningMessage(`${selector} already has screen variants. Remove them first.`)
            return
        }

        const variants = generateVariants(properties, screens)
        const newText = insertVariants(text, selector, variants)

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        )

        editor.edit(editBuilder => {
            editBuilder.replace(fullRange, newText)
        })

        vscode.window.showInformationMessage(`Scaffolded ${variants.length} variants for ${selector}.`)
    })

    context.subscriptions.push(disposable)


    const globalScanDisposable = vscode.commands.registerCommand('screen-adapt.globalScan', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
        vscode.window.showErrorMessage('No active file.')
        return
    }

    const document = editor.document
    const text = document.getText()
    const screens = parseScreens(text)

    if (screens.size === 0) {
        vscode.window.showErrorMessage('No @screens block found.')
        return
    }

    const newText = globalScan(text, screens)

    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
    )

    editor.edit(editBuilder => {
        editBuilder.replace(fullRange, newText)
    })

    vscode.window.showInformationMessage('Screen Adapt: global scan complete.')
})

    context.subscriptions.push(globalScanDisposable)
}

export function deactivate() {}