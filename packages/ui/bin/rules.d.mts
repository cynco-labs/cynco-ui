export type Rule = {
	id: string;
	why: string;
	re: RegExp;
	/** Where the rule looks: class attributes and cn()-style calls, every string literal, or code lines. */
	in: "class" | "string" | "code";
	accept?: (match: string, token: string) => boolean;
};

export type Violation = { file: string; line: number; rule: string; match: string; why: string };

export type AllowEntry = { path: string; pattern: string; line: number; used: boolean };

export const RULES: readonly Rule[];

/** The rules `cynco-ui check` runs in an app: every rule but viewport breakpoints. */
export const APP_RULES: readonly Rule[];

export function violations(file: string, src: string, rules?: readonly Rule[]): Violation[];

export function sourceFiles(dir: string, exts: readonly string[], skip?: ReadonlySet<string>): Generator<string>;

export function readAllow(path: string, label?: string): { entries: AllowEntry[]; errors: string[] };

export function allows(entry: AllowEntry, v: Violation): boolean;

export function check(options: {
	files: readonly string[];
	/** The paths the files were found under, in `rel` form; allow entries outside them are not reported stale. */
	roots: readonly string[];
	rel: (file: string) => string;
	rulesFor: (file: string) => readonly Rule[];
	allowPath: string;
	allowLabel?: string;
	where: string;
	quiet?: boolean;
}): 0 | 1;
