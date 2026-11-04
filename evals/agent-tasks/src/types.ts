export const LIBRARY_IDS = ["cynco", "shadcn", "kumo", "fluid"] as const;
export type LibraryId = (typeof LIBRARY_IDS)[number];

export const TASK_IDS = [
	"account-settings",
	"team-members",
	"analytics-overview",
	"command-palette",
	"invoices-list",
	"new-invoice",
] as const;
export type TaskId = (typeof TASK_IDS)[number];
export type TaskSet = "generic" | "domain";

export const VIEWPORTS = [320, 375, 768, 1280] as const;
export type Viewport = (typeof VIEWPORTS)[number];

export interface RunKey {
	runId: string;
	task: TaskId;
	library: LibraryId;
	trial: number;
}

export interface AgentMetrics {
	/** null when the agent never reached its result message (timeout or crash). */
	costUsd: number | null;
	turns: number;
	durationMs: number;
	/** Prompt tokens including cache reads and cache writes. */
	inputTokens: number;
	outputTokens: number;
	isError: boolean;
	timedOut: boolean;
	toolCalls: Record<string, number>;
	docLookups: number;
}

export interface BuildMetrics {
	ok: boolean;
	typeErrors: number;
	buildErrors: string[];
}

export interface AxeCounts {
	critical: number;
	serious: number;
	moderate: number;
	minor: number;
}

export interface BrowserMetrics {
	rendered: boolean;
	consoleErrors: number;
	/** Violating nodes per impact, at 1280px. */
	axe: AxeCounts;
	overflow: Record<Viewport, boolean>;
	focusVisible: { checked: number; visible: number };
}

export interface SourceMetrics {
	files: number;
	lines: number;
	rawInteractive: number;
	/** Distinct names imported from the library. */
	libraryImports: number;
	offSystemStyles: number;
}

export interface ScoreRecord {
	build: BuildMetrics;
	/** null when the build failed or the page could not be loaded; browserError says which. */
	browser: BrowserMetrics | null;
	browserError: string | null;
	source: SourceMetrics;
}

export const JUDGE_CRITERIA = ["fulfils", "hierarchy", "polish", "mobile"] as const;
export type JudgeCriterion = (typeof JUDGE_CRITERIA)[number];

export type JudgeScores = Record<JudgeCriterion, number> & { notes: string };

export interface JudgeRecord {
	labels: Record<string, LibraryId>;
	/** A library with no screenshots (failed build or page) gets 1 on every criterion and judged: false. */
	scores: Partial<Record<LibraryId, JudgeScores & { judged: boolean }>>;
	costUsd: number | null;
}

export interface WorkspaceRecord {
	path: string;
	base: string;
}

export interface BaseRecord {
	library: LibraryId;
	path: string;
	versions: Record<string, string>;
	skills: Record<string, string>;
	steps: string[];
	probe: ScoreRecord;
}

export interface RunRecord {
	runId: string;
	created: string;
	workRoot: string;
	cynco: "local" | "npm";
	agentCmd?: string;
	cliVersion?: string;
	model?: string;
	budgetUsd?: number;
	judgeModel?: string;
}
