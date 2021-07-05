import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import parse = require('csv-parse');
import { markdownTable } from 'markdown-table';

export function parseCsv(input: string, okfunc: (output: string[][]) => void, errfunc: (err: any) => void) {
	parse(input, {
		//TODO: settings
		comment: '#',
		columns: false,
		skip_empty_lines: true
	}, function (err, output) {
		if (err) {
			errfunc(err);
		} else {
			okfunc(output);
		}
	})
}

joplin.plugins.register({
	onStart: async function () {
		// Register new command
		await joplin.commands.register({
			name: "csvToMarkdown",
			label: "Convert CSV to Markdown table",
			iconName: "fas fa-file-csv",
			execute: async () => {
				//Get selected text
				const selectedText = (await joplin.commands.execute('selectedText') as string);
				if (selectedText != '') {
					// Replace selection with converted data
					parseCsv(selectedText, (output: any[]) => {
						const table = markdownTable(output);
						joplin.commands.execute('replaceSelection', table);
					}, (err: any) => {
						alert(err);
					});
				}
			},
		});

		joplin.views.toolbarButtons.create(
			"csvToMarkdownBtn",
			"csvToMarkdown",
			ToolbarButtonLocation.EditorToolbar
		);
	},
});


