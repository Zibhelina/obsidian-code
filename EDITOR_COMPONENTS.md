# Obsidian Code Architecture

Obsidian Code is a single-file editor view for code and configuration files. It keeps the Obsidian shell native while replacing markdown rendering with a CodeMirror code editor for supported extensions.

## Runtime Components

1. `manifest.json` declares the Obsidian plugin.
2. `main.ts` registers the `obsidian-code-file` view, maps supported extensions to that view, configures CodeMirror, registers a settings tab, and adds the folder context-menu file creator.
3. `main.js` is the generated Obsidian bundle.
4. `styles.css` keeps the editor host full-height and lets the create-file modal use the monospace font.
5. `package.json` pins CodeMirror core packages so the bundled editor has exactly one `@codemirror/state` instance.

## Editor Surface

- CodeMirror editor mounted directly in the Obsidian file pane.
- Syntax highlighting mapped to Obsidian CSS variables.
- Minimal line-number gutter without left padding, subdued line numbers, no active-line gutter highlight, and no divider between the gutter and code.
- Fold controls are compact and ordered after line numbers so they sit next to the foldable code without creating a wide gap.
- Inline fold placeholders render without the default background, border, or rounded corners, so collapsed regions appear as a subtle dotted icon.
- Indentation guides are painted as a `Decoration.line` background stripe on each indented line. The number of stripes is encoded in a per-line CSS custom property, and the spacing is driven by a character-width variable measured from the editor's content DOM so guides stay aligned across font sizes and themes.
- Inline lint diagnostics, active-line highlight, search, autocomplete, bracket matching, auto-close brackets, and indentation keymaps.
- Parser-based syntax diagnostics, with JSON parse diagnostics for `.json`.
- Debounced saving through Obsidian's `TextFileView` lifecycle, plus `Cmd/Ctrl+S`.
- Per-view font-size adjustment through `Cmd/Ctrl + Plus` and `Cmd/Ctrl + Minus`, implemented as an editor-scoped CSS variable and handled through focused-view hotkeys plus raw keydown capture inside the code pane.
- Optional vim keybindings via `@replit/codemirror-vim`, added to the extension list with `Prec.highest` when the `vim` setting is enabled so vim's keymap wins against the default CodeMirror keymap.

## Settings

The plugin exposes a single settings tab with one toggle:

- **Vim keybindings** (default: off) — enables modal vim editing. Flipping the toggle persists to `data.json` via `Plugin.saveData` and rebuilds every open `CodeFileView` in place, preserving the current unsaved buffer.

## Explicitly Not Included

- No plugin file explorer.
- No custom workspace shell.
- No editor header.
- No editor toolbar or buttons.
- No ribbon icon.
- No tabs beyond Obsidian's own tabs.
- No file rename, duplicate, delete, or folder management UI.

## File Creation

The only additional UI is a folder context-menu item named **Create new file**. It creates a named file in the selected folder, creates intermediate folders if the filename includes a path, and opens the file in Obsidian Code when the extension is supported.

## Dependency Invariant

CodeMirror extensions must all come from the same `@codemirror/state` instance. Run `npm ls @codemirror/state @codemirror/view` after dependency changes and make sure there is one deduped copy of each core package. Duplicate state packages can make Obsidian show a generic “Failed to open” notice when the editor view is created.
