// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const stripCommentMarkers = (input) => {
	// Remove leading //
	let stripped = input.replace(/^\/\/\s*/, '');
	// Remove trailing @
	stripped = stripped.replace(/\s*@$/, '');
	return stripped.trim();
}

const strip = (text, position) => {
	const linesArray = text.split('\n');
	const line = linesArray[position];
	return stripCommentMarkers(line)
}

const stripCode = (text) => {
	const lines = text.split('\n');
	if (lines.length <= 2) {
		return '';
	}
	lines.shift();
	lines.pop();
	return lines.join('\n');
}
const geminiResponse = (text, language) => {
	// Choose a model that's appropriate for your use case.
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

	const prompt = `${language} ${text} small amount, include the code only`

	return model.generateContent(prompt).then((result) => {
		const response = result.response;
		const text = stripCode(response.text());

		const item = new vscode.CompletionItem(`\n${text}`, vscode.CompletionItemKind.Text);
		item.detail = 'Gemini Autocomplete'
		item.documentation = text

		return [item];
	});
}
/**
 * @param {vscode.ExtensionContext} context
 */
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('gemini-autocomplete.activate', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Gemini Autocomplete Activated');

	});
	context.subscriptions.push(disposable);


	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			[
				'javascript', 'typescript', 'python', 'cpp', 'rust', 'kotlin',
				'c', 'go', 'java', 'php', 'ruby', 'swift', 'objective-c',
				'perl', 'shellscript', 'scala', 'haskell', 'dart', 'r',
				'matlab', 'lua', 'css', 'html'
			],
			new AIItemProvider(),
			'@' // Trigger character
		)
	);
}

class AIItemProvider {
	provideCompletionItems(document, position, token, context) {
		// Return a Promise that resolves with the completion items
		return new Promise(async (resolve, reject) => {
			try {
				// Perform your async operation to fetch completion items
				const items = await this.getCompletionItems(document, position, token);
				resolve(items);
			} catch (error) {
				reject(error);
			}
		});
	}

	async getCompletionItems(document, position, token) {
		const line = strip(document.getText(), position.line)
		const data = await geminiResponse(line, document.languageId)
		return data;
	}
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
