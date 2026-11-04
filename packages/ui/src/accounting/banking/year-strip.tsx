"use client";

/**
 * Cynco UI — one account's fiscal year as twelve month cells, and the heading
 * that names the selected month, its state and its next step.
 */
import { CaretLeftIcon, CaretRightIcon, CheckIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { Button, cn, StatusChip, type StatusGlyph, type StatusTone, useControllableState } from "../../base";
import { surfaces } from "../../lib/shared";
import { countOf, MUTED, type With } from "./shared";

export type BankCloseMonthState =
	| "closed"
	| "ready"
	| "needs_work"
	| "no_statement"
	| "covered"
	| "in_progress"
	| "future";
export type BankCloseMonth = {
	/** "2026-03" */
	period: string;
	state: BankCloseMonthState;
	/** Lines still to post or reconcile. */
	openLines?: number;
	/** A no-statement month the account moved in (vs. quiet, before history). */
	missing?: boolean;
	/** needs_work because the bridge is off. */
	untied?: boolean;
	signedOff?: "holds" | "stale";
};

const STATE_LABEL: Record<BankCloseMonthState, string> = {
	closed: "Closed",
	ready: "Ready to close",
	needs_work: "Needs work",
	no_statement: "No statement",
	covered: "Covered",
	in_progress: "In progress",
	future: "Not started",
};
const STATE_CHIP: Record<BankCloseMonthState, { tone: StatusTone; glyph: StatusGlyph; dashed?: boolean }> = {
	closed: { tone: "neutral", glyph: "check" },
	ready: { tone: "green", glyph: "check" },
	needs_work: { tone: "amber", glyph: "alert" },
	no_statement: { tone: "neutral", glyph: "dashed", dashed: true },
	covered: { tone: "blue", glyph: "minus" },
	in_progress: { tone: "blue", glyph: "clock" },
	future: { tone: "neutral", glyph: "dashed", dashed: true },
};
type Look = Exclude<BankCloseMonthState, "no_statement"> | "missing" | "quiet";
const lookOf = (m: BankCloseMonth): Look => (m.state !== "no_statement" ? m.state : m.missing ? "missing" : "quiet");
const BAR: Record<Look, string> = {
	closed: "bg-muted-foreground",
	ready: "bg-status-green",
	needs_work: "bg-status-amber",
	missing: "border border-dashed border-status-amber bg-transparent",
	quiet: "bg-foreground/8",
	covered: "border border-tertiary-foreground bg-transparent",
	in_progress: "bg-tertiary-foreground/40",
	future: "bg-foreground/8",
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const monthIdx = (p: string) => parseInt(p.slice(5, 7), 10) - 1;

/** The month-state chip used on the selected month's heading. */
export function BankCloseStateChip({
	state,
	className,
	...props
}: With<{ state: BankCloseMonthState; className?: string }, "span">) {
	const c = STATE_CHIP[state];
	return (
		<StatusChip tone={c.tone} glyph={c.glyph} dashed={c.dashed} className={className} {...props}>
			{STATE_LABEL[state]}
		</StatusChip>
	);
}

function CellDetail({ m }: { m: BankCloseMonth }) {
	if (m.state === "closed") return <LockSimpleIcon size={12} className="size-3" aria-hidden="true" />;
	if (m.signedOff === "holds") return <CheckIcon size={12} className="size-3" weight="bold" aria-hidden="true" />;
	const open = m.state === "needs_work" || m.state === "covered" ? (m.openLines ?? 0) : 0;
	if (open > 0) return <>{open}</>;
	if (m.state === "needs_work") return <>{m.untied ? "Off" : "—"}</>;
	if (lookOf(m) === "missing") return <>Missing</>;
	return null;
}

/** CellDetail in words, for the month button's accessible name. */
function cellDetailText(m: BankCloseMonth): string | null {
	if (m.state === "closed") return null;
	if (m.signedOff === "holds") return "signed off";
	const open = m.state === "needs_work" || m.state === "covered" ? (m.openLines ?? 0) : 0;
	if (open > 0) return `${countOf(open, "line")} open`;
	if (m.state === "needs_work" && m.untied) return "off against the ledger";
	return null;
}

/**
 * ReconciliationView's header and YearStrip — one account's fiscal year as
 * twelve month cells (closed, ready, needs work, missing, covered, in
 * progress, not started), and the selected month's heading, state and the
 * one sentence naming its next step. 12 across when wide, 6 or 4 per row
 * when narrow.
 */
export function BankReconciliationYearStrip({
	months,
	selected,
	yearLabel,
	accountName,
	calendarMonths = false,
	defaultSelected,
	onSelectedChange,
	selectedSummary,
	onPreviousYear,
	onNextYear,
	className,
	...props
}: With<{
	months: BankCloseMonth[];
	/** The month shown as selected, as "2026-03", or `null` for none (controlled). */
	selected?: string | null;
	/** The month selected before the user picks one. Default none. */
	defaultSelected?: string | null;
	/** "FY 2026" */
	yearLabel: string;
	accountName: string;
	calendarMonths?: boolean;
	/** The next-step sentence for the selected month, and its sign-off line. */
	selectedSummary?: { nextStep: string; signedOffLabel?: string };
	/** Called when the user clicks the Previous year button. */
	onPreviousYear?: () => void;
	/** Called when the user clicks the Next year button. */
	onNextYear?: () => void;
	/** Called when the user selects a month cell, or `null` when they deselect it. */
	onSelectedChange?: (period: string | null) => void;
	className?: string;
}>) {
	const [period = null, setPeriod] = useControllableState<string | null>({
		prop: selected,
		defaultProp: defaultSelected ?? null,
		onChange: onSelectedChange,
	});
	const sel = months.find((m) => m.period === period);
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<div className="flex items-center gap-2">
				<div className="min-w-0 flex-1">
					<h2 className="text-md font-semibold text-foreground">Month-end close · {yearLabel}</h2>
					{calendarMonths && (
						<p className={MUTED}>No fiscal year end is set, so these are calendar months. Set it in Periods.</p>
					)}
				</div>
				<Button
					variant="skeleton"
					size="icon"
					aria-label="Previous year"
					onClick={onPreviousYear}
					disabled={!onPreviousYear}
				>
					<CaretLeftIcon size={14} className="size-3.5" aria-hidden="true" />
				</Button>
				<Button variant="skeleton" size="icon" aria-label="Next year" onClick={onNextYear} disabled={!onNextYear}>
					<CaretRightIcon size={14} className="size-3.5" aria-hidden="true" />
				</Button>
			</div>
			{/* biome-ignore lint/a11y/useSemanticElements: no HTML element groups buttons; fieldset is for form controls and needs a legend. */}
			<div
				role="group"
				aria-label={`Months of ${yearLabel} for ${accountName}`}
				className={cn(surfaces.tray, "grid grid-cols-4 gap-0.5 @sm:grid-cols-6 @2xl:grid-cols-12")}
			>
				{months.map((m) => {
					const isSel = m.period === period;
					const look = lookOf(m);
					return (
						<button
							key={m.period}
							type="button"
							aria-current={isSel || undefined}
							aria-label={[
								`${MONTHS_LONG[monthIdx(m.period)]} ${m.period.slice(0, 4)}`,
								look === "quiet" ? "no activity" : look === "missing" ? "statement missing" : STATE_LABEL[m.state],
								cellDetailText(m),
							]
								.filter(Boolean)
								.join(", ")}
							className={cn(
								"relative flex min-h-14 min-w-0 cursor-pointer flex-col items-stretch gap-1.5 rounded-lg border px-1.5 pt-2 pb-2.5 text-left transition-colors focus-ring",
								isSel
									? "border-table-surface-border bg-table-surface shadow-xs"
									: "border-transparent hover:bg-table-surface/60",
							)}
							onClick={() => setPeriod(isSel ? null : m.period)}
						>
							<span
								className={cn(
									"text-2xs leading-4",
									isSel ? "font-semibold text-foreground" : m.state === "future" ? "text-subtle" : "text-muted-foreground",
								)}
							>
								{MONTHS[monthIdx(m.period)]}
							</span>
							<span aria-hidden="true" className={cn("block h-1.5 w-full rounded-full", BAR[look])} />
							<span
								aria-hidden="true"
								className={cn(
									"flex h-3 items-center truncate text-2xs leading-3 tabular-nums",
									m.state === "needs_work" || look === "missing" ? "font-medium text-foreground" : "text-tertiary-foreground",
								)}
							>
								<CellDetail m={m} />
							</span>
							{isSel && <span aria-hidden="true" className="absolute inset-x-1.5 bottom-0.5 h-0.5 rounded-full bg-primary" />}
						</button>
					);
				})}
			</div>
			{sel && selectedSummary && (
				<div className="flex flex-col gap-1 border-t border-border pt-3">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">
							{MONTHS_LONG[monthIdx(sel.period)]} {sel.period.slice(0, 4)}
						</h2>
						<BankCloseStateChip state={sel.state} />
						{selectedSummary.signedOffLabel && (
							<span className="text-2xs text-muted-foreground">{selectedSummary.signedOffLabel}</span>
						)}
					</div>
					<p className="text-sm leading-5 text-muted-foreground">{selectedSummary.nextStep}</p>
				</div>
			)}
		</div>
	);
}
