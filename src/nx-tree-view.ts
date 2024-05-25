import * as vscode from 'vscode'
import { ConfigurationProvider } from './configuration-provider'
import { NxProvider } from './nx-project-provider'
import { NxItemBase } from './tree-item/nx-item-base'
import { NxGroupItem } from './tree-item/nx-group-item'
import { NxProjItem } from './tree-item/nx-proj-item'


export class NxTreeDataProvider implements vscode.TreeDataProvider<NxItemBase> {
    private _onDidChangeTreeData: vscode.EventEmitter<NxItemBase | undefined> = new vscode.EventEmitter<NxItemBase | undefined>()
    readonly onDidChangeTreeData: vscode.Event<NxItemBase | undefined> = this._onDidChangeTreeData.event

    getTreeItem(element: NxItemBase): vscode.TreeItem {
        return element
    }

    async getChildren(element?: NxItemBase): Promise<NxItemBase[]> {
		try {
			if (element instanceof NxGroupItem) {
				return element.children
			}

			const nxApps = await NxProvider.getNxProjects(false)
			
			const excludes = ConfigurationProvider.getExcludes(nxApps.map(p => p.root))
	
			var items = nxApps.map(p => new NxProjItem(p.name, p.root, p.projectType, !excludes[p.root]))

			return [
				new NxGroupItem('Nx Apps', items.filter(i => i.type === 'application')),
				new NxGroupItem('Nx Libs', items.filter(i => i.type === 'library'))
			]
		}
		catch {
			return []
		}
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined)
    }

	public static create(context: vscode.ExtensionContext) {
		const nxAppsProvider = new NxTreeDataProvider()
		const treeView = vscode.window.createTreeView('nxApps', {
			treeDataProvider: nxAppsProvider,
			showCollapseAll: false
		})
	
		treeView.onDidChangeCheckboxState(async ({ items: [[nxItem]] }) => await nxItem.toggle())
		const refreshCmd = vscode.commands.registerCommand('nxApps.refresh', () => {
            nxAppsProvider.refresh()
		})
		
		context.subscriptions.push(refreshCmd)
		context.subscriptions.push(treeView)
	}
}
