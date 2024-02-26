// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { NxAppsProvider } from './nx-tree-view'


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "nx-filter" is now active!')

	NxAppsProvider.create(context)
}

export function deactivate() {}
