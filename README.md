# Obsidian Code

Obsidian Code opens common code and configuration files inside Obsidian with a native-feeling CodeMirror editor.

The plugin does not add a separate workspace, file explorer, editor header, toolbar, ribbon icon, or settings tab. A code file opens in the main editor pane like a normal Obsidian file, but it renders with code-focused editing features instead of markdown typography.

## Features

- Syntax highlighting for common programming, scripting, markup, data, and config files.
- Line numbers, code-adjacent fold controls, active-line highlighting, bracket matching, auto-close brackets, search, autocomplete, and `Tab` indentation.
- Lint gutter and diagnostics for parser syntax errors, plus JSON parse linting for `.json` files.
- Dynamic styling through Obsidian CSS variables, so changing the Obsidian theme updates the editor palette.
- Minimal gutter styling with subdued line numbers and no divider between line numbers and code.
- Indentation guides for scanning nested blocks without adding extra chrome.
- Per-pane code font sizing with `Cmd/Ctrl + Plus` and `Cmd/Ctrl + Minus`.
- Folder context-menu action for creating files such as `main.py` or `hello.c`.

## Supported Extensions

Obsidian Code registers common source, shell, markup, data, and config extensions, including:

| Category | Extensions |
| --- | --- |
| Web | `.html`, `.htm`, `.css`, `.scss`, `.sass`, `.less`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts`, `.vue`, `.svelte` |
| Systems | `.c`, `.cc`, `.cpp`, `.cxx`, `.h`, `.hpp`, `.hxx`, `.cs`, `.go`, `.rs`, `.swift`, `.kt`, `.kts`, `.scala`, `.java` |
| Scripting | `.py`, `.rb`, `.php`, `.lua`, `.r`, `.pl`, `.pm`, `.sh`, `.bash`, `.zsh`, `.fish`, `.ps1`, `.bat`, `.cmd` |
| Data and config | `.json`, `.yaml`, `.yml`, `.toml`, `.ini`, `.cfg`, `.conf`, `.properties`, `.env`, `.xml`, `.svg`, `.plist`, `.txt`, `.lock`, `.log` |
| Tools | `.gitignore`, `.dockerignore`, `.make`, `.mk`, `.cmake`, `.tf`, `.hcl`, `.graphql`, `.gql`, `.proto`, `.prisma`, `.editorconfig`, `.npmrc` |

## Usage

Open a supported file from Obsidian's file explorer, quick switcher, search results, links, tabs, or panes. Right-click a folder and choose **Create new file** to create a code file directly in that folder.

If another plugin already owns an extension, Obsidian Code skips that extension and logs a warning to the developer console instead of failing to load.

Inside a code file, press `Cmd + Plus` or `Cmd + Minus` on macOS, and `Ctrl + Plus` or `Ctrl + Minus` on Windows/Linux, to increase or decrease the code font size for that editor pane.

## Development

```bash
npm install
npm run dev
npm run build
```

The runtime source is intentionally small:

- `main.ts` registers a file view for supported extensions and contains the editor setup.
- `main.js` is the generated bundle loaded by Obsidian.
- `styles.css` only contains host sizing and modal input styling.

Keep `@codemirror/state` and `@codemirror/view` pinned to the versions expected by the Obsidian API package. A second copy of `@codemirror/state` can make CodeMirror reject its own extensions at file-open time.

## License

MIT
