"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { LiveStatus } from "../general/live-status";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import {
	type ComponentProps,
	createContext,
	Fragment,
	type HTMLAttributes,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { BundledLanguage, ShikiTransformer } from "shiki";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";
import { bundledThemes } from "shiki/themes";

type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
	code: string;
	language: BundledLanguage;
	showLineNumbers?: boolean;
};

type CodeBlockContextType = {
	code: string;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
	code: "",
});

const LINE_NUMBER_CLASSES = [
	"inline-block",
	"min-w-10",
	"mr-4",
	"text-right",
	"select-none",
	"text-muted-foreground",
];

const lineNumberTransformer: ShikiTransformer = {
	name: "line-numbers",
	line(node, line) {
		node.children.unshift({
			type: "element",
			tagName: "span",
			// Line numbers are visual only; screen readers read the code itself.
			properties: { "aria-hidden": "true", className: LINE_NUMBER_CLASSES },
			children: [{ type: "text", value: String(line) }],
		});
	},
};

// One Light tokens fall to ~3:1 on the page background; this theme keeps every token above 4.5:1.
const LIGHT_THEME = "github-light-high-contrast";

// One highlighter per page on Shiki's JavaScript regex engine, which avoids the ~600 KB Oniguruma WASM
// download; grammars load on first use. `forgiving` skips the rare pattern the engine can't compile
// instead of failing the whole grammar.
let highlighterPromise: Promise<HighlighterCore> | undefined;

async function getHighlighter(language: BundledLanguage) {
	highlighterPromise ??= createHighlighterCore({
		themes: [bundledThemes[LIGHT_THEME], bundledThemes["one-dark-pro"]],
		langs: [],
		engine: createJavaScriptRegexEngine({ forgiving: true }),
	}).catch((error: unknown) => {
		highlighterPromise = undefined;
		throw error;
	});
	const highlighter = await highlighterPromise;
	if (!highlighter.getLoadedLanguages().includes(language)) {
		await highlighter.loadLanguage(bundledLanguages[language]);
	}
	return highlighter;
}

export async function highlightCode(
	code: string,
	language: BundledLanguage,
	showLineNumbers = false,
): Promise<[string, string]> {
	const highlighter = await getHighlighter(language);
	const transformers: ShikiTransformer[] = showLineNumbers
		? [lineNumberTransformer]
		: [];
	return [
		highlighter.codeToHtml(code, { lang: language, theme: LIGHT_THEME, transformers }),
		highlighter.codeToHtml(code, { lang: language, theme: "one-dark-pro", transformers }),
	];
}

const PANE_CLASSES =
	"overflow-auto outline-none focus-ring-inset [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&_code]:font-mono [&_code]:text-sm";

export const CodeBlock = ({
	code,
	language,
	showLineNumbers = false,
	className,
	children,
	...props
}: CodeBlockProps) => {
	const [html, setHtml] = useState<string>("");
	const [darkHtml, setDarkHtml] = useState<string>("");

	useEffect(() => {
		let cancelled = false;
		highlightCode(code, language, showLineNumbers)
			.then(([light, dark]) => {
				if (cancelled) return;
				setHtml(light);
				setDarkHtml(dark);
			})
			// An unknown language or a failed grammar load keeps the plain-text rendering.
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [code, language, showLineNumbers]);

	return (
		<CodeBlockContext.Provider value={{ code }}>
			<div
				className={cn(
					"group relative w-full overflow-hidden rounded-md border bg-background text-foreground",
					className,
				)}
				{...props}
			>
				<div className="relative">
					{/* tabIndex: long lines scroll horizontally, which keyboard users must reach. */}
					{html ? (
						<>
							<div
								className={cn(PANE_CLASSES, "dark:hidden")}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: "this is needed."
								dangerouslySetInnerHTML={{ __html: html }}
								tabIndex={0}
							/>
							<div
								className={cn(PANE_CLASSES, "hidden dark:block")}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: "this is needed."
								dangerouslySetInnerHTML={{ __html: darkHtml }}
								tabIndex={0}
							/>
						</>
					) : (
						// Plain text with Shiki's line structure until the highlighter is ready, so the code is
						// readable on first paint (and server-rendered) and the colours swap in without a shift.
						<div className={PANE_CLASSES} tabIndex={0}>
							<pre tabIndex={0}>
								<code>
									{code.split("\n").map((line, i) => (
										<Fragment key={i}>
											{i > 0 && "\n"}
											<span className="line">
												{showLineNumbers && (
													<span aria-hidden="true" className={LINE_NUMBER_CLASSES.join(" ")}>
														{i + 1}
													</span>
												)}
												{line}
											</span>
										</Fragment>
									))}
								</code>
							</pre>
						</div>
					)}
					{children && (
						<div className="absolute top-2 right-2 flex items-center gap-2">
							{children}
						</div>
					)}
				</div>
			</div>
		</CodeBlockContext.Provider>
	);
};

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
	onCopy?: () => void;
	onError?: (error: Error) => void;
	timeout?: number;
};

export const CodeBlockCopyButton = ({
	onCopy,
	onError,
	timeout = 2000,
	children,
	className,
	...props
}: CodeBlockCopyButtonProps) => {
	const [isCopied, setIsCopied] = useState(false);
	const { code } = useContext(CodeBlockContext);
	const resetTimer = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(resetTimer.current), []);

	const copyToClipboard = async () => {
		if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
			onError?.(new Error("Clipboard API not available"));
			return;
		}

		try {
			await navigator.clipboard.writeText(code);
			setIsCopied(true);
			onCopy?.();
			window.clearTimeout(resetTimer.current);
			resetTimer.current = window.setTimeout(() => setIsCopied(false), timeout);
		} catch (error) {
			onError?.(error as Error);
		}
	};

	const Icon = isCopied ? CheckIcon : CopyIcon;

	return (
		<>
			<Button
				aria-label={children ? undefined : "Copy code"}
				className={cn("shrink-0", className)}
				onClick={copyToClipboard}
				size="icon"
				type="button"
				variant="skeleton"
				{...props}
			>
				{children ?? <Icon size={14} />}
			</Button>
			{/* Rendered empty up front so the confirmation is announced reliably. */}
			<LiveStatus>
				{isCopied ? "Copied" : ""}
			</LiveStatus>
		</>
	);
};
