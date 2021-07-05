import joplin from 'api';
import { SettingItemType, ToolbarButtonLocation } from 'api/types';
import parse = require('csv-parse');
import { markdownTable } from 'markdown-table';

interface CsvSettings {
	comment: string;
	delimiter: string[];
	quote: string;
	skip_empty: boolean;
	skip_error: boolean;
	trim: boolean;
}

async function getSettings(): Promise<CsvSettings> {
	return {
		comment: await joplin.settings.value('comment') as string,
		delimiter: (await joplin.settings.value('delimiter') as string).split(""),
		quote: await joplin.settings.value('quote') as string,
		skip_empty: await joplin.settings.value('skip_empty') as boolean,
		skip_error: await joplin.settings.value('skip_error') as boolean,
		trim: await joplin.settings.value('trim') as boolean,
	} as CsvSettings;
}

async function parseCsv(
	input: string,
	okfunc: (output: string[][]) => void, errfunc: (err: any) => void
) {
	const s = await getSettings();
	parse(input, {
		columns: false,
		comment: s.comment,
		delimiter: s.delimiter,
		quote: s.quote[0],
		skip_empty_lines: s.skip_empty,
		skip_lines_with_error: s.skip_error,
		trim: s.trim,
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
		await joplin.commands.register({
			name: "csvToMarkdown",
			label: "Convert CSV to Markdown table",
			iconName: "fas fa-file-csv",
			execute: async () => {
				const dialogs = joplin.views.dialogs;
				const selectedText = (await joplin.commands.execute('selectedText') as string);
				if (selectedText != '') {
					parseCsv(selectedText, (output: any[]) => {
						const table = markdownTable(output);
						joplin.commands.execute('replaceSelection', table);
					}, (err: parse.CsvError) => {
						dialogs.showMessageBox(err.code + "\n" + err.message);
					});
				} else {
					dialogs.showMessageBox("Please select some CSV data.");
				}
			},
		});

		joplin.views.toolbarButtons.create(
			"csvToMarkdownBtn",
			"csvToMarkdown",
			ToolbarButtonLocation.EditorToolbar
		);

		await joplin.settings.registerSection('csvConversion', {
			label: 'CSV Conversion',
			iconName: 'fas fa-file-csv',
		});

		await joplin.settings.registerSettings({
			'comment': {
				value: "#",
				type: SettingItemType.String,
				section: 'csvConversion',
				public: true,
				label: 'Comments',
				description: 'String representing comment sequence. Everything after this sequence is treated as comment.',
			},
			'delimiter': {
				value: ",;",
				type: SettingItemType.String,
				section: 'csvConversion',
				public: true,
				label: 'Delimiters',
				description: 'Set of field delimiter characters, each character from string will be treated as a separate delimiter alternative.',
			},
			'quote': {
				value: '"',
				type: SettingItemType.String,
				section: 'csvConversion',
				public: true,
				label: 'Quote',
				description: 'Single character for quoting fields.',
			},
			'skip_empty': {
				value: true,
				type: SettingItemType.Bool,
				section: 'csvConversion',
				public: true,
				label: 'Skip empty lines',
				description: 'Do not generate records for empty lines.',
			},
			'skip_error': {
				value: false,
				type: SettingItemType.Bool,
				section: 'csvConversion',
				public: true,
				label: 'Skip error lines',
				description: 'Skip lines with errors and continue processing.',
			},
			'trim': {
				value: true,
				type: SettingItemType.Bool,
				section: 'csvConversion',
				public: true,
				label: 'Trim fields',
				description: 'Remove whitespaces around field delilmiters (only unquoted fields).',
			},
		});
	},
});


