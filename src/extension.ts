// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { processMessage } from './messageProcessor';

let openaiApiKey: string | undefined = "";
let globalContext : vscode.ExtensionContext;
let selectedText = "";
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("parallelaiView", new SelectedTextWebviewViewProvider(context.extensionUri, context)));
	openaiApiKey = context.globalState.get<string>('openaiApiKey');
	globalContext = context;
	if (!openaiApiKey) {
		vscode.window.showInputBox({ prompt: 'Enter your OpenAI API Key' }).then(value => {
			if (value) {
				openaiApiKey = value;
				context.globalState.update('openaiApiKey', value);
			}
		});
	}
	let disposable = vscode.commands.registerCommand('extension.askChatGPT', function () {
		const selectedText = getSelectedText();
		if (selectedText) {
			console.log(`Asked to chat GPT with text command: ${selectedText}`);
		}
	});

	context.subscriptions.push(disposable);

}

let currentViewProvider: SelectedTextWebviewViewProvider | null = null;

class SelectedTextWebviewViewProvider implements vscode.WebviewViewProvider {

	public view?: vscode.WebviewView;

	constructor(private readonly _extensionUri: vscode.Uri, private _context: vscode.ExtensionContext) {
		this._context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
			if (this.view) {
				this.view.webview.html = this.getHtmlForWebview(this.view.webview);
			}
		}));
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		token: vscode.CancellationToken
	) {
		this.view = webviewView;
		currentViewProvider = this;

		webviewView.webview.options = {
			enableScripts: true
		};


		webviewView.webview.onDidReceiveMessage(
			async message => {
				switch (message.command) {
					case 'askChatGPT':
						const selectedText = getSelectedText();
						console.log(`Asked to chat GPT with text: ${selectedText}`);
						const processedMessage = await processMessage(selectedText, openaiApiKey); // processMessage is your function that processes the message
						if (processedMessage.includes("ERROR: Bad Request. Please check your API Key.")) {
							globalContext.globalState.update('openaiApiKey', undefined);
							vscode.window.showInputBox({ prompt: 'Enter your OpenAI API Key' }).then(value => {
								if (value) {
									openaiApiKey = value;
									globalContext.globalState.update('openaiApiKey', value);
								}
							});
						}
						webviewView.webview.postMessage({ command: 'display', text: processedMessage });

						return;
				}
			},
			undefined,
			this._context.subscriptions
		);

		this.refresh();
	}

	public refresh() {
		if (this.view) {
			this.view.webview.html = this.getHtmlForWebview(this.view.webview);
		}
	}

	public getHtmlForWebview(webview: vscode.Webview): string {
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
                h4 {
                    margin: 5px;
                }
                pre {
                    background-color: white;
                    border: 0.5px solid black;
                    padding: 5px;
                    margin: 5px;
                    white-space: pre-wrap;
                }
                button {
                    margin: 5px;
                    background-color: green;
                    color: white;
                    border: none;
                    padding: 5px 15px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 12px;
                    cursor: pointer;
                }
            </style>
        </head>
			<body>
			<h4>Selected Code:</h4>
			<pre>${selectedText}</pre>
			<button id="askButton">Ask to ChatGPT</button>
			<p id="loadingIndicator" style="display: none;">Loading...</p>
			<div id="messageContainer" style="display: none;">
				<h4>Suggestion:</h4>
				<pre id="processedMessage"></pre>
			</div>
			<script nonce="${nonce}">
			window.onload = function() {
				const vscode = acquireVsCodeApi();
				const loadingIndicator = document.getElementById('loadingIndicator');
				const messageContainer = document.getElementById('messageContainer');

				document.getElementById('askButton').addEventListener('click', () => {
					// Show the loading indicator and hide the messageContainer
					loadingIndicator.style.display = 'block';
					loadingIndicator.style.margin = '5px';
					messageContainer.style.display = 'none';

					vscode.postMessage({
						command: 'askChatGPT',
					});
				});
			};

			window.addEventListener('message', event => {
				const message = event.data; // The JSON data our extension sent

				switch (message.command) {
					case 'display':
						const processedMessage = message.text;

						// Hide the loading indicator and show the messageContainer
						loadingIndicator.style.display = 'none';
						messageContainer.style.display = 'block';

						document.getElementById('processedMessage').textContent = processedMessage;
						break;
				}
			});
		</script>
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

function getSelectedText(): string | undefined {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const document = editor.document;
		const selection = editor.selection;
		selectedText = document.getText(selection);
		return document.getText(selection);
	}
	return undefined;
}

// This method is called when your extension is deactivated
export function deactivate() { }