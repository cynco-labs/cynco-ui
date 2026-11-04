"use client";

/**
 * Cynco UI — closing the month: the bank sign-off, then the period close
 * checklist and the way through to Periods.
 */
import { ArrowRightIcon, CircleIcon, SealCheckIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Button, cn, StatusChipIcon, type StatusGlyph, type StatusTone } from "../../base";
import { FG, MUTED, Shimmer, type With } from "./shared";

export type BankCloseCheck = {
	id: string;
	label: string;
	status: "pass" | "warn" | "attention" | "fail";
	text?: string;
	figures?: string;
};

const CHECK_TONE: Record<BankCloseCheck["status"], { tone: StatusTone; glyph: StatusGlyph; word: string }> = {
	pass: { tone: "green", glyph: "check", word: "Passes" },
	warn: { tone: "amber", glyph: "alert", word: "Warning" },
	attention: { tone: "amber", glyph: "alert", word: "Needs attention" },
	fail: { tone: "red", glyph: "x", word: "Fails" },
};
const FISCAL_LABEL = { open: "Open", closing: "Closing", closed: "Closed", locked: "Locked" } as const;

/**
 * MonthClose — closing the month: the bank sign-off (a closed reconciliation
 * session once the bridge ties and nothing is left to reconcile), then the
 * period close — fiscal status, the close checklist's two bank items, and
 * the way to Periods.
 */
export function BankMonthClose({
	monthName,
	state,
	signedOffLabel,
	standing = "none",
	staleNote,
	signing = false,
	fiscalStatus,
	checks,
	className,
	...props
}: With<
	{
		monthName: string;
		state: "ready" | "needs_work" | "in_progress" | "covered" | "no_statement" | "closed";
		/** "Signed off by Aisyah Rahman · 3 Apr 2026" */
		signedOffLabel?: string;
		standing?: "none" | "holds" | "stale";
		staleNote?: string;
		signing?: boolean;
		fiscalStatus?: keyof typeof FISCAL_LABEL | null;
		/** undefined = loading; null = no chart to close against. */
		checks?: BankCloseCheck[] | null;
		className?: string;
	},
	"section"
>) {
	const ready = state === "ready";
	let signOff: React.ReactNode;
	if (signedOffLabel && standing === "holds") {
		signOff = (
			<div className="flex items-start gap-2">
				<SealCheckIcon
					size={16}
					weight="fill"
					className="size-4 mt-0.5 shrink-0 text-status-green-text"
					aria-hidden="true"
				/>
				<div className="min-w-0">
					<p className={cn(FG, "font-semibold")}>{signedOffLabel}</p>
					<p className={MUTED}>The bank side of {monthName} is proven.</p>
				</div>
			</div>
		);
	} else if (state === "closed") {
		signOff = <p className={MUTED}>{monthName} was closed in Periods without a bank sign-off.</p>;
	} else {
		signOff = (
			<div className="flex flex-col gap-2">
				{standing === "stale" && staleNote && (
					<div className="flex items-start gap-2">
						<StatusChipIcon tone="amber" glyph="alert" className="mt-0.5" />
						<div className="min-w-0">
							{signedOffLabel && <p className={cn(FG, "font-semibold")}>{signedOffLabel}</p>}
							<p className={MUTED}>{staleNote}</p>
						</div>
					</div>
				)}
				<Button
					variant={ready ? "primary" : "secondary"}
					disabled={!ready || signing}
					isLoading={signing}
					className="w-full justify-center"
				>
					{standing === "stale" ? `Sign off ${monthName} again` : `Sign off ${monthName}`}
				</Button>
				{standing !== "stale" && (
					<p className={MUTED}>
						{ready
							? "Records a closed reconciliation session for the month, with who signed and when."
							: state === "in_progress"
								? `Opens once ${monthName} has ended.`
								: state === "covered"
									? `${monthName} is proven with the month its statement ends in.`
									: `Opens once ${monthName} has a statement, ties to the ledger, and every line is reconciled or excluded.`}
					</p>
				)}
			</div>
		);
	}
	const closedish = fiscalStatus === "closed" || fiscalStatus === "locked";
	return (
		<section aria-label={`Close ${monthName}`} className={cn("flex min-w-0 flex-col gap-4", className)} {...props}>
			<h3 className="text-sm font-semibold text-muted-foreground">Close {monthName}</h3>
			{signOff}
			<div className="flex flex-col gap-2.5 border-t border-border pt-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h4 className={cn(FG, "font-semibold")}>Period close</h4>
					<span
						className={cn("inline-flex items-center gap-1 text-2xs", closedish ? "text-foreground" : "text-muted-foreground")}
					>
						<CircleIcon
							size={8}
							className="size-2"
							weight={fiscalStatus === "open" || !fiscalStatus ? "regular" : "fill"}
							aria-hidden="true"
						/>
						{fiscalStatus ? FISCAL_LABEL[fiscalStatus] : "No period yet"}
					</span>
				</div>
				{checks === undefined && <Shimmer label="Loading checks" className="h-12 w-full rounded-lg" />}
				{checks && (
					<ul className="flex flex-col gap-2.5">
						{checks.map((c) => {
							const t = CHECK_TONE[c.status];
							return (
								<li key={c.id} className="flex items-start gap-2">
									<StatusChipIcon tone={t.tone} glyph={t.glyph} className="mt-[3px]" />
									<div className="min-w-0">
										<p className={FG}>
											{c.label}
											<span className="sr-only">: {t.word}</span>
										</p>
										{c.text && <p className={cn(MUTED, "break-words")}>{c.text}</p>}
										{c.figures && (
											<details className="mt-1 text-2xs text-tertiary-foreground">
												<summary className="cursor-pointer select-none hover:text-foreground">Show the figures</summary>
												<p className="font-mono text-2xs font-medium mt-1 break-words">{c.figures}</p>
											</details>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				)}
				{checks !== undefined && <p className={MUTED}>These checks cover every bank account for {monthName}.</p>}
				<a
					href="#periods"
					className="inline-flex w-fit items-center gap-1 rounded-sm text-sm text-primary underline-offset-4 hover:underline focus-ring"
				>
					{state === "closed" ? "Open Periods" : `Close ${monthName} in Periods`}
					<ArrowRightIcon size={12} className="size-3" aria-hidden="true" />
				</a>
			</div>
		</section>
	);
}
