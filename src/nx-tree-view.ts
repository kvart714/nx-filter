import * as vscode from 'vscode'
import { ConfigurationProvider } from './configuration-provider'
import { NxProvider } from './nx-project-provider'


export class NxTreeDataProvider implements vscode.TreeDataProvider<NxProjItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NxProjItem | undefined> = new vscode.EventEmitter<NxProjItem | undefined>()
    readonly onDidChangeTreeData: vscode.Event<NxProjItem | undefined> = this._onDidChangeTreeData.event

    getTreeItem(element: NxProjItem): vscode.TreeItem {
        return element
    }

    async getChildren(element?: NxProjItem): Promise<NxProjItem[]> {
		try {
			const nxApps = await NxProvider.getNxProjects(false)
			
			const excludes = ConfigurationProvider.getExcludes(nxApps.map(p => p.root))
	
			return nxApps.map(p => new NxProjItem(p.name, p.root, p.projectType, !excludes[p.root]))
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
	
		treeView.onDidChangeCheckboxState(async ({ items: [[nxApp]] }) => nxApp.toggle())
		const refreshCmd = vscode.commands.registerCommand('nxApps.refresh', () => {
            nxAppsProvider.refresh()
		})
		
		context.subscriptions.push(refreshCmd)
		context.subscriptions.push(treeView)
	}
}

class NxProjItem extends vscode.TreeItem {

	get checked(): boolean {
        return this.checkboxState === vscode.TreeItemCheckboxState.Checked
    }

    set checked(value: boolean) {
        this.checkboxState = value
            ? vscode.TreeItemCheckboxState.Checked
            : vscode.TreeItemCheckboxState.Unchecked
	}

	constructor(
		public readonly name: string,
		public readonly path: string,
		public readonly type: string,
		checked: boolean) {
		
		super(name, vscode.TreeItemCollapsibleState.None)
		
		this.tooltip = path
		this.description = type
		
		this.contextValue = 'nxApp'
        this.checked = checked
	}
	
	public toggle() {
		if (this.checked) {
			ConfigurationProvider.removeFromExclude(this.path)
		} else {
			ConfigurationProvider.addToExclude(this.path)
		}
	}
}
