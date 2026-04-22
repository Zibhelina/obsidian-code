import {
	App,
	Modal,
	Notice,
	Platform,
	Plugin,
	Setting,
	Scope,
	TAbstractFile,
	TFile,
	TFolder,
	TextComponent,
	TextFileView,
	WorkspaceLeaf,
	normalizePath,
} from "obsidian";
import { closeBrackets, closeBracketsKeymap, completionKeymap, autocompletion } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import {
	HighlightStyle,
	StreamLanguage,
	bracketMatching,
	foldGutter,
	foldKeymap,
	indentUnit,
	syntaxHighlighting,
	syntaxTree,
} from "@codemirror/language";
import { cmake } from "@codemirror/legacy-modes/mode/cmake";
import { clojure } from "@codemirror/legacy-modes/mode/clojure";
import { coffeeScript } from "@codemirror/legacy-modes/mode/coffeescript";
import { less as legacyLess } from "@codemirror/legacy-modes/mode/css";
import { dockerFile } from "@codemirror/legacy-modes/mode/dockerfile";
import { elm } from "@codemirror/legacy-modes/mode/elm";
import { erlang } from "@codemirror/legacy-modes/mode/erlang";
import { fortran } from "@codemirror/legacy-modes/mode/fortran";
import { go } from "@codemirror/legacy-modes/mode/go";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";
import { julia } from "@codemirror/legacy-modes/mode/julia";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { fSharp, oCaml } from "@codemirror/legacy-modes/mode/mllike";
import { pascal } from "@codemirror/legacy-modes/mode/pascal";
import { perl } from "@codemirror/legacy-modes/mode/perl";
import { powerShell } from "@codemirror/legacy-modes/mode/powershell";
import { properties } from "@codemirror/legacy-modes/mode/properties";
import { protobuf } from "@codemirror/legacy-modes/mode/protobuf";
import { r } from "@codemirror/legacy-modes/mode/r";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import { sass } from "@codemirror/legacy-modes/mode/sass";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { verilog } from "@codemirror/legacy-modes/mode/verilog";
import { vhdl } from "@codemirror/legacy-modes/mode/vhdl";
import { search, searchKeymap } from "@codemirror/search";
import { EditorState, Extension, Prec, RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	drawSelection,
	highlightActiveLine,
	keymap,
	lineNumbers,
} from "@codemirror/view";
import { Diagnostic, lintKeymap, linter } from "@codemirror/lint";
import { tags } from "@lezer/highlight";

const VIEW_TYPE_CODE = "obsidian-code-file";
const DEFAULT_CODE_FONT_SIZE_PX = 14;
const MIN_CODE_FONT_SIZE_PX = 9;
const MAX_CODE_FONT_SIZE_PX = 32;
const CODE_FONT_SIZE_STEP_PX = 1;

const CODE_EXTENSIONS = [
	"asm",
	"bash",
	"bat",
	"bib",
	"c",
	"cc",
	"cfg",
	"clj",
	"cljs",
	"cmake",
	"cmd",
	"cjs",
	"coffee",
	"conf",
	"cpp",
	"cr",
	"cs",
	"css",
	"cts",
	"cxx",
	"d",
	"dart",
	"dockerignore",
	"dockerfile",
	"editorconfig",
	"dtd",
	"elm",
	"env",
	"erl",
	"ex",
	"exs",
	"f90",
	"fish",
	"for",
	"fs",
	"fsx",
	"gitignore",
	"go",
	"gql",
	"graphql",
	"h",
	"hcl",
	"hh",
	"hp",
	"hpp",
	"hxx",
	"hs",
	"htm",
	"html",
	"ini",
	"java",
	"jenkinsfile",
	"jl",
	"js",
	"json",
	"jsx",
	"kt",
	"kts",
	"less",
	"lhs",
	"litcoffee",
	"lock",
	"log",
	"lua",
	"m",
	"make",
	"mdx",
	"mjs",
	"mk",
	"ml",
	"mli",
	"mm",
	"mts",
	"nim",
	"nims",
	"npmrc",
	"pas",
	"php",
	"plist",
	"pl",
	"pm",
	"pp",
	"prisma",
	"properties",
	"proto",
	"ps1",
	"py",
	"qmd",
	"r",
	"rb",
	"rmd",
	"rs",
	"s",
	"sass",
	"scala",
	"scss",
	"sh",
	"sql",
	"sty",
	"sv",
	"svg",
	"svh",
	"svelte",
	"swift",
	"t",
	"tex",
	"tf",
	"toml",
	"ts",
	"txt",
	"tsx",
	"v",
	"vhd",
	"vhdl",
	"vim",
	"vue",
	"xsd",
	"xsl",
	"xslt",
	"xml",
	"yaml",
	"yml",
	"zsh",
];

