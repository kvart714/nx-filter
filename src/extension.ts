// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { NxTreeDataProvider } from './nx-tree-view'


async function fileExists(fileName: string): Promise<boolean> {
    const rootPath = vscode.workspace.rootPath

    if (!rootPath) {
        return false
    }

    const uri = vscode.Uri.file(vscode.Uri.joinPath(vscode.Uri.file(rootPath), fileName).fsPath)
    
    try {
        await vscode.workspace.fs.stat(uri)
        return true
    } catch (error) {
        return false
    }
}

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "nx-filter" is now active!')

	if (await fileExists('nx.json') || await fileExists('workspace.json')) {
		NxTreeDataProvider.create(context)		
	}

}

export function deactivate() {}

