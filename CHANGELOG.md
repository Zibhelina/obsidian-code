# Changelog

All notable changes to Obsidian Code are documented here.

## 1.0.0 - Native Code Editor

- Registered common code and configuration extensions with a focused CodeMirror file view.
- Added syntax highlighting, line numbers, folding, parser lint diagnostics, Obsidian-theme-aware colors, and native `TextFileView` saving.
- Made the gutter more minimal by removing left gutter padding, removing the line-number divider, reducing line-number emphasis, and preventing active-line highlighting from spilling into line numbers.
- Moved fold controls next to the code and added indentation guide decorations for nested blocks.
- Added `Cmd/Ctrl + Plus` and `Cmd/Ctrl + Minus` shortcuts for changing the code editor font size, with raw keydown handling for symbol and numpad variants.
- Added a folder context-menu action for creating named code files.
- Fixed file-open failures caused by duplicate CodeMirror core package instances in the bundle.
- Removed the legacy custom workspace, explorer, tabs, toolbar, settings, and broad file-operation UI from the documented architecture.
- Made extension registration resilient so one conflicting extension cannot prevent the plugin from loading.
