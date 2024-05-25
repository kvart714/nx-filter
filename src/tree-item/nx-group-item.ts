import * as vscode from 'vscode'
import { NxItemBase } from './nx-item-base'
import { NxProjItem } from './nx-proj-item'

export class NxGroupItem extends NxItemBase {
	constructor(
		public readonly groupName: string,
		public readonly children: NxProjItem[]) {

		super(groupName, vscode.TreeItemCollapsibleState.Expanded)

		this.checked = children.every(c => c.checked)
	}

	public async toggle() {
		for (const child of this.children) {
			child.checked = this.checked
			await child.toggle()
		}
	}
}
