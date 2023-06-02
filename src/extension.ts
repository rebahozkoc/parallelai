// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("parallelaiView", new SelectedTextWebviewViewProvider(context.extensionUri)));
}
class SelectedTextWebviewViewProvider implements vscode.WebviewViewProvider {

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();
	
		const selectedText = getSelectedText();
	
		let content = selectedText ? `<pre>${selectedText}</pre>` : `<p>No Selection</p>`;
	
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Selected Text</title>
			</head>
			<body>
				${content}
			</body>
			</html>`;
	}
	
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
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

