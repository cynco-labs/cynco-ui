"use client";

import { WarningIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Alert, AlertDescription, cn } from "../../base";
import { useNeedsScrollStop } from "../../layout/scroll-stop";
import { type Amount, absAmount, subtractAmounts, sumAmounts, toSen } from "../../lib/money";
import { formatBracketed, formatCurrency, SectionPanel, StatGrid, StatTile, surfaces } from "../../lib/shared";
import { AccountLabel, CheckChip, DOUBLE_RULE, Figure, ratioOf } from "./shared";

/** The single rule a section total sits above. */

const SINGLE_RULE = "border-t border-foreground/30 pt-px";

export type StatementRowKind =
	| "heading"
	| "section-header"
	| "account"
	| "section-total"
	| "line"
	| "subtotal"
	| "grand-total";

/** One rung of a statement ladder (cynco services/reporting/statementRows). */
export interface StatementRow {
	key: string;
	kind: StatementRowKind;
	label: string;
	accountCode?: string;
	/** [current] or [current, prior]. */
	values?: Amount[];
	/** Expense-type section: a positive contribution reads as a deduction. */
	negate?: boolean;
	/** The posted variance. Omit it and the row subtracts prior from current, which a comparative statement may do. */
	variance?: Amount;
	variancePct?: number | null;
}

function formatVariancePct(pct: number | null | undefined): string {
	if (pct == null || !Number.isFinite(pct)) return "-";
	if (pct > 999) return ">999%";
	if (pct < -999) return "<-999%";
	return `${pct}%`;
}

/** An account amount: parenthesized when it counts against its section; absolute otherwise. */
function contribution(value: Amount, negate: boolean | undefined, forceParen?: boolean) {
	const sen = toSen(value);
	if (sen === 0n) return <Figure value={0} />;
	const against = forceParen ?? (negate ? sen > 0n : sen < 0n);
	const s = formatBracketed(absAmount(value));
	return <span className="tabular-nums whitespace-nowrap">{against ? `(${s})` : s}</span>;
}

/**
 * Rows renderer shared by both statements (cynco StatementTableRows). A ladder
 * with headings and indents, so a bespoke table rather than DataList: the
 * account column wraps, and the comparative Variance/% columns drop below
 * 32rem of container width so Account | Current | Prior still fits a phone.
 */