const CODE_EXTENSION_SET = new Set(CODE_EXTENSIONS);

const obsidianHighlightStyle = HighlightStyle.define([
	{ tag: tags.comment, color: "var(--text-faint)", fontStyle: "italic" },
	{ tag: [tags.keyword, tags.modifier, tags.operatorKeyword], color: "var(--color-purple, #c678dd)" },
	{ tag: [tags.controlKeyword, tags.definitionKeyword], color: "var(--color-red, #e06c75)" },
	{ tag: [tags.atom, tags.bool, tags.null], color: "var(--color-orange, #d19a66)" },
	{ tag: [tags.number, tags.integer, tags.float], color: "var(--color-orange, #d19a66)" },
	{ tag: [tags.string, tags.special(tags.string), tags.regexp, tags.character], color: "var(--color-yellow, #e5c07b)" },
	{ tag: [tags.escape, tags.url], color: "var(--color-cyan, #56b6c2)" },
	{ tag: [tags.variableName, tags.self], color: "var(--text-normal)" },
	{ tag: [tags.definition(tags.variableName), tags.function(tags.variableName), tags.labelName], color: "var(--color-green, #98c379)" },
	{ tag: [tags.className, tags.typeName, tags.namespace], color: "var(--color-cyan, #56b6c2)" },
	{ tag: [tags.propertyName, tags.attributeName], color: "var(--color-blue, #61afef)" },
	{ tag: [tags.operator, tags.punctuation, tags.bracket], color: "var(--text-muted)" },
	{ tag: [tags.heading, tags.strong], color: "var(--text-normal)", fontWeight: "700" },
	{ tag: tags.emphasis, fontStyle: "italic" },
	{ tag: tags.invalid, color: "var(--text-error)", textDecoration: "underline wavy var(--text-error)" },
]);

class NewCodeFileModal extends Modal {
	private readonly folder: TFolder;
	private readonly onSubmit: (filename: string) => void;

	constructor(app: App, folder: TFolder, onSubmit: (filename: string) => void) {
		super(app);
		this.folder = folder;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		let textComponent: TextComponent | null = null;

		this.titleEl.setText("Create new file");
		contentEl.addClass("obsidian-code-create-modal");

		new Setting(contentEl)
			.setName(this.folder.isRoot() ? "Vault root" : this.folder.path)
			.setDesc("Enter a filename such as main.py or hello.c.")
			.addText((text) => {
				textComponent = text;
				text.setPlaceholder("main.py");
				text.inputEl.addEventListener("keydown", (evt: KeyboardEvent) => {
					if (evt.key === "Enter") {
						evt.preventDefault();
						this.submit(text.getValue());
					}
				});
			});

		new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText("Create")
					.setCta()
					.onClick(() => {
						this.submit(textComponent?.getValue() ?? "");
					});
			})
			.addButton((button) => {
				button.setButtonText("Cancel").onClick(() => this.close());
			});

		setTimeout(() => {
			textComponent?.inputEl.focus();
		}, 0);
	}

	onClose() {
		this.contentEl.empty();
	}

	private submit(filename: string) {
		this.onSubmit(filename.trim());
		this.close();
	}
}

