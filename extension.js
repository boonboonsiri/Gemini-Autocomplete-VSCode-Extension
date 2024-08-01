// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { GoogleGenerativeAI } = require("@google/generative-ai");


// Global Vars
var config = vscode.workspace.getConfiguration('gemini-autocomplete');
var apiKey = config.get('geminiAPIKey');
var promptChar = config.get('promptCharacter') || '@';
var genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || apiKey);

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

	// Sometimes you need to pop twice for some reason
	if (lines[lines.length - 1] == '```') {
		lines.pop();
	}
	return lines.join('\n');
}
const geminiResponse = (text, language) => {
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

	var prompt = `${language} ${text} small amount, include the code only`
	var formatFunction = stripCode;

	// Yeah this is not hte best way to do this
	if (text.includes('ggemini')) {
		prompt = text;
		formatFunction = (text) => text;
	}

	return model.generateContent(prompt).then((result) => {
		const response = result.response;
		const text = formatFunction(response.text());

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
	initialize(context);


  // Register an event listener for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      // Check if the change affects your extension's configuration
      if (event.affectsConfiguration('gemini-autocomplete')) {

        // Optional: Dispose of any resources if necessary
        // Dispose of all subscriptions by clearing the context

        context.subscriptions.forEach(disposable => disposable.dispose());

        // Re-initialize the extension
        initialize(context);
      }
    })
  );
}

const initialize = (context) => {
	config = vscode.workspace.getConfiguration('gemini-autocomplete');

	apiKey = config.get('geminiAPIKey');
	promptChar = config.get('promptCharacter') || '@';
	genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || apiKey);


	const disposable = vscode.commands.registerCommand('gemini-autocomplete.activate', async function () {
		vscode.window.showInformationMessage('Gemini Autocomplete Activated');
    // Manually trigger the completion
    await vscode.commands.executeCommand('editor.action.triggerSuggest');
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
			promptChar, // Trigger character
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
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

		if (selectedText.length > 0) {
			const data = await geminiResponse(selectedText, document.languageId)
			return data;
		} else {
			const line = strip(document.getText(), position.line)
			const data = await geminiResponse(line, document.languageId)
			return data;
		}
	}
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}


