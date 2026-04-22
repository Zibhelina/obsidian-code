# Obsidian Code Architecture

Obsidian Code is a single-file editor view for code and configuration files. It keeps the Obsidian shell native while replacing markdown rendering with a CodeMirror code editor for supported extensions.

## Runtime Components

1. `manifest.json` declares the Obsidian plugin.
2. `main.ts` registers the `obsidian-code-file` view, maps supported extensions to that view, configures CodeMirror, and adds the folder context-menu file creator.
3. `main.js` is the generated Obsidian bundle.
4. `styles.css` keeps the editor host full-height and lets the create-file modal use the monospace font.
5. `package.json` pins CodeMirror core packages so the bundled editor has exactly one `@codemirror/state` instance.

## Editor Surface

- CodeMirror editor mounted directly in the Obsidian file pane.
- Syntax highlighting mapped to Obsidian CSS variables.
- Minimal line-number and fold gutters without a divider between the gutter and code.
- Lint gutter, active-line highlight, search, autocomplete, bracket matching, auto-close brackets, and indentation keymaps.
- Parser-based syntax diagnostics, with JSON parse diagnostics for `.json`.
- Debounced saving through Obsidian's `TextFileView` lifecycle, plus `Cmd/Ctrl+S`.
- Per-view font-size adjustment through `Cmd/Ctrl + Plus` and `Cmd/Ctrl + Minus`, implemented as an editor-scoped CSS variable and handled from raw keydown events inside the code pane.

## Explicitly Not Included

- No plugin file explorer.
- No custom workspace shell.
- No editor header.
- No editor toolbar or buttons.
- No ribbon icon.
- No settings tab.
- No tabs beyond Obsidian's own tabs.
- No file rename, duplicate, delete, or folder management UI.

## File Creation

The only additional UI is a folder context-menu item named **Create new file**. It creates a named file in the selected folder, creates intermediate folders if the filename includes a path, and opens the file in Obsidian Code when the extension is supported.

## Dependency Invariant

CodeMirror extensions must all come from the same `@codemirror/state` instance. Run `npm ls @codemirror/state @codemirror/view` after dependency changes and make sure there is one deduped copy of each core package. Duplicate state packages can make Obsidian show a generic “Failed to open” notice when the editor view is created.