class CodeFileView extends TextFileView {
	private editorView: EditorView | null = null;
	private editorHostEl: HTMLDivElement | null = null;
	private isSettingViewData = false;
	private fontSizePx: number | null = null;
	private keydownWindow: Window | null = null;
	private readonly handleWindowKeydown = (event: KeyboardEvent) => {
		if (!this.isEventForEditor(event)) {
			return;
		}

		this.handleFontSizeKeydown(event);
	};

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.navigation = true;
		this.scope = new Scope(this.app.scope);
		this.registerFontSizeScopeHotkeys();
	}

	getViewType(): string {
		return VIEW_TYPE_CODE;
	}

	getDisplayText(): string {
		return this.file?.name ?? "Code";
	}

	getIcon(): string {
		return "file-code";
	}

	canAcceptExtension(extension: string): boolean {
		return CODE_EXTENSION_SET.has(extension.toLowerCase());
	}

	getViewData(): string {
		return this.editorView?.state.doc.toString() ?? this.data ?? "";
	}

	setViewData(data: string, clear: boolean): void {
		this.data = data;

		if (!this.editorView || clear) {
			this.mountEditor(data);
			return;
		}

		const currentDoc = this.editorView.state.doc.toString();
		if (currentDoc !== data) {
			this.isSettingViewData = true;
			try {
				this.editorView.dispatch({
					changes: {
						from: 0,
						to: currentDoc.length,
						insert: data,
					},
				});
			} finally {
				this.isSettingViewData = false;
			}
		}
	}

	clear(): void {
		this.data = "";
		this.destroyEditor();
		this.contentEl.empty();
	}

	protected async onClose(): Promise<void> {
		await super.onClose();
		this.destroyEditor();
		this.contentEl.empty();
	}

	private mountEditor(data: string) {
		this.destroyEditor();
		this.contentEl.empty();
		this.contentEl.addClass("obsidian-code-view");
		this.applyFontSize(this.ensureFontSizePx());
		this.editorHostEl = this.contentEl.createDiv({ cls: "obsidian-code-editor-host" });
		this.keydownWindow = this.contentEl.ownerDocument.defaultView;
		this.keydownWindow?.addEventListener("keydown", this.handleWindowKeydown, true);

		this.editorView = new EditorView({
			state: EditorState.create({
				doc: data,
				extensions: this.createEditorExtensions(),
			}),
			parent: this.editorHostEl,
		});

		this.editorHostEl.style.setProperty("--obsidian-code-tab-size", "4");
		this.updateIndentCharWidth();

		setTimeout(() => this.editorView?.focus(), 0);
	}

	private updateIndentCharWidth() {
		if (!this.editorView || !this.editorHostEl) {
			return;
		}

		const contentEl = this.editorView.contentDOM;
		const probe = contentEl.ownerDocument.createElement("span");
		probe.textContent = "0".repeat(40);
		probe.style.position = "absolute";
		probe.style.visibility = "hidden";
		probe.style.whiteSpace = "pre";
		contentEl.appendChild(probe);
		const width = probe.getBoundingClientRect().width / 40;
		contentEl.removeChild(probe);

		if (width > 0 && Number.isFinite(width)) {
			this.editorHostEl.style.setProperty("--obsidian-code-indent-step", `${width}px`);
		}
	}

	private destroyEditor() {
		this.keydownWindow?.removeEventListener("keydown", this.handleWindowKeydown, true);
		this.keydownWindow = null;
		this.editorView?.destroy();
		this.editorView = null;
		this.editorHostEl = null;
	}

	private createEditorExtensions(): Extension[] {
		const extensions: Extension[] = [
			EditorState.tabSize.of(4),
			indentUnit.of("    "),
			history(),
			search({ top: true }),
			autocompletion({ activateOnTyping: true }),
			closeBrackets(),
			bracketMatching(),
			lineNumbers(),
			foldGutter(),
			indentGuides(),
			highlightActiveLine(),
			drawSelection(),
			syntaxHighlighting(obsidianHighlightStyle, { fallback: true }),
			syntaxErrorLinter(),
			Prec.highest(
				EditorView.domEventHandlers({
					keydown: (event) => this.handleFontSizeKeydown(event),
				})
			),
			keymap.of([
				{
					key: "Mod-s",
					run: () => {
						void this.save();
						return true;
					},
				},
				{
					key: "Mod-=",
					run: () => this.increaseFontSize(),
				},
				{
					key: "Mod-+",
					run: () => this.increaseFontSize(),
				},
				{
					key: "Mod-Shift-=",
					run: () => this.increaseFontSize(),
				},
				{
					key: "Mod--",
					run: () => this.decreaseFontSize(),
				},
				indentWithTab,
				...searchKeymap,
				...completionKeymap,
				...foldKeymap,
				...closeBracketsKeymap,
				...lintKeymap,
				...defaultKeymap,
				...historyKeymap,
			]),
			EditorView.updateListener.of((update) => {
				if (!update.docChanged || this.isSettingViewData) {
					return;
				}

				this.data = update.state.doc.toString();
				this.requestSave();
			}),
			EditorView.theme({
				"&": {
					height: "100%",
					backgroundColor: "var(--background-primary)",
					color: "var(--text-normal)",
					fontFamily: "var(--font-monospace)",
					fontSize: "var(--obsidian-code-font-size, var(--font-text-size))",
				},
				".cm-scroller": {
					overflow: "auto",
					fontFamily: "var(--font-monospace)",
					lineHeight: "1.55",
				},
				".cm-content": {
					minHeight: "100%",
					padding: "16px 0 32px",
					caretColor: "var(--interactive-accent)",
				},
				".cm-line": {
					padding: "0 20px 0 4px",
				},
				".cm-gutters": {
					backgroundColor: "transparent",
					color: "var(--text-muted)",
					borderRight: "0",
					paddingLeft: "0",
					marginLeft: "0",
				},
				".cm-gutter": {
					paddingLeft: "0",
					marginLeft: "0",
				},
				".cm-lineNumbers .cm-gutterElement": {
					opacity: "0.48",
					minWidth: "2.2ch",
					padding: "0 4px 0 0",
					textAlign: "right",
				},
				".cm-gutter.cm-foldGutter": {
					minWidth: "12px",
				},
				".cm-foldGutter .cm-gutterElement": {
					color: "var(--text-faint)",
					cursor: "pointer",
					minWidth: "12px",
					padding: "0",
					textAlign: "center",
				},
				".cm-foldPlaceholder": {
					backgroundColor: "transparent",
					border: "none",
					borderRadius: "0",
					color: "var(--text-faint)",
					margin: "0 2px",
					padding: "0",
					opacity: "0.7",
				},
				".cm-line.obsidian-code-indent-line": {
					backgroundImage:
						"repeating-linear-gradient(to right, color-mix(in srgb, var(--text-faint) 28%, transparent) 0 1px, transparent 1px calc(var(--obsidian-code-indent-step, 1ch) * var(--obsidian-code-tab-size, 4)))",
					backgroundSize:
						"calc(var(--obsidian-code-indent-step, 1ch) * var(--obsidian-code-tab-size, 4) * var(--obsidian-code-indent-depth, 0)) 100%",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "var(--obsidian-code-indent-offset, 4px) 0",
				},
				".cm-lintRange-error": {
					backgroundImage: "linear-gradient(45deg, transparent 65%, var(--text-error) 80%, transparent 90%)",
				},
				".cm-lintRange-warning": {
					backgroundImage: "linear-gradient(45deg, transparent 65%, var(--text-warning) 80%, transparent 90%)",
				},
				".cm-activeLine": {
					backgroundColor: "color-mix(in srgb, var(--interactive-accent) 8%, transparent)",
				},
				".cm-activeLineGutter": {
					backgroundColor: "transparent",
				},
				"&.cm-focused": {
					outline: "none",
				},
				"&.cm-focused .cm-cursor": {
					borderLeftColor: "var(--interactive-accent)",
				},
				"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
					backgroundColor: "color-mix(in srgb, var(--interactive-accent) 24%, transparent) !important",
				},
				".cm-panels": {
					backgroundColor: "var(--background-secondary)",
					color: "var(--text-normal)",
					borderColor: "var(--background-modifier-border)",
				},
				".cm-tooltip": {
					backgroundColor: "var(--background-secondary)",
					color: "var(--text-normal)",
					borderColor: "var(--background-modifier-border)",
				},
			}),
		];

		const languageExtension = languageExtensionForFile(this.file);
		if (languageExtension) {
			extensions.push(languageExtension);
		}

		if (this.file?.extension.toLowerCase() === "json") {
			extensions.push(linter(jsonParseLinter()));
		}

		return extensions;
	}

	private isEventForEditor(event: KeyboardEvent): boolean {
		if (this.editorView?.hasFocus) {
			return true;
		}

		const target = event.target;
		if (target instanceof Node && this.contentEl.contains(target)) {
			return true;
		}

		const activeElement = this.contentEl.ownerDocument.activeElement;
		return activeElement instanceof Node && this.contentEl.contains(activeElement);
	}

	private handleFontSizeKeydown(event: KeyboardEvent): boolean {
		if (!isFontSizeShortcut(event)) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();

		if (isFontSizeIncreaseKey(event)) {
			return this.increaseFontSize();
		}

		return this.decreaseFontSize();
	}

	private increaseFontSize(): boolean {
		this.adjustFontSize(CODE_FONT_SIZE_STEP_PX);
		return true;
	}

	private decreaseFontSize(): boolean {
		this.adjustFontSize(-CODE_FONT_SIZE_STEP_PX);
		return true;
	}

	private adjustFontSize(deltaPx: number) {
		const nextFontSizePx = clamp(
			this.ensureFontSizePx() + deltaPx,
			MIN_CODE_FONT_SIZE_PX,
			MAX_CODE_FONT_SIZE_PX
		);

		if (nextFontSizePx === this.fontSizePx) {
			return;
		}

		this.fontSizePx = nextFontSizePx;
		this.applyFontSize(nextFontSizePx);
		this.editorView?.requestMeasure();
		this.updateIndentCharWidth();
	}

	private ensureFontSizePx(): number {
		if (this.fontSizePx !== null) {
			return this.fontSizePx;
		}

		this.fontSizePx = this.readInheritedFontSizePx();
		return this.fontSizePx;
	}

	private readInheritedFontSizePx(): number {
		const style = getComputedStyle(this.contentEl);
		const fontTextSize = parseCssPixelValue(style.getPropertyValue("--font-text-size"));
		const inheritedFontSize = parseCssPixelValue(style.fontSize);

		return clamp(
			fontTextSize ?? inheritedFontSize ?? DEFAULT_CODE_FONT_SIZE_PX,
			MIN_CODE_FONT_SIZE_PX,
			MAX_CODE_FONT_SIZE_PX
		);
	}

	private applyFontSize(fontSizePx: number) {
		this.contentEl.style.setProperty("--obsidian-code-font-size", `${fontSizePx}px`);
	}

	private registerFontSizeScopeHotkeys() {
		const zoomIn = () => {
			this.increaseFontSize();
			return false;
		};
		const zoomOut = () => {
			this.decreaseFontSize();
			return false;
		};

		this.scope?.register(["Mod"], "=", zoomIn);
		this.scope?.register(["Mod"], "+", zoomIn);
		this.scope?.register(["Mod", "Shift"], "+", zoomIn);
		this.scope?.register(["Mod"], "-", zoomOut);
		this.scope?.register(["Mod"], "_", zoomOut);
		this.scope?.register(["Mod", "Shift"], "_", zoomOut);
	}
}

