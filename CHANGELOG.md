# Changelog

All notable changes to Obsidian Code are documented here.

## 1.0.0 - Native Code Editor

- Registered common code and configuration extensions with a focused CodeMirror file view.
- Added syntax highlighting, line numbers, folding, parser lint diagnostics, Obsidian-theme-aware colors, and native `TextFileView` saving.
- Made the gutter more minimal by removing left gutter padding, removing the line-number divider, reducing line-number emphasis, tightening the gap before code, and preventing active-line highlighting from spilling into line numbers.
- Moved compact fold controls next to the code and added continuous indentation guides drawn as full-line background stripes so vertical lines stay connected across rows (including blank lines inside a block).
- Stripped the inline fold placeholder chrome so collapsed regions render as a subtle dotted icon that blends with the editor background.
- Measured the editor's monospace character width at mount and on font-size changes, so indentation guides align with the actual glyph advance instead of drifting from the `ch` unit.
- Added `Cmd/Ctrl + Plus` and `Cmd/Ctrl + Minus` shortcuts for changing the code editor font size, with focused-view hotkeys and raw keydown handling for symbol and numpad variants.
- Added a folder context-menu action for creating named code files.
- Fixed file-open failures caused by duplicate CodeMirror core package instances in the bundle.
- Removed the legacy custom workspace, explorer, tabs, toolbar, settings, and broad file-operation UI from the documented architecture.
- Made extension registration resilient so one conflicting extension cannot prevent the plugin from loading.
