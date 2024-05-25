import * as vscode from 'vscode'
import { NxItemBase } from './nx-item-base'
import { ConfigurationProvider } from '../configuration-provider'


export class NxProjItem extends NxItemBase {
	constructor(
		public readonly name: string,
		public readonly path: string,
		public readonly type: 'library' | 'application',
		checked: boolean) {

		super(name, vscode.TreeItemCollapsibleState.None)

		this.tooltip = path
		// this.description = type

		this.contextValue = 'nxApp'
		this.checked = checked
	}

	public async toggle(): Promise<void> {
		if (this.checked) {
			await ConfigurationProvider.removeFromExclude(this.path)
		} else {
			await ConfigurationProvider.addToExclude(this.path)
		}
	}
}