export default class ObsidianCodePlugin extends Plugin {
	async onload() {
		this.registerView(VIEW_TYPE_CODE, (leaf) => new CodeFileView(leaf));

		for (const extension of CODE_EXTENSIONS) {
			this.registerCodeExtension(extension);
		}

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file: TAbstractFile) => {
				if (!(file instanceof TFolder)) {
					return;
				}

				menu.addItem((item) => {
					item
						.setTitle("Create new file")
						.setIcon("file-code")
						.onClick(() => {
							new NewCodeFileModal(this.app, file, (filename) => {
								void this.createCodeFile(file, filename);
							}).open();
						});
				});
			})
		);
	}

	private registerCodeExtension(extension: string) {
		try {
			this.registerExtensions([extension], VIEW_TYPE_CODE);
		} catch (error) {
			console.warn(
				`Obsidian Code: skipped .${extension}; another view already owns it.`,
				error
			);
		}
	}

	private async createCodeFile(folder: TFolder, filename: string) {
		if (!filename) {
			new Notice("Filename cannot be empty.");
			return;
		}

		const basePath = folder.isRoot() ? "" : folder.path;
		const path = normalizePath([basePath, filename].filter(Boolean).join("/"));

		if (!path || path.endsWith("/")) {
			new Notice("Enter a filename, not a folder path.");
			return;
		}

		if (this.app.vault.getAbstractFileByPath(path)) {
			new Notice(`A file already exists at ${path}.`);
			return;
		}

		try {
			await this.ensureFolderPath(parentPathFor(path));
			const createdFile = await this.app.vault.create(path, "");
			await this.app.workspace.getLeaf().openFile(createdFile);
			new Notice(`Created ${path}.`);
		} catch (error) {
			console.error("[obsidian-code] Failed to create file", error);
			new Notice(`Could not create ${path}.`);
		}
	}

	private async ensureFolderPath(folderPath: string) {
		if (!folderPath) {
			return;
		}

		const parts = normalizePath(folderPath).split("/").filter(Boolean);
		let currentPath = "";

		for (const part of parts) {
			currentPath = normalizePath([currentPath, part].filter(Boolean).join("/"));
			const existing = this.app.vault.getAbstractFileByPath(currentPath);

			if (existing instanceof TFolder) {
				continue;
			}

			if (existing) {
				throw new Error(`${currentPath} exists and is not a folder.`);
			}

			await this.app.vault.createFolder(currentPath);
		}
	}
}

