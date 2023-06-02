// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("parallelaiView", new SelectedTextWebviewViewProvider(context.extensionUri, context)));
}

class SelectedTextWebviewViewProvider implements vscode.WebviewViewProvider {

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri, private _context: vscode.ExtensionContext) {
        this._context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        }));
    }

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

	private _getHtmlForWebview(webview: vscode.Webview): string {
		const nonce = getNonce();
	
		let selectedText = getSelectedText() || 'No selection';
		selectedText = this._escapeHtml(selectedText);
		
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Selected Text</title>
				<style>
					h3 {
						margin: 10px;
					}
					pre {
						background-color: white;
						border: 1px solid black; /* reintroduced border */
						padding: 10px;
						margin: 10px;
						white-space: pre-wrap;
					}
				</style>
			</head>
			<body>
				<h3>Your Code:</h3> <!-- h2 changed to h3 -->
				<pre>${selectedText}</pre>
			</body>
			</html>`;
	}
		
	
	private _escapeHtml(html: string): string {
		return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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

