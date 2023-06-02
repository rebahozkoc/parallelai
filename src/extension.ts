// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    const treeDataProvider = new MyTreeDataProvider();
    vscode.window.registerTreeDataProvider('parallelaiView', treeDataProvider);

    vscode.window.onDidChangeTextEditorSelection(() => {
        treeDataProvider.refresh();
    });
}


class MyTreeDataProvider implements vscode.TreeDataProvider<MyItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MyItem | undefined> = new vscode.EventEmitter<MyItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<MyItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: MyItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MyItem): vscode.ProviderResult<MyItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const selectedText = getSelectedText();
            if (selectedText) {
                const item = new MyItem(selectedText);
                return Promise.resolve([item]);
            } else {
                return Promise.resolve([]);
            }
        }
    }
}


class MyItem extends vscode.TreeItem {
    constructor(label: string) {
        super(label);
    }
}

function getSelectedText(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        return document.getText(selection);
    }
    return undefined;
}

// This method is called when your extension is deactivated
export function deactivate() {}

