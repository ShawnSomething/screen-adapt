import * as vscode from 'vscode'
import { parseScreens } from './parser'
import { getSelectorAtCursor } from './selector'
import { getPropertiesFromSelector } from './properties'
import { generateVariants } from './generator'
import { insertVariants, hasExistingVariants } from './inserter'
import { globalScan } from './scanner'
import { hasScreensBlock, insertScreensBlock } from './initialiser'
import { checkAndInstallPlugin } from "./installer"
import { readTailwindBreakpoints, TailwindConfigError } from './tailwind-config-reader'
import { getClassNameAtCursor } from './jsx-class-detector'
import { parseBaseClasses } from './tailwind-class-parser'
import { generateTailwindVariants } from './tailwind-generator'
import { hasExistingVariants as tailwindHasExistingVariants, insertVariants as tailwindInsertVariants, insertCheckComment } from './tailwind-inserter'
import { globalScan as tailwindGlobalScan } from './tailwind-scanner'

export function activate(context: vscode.ExtensionContext) {
    checkAndInstallPlugin(context)
    
    //initialiser
    const initDisposable = vscode.commands.registerCommand('screen-adapt.initialise', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
        vscode.window.showErrorMessage('No active file.')
        return
    }

    const document = editor.document
    const text = document.getText()

    if (hasScreensBlock(text)) {
        vscode.window.showWarningMessage('An @screens block already exists in this file.')
        return
    }

    const newText = insertScreensBlock(text)
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
    )

    editor.edit(editBuilder => {
        editBuilder.replace(fullRange, newText)
    })

    vscode.window.showInformationMessage('Screen Adapt: @screens block added.')
})

    context.subscriptions.push(initDisposable)

    //single scaffold
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
        if (screens.size === 0) {
            vscode.window.showErrorMessage('No @screens block found. Run "Screen Adapt: Initialise @screens" first.')
            return
        }

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

    //global scaffold
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
        vscode.window.showErrorMessage('No @screens block found. Run "Screen Adapt: Initialise @screens" first.')
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

    //tailwind single element
    const tailwindAddVariantsDisposable = vscode.commands.registerCommand('screen-adapt.tailwind.addVariants', () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            vscode.window.showErrorMessage('No active file.')
            return
        }

        const document = editor.document
        const text = document.getText()
        const offset = document.offsetAt(editor.selection.active)

        let breakpoints: Map<string, string>
        try {
            breakpoints = readTailwindBreakpoints()
        } catch (err) {
            vscode.window.showErrorMessage((err as TailwindConfigError).message)
            return
        }

        const info = getClassNameAtCursor(text, offset)
        if (!info) {
            vscode.window.showErrorMessage('No className found at cursor.')
            return
        }

        if (tailwindHasExistingVariants(info.classes, breakpoints)) {
            vscode.window.showWarningMessage('This element already has screen variants. Remove them first.')
            return
        }

        const baseClasses = parseBaseClasses(info.classes)
        const { variants, flagged } = generateTailwindVariants(baseClasses, breakpoints)
        let newText = tailwindInsertVariants(text, info, variants)
        newText = insertCheckComment(newText, flagged)

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        )

        editor.edit(editBuilder => {
            editBuilder.replace(fullRange, newText)
        })

        vscode.window.showInformationMessage('Screen Adapt: Tailwind variants added.')
    })

    context.subscriptions.push(tailwindAddVariantsDisposable)

    //tailwind global scan
    const tailwindAdaptAllDisposable = vscode.commands.registerCommand('screen-adapt.tailwind.adaptAll', () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            vscode.window.showErrorMessage('No active file.')
            return
        }

        const document = editor.document
        const text = document.getText()

        let breakpoints: Map<string, string>
        try {
            breakpoints = readTailwindBreakpoints()
        } catch (err) {
            vscode.window.showErrorMessage((err as TailwindConfigError).message)
            return
        }

        const newText = tailwindGlobalScan(text, breakpoints)

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        )

        editor.edit(editBuilder => {
            editBuilder.replace(fullRange, newText)
        })

        vscode.window.showInformationMessage('Screen Adapt: Tailwind global scan complete.')
    })

    context.subscriptions.push(tailwindAdaptAllDisposable)
}

export function deactivate() {}