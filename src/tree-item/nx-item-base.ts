import * as vscode from 'vscode'

export abstract class NxItemBase extends vscode.TreeItem {
	get checked(): boolean {
		return this.checkboxState === vscode.TreeItemCheckboxState.Checked
	}

	set checked(value: boolean) {
		this.checkboxState = value
			? vscode.TreeItemCheckboxState.Checked
			: vscode.TreeItemCheckboxState.Unchecked
	}

	abstract toggle(): Promise<void>
}