function parentPathFor(path: string): string {
	const separatorIndex = path.lastIndexOf("/");
	return separatorIndex === -1 ? "" : path.slice(0, separatorIndex);
}

function parseCssPixelValue(value: string): number | null {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function indentGuides(): Extension {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildIndentGuideDecorations(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = buildIndentGuideDecorations(update.view);
				}
			}
		},
		{
			decorations: (plugin) => plugin.decorations,
		}
	);
}

function buildIndentGuideDecorations(view: EditorView): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();
	const tabSize = view.state.tabSize;
	const doc = view.state.doc;

	const lineDepths: number[] = new Array(doc.lines + 1);

	for (let lineNumber = 1; lineNumber <= doc.lines; lineNumber++) {
		const line = doc.line(lineNumber);
		const { depth, isBlank } = computeIndentDepth(line.text, tabSize);
		lineDepths[lineNumber] = isBlank ? -1 : depth;
	}

	let nextDepth = 0;
	for (let lineNumber = doc.lines; lineNumber >= 1; lineNumber--) {
		if (lineDepths[lineNumber] === -1) {
			lineDepths[lineNumber] = nextDepth;
		} else {
			nextDepth = lineDepths[lineNumber];
		}
	}

	for (let lineNumber = 1; lineNumber <= doc.lines; lineNumber++) {
		const depth = lineDepths[lineNumber];
		if (depth <= 0) {
			continue;
		}

		const line = doc.line(lineNumber);
		builder.add(
			line.from,
			line.from,
			Decoration.line({
				attributes: {
					class: "obsidian-code-indent-line",
					style: `--obsidian-code-indent-depth: ${depth}`,
				},
			})
		);
	}

	return builder.finish();
}