function StatementTable({
	rows,
	comparative,
	currency,
	signColorTotals,
	ariaLabel,
}: {
	rows: StatementRow[];
	comparative: boolean;
	currency: string;
	signColorTotals: boolean;
	ariaLabel: string;
}) {
	const span = comparative ? 5 : 2;
	// Every column stays at every width: the table scrolls sideways instead (tables are exempt from reflow,
	// hiding figures is not). The scroller becomes a tab stop while it overflows so the keyboard can scroll it.
	const scroller = React.useRef<HTMLDivElement>(null);
	const needsStop = useNeedsScrollStop(scroller);
	const TH = "px-2 py-2 text-xs font-medium whitespace-nowrap text-tertiary-foreground first:pl-3 last:pr-3 @lg:px-3";
	const TD = "px-2 py-1 align-top first:pl-3 last:pr-3 @lg:px-3";
	const NUM = "text-right tabular-nums whitespace-nowrap";
	const INDENT = "first:pl-5 @md:first:pl-7";
	/** Row headers (the account / line label) keep body-cell styling. */
	const RH = "text-left font-normal";
	return (
		<div className={cn("@container min-w-0", surfaces.tray)}>
			{/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role, aria-label and tabIndex are set together on the same condition, which the rule cannot see through */}
			<div
				ref={scroller}
				role={needsStop ? "group" : undefined}
				aria-label={needsStop ? `${ariaLabel}, scrolls sideways` : undefined}
				tabIndex={needsStop ? 0 : undefined}
				className={cn(surfaces.surface, "overflow-x-auto outline-none focus-ring-inset")}
			>
				<table className="w-full border-collapse text-sm">
					<caption className="sr-only">{ariaLabel}</caption>
					<thead>
						<tr className="border-b border-table-row-divider">
							<th scope="col" className={cn(TH, "text-left")}>
								Account
							</th>
							{comparative ? (
								<>
									<th scope="col" className={cn(TH, "text-right")}>
										Current <span className="hidden @md:inline">({currency})</span>
									</th>
									<th scope="col" className={cn(TH, "text-right")}>
										Prior <span className="hidden @md:inline">({currency})</span>
									</th>
									<th scope="col" className={cn(TH, "text-right")}>
										Variance
									</th>
									<th scope="col" className={cn(TH, "text-right")}>
										%
									</th>
								</>
							) : (
								<th scope="col" className={cn(TH, "text-right")}>
									Amount ({currency})
								</th>
							)}
						</tr>
					</thead>
					<tbody className="[&>tr]:border-b [&>tr]:border-table-row-divider [&>tr:last-child]:border-0">
						{rows.map((row) => {
							const [current = 0, prior = 0] = row.values ?? [];
							const variance = row.variance ?? subtractAmounts(current, prior);
							const pct =
								row.variancePct !== undefined
									? row.variancePct
									: toSen(prior) === 0n
										? null
										: Math.round(ratioOf(variance, absAmount(prior)) * 1000) / 10;
							const total = row.kind === "subtotal" || row.kind === "grand-total";
							const compareCells = comparative && (
								<>
									<td
										className={cn(
											TD,
											NUM,
											total && "font-semibold",
											toSen(variance) < 0n ? surfaces.negative : "text-foreground",
										)}
									>
										<Figure value={variance} />
									</td>
									<td className={cn(TD, NUM, "text-tertiary-foreground")}>{formatVariancePct(pct)}</td>
								</>
							);
							switch (row.kind) {
								case "heading":
									return (
										<tr key={row.key}>
											<th
												scope="row"
												colSpan={span}
												className="px-3 pt-1.5 pb-1 text-left text-2xs font-medium uppercase tracking-[0.04em] text-tertiary-foreground"
											>
												{row.label}
											</th>
										</tr>
									);
								case "section-header":
									return (
										<tr key={row.key}>
											<th scope="row" colSpan={span} className={cn(TD, RH, "pt-1.5 font-medium text-foreground")}>
												{row.label}
											</th>
										</tr>
									);
								case "account":
									return (
										<tr key={row.key} className="hover:bg-table-row-hover">
											<th scope="row" className={cn(TD, RH, INDENT)}>
												<AccountLabel code={row.accountCode} label={row.label} />
											</th>
											<td className={cn(TD, NUM, "text-foreground")}>{contribution(current, row.negate)}</td>
											{comparative && (
												<td className={cn(TD, NUM, "text-tertiary-foreground")}>{contribution(prior, row.negate)}</td>
											)}
											{compareCells}
										</tr>
									);
								case "section-total":
									return (
										<tr key={row.key}>
											<th scope="row" className={cn(TD, RH, INDENT, "text-foreground")}>
												{row.label}
											</th>
											<td className={cn(TD, NUM, "text-foreground")}>
												<span className={SINGLE_RULE}>{contribution(current, row.negate, !!row.negate)}</span>
											</td>
											{comparative && (
												<td className={cn(TD, NUM, "text-tertiary-foreground")}>
													<span className={SINGLE_RULE}>{contribution(prior, row.negate, !!row.negate)}</span>
												</td>
											)}
											{compareCells}
										</tr>
									);
								case "line":
									return (
										<tr key={row.key}>
											<th scope="row" className={cn(TD, RH, INDENT, "italic")}>
												{row.label}
											</th>
											<td className={cn(TD, NUM, "text-foreground")}>
												<Figure value={current} />
											</td>
											{comparative && (
												<td className={cn(TD, NUM, "text-tertiary-foreground")}>
													<Figure value={prior} red={false} />
												</td>
											)}
											{compareCells}
										</tr>
									);
								case "subtotal":
								case "grand-total": {
									const rule = row.kind === "grand-total" ? DOUBLE_RULE : "";
									return (
										<tr key={row.key} className="bg-muted/60">
											<th scope="row" className={cn(TD, "text-left font-semibold text-foreground")}>
												{row.label}
											</th>
											<td className={cn(TD, NUM, "font-semibold text-foreground")}>
												<span className={rule}>
													<Figure value={current} red={signColorTotals} />
												</span>
											</td>
											{comparative && (
												<td className={cn(TD, NUM, "font-semibold text-tertiary-foreground")}>
													<span className={rule}>
														<Figure value={prior} red={false} />
													</span>
												</td>
											)}
											{compareCells}
										</tr>
									);
								}
								default: {
									const unhandled: never = row.kind;
									return unhandled;
								}
							}
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/**
 * Profit & loss (cynco routes/dashboard.reports.profit-loss + StatementTableRows):
 * revenue → cost of sales → gross profit → operating expenses → operating profit
 * → net income. Expense lines bracket, totals colour by sign.
 */
export function ProfitLossStatement({
	period,
	priorPeriod,
	rows,
	description,
	currency = "MYR",
	className,
	...props
}: React.ComponentProps<"section"> & {
	/** Current period label, e.g. "October 2026" or "Jan – Oct 2026". */
	period: string;
	/** Set to render the comparative (Current | Prior | Variance | %) layout. */
	priorPeriod?: string;
	rows: StatementRow[];
	description?: React.ReactNode;
	currency?: string;
}) {
	const comparative = !!priorPeriod;
	const accounts = rows.filter((r) => r.kind === "account").length;
	return (
		<SectionPanel
			flush
			className={className}
			{...props}
			title={comparative ? "Comparative profit & loss" : `Profit & loss · ${period}`}
			description={description ?? (comparative ? `${period} vs ${priorPeriod}` : `${accounts} accounts with activity`)}
		>
			<div className="px-1.5 pb-1.5">
				<StatementTable
					rows={rows}
					comparative={comparative}
					currency={currency}
					signColorTotals
					ariaLabel={`Profit and loss, ${period}`}
				/>
			</div>
		</SectionPanel>
	);
}

/**
 * Balance sheet (cynco routes/dashboard.reports.balance-sheet): the totals tiles,
 * the out-of-balance callout, and assets / liabilities / equity with the
 * balanced chip in the section header.
 */
export function BalanceSheetStatement({
	asAt,
	priorPeriod,
	rows,
	totals,
	equityLabel = "Total equity",
	showTotalsStrip = true,
	balanced,
	description,
	currency = "MYR",
	className,
	...props
}: React.ComponentProps<"div"> & {
	/** "As at" label, e.g. "31 Oct 2026". */
	asAt: string;
	priorPeriod?: string;
	rows: StatementRow[];
	/** Tiles + balance check. */
	totals: { assets: Amount; liabilities: Amount; equity: Amount };
	/** "Total equity", "Total owner's equity" (sole prop), "Total partners' capital"… */
	equityLabel?: string;
	/** The Total assets / liabilities / equity tiles above the statement. */
	showTotalsStrip?: boolean;
	balanced?: boolean;
	description?: React.ReactNode;
	currency?: string;
}) {
	const claims = sumAmounts([totals.liabilities, totals.equity]);
	const diff = subtractAmounts(totals.assets, claims);
	const ok = balanced ?? toSen(diff) === 0n;
	const comparative = !!priorPeriod;
	const accounts = rows.filter((r) => r.kind === "account").length;
	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			{showTotalsStrip && (
				<StatGrid>
					<StatTile label="Total assets" value={formatCurrency(totals.assets, currency)} />
					<StatTile label="Total liabilities" value={formatCurrency(totals.liabilities, currency)} />
					<StatTile label={equityLabel} value={formatCurrency(totals.equity, currency)} />
				</StatGrid>
			)}
			{!ok && (
				<Alert variant="destructive">
					<WarningIcon size={16} weight="fill" aria-hidden="true" />
					<AlertDescription>
						Assets ({formatBracketed(totals.assets)}) do not equal liabilities plus equity ({formatBracketed(claims)}), a
						difference of {currency} {formatBracketed(diff)}.
					</AlertDescription>
				</Alert>
			)}
			<SectionPanel
				flush
				title={comparative ? "Comparative balance sheet" : `Balance sheet as at ${asAt}`}
				description={description ?? (comparative ? `${asAt} vs ${priorPeriod}` : `${accounts} accounts with balances`)}
				actions={<CheckChip ok={ok}>{ok ? (comparative ? "Both balanced" : "Balanced") : "Unbalanced"}</CheckChip>}
			>
				<div className="px-1.5 pb-1.5">
					<StatementTable
						rows={rows}
						comparative={comparative}
						currency={currency}
						signColorTotals={false}
						ariaLabel={`Balance sheet as at ${asAt}`}
					/>
				</div>
			</SectionPanel>
		</div>
	);
}
