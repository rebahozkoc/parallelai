// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    const treeDataProvider = new MyTreeDataProvider();
    vscode.window.registerTreeDataProvider('parallelaiView', treeDataProvider);
}

class MyTreeDataProvider implements vscode.TreeDataProvider<MyItem> {
    getTreeItem(element: MyItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MyItem): vscode.ProviderResult<MyItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const item = new MyItem("Hello, ParallelAI!");
            return Promise.resolve([item]);
        }
    }
}

class MyItem extends vscode.TreeItem {
    constructor(label: string) {
        super(label);
    }
}


// This method is called when your extension is deactivated
export function deactivate() {}

