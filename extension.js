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
	console.log(text, language)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  //const prompt = `${language} ${text} code only`
	const prompt = 'python for loop code only'

  return model.generateContent(prompt).then((result) => {
    const response = result.response;
    const text = stripCode(response.text());
		console.log(text)

		const item = new vscode.CompletionItem(`\n${text}`, vscode.CompletionItemKind.Text);
		item.detail = 'Gemini Autocomplete'
		item.documentation = text

		return item;
  });
}
/**
 * @param {vscode.ExtensionContext} context
 */
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
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
				const line = strip(document.getText(), position.line)
				const data =  geminiResponse(line, document.languageId)
				//setTimeout(()=>{}, 2000);
				// return data.then((data) => {
				// 	return [data]
				// })
				// return data;

				// Testing
				const text = 'monkey'//stripCode(response.text());
				console.log(text)

				const item = new vscode.CompletionItem(`\n${text}`, vscode.CompletionItemKind.Text);
				item.detail = 'Gemini Autocomplete'
				item.documentation = text
				return [item];
			}
		},
		'@' // Trigger the completion with dot (you can customize this)
	);


	context.subscriptions.push(provider);
	context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
