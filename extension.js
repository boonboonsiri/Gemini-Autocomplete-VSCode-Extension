// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed


function stripCommentMarkers(input) {
	// Remove leading //
	let stripped = input.replace(/^\/\/\s*/, '');

	// Remove trailing @
	stripped = stripped.replace(/\s*@$/, '');

	return stripped.trim();
}

const strip = (text, position) => {
	const linesArray = text.split('\n');
	const line = linesArray[position];

	console.log(stripCommentMarkers(line))
	return stripCommentMarkers(line)




}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bard-autocomplete" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('bard-autocomplete.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from bard-autocomplete!');
	});


	const provider = vscode.languages.registerCompletionItemProvider(
		'javascript', // language id
		{
			provideCompletionItems(document, position, token, context) {
				console.log('testing')

				const item = new vscode.CompletionItem('\nmy name is boon', vscode.CompletionItemKind.Text);
				item.detail = 'hello testing'
				item.documentation = '123'
				// item.detail = suggestion.detail;
				// item.documentation = suggestion.documentation;

				//console.log(document, position, token, context)
				// console.log(document.getText())
				console.log(position.line)
				strip(document.getText(), position.line)


				return [item];

				// Fetch autocomplete suggestions from your API
				return fetch('https://your-api.com/autocomplete', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: document.getText(),
						position: position.character
					})
				})
					.then(response => response.json())
					.then(data => {
						return data.suggestions.map(suggestion => {
							const item = new vscode.CompletionItem(suggestion.label, vscode.CompletionItemKind.Text);
							item.detail = suggestion.detail;
							item.documentation = suggestion.documentation;
							return item;
						});
					});
			}
		},
		'@' // Trigger the completion with dot (you can customize this)
	);

	console.log("TESTING")

	context.subscriptions.push(provider);



	context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
