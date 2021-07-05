# CSV table converter for Joplin editor

This plugin allows you to convert raw CSV data into Markdown table.

## Usage
Simply select CSV data in note text and run `csvMarkdown` command from command palette or toolbar.

## Plugin command
The plugin registers `csvToMarkdown` command and adds it to the editor toolbar (the `fa-file-csv` icon).

## Plugin settings
You can customize Markdown generation through miscellanous settings:

| Setting              | Type    | Default | Description                                    |
| -------------------- | ------- | ------- | ---------------------------------------------- |
| Comment              | string  | #       | Comment sequence                               |
| Delimiter            | string  | ,;      | Set of field delimiter characters              |
| Quote                | char    | "       | Field quoting character                        |
| Skip empty lines     | boolean | true    | Do not generate records for empty lines        |
| Ignore error lines   | boolean | false   | Skip lines with errors and continue processing |
| Trim unquoted fields | boolean | true    | Remove whitespaces around field delilmiters    |