function computeIndentDepth(text: string, tabSize: number): { depth: number; isBlank: boolean } {
	let column = 0;

	for (let index = 0; index < text.length; index++) {
		const character = text[index];

		if (character === " ") {
			column += 1;
		} else if (character === "\t") {
			column += tabSize - (column % tabSize);
		} else {
			return { depth: Math.floor(column / tabSize), isBlank: false };
		}
	}

	return { depth: Math.floor(column / tabSize), isBlank: true };
}

function isFontSizeShortcut(event: KeyboardEvent): boolean {
	if (event.altKey) {
		return false;
	}

	const usesPrimaryModifier = isMacPlatform() ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
	return usesPrimaryModifier && (isFontSizeIncreaseKey(event) || isFontSizeDecreaseKey(event));
}

function isFontSizeIncreaseKey(event: KeyboardEvent): boolean {
	return event.key === "+" || event.key === "=" || event.code === "Equal" || event.code === "NumpadAdd";
}

function isFontSizeDecreaseKey(event: KeyboardEvent): boolean {
	return event.key === "-" || event.key === "_" || event.code === "Minus" || event.code === "NumpadSubtract";
}

function isMacPlatform(): boolean {
	return Platform.isMacOS;
}

function syntaxErrorLinter(): Extension {
	return linter((view) => {
		const diagnostics: Diagnostic[] = [];

		syntaxTree(view.state).iterate({
			enter: (node) => {
				if (!node.type.isError) {
					return;
				}

				diagnostics.push({
					from: node.from,
					to: Math.max(node.to, Math.min(node.from + 1, view.state.doc.length)),
					severity: "error",
					message: "Syntax error",
				});
			},
		});

		return diagnostics;
	});
}

function languageExtensionForFile(file: TFile | null): Extension | null {
	const extension = file?.extension.toLowerCase() ?? "";

	switch (extension) {
		case "c":
		case "cc":
		case "cpp":
		case "cxx":
		case "h":
		case "hh":
		case "hp":
		case "hpp":
		case "hxx":
			return cpp();
		case "cjs":
		case "js":
		case "mjs":
			return javascript();
		case "jsx":
			return javascript({ jsx: true });
		case "cts":
		case "mts":
		case "ts":
			return javascript({ typescript: true });
		case "tsx":
			return javascript({ typescript: true, jsx: true });
		case "css":
			return css();
		case "scss":
		case "sass":
			return StreamLanguage.define(sass);
		case "less":
			return StreamLanguage.define(legacyLess);
		case "htm":
		case "html":
		case "svelte":
		case "vue":
			return html();
		case "json":
			return json();
		case "mdx":
		case "qmd":
		case "rmd":
			return markdown();
		case "py":
			return python();
		case "svg":
		case "xml":
		case "xsd":
		case "xsl":
		case "xslt":
			return xml();
		case "yaml":
		case "yml":
			return yaml();
		case "java":
			return java();
		case "php":
			return php({ plain: true });
		case "rs":
			return rust();
		case "sql":
			return sql();
		case "sh":
		case "bash":
		case "zsh":
		case "fish":
			return StreamLanguage.define(shell);
		case "ps1":
			return StreamLanguage.define(powerShell);
		case "go":
			return StreamLanguage.define(go);
		case "rb":
			return StreamLanguage.define(ruby);
		case "lua":
			return StreamLanguage.define(lua);
		case "r":
			return StreamLanguage.define(r);
		case "swift":
			return StreamLanguage.define(swift);
		case "toml":
			return StreamLanguage.define(toml);
		case "ini":
		case "properties":
		case "env":
		case "editorconfig":
		case "npmrc":
			return StreamLanguage.define(properties);
		case "dockerfile":
			return StreamLanguage.define(dockerFile);
		case "cmake":
			return StreamLanguage.define(cmake);
		case "clj":
		case "cljs":
			return StreamLanguage.define(clojure);
		case "coffee":
		case "litcoffee":
			return StreamLanguage.define(coffeeScript);
		case "elm":
			return StreamLanguage.define(elm);
		case "erl":
		case "ex":
		case "exs":
			return StreamLanguage.define(erlang);
		case "f90":
		case "for":
			return StreamLanguage.define(fortran);
		case "hs":
		case "lhs":
			return StreamLanguage.define(haskell);
		case "jl":
			return StreamLanguage.define(julia);
		case "ml":
		case "mli":
			return StreamLanguage.define(oCaml);
		case "fs":
		case "fsx":
			return StreamLanguage.define(fSharp);
		case "pas":
		case "pp":
			return StreamLanguage.define(pascal);
		case "pl":
		case "pm":
		case "t":
			return StreamLanguage.define(perl);
		case "proto":
			return StreamLanguage.define(protobuf);
		case "sv":
		case "svh":
		case "v":
			return StreamLanguage.define(verilog);
		case "vhd":
		case "vhdl":
			return StreamLanguage.define(vhdl);
		default:
			return null;
	}
}
