"use client";

/**
 * Cynco UI — financial reports & the CFO dashboard.
 *
 * Hand-written, presentational ports of cynco-labs/cynco
 * remix/app/components/reports/* and dashboard/overview/*, rebuilt on Cynco UI
 * primitives and the shared Cynco layout primitives (DataList, StatGrid,
 * SectionPanel, ActionBar). Every component responds to its own container width.
 *
 * Conventions kept from Cynco: Dr/Cr columns left blank at zero, bracketed
 * deductions, em-dash zeros, account codes in mono, "RM" via formatCurrency,
 * aging bands Current / 1–30 / 31–60 / 61–90 / 90+.
 */
import * as React from "react";
import {
	Alert,
	AlertDescription,
	Button,
	ChartContainer,
	ChartTooltip,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	GroupedTabButton,
	Progress,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
	StatusChip,
	StatusChipIcon,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	cn,
	useControllableState,
	type StatusGlyph,
	type StatusTone,
} from "../base";
import {
	ArrowDownLeftIcon,
	ArrowDownRightIcon,
	ArrowRightIcon,
	ArrowUpRightIcon,
	BankIcon,
	CameraIcon,
	CaretRightIcon,
	ClockIcon,
	DownloadSimpleIcon,
	FilePdfIcon,
	FileXlsIcon,
	HeartbeatIcon,
	InvoiceIcon,
	ReceiptIcon,
	TrendDownIcon,
	TrendUpIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import {
	BracketedFigure,
	ReportAmount,
	ActionBar,
	DataList,
	formatBracketed,
	formatCurrency,
	formatCurrencyCompact,
	formatDate,
	negativeClass,
	SectionPanel,
	SectionLabel,
	StatGrid,
	StatTile,
	surfaces,
	type DataColumn,
	ToneDot,
	toneBg,
} from "../lib/shared";
import { useNeedsScrollStop } from "../layout/scroll-stop";

/* ────────────────────────────────────────────────────────────────────────── */
/* Local furniture                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/** Status-token colour classes (the theme has no status utilities; literal strings so Tailwind sees them). */
const STATUS_TEXT: Record<"green" | "red" | "amber", string> = {
	green: "text-status-green-text",
	red: "text-error-text",
	amber: "text-status-amber-text",
};


/** "2026-05" → "May 2026". */
function periodShort(period: string): string {
	const [y, m] = period.split("-").map(Number);
	if (!y || !m) return period;
	const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return `${MONTHS[m - 1]} ${y}`;
}

/** Report figure, unsigned symbol: "1,234.00", "(1,234.00)", or a muted em dash at zero. */
function Figure({ value, red = true, className }: { value: number; red?: boolean; className?: string }) {
	return <ReportAmount amount={value} red={red} className={className} />;
}

/** Blank in the table (accounting convention), an em dash once DataList stacks (below 36rem). */
const STACKED_DASH = (
	<span aria-hidden="true" className="text-tertiary-foreground @xl:hidden">
		—
	</span>
);

/** Accountant's rules under totals. */
const DOUBLE_RULE = "border-b-[3px] border-double border-foreground/40 pb-px";
const SINGLE_RULE = "border-t border-foreground/30 pt-px";

/** The statement's integrity check (cynco CheckBadge) as a StatusChip. */
function CheckChip({ ok, children }: { ok: boolean; children: React.ReactNode }) {
	return (
		<StatusChip tone={ok ? "green" : "red"} glyph={ok ? "check" : "alert"}>
			{children}
		</StatusChip>
	);
}

/** "1000-001  Cash at bank" — the code in mono, the name wraps beside it. */
function AccountLabel({ code, label }: { code?: string | null; label: string }) {
	return (
		<span className="[overflow-wrap:anywhere]">
			{code && (
				<>
					<span className="mr-1.5 inline-block text-tiny-id text-tertiary-foreground">{code}</span>{" "}
				</>
			)}
			<span className="text-foreground">{label}</span>
		</span>
	);
}

/** A coloured dot and its name (cynco ChartKey). The dot decorates; the name carries meaning. */
function ChartKeyDot({ dotClass, children }: { dotClass: string; children: React.ReactNode }) {
	return (
		<span className="flex items-center gap-1 text-2xs text-tertiary-foreground">
			<span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dotClass)} />
			{children}
		</span>
	);
}

/** Inline SVG sparkline (cynco ui-v2/sparkline): line or area, scaled to its box. */
function MiniSparkline({ data, color = "var(--chart-series-1)", type = "area", className }: { data: number[]; color?: string; type?: "line" | "area"; className?: string }) {
	const W = 200;
	const H = 40;
	const P = 2;
	if (data.length < 2) return null;
	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min || 1;
	const step = (W - P * 2) / (data.length - 1);
	const pts = data.map((v, i) => [P + i * step, P + (1 - (v - min) / range) * (H - P * 2)] as const);
	const line = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
	const area = `${line} L ${pts[pts.length - 1]![0]} ${H} L ${pts[0]![0]} ${H} Z`;
	return (
		<svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className={cn("block h-8 w-full", className)}>
			{type === "area" && <path d={area} fill={color} opacity={0.14} />}
			<path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
		</svg>
	);
}

/** Panel title with a leading glyph (cynco dashboard/overview/Panel header). */
function IconTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<span className="flex min-w-0 items-center gap-2">
			<span aria-hidden="true" className="shrink-0 text-tertiary-foreground [&>svg]:size-4">
				{icon}
			</span>
			<span className="truncate">{children}</span>
		</span>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Trial balance                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export interface TrialBalanceAccount {
	accountId: string;
	accountCode: string;
	accountName: string;
	accountType?: string;
	debit?: number;
	credit?: number;
	[key: string]: unknown;
}

/** One Dr/Cr column pair: a balance, a prior period, a variance, adjustments… */
export interface TrialBalanceColumnGroup {
	/** Header over the pair; omit for a single, unlabelled pair. */
	label?: string;
	/** Secondary figures (prior period, unadjusted) read quieter. */
	muted?: boolean;
	/** Variances: shown signed and sign-coloured, zero left blank. */
	signed?: boolean;
	debit: (row: TrialBalanceAccount) => number;
	credit: (row: TrialBalanceAccount) => number;
	totalDebit?: number;
	totalCredit?: number;
}

type TbRow = TrialBalanceAccount & { __total?: boolean };

/**
 * The trial balance (cynco TrialBalanceSection): account code + name, Dr/Cr
 * pairs per column group, totals that must tie, and a balance chip. Tray table
 * on wide containers; one card per account below 36rem.
 */
export function TrialBalanceReport({
	title = "Trial balance",
	description,
	period,
	rows,
	groups,
	showType = false,
	balanced,
	badgeLabel,
	currency = "MYR",
	className,
	...props
}: Omit<React.ComponentProps<"div">, "title"> & {
	title?: string;
	description?: React.ReactNode;
	/** Period label for the heading, e.g. "October 2026". */
	period?: string;
	rows: TrialBalanceAccount[];
	/** Column groups; defaults to one pair read from `row.debit` / `row.credit`. */
	groups?: TrialBalanceColumnGroup[];
	showType?: boolean;
	/** Override the computed balanced state (totals of every unsigned group tie). */
	balanced?: boolean;
	/** Which figures the chip speaks for, when there is more than one set. */
	badgeLabel?: string;
	currency?: string;
}) {
	const cols: TrialBalanceColumnGroup[] = (groups ?? [{ debit: (r) => r.debit ?? 0, credit: (r) => r.credit ?? 0 }]).map((g) => ({
		...g,
		totalDebit: g.totalDebit ?? rows.reduce((s, r) => s + g.debit(r), 0),
		totalCredit: g.totalCredit ?? rows.reduce((s, r) => s + g.credit(r), 0),
	}));
	const main = cols.find((g) => !g.signed && !g.muted) ?? cols[0]!;
	const ties = cols.filter((g) => !g.signed).every((g) => Math.abs(g.totalDebit! - g.totalCredit!) < 0.005);
	const ok = balanced ?? ties;
	const status = ok ? "balanced" : "unbalanced";
	const diff = Math.abs(main.totalDebit! - main.totalCredit!);

	const amountCol = (g: TrialBalanceColumnGroup, i: number, side: "debit" | "credit"): DataColumn<TbRow> => ({
		key: `${i}-${side}`,
		align: "right",
		mobile: "meta",
		header: (
			<>
				{g.label && <span className="block text-2xs text-subtle">{g.label}</span>}
				{side === "debit" ? "Debit" : "Credit"} ({currency})
			</>
		),
		cell: (r) => {
			if (r.__total) {
				const v = side === "debit" ? g.totalDebit! : g.totalCredit!;
				return (
					<span className={cn("font-semibold", g.muted && "text-tertiary-foreground", g.signed && negativeClass(v < 0))}>
						<span className={cn(!g.signed && DOUBLE_RULE)}><BracketedFigure value={v} /></span>
					</span>
				);
			}
			const v = side === "debit" ? g.debit(r) : g.credit(r);
			const shown = g.signed ? v !== 0 : v > 0;
			if (!shown) return STACKED_DASH;
			return <span className={cn(g.muted && "text-tertiary-foreground", g.signed && negativeClass(v < 0))}><BracketedFigure value={v} /></span>;
		},
	});

	const columns: DataColumn<TbRow>[] = [
		{
			key: "account",
			header: "Account",
			mobile: "title",
			className: "w-full",
			cell: (r) => (r.__total ? <span className="font-semibold text-foreground">Total</span> : <AccountLabel code={r.accountCode} label={r.accountName} />),
		},
		...(showType
			? [
					{
						key: "type",
						header: "Type",
						mobile: "badge" as const,
						className: "whitespace-nowrap",
						cell: (r: TbRow) => <span className="text-xs capitalize text-tertiary-foreground">{(r.accountType ?? "").replace(/_/g, " ")}</span>,
					},
				]
			: []),
		...cols.flatMap((g, i) => [amountCol(g, i, "debit"), amountCol(g, i, "credit")]),
	];
	const data: TbRow[] = [...rows, { accountId: "__total", accountCode: "", accountName: "Total", __total: true }];

	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			{!ok && (
				<Alert variant="destructive">
					<WarningIcon size={16} weight="fill" aria-hidden="true" />
					<AlertDescription>
						Debits ({formatBracketed(main.totalDebit!)}) do not equal credits ({formatBracketed(main.totalCredit!)}), a difference of {currency}{" "}
						{formatBracketed(diff)}.
					</AlertDescription>
				</Alert>
			)}
			<SectionPanel
				flush
				title={period ? `${title} · ${period}` : title}
				description={description ?? `${rows.length} accounts with balances`}
				actions={<CheckChip ok={ok}>{badgeLabel ? `${badgeLabel} ${status}` : status.charAt(0).toUpperCase() + status.slice(1)}</CheckChip>}
			>
				<DataList
					className="px-1.5 pb-1.5"
					dense
					caption={period ? `${title}, ${period}` : title}
					columns={columns}
					rows={data}
					getKey={(r) => r.accountId}
				/>
			</SectionPanel>
		</div>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Statements (P&L, balance sheet)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export type StatementRowKind = "heading" | "section-header" | "account" | "section-total" | "line" | "subtotal" | "grand-total";

/** One rung of a statement ladder (cynco services/reporting/statementRows). */
export interface StatementRow {
	key: string;
	kind: StatementRowKind;
	label: string;
	accountCode?: string;
	/** [current] or [current, prior]. */
	values?: number[];
	/** Expense-type section: a positive contribution reads as a deduction. */
	negate?: boolean;
	variance?: number;
	variancePct?: number | null;
}

function formatVariancePct(pct: number | null | undefined): string {
	if (pct == null || !Number.isFinite(pct)) return "-";
	if (pct > 999) return ">999%";
	if (pct < -999) return "<-999%";
	return `${pct}%`;
}

/** An account amount: parenthesized when it counts against its section; absolute otherwise. */
function contribution(value: number, negate: boolean | undefined, forceParen?: boolean) {
	if (value === 0) return <Figure value={0} />;
	const against = forceParen ?? (negate ? value > 0 : value < 0);
	const s = formatBracketed(Math.abs(value));
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
			<div
				ref={scroller}
				role={needsStop ? "group" : undefined}
				aria-label={needsStop ? `${ariaLabel}, scrolls sideways` : undefined}
				tabIndex={needsStop ? 0 : undefined}
				className={cn(surfaces.surface, "overflow-x-auto outline-none focus-ring-inset")}
			>
				<table className="w-full border-collapse text-sm" aria-label={ariaLabel}>
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
							const variance = row.variance ?? current - prior;
							const pct = row.variancePct !== undefined ? row.variancePct : prior ? Math.round(((current - prior) / Math.abs(prior)) * 1000) / 10 : null;
							const total = row.kind === "subtotal" || row.kind === "grand-total";
							const compareCells = comparative && (
								<>
									<td className={cn(TD, NUM, total && "font-semibold", variance < 0 ? surfaces.negative : "text-foreground")}>
										<Figure value={variance} />
									</td>
									<td className={cn(TD, NUM, "text-tertiary-foreground")}>{formatVariancePct(pct)}</td>
								</>
							);
							switch (row.kind) {
								case "heading":
									return (
										<tr key={row.key}>
											<th scope="row" colSpan={span} className="px-3 pt-1.5 pb-1 text-left text-2xs font-medium uppercase tracking-[0.04em] text-tertiary-foreground">
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
											{comparative && <td className={cn(TD, NUM, "text-tertiary-foreground")}>{contribution(prior, row.negate)}</td>}
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
				<StatementTable rows={rows} comparative={comparative} currency={currency} signColorTotals ariaLabel={`Profit and loss, ${period}`} />
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
	totals: { assets: number; liabilities: number; equity: number };
	/** "Total equity", "Total owner's equity" (sole prop), "Total partners' capital"… */
	equityLabel?: string;
	/** The Total assets / liabilities / equity tiles above the statement. */
	showTotalsStrip?: boolean;
	balanced?: boolean;
	description?: React.ReactNode;
	currency?: string;
}) {
	const diff = totals.assets - (totals.liabilities + totals.equity);
	const ok = balanced ?? Math.abs(diff) < 0.005;
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
						Assets ({formatBracketed(totals.assets)}) do not equal liabilities plus equity ({formatBracketed(totals.liabilities + totals.equity)}), a difference of{" "}
						{currency} {formatBracketed(diff)}.
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
					<StatementTable rows={rows} comparative={comparative} currency={currency} signColorTotals={false} ariaLabel={`Balance sheet as at ${asAt}`} />
				</div>
			</SectionPanel>
		</div>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Report header controls                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

/** Group "YYYY-MM" periods under their fiscal year ("FY 2026", "FY 2025/2026"); flat without a FYE. */
function groupPeriodsByFY(periods: string[], fiscalYearEnd?: string | null): { label: string | null; periods: string[] }[] {
	if (!fiscalYearEnd) return [{ label: null, periods }];
	const endMonth = parseInt(fiscalYearEnd.split("-")[0]!, 10);
	const map = new Map<string, string[]>();
	for (const p of periods) {
		const [y, m] = p.split("-").map(Number) as [number, number];
		const label = endMonth === 12 ? `FY ${y}` : m > endMonth ? `FY ${y}/${y + 1}` : `FY ${y - 1}/${y}`;
		if (!map.has(label)) map.set(label, []);
		map.get(label)!.push(p);
	}
	return [...map.entries()].map(([label, ps]) => ({ label, periods: ps }));
}

function relativeShort(iso: string, now: number): string {
	const ms = now - new Date(iso).getTime();
	const mins = Math.floor(ms / 60000);
	const hours = Math.floor(ms / 3600000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	if (hours < 24) return `${hours}h ago`;
	return formatDate(iso);
}

export type ReportFreshness = { mode: "live"; lastPostingAt: string } | { mode: "snapshot"; takenAt: string };

/**
 * The report page header (cynco ReportShell › WorkbenchHeader) with its controls
 * (ReportControls + ExportDropdown): period, view, compare, snapshot, freshness
 * and export. Both rows wrap rather than overflow.
 */
export function ReportToolbar({
	title,
	meta,
	period: periodProp,
	defaultPeriod,
	onPeriodChange,
	periods,
	fiscalYearEnd,
	view: viewProp,
	defaultView,
	onViewChange,
	views,
	compare: compareProp,
	defaultCompare,
	onCompareChange,
	comparePeriod: comparePeriodProp,
	defaultComparePeriod,
	onComparePeriodChange,
	onSaveSnapshot,
	freshness,
	now,
	onExport,
	className,
	...props
}: Omit<React.ComponentProps<"header">, "title"> & {
	title?: React.ReactNode;
	/** Quiet sub-line, e.g. "October 2026 · MYR". */
	meta?: React.ReactNode;
	/** Controlled reporting period (e.g. "2026-03"). */
	period?: string;
	/** Initial period for uncontrolled use. */
	defaultPeriod?: string;
	/** Called when the user changes the reporting period. */
	onPeriodChange?: (period: string) => void;
	periods: string[];
	/** "MM-DD"; groups the period list by fiscal year. */
	fiscalYearEnd?: string | null;
	/** Controlled view (P&L Monthly/YTD, TB Standard/Extended). */
	view?: string;
	/** Initial view for uncontrolled use. */
	defaultView?: string;
	/** Called when the user switches the report view. */
	onViewChange?: (view: string) => void;
	views?: { value: string; label: string }[];
	/** Controlled compare toggle; omit the prop entirely to hide the Compare button. */
	compare?: boolean;
	/** Initial compare value for uncontrolled use. */
	defaultCompare?: boolean;
	/** Called when the user toggles the compare mode. */
	onCompareChange?: (compare: boolean) => void;
	/** Controlled comparison period. */
	comparePeriod?: string;
	/** Initial comparison period for uncontrolled use. */
	defaultComparePeriod?: string;
	/** Called when the user changes the comparison period. */
	onComparePeriodChange?: (period: string) => void;
	/** Called when the user clicks "Save snapshot"; omit to hide the button. */
	onSaveSnapshot?: () => void;
	freshness?: ReportFreshness | null;
	/** Clock for the freshness label (defaults to Date.now()). */
	now?: string | number;
	onExport?: (format: "pdf" | "excel") => void;
}) {
	const [period = "", setPeriod] = useControllableState({ prop: periodProp, defaultProp: defaultPeriod, onChange: onPeriodChange });
	const [view, setView] = useControllableState({ prop: viewProp, defaultProp: defaultView, onChange: onViewChange });
	const [compare, setCompare] = useControllableState({ prop: compareProp, defaultProp: defaultCompare, onChange: onCompareChange });
	const [comparePeriod, setComparePeriod] = useControllableState({ prop: comparePeriodProp, defaultProp: defaultComparePeriod, onChange: onComparePeriodChange });
	const groups = React.useMemo(() => groupPeriodsByFY(periods, fiscalYearEnd), [periods, fiscalYearEnd]);
	const items = React.useMemo(() => Object.fromEntries([...periods, period].map((p) => [p, periodShort(p)])), [periods, period]);
	const clock = now != null ? new Date(now).getTime() : Date.now();
	const fresh = freshness
		? freshness.mode === "snapshot"
			? {
					Icon: CameraIcon,
					label: `Snapshot taken ${relativeShort(freshness.takenAt, clock)}`,
					detail: `Snapshot taken ${formatDate(freshness.takenAt)}. Postings after that aren't included.`,
				}
			: {
					Icon: ClockIcon,
					label: `Last posting ${relativeShort(freshness.lastPostingAt, clock)}`,
					detail: "Figures are calculated from the ledger each time this page loads.",
				}
		: null;

	const options = (exclude?: string) =>
		groups.map((g) => {
			const list = g.periods.filter((p) => p !== exclude).map((p) => (
				<SelectItem key={p} value={p}>
					{periodShort(p)}
				</SelectItem>
			));
			if (!list.length) return null;
			if (g.label === null) return <React.Fragment key="flat">{list}</React.Fragment>;
			return (
				<SelectGroup key={g.label}>
					<SelectLabel>{g.label}</SelectLabel>
					{list}
				</SelectGroup>
			);
		});

	const controls = (
		<ActionBar>
			<Select value={period} items={items} onValueChange={(v) => v && setPeriod(v as string)}>
				<SelectTrigger className="h-input w-36 max-w-full" aria-label="Reporting period">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{options()}</SelectContent>
			</Select>
			{views && view !== undefined && (
				<GroupedTabButton aria-label="Report view" className="w-auto" value={view} onValueChange={setView} options={views} />
			)}
			{compare !== undefined && (
				<>
					<Button variant={compare ? "primary" : "secondary"} aria-pressed={compare} onClick={() => setCompare(!compare)}>
						Compare
					</Button>
					{compare && (
						<Select value={comparePeriod ?? ""} items={items} onValueChange={(v) => v && setComparePeriod(v as string)}>
							<SelectTrigger className="h-input w-36 max-w-full" aria-label="Comparison period">
								<SelectValue placeholder="Compare with…" />
							</SelectTrigger>
							<SelectContent>{options(period)}</SelectContent>
						</Select>
					)}
				</>
			)}
			{onSaveSnapshot && (
				<Button variant="secondary" onClick={onSaveSnapshot}>
					<CameraIcon size={14} aria-hidden="true" />
					Save snapshot
				</Button>
			)}
		</ActionBar>
	);
	const actions = (
		<ActionBar>
			{fresh && (
				<Tooltip>
					<TooltipTrigger render={<Button variant="skeleton" className="text-2xs text-tertiary-foreground tabular-nums" />}>
						<fresh.Icon size={14} aria-hidden="true" />
						{fresh.label}
					</TooltipTrigger>
					<TooltipContent className="max-w-64">{fresh.detail}</TooltipContent>
				</Tooltip>
			)}
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger render={<Button variant="secondary" />}>
					<DownloadSimpleIcon size={14} aria-hidden="true" />
					Export
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-44">
					<DropdownMenuItem onClick={() => onExport?.("pdf")}>
						<FilePdfIcon size={14} aria-hidden="true" />
						Download PDF
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onExport?.("excel")}>
						<FileXlsIcon size={14} aria-hidden="true" />
						Download Excel
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</ActionBar>
	);

	return (
		<header className={cn("flex min-w-0 flex-col gap-3", title && "border-b pb-3", className)} {...props}>
			{title ? (
				<>
					<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
						<div className="min-w-0">
							<h1 className="text-main">{title}</h1>
							{meta && <p className="mt-0.5 text-2xs text-tertiary-foreground tabular-nums">{meta}</p>}
						</div>
						{actions}
					</div>
					{controls}
				</>
			) : (
				<ActionBar>
					{controls}
					{actions}
				</ActionBar>
			)}
		</header>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* KPI tiles                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export type KpiAccent = "default" | "brand" | "success" | "warning" | "error" | "violet";
const ACCENT_SERIES: Record<KpiAccent, string> = {
	default: "var(--chart-series-1)",
	brand: "var(--chart-series-1)",
	success: "var(--chart-series-3)",
	warning: "var(--chart-series-4)",
	error: "var(--chart-series-8)",
	violet: "var(--chart-series-5)",
};

export interface KpiTileData {
	label: string;
	value: string;
	/** Signed % change — the top-right chip. */
	delta?: number | null;
	/** Meta chip when there is no delta, e.g. "21 overdue" — sits under the figure. */
	badge?: string;
	badgeTone?: StatusTone;
	/** Quiet sub-line (reports KpiTile): "RM 12,400.00 overdue", "18.2% margin". */
	sub?: string;
	subTone?: "up" | "down" | "warn" | "muted";
	/** Trend under the figure. */
	sparkline?: number[];
	accent?: KpiAccent;
}

const SUB_ICON: Record<NonNullable<KpiTileData["subTone"]>, React.ReactNode> = {
	up: <TrendUpIcon size={12} weight="bold" aria-hidden="true" className={cn("shrink-0", STATUS_TEXT.green)} />,
	down: <TrendDownIcon size={12} weight="bold" aria-hidden="true" className={cn("shrink-0", STATUS_TEXT.red)} />,
	warn: <ToneDot tone="amber" />,
	muted: null,
};
const BADGE_DOT: Partial<Record<StatusTone, StatusTone>> = { green: "green", red: "red", amber: "amber", blue: "blue", orange: "orange" };

/**
 * A row of KPI tiles (cynco ui-v2/kpi KpiRow + KpiTile, reports/KpiTile):
 * label, hero figure, delta chip, optional sparkline and one quiet sub-line.
 * Tiles auto-fit the container (4-up → 2-up → 1-up) and never truncate money.
 */
export function KpiTileGrid({
	tiles,
	columns = 4,
	className,
	...props
}: React.ComponentProps<"div"> & {
	tiles: KpiTileData[];
	/** Kept for compatibility; tiles auto-fit the container (min 9rem each). */
	columns?: 2 | 3 | 4 | 5;
}) {
	return (
		<StatGrid min="sm" aria-label="Key metrics" className={cn("gap-2", className)} {...props}>
			{tiles.map((t) => {
				const empty = !/[1-9]/.test(t.value);
				const up = (t.delta ?? 0) > 0;
				const dot = t.badgeTone ? BADGE_DOT[t.badgeTone] : undefined;
				return (
					<StatTile
						key={t.label}
						className="p-3"
						label={t.label}
						value={<span className={cn(empty && "text-tertiary-foreground")}>{t.value}</span>}
						badge={
							t.delta != null && t.delta !== 0 ? (
								<StatusChip className="shrink-0 gap-1 text-2xs tabular-nums">
									{up ? (
										<ArrowUpRightIcon size={12} weight="bold" aria-hidden="true" className={STATUS_TEXT.green} />
									) : (
										<ArrowDownRightIcon size={12} weight="bold" aria-hidden="true" className={STATUS_TEXT.red} />
									)}
									{up ? "+" : ""}
									{t.delta.toFixed(1)}%
								</StatusChip>
							) : undefined
						}
					>
						{(t.delta == null || t.delta === 0) && t.badge && (
							<StatusChip className="min-w-0 self-start gap-1 text-2xs">
								{dot && <ToneDot tone={dot} />}
								<span className="min-w-0 truncate">{t.badge}</span>
							</StatusChip>
						)}
						{t.sparkline && t.sparkline.length > 1 && <MiniSparkline data={t.sparkline} color={ACCENT_SERIES[t.accent ?? "default"]} className="mt-0.5 h-7" />}
						{t.sub && (
							<span className="flex min-w-0 items-center gap-1 text-2xs text-tertiary-foreground tabular-nums">
								{SUB_ICON[t.subTone ?? "muted"]}
								<span className="min-w-0">{t.sub}</span>
							</span>
						)}
					</StatTile>
				);
			})}
		</StatGrid>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Aging (Owed rings, aging detail)                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export interface AgingBucket {
	current: number;
	days1to30: number;
	days31to60: number;
	days61to90: number;
	over90: number;
	total?: number;
}
type BandKey = Exclude<keyof AgingBucket, "total">;

/** Aging bands in the order a report ages them, each with its status hue (ring stroke + key dot). */
const AGE_BANDS: { key: BandKey; label: string; hue: string; dot: string }[] = [
	{ key: "current", label: "Current", hue: "var(--status-green)", dot: toneBg.green },
	{ key: "days1to30", label: "1–30", hue: "var(--status-blue)", dot: toneBg.blue },
	{ key: "days31to60", label: "31–60", hue: "var(--status-amber)", dot: toneBg.amber },
	{ key: "days61to90", label: "61–90", hue: "var(--status-orange)", dot: toneBg.orange },
	{ key: "over90", label: "90+", hue: "var(--status-red)", dot: toneBg.red },
];
const bucketTotal = (b: AgingBucket) => b.total ?? AGE_BANDS.reduce((s, x) => s + b[x.key], 0);

function AgingRing({ bucket, currency, size = 92 }: { bucket: AgingBucket; currency: string; size?: number }) {
	const stroke = 9;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const total = bucketTotal(bucket);
	let used = 0;
	const arcs = AGE_BANDS.flatMap((band) => {
		const v = bucket[band.key];
		if (v <= 0) return [];
		const len = (v / total) * c;
		const arc = { band, len, offset: used };
		used += len;
		return [arc];
	});
	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
			<circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
			{arcs.map(({ band, len, offset }) => (
				<circle
					key={band.key}
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke={band.hue}
					strokeWidth={stroke}
					strokeDasharray={`${Math.max(0, len - 1.5)} ${c}`}
					strokeDashoffset={-offset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			))}
			<text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-2xs font-semibold tabular-nums">
				{formatCurrencyCompact(total, currency)}
			</text>
		</svg>
	);
}

function OwedColumn({ title, bucket, currency, footnote }: { title: string; bucket: AgingBucket | null; currency: string; footnote?: string }) {
	const total = bucket ? bucketTotal(bucket) : 0;
	const overdue = bucket ? total - bucket.current : 0;
	return (
		<div className="flex min-w-0 flex-1 flex-col items-center gap-2 rounded-lg p-2 hover:bg-interactive-secondary-hover">
			<span className="text-2xs text-tertiary-foreground">{title}</span>
			{bucket && total > 0 ? (
				<>
					<AgingRing bucket={bucket} currency={currency} />
					<span className="sr-only">Total {formatCurrency(total, currency)}</span>
					<ul className="flex flex-wrap justify-center gap-x-2.5 gap-y-0.5">
						{AGE_BANDS.filter((b) => bucket[b.key] > 0).map((b) => (
							<li key={b.key}>
								<ChartKeyDot dotClass={b.dot}>
									{b.label} <span className="tabular-nums text-muted-foreground">{formatCurrencyCompact(bucket[b.key], currency)}</span>
								</ChartKeyDot>
							</li>
						))}
					</ul>
				</>
			) : (
				<span className="grid h-[92px] place-items-center text-2xs text-tertiary-foreground">{bucket ? "Nothing outstanding" : "Unavailable"}</span>
			)}
			{(overdue > 0 || footnote) && (
				<span className="flex flex-wrap items-center justify-center gap-x-1.5 text-center text-2xs text-tertiary-foreground">
					{overdue > 0 && (
						<span className="flex items-center gap-1.5">
							<ToneDot tone="amber" />
							<span className="text-foreground tabular-nums">{formatCurrencyCompact(overdue, currency)} overdue</span>
						</span>
					)}
					{overdue > 0 && footnote ? <span aria-hidden="true">·</span> : null}
					{footnote}
				</span>
			)}
		</div>
	);
}

/**
 * Receivables and payables as aging rings (cynco dashboard/overview/Owed, the
 * "Owed" band of MetricsOverview): one arc per band, the total in the middle.
 * Side by side from 24rem of container width, stacked below.
 */
export function OwedAgingRings({
	receivables,
	payables,
	currency = "MYR",
	dso,
	className,
	...props
}: React.ComponentProps<"section"> & {
	receivables: AgingBucket | null;
	payables: AgingBucket | null;
	currency?: string;
	/** Days sales outstanding, shown under receivables. */
	dso?: number | null;
}) {
	return (
		<section className={cn("@container min-w-0 px-3 pt-3 pb-2", surfaces.card, className)} {...props}>
			<SectionLabel className="px-1">Owed</SectionLabel>
			<div className="mt-1 flex flex-col gap-2 @sm:flex-row">
				<OwedColumn title="Receivables" bucket={receivables} currency={currency} footnote={dso == null ? undefined : `${Math.round(dso)}d to collect`} />
				<OwedColumn title="Payables" bucket={payables} currency={currency} />
			</div>
		</section>
	);
}

export interface AgingCustomerRow extends AgingBucket {
	id: string;
	name: string;
	/** Open invoices behind the balance. */
	invoices?: number;
}
type AgingRow = AgingCustomerRow & { __total?: boolean };

/**
 * Accounts receivable aging (cynco routes/dashboard.reports.aging-receivable):
 * the summary tiles, then customers (top debtors first) across the aging bands
 * with a totals row. One card per customer below 42rem of container width.
 */
export function ReceivablesAgingTable({
	asOf,
	rows,
	dso,
	limit,
	currency = "MYR",
	partyLabel = "Customer",
	className,
	...props
}: React.ComponentProps<"div"> & {
	/** "31 Oct 2026". */
	asOf: string;
	rows: AgingCustomerRow[];
	dso?: number | null;
	/** Show only the top N debtors (by total). */
	limit?: number;
	currency?: string;
	/** "Customer" for receivables, "Vendor" for payables. */
	partyLabel?: string;
}) {
	const sorted = [...rows].sort((a, b) => bucketTotal(b) - bucketTotal(a));
	const shown = limit ? sorted.slice(0, limit) : sorted;
	const sum = (k: BandKey) => rows.reduce((s, r) => s + r[k], 0);
	const total = rows.reduce((s, r) => s + bucketTotal(r), 0);
	const current = sum("current");
	const overdueParties = rows.filter((r) => bucketTotal(r) - r.current > 0).length;
	const totalRow: AgingRow = {
		id: "__total",
		name: "Total",
		current,
		days1to30: sum("days1to30"),
		days31to60: sum("days31to60"),
		days61to90: sum("days61to90"),
		over90: sum("over90"),
		total,
		__total: true,
	};
	const columns: DataColumn<AgingRow>[] = [
		{
			key: "party",
			header: partyLabel,
			mobile: "title",
			className: "w-full",
			cell: (r) =>
				r.__total ? (
					<span className="font-semibold text-foreground">Total</span>
				) : (
					<>
						<span className="block text-foreground">{r.name}</span>
						{r.invoices != null && (
							<span className="block text-2xs font-normal text-tertiary-foreground">
								{r.invoices} open invoice{r.invoices === 1 ? "" : "s"}
							</span>
						)}
					</>
				),
		},
		...AGE_BANDS.map(
			(b): DataColumn<AgingRow> => ({
				key: b.key,
				header: b.label.replace("–", "-"),
				align: "right",
				mobile: "meta",
				cell: (r) => (
					<span className={cn(r.__total && "font-semibold", b.key === "over90" && r.over90 > 0 && !r.__total && surfaces.negative)}>
						<Figure value={r[b.key]} red={false} />
					</span>
				),
			}),
		),
		{
			key: "total",
			header: "Total",
			align: "right",
			mobile: "value",
			cell: (r) => (
				<span className={cn("font-semibold", r.__total && DOUBLE_RULE)}>
					<Figure value={bucketTotal(r)} />
				</span>
			),
		},
	];
	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			<StatGrid min="sm" className="gap-2">
				<StatTile className="p-3" label="Total outstanding" value={formatCurrency(total, currency)} />
				<StatTile className="p-3" label="Days to pay (DSO)" value={dso ? `${dso} days` : "—"} />
				<StatTile className="p-3" label="Current (not due)" value={formatCurrency(current, currency)} dot="var(--status-green)" />
				<StatTile className="p-3" label="Total overdue" value={formatCurrency(total - current, currency)} dot="var(--status-red)" />
				<StatTile className="p-3" label={`Overdue ${partyLabel.toLowerCase()}s`} value={String(overdueParties)} dot="var(--status-amber)" />
			</StatGrid>
			<SectionPanel
				flush
				title="Aging detail"
				description={`As of ${asOf} · ${currency} · ${rows.length} ${partyLabel.toLowerCase()}s${limit && rows.length > limit ? ` · top ${limit} shown` : ""}`}
			>
				<DataList
					className="px-1.5 pb-1.5"
					stackBelow="2xl"
					dense
					caption={`Accounts receivable aging as of ${asOf}`}
					columns={columns}
					rows={[...shown, totalRow]}
					getKey={(r) => r.id}
				/>
			</SectionPanel>
		</div>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Cash flow & cash position                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export interface CashFlowPoint {
	label: string;
	credits: number;
	debits: number;
	net: number;
}

const FLOW = { credits: "var(--chart-series-3)", debits: "var(--chart-series-8)", net: "var(--primary)" };
const FLOW_DOT = { credits: "bg-[var(--chart-series-3)]", debits: "bg-[var(--chart-series-8)]", net: "bg-primary" };

function MoneyTooltip({ active, payload, label, currency }: { active?: boolean; payload?: { dataKey?: string | number; value?: number }[]; label?: string; currency: string }) {
	if (!active || !payload?.length) return null;
	const names: Record<string, string> = { credits: "Inflows", debits: "Outflows", net: "Net" };
	return (
		<div className="grid min-w-[10rem] gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
			<div className="font-medium text-foreground">{label}</div>
			{payload.map((p) => (
				<div key={String(p.dataKey)} className="flex items-center justify-between gap-3">
					<span className="flex items-center gap-1.5 text-muted-foreground">
						<span className={cn("size-2 rounded-[2px]", FLOW_DOT[p.dataKey as keyof typeof FLOW_DOT])} />
						{names[String(p.dataKey)]}
					</span>
					<span className={cn("font-mono tabular-nums text-foreground", negativeClass((p.value ?? 0) < 0))}>{formatCurrency(p.value ?? 0, currency)}</span>
				</div>
			))}
		</div>
	);
}

/**
 * Money movement (cynco dashboard/overview/OverviewCashFlow + banking/CashFlowChart):
 * inflow and outflow bars per month with net as the line across them, a 3M/6M
 * range and the window's net; a connect-bank empty state without activity.
 */
export function CashFlowOverview({
	points,
	currency = "MYR",
	hasActivity = true,
	defaultRange = "6",
	onConnectBank,
	className,
	...props
}: React.ComponentProps<"section"> & {
	/** Up to 6 months, oldest → newest. */
	points: CashFlowPoint[];
	currency?: string;
	hasActivity?: boolean;
	defaultRange?: "3" | "6";
	/** Called from the empty state's "Connect bank"; omit to hide the button. */
	onConnectBank?: () => void;
}) {
	const [range, setRange] = React.useState<string>(defaultRange);
	const windowed = React.useMemo(() => points.slice(-Number(range)), [points, range]);
	const net = windowed.reduce((s, p) => s + p.net, 0);
	return (
		<SectionPanel
			aria-label="Cash flow"
			className={className}
			{...props}
			title="Money movement"
			description="Inflows vs outflows, with net per month"
			actions={
				hasActivity && (
					<>
						<span className="text-right">
							<span className="block text-2xs text-tertiary-foreground">Net</span>
							<span className={cn("text-sm font-semibold tabular-nums text-foreground", negativeClass(net < 0))}>{formatCurrency(net, currency)}</span>
						</span>
							<GroupedTabButton aria-label="Range"
								className="w-auto"
								value={range}
								onValueChange={setRange}
								options={[
									{ value: "3", label: "3M" },
									{ value: "6", label: "6M" },
								]}
							/>
					</>
				)
			}
		>
			{hasActivity ? (
				<>
					<div className="-mt-1 flex flex-wrap items-center gap-3">
						<ChartKeyDot dotClass={FLOW_DOT.credits}>Inflows</ChartKeyDot>
						<ChartKeyDot dotClass={FLOW_DOT.debits}>Outflows</ChartKeyDot>
						<ChartKeyDot dotClass={FLOW_DOT.net}>Net</ChartKeyDot>
					</div>
					<ChartContainer
						config={{ credits: { label: "Inflows", color: FLOW.credits }, debits: { label: "Outflows", color: FLOW.debits }, net: { label: "Net", color: FLOW.net } }}
						className="mt-2 aspect-auto h-56 w-full"
					>
						<ComposedChart
							data={windowed}
							margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
							barGap={2}
							title="Money movement chart: inflows, outflows and net per month"
							desc="Use the arrow keys to step through months. The same figures follow as a table."
						>
							<CartesianGrid vertical={false} stroke="var(--chart-grid-stroke)" />
							<XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
							<YAxis tickLine={false} axisLine={false} width={60} tickFormatter={(v: number) => formatCurrencyCompact(v, currency)} />
							<ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<MoneyTooltip currency={currency} />} />
							<Bar isAnimationActive={false} dataKey="credits" fill={FLOW.credits} radius={[3, 3, 0, 0]} maxBarSize={22} />
							<Bar isAnimationActive={false} dataKey="debits" fill={FLOW.debits} fillOpacity={0.7} radius={[3, 3, 0, 0]} maxBarSize={22} />
							<Line isAnimationActive={false} dataKey="net" type="monotone" stroke={FLOW.net} strokeWidth={2} dot={{ r: 2.5, fill: FLOW.net, strokeWidth: 0 }} />
						</ComposedChart>
					</ChartContainer>
					<table className="sr-only">
						<caption>Money movement by month ({currency})</caption>
						<thead>
							<tr>
								<th scope="col">Month</th>
								<th scope="col">Inflows</th>
								<th scope="col">Outflows</th>
								<th scope="col">Net</th>
							</tr>
						</thead>
						<tbody>
							{windowed.map((p) => (
								<tr key={p.label}>
									<th scope="row">{p.label}</th>
									<td>{formatCurrency(p.credits, currency)}</td>
									<td>{formatCurrency(p.debits, currency)}</td>
									<td>{formatCurrency(p.net, currency)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			) : (
				<div className="flex h-44 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 text-center">
					<span className="flex size-10 items-center justify-center rounded-full bg-muted text-tertiary-foreground">
						<BankIcon size={18} weight="duotone" aria-hidden="true" />
					</span>
					<div className="flex flex-col gap-0.5">
						<span className="text-sm font-semibold text-foreground">Connect a bank account</span>
						<span className="text-2xs text-tertiary-foreground">See money moving in and out, month by month</span>
					</div>
					{onConnectBank && (
						<Button variant="secondary" onClick={onConnectBank}>
							Connect bank
						</Button>
					)}
				</div>
			)}
		</SectionPanel>
	);
}

/** A runway longer than this reads as plenty; the meter tops out there. */
const RUNWAY_FULL_MONTHS = 12;
const RUNWAY_INDICATOR = {
	green: "[&_[data-slot=progress-indicator]]:bg-status-green",
	amber: "[&_[data-slot=progress-indicator]]:bg-status-amber",
	red: "[&_[data-slot=progress-indicator]]:bg-status-red",
	neutral: "[&_[data-slot=progress-indicator]]:bg-muted",
} as const;

/**
 * The position band of the CFO figures (cynco MetricsOverview): cash on hand
 * across accounts, the runway meter, and the implied cash trail. The runway
 * block drops under the cash figure on narrow containers.
 */
export function CashRunwayPosition({
	cash,
	accounts,
	runwayMonths,
	cashPositive,
	trail,
	currency = "MYR",
	className,
	...props
}: React.ComponentProps<"section"> & {
	cash: number | null;
	accounts?: number | null;
	/** Months at the last 3 months' burn; null when it can't be computed. */
	runwayMonths: number | null;
	/** No burn to divide by — earns a full bar. */
	cashPositive?: boolean;
	/** Implied month-end cash, oldest → newest. */
	trail?: { label: string; cash: number }[];
	currency?: string;
}) {
	const runway: { value: string; filled: number; tone: keyof typeof RUNWAY_INDICATOR; note: string } =
		runwayMonths == null
			? cashPositive
				? { value: "Cash positive", filled: RUNWAY_FULL_MONTHS, tone: "green", note: "no burn to divide by" }
				: { value: "—", filled: 0, tone: "neutral", note: "not enough to go on" }
			: {
					value: `${runwayMonths.toFixed(1)} mo`,
					filled: runwayMonths,
					tone: runwayMonths < 3 ? "red" : runwayMonths < 6 ? "amber" : "green",
					note: "at the last 3 months' burn",
				};
	const pct = Math.min(100, (runway.filled / RUNWAY_FULL_MONTHS) * 100);
	return (
		<section className={cn("@container min-w-0 px-4 pt-3.5 pb-3", surfaces.card, className)} {...props}>
			<div className="flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between @md:gap-4">
				<div className="min-w-0">
					<span className="text-2xs text-tertiary-foreground">Cash on hand</span>
					<p className="text-xl font-semibold leading-tight tabular-nums break-words text-foreground @sm:text-display">{cash == null ? "—" : formatCurrency(cash, currency)}</p>
					<span className="text-2xs text-tertiary-foreground">{accounts == null ? "Balance unavailable" : `across ${accounts} account${accounts === 1 ? "" : "s"}`}</span>
				</div>
				<div className="w-full shrink-0 @md:w-36 @md:text-end">
					<span className="text-2xs text-tertiary-foreground">Runway</span>
					<Progress value={pct} aria-label="Runway" getAriaValueText={() => runway.value} className={cn("mt-1.5 mb-1.5", RUNWAY_INDICATOR[runway.tone])} />
					<p className={cn("font-semibold leading-tight tabular-nums", runwayMonths == null ? "text-sm" : "text-xl", runwayMonths == null && !cashPositive ? "text-tertiary-foreground" : "text-foreground")}>
						{runway.value}
					</p>
					<span className="mt-0.5 block text-2xs text-tertiary-foreground">{runway.note}</span>
				</div>
			</div>
			{trail && trail.length > 1 && (
				<div className="mt-2">
					<MiniSparkline data={trail.map((t) => t.cash)} color="var(--chart-series-1)" className="h-11" />
					<table className="sr-only">
						<caption>Implied month-end cash</caption>
						<tbody>
							{trail.map((t) => (
								<tr key={t.label}>
									<th scope="row">{t.label}</th>
									<td>{formatCurrency(t.cash, currency)}</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="mt-0.5 flex justify-between gap-2 text-2xs text-tertiary-foreground">
						<span>{trail[0]!.label}</span>
						<span className="hidden text-center @md:inline">Implied from today&rsquo;s balance and bank movement</span>
						<span>{trail[trail.length - 1]!.label}</span>
					</div>
					<p className="mt-0.5 text-2xs text-tertiary-foreground @md:hidden">Implied from today&rsquo;s balance and bank movement</p>
				</div>
			)}
		</section>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Health checks                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export type HealthCheckStatus = "fail" | "warn" | "pass" | "na";
export type HealthArea = "books" | "collections" | "payables" | "compliance";
export interface HealthCheck {
	id: string;
	label: string;
	detail: string;
	area: HealthArea;
	status: HealthCheckStatus;
	/** Where the control is fixed. */
	href?: string;
}

const AREA_LABEL: Record<HealthArea, string> = { books: "Books", collections: "Collections", payables: "Payables", compliance: "Compliance" };
const CHECK_STATUS: Record<HealthCheckStatus, { tone: StatusTone; glyph: StatusGlyph; name: string }> = {
	fail: { tone: "red", glyph: "x", name: "Failing" },
	warn: { tone: "amber", glyph: "alert", name: "Drifting" },
	pass: { tone: "green", glyph: "check", name: "Passing" },
	na: { tone: "neutral", glyph: "minus", name: "Not judged" },
};

function healthSummary(checks: HealthCheck[]): string {
	const acting = checks.filter((c) => c.status === "fail" || c.status === "warn").length;
	const judged = checks.filter((c) => c.status !== "na").length;
	if (judged === 0) return "Nothing to check yet";
	if (acting === 0) return judged === 1 ? "The one check passes" : `All ${judged} checks pass`;
	return `${acting} of ${judged} check${judged === 1 ? "" : "s"} need${acting === 1 ? "s" : ""} you`;
}

const ROW = "flex items-center gap-3";
const ROW_LINK = cn(ROW, "outline-none hover:bg-table-row-hover focus-ring-inset");

/** A real link when there is somewhere to go; plain content otherwise, never an `href="#"` that does nothing. */
function RowLink({ href, className, children }: { href?: string; className?: string; children: React.ReactNode }) {
	return href ? (
		<a href={href} className={cn(ROW_LINK, className)}>
			{children}
		</a>
	) : (
		<div className={cn(ROW, className)}>{children}</div>
	);
}

/**
 * The controls checklist (cynco dashboard/overview/HealthPanel): every check,
 * its verdict, one line of evidence and the area it belongs to. Fails first.
 * The area tag hides below 24rem of container width.
 */
export function BusinessHealthPanel({ checks, className, ...props }: React.ComponentProps<"section"> & { checks: HealthCheck[] | null }) {
	const order: HealthCheckStatus[] = ["fail", "warn", "pass", "na"];
	const sorted = checks ? [...checks].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status)) : null;
	return (
		<SectionPanel
			flush
			className={cn("overflow-hidden", className)}
			{...props}
			title={<IconTitle icon={<HeartbeatIcon weight="duotone" />}>Checks</IconTitle>}
			actions={sorted && <span className="text-2xs text-tertiary-foreground">{healthSummary(sorted)}</span>}
		>
			{sorted === null ? (
				<p className="px-4 py-8 text-center text-2xs text-tertiary-foreground">Couldn&rsquo;t run the checks right now.</p>
			) : sorted.length === 0 ? (
				<p className="px-4 py-8 text-center text-2xs text-tertiary-foreground">Nothing to check yet. Set up the books and the filing calendar and the controls appear here.</p>
			) : (
				<ul className="border-t border-table-row-divider">
					{sorted.map((check) => {
						const s = CHECK_STATUS[check.status];
						return (
							<li key={check.id} className="border-b border-table-row-divider last:border-b-0">
								<RowLink href={check.href} className="min-h-10 px-4 py-1.5">
									<StatusChipIcon tone={s.tone} glyph={s.glyph} />
									<span className="sr-only">{s.name}:</span>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm text-foreground">{check.label}</span>
										<span className="block text-2xs text-tertiary-foreground @md:truncate" title={check.detail}>
											{check.detail}
										</span>
									</span>
									<span className="hidden shrink-0 text-2xs font-medium uppercase tracking-[0.04em] text-tertiary-foreground @sm:inline">{AREA_LABEL[check.area]}</span>
									{check.href && <CaretRightIcon size={12} aria-hidden="true" className="shrink-0 text-tertiary-foreground" />}
								</RowLink>
							</li>
						);
					})}
				</ul>
			)}
		</SectionPanel>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Recent activity                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export interface ActivityItem {
	id: string;
	kind: "invoice" | "payment" | "bill";
	direction: "in" | "out" | "neutral";
	/** Counterparty. */
	title: string;
	/** Reference number or note. */
	subtitle?: string | null;
	amount: number | null;
	currency?: string;
	status: string;
	/** ISO timestamp. */
	date: string;
	href?: string;
}

/** Kind tiles: a soft tint of a chart-series token with a same-hue glyph. Literal strings for Tailwind. */
const KIND_TILE = {
	invoice: "bg-[color-mix(in_oklab,var(--chart-series-1)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-1)_82%,var(--foreground))]",
	bill: "bg-[color-mix(in_oklab,var(--chart-series-4)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-4)_82%,var(--foreground))]",
	out: "bg-[color-mix(in_oklab,var(--chart-series-5)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-5)_82%,var(--foreground))]",
	in: "bg-[color-mix(in_oklab,var(--chart-series-3)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-3)_82%,var(--foreground))]",
} as const;

/** What the kind tile's glyph says, for screen readers. */
const KIND_NAME = { invoice: "Invoice", bill: "Bill", out: "Payment out", in: "Payment in" } as const;

function activityVisual(item: ActivityItem) {
	if (item.kind === "invoice") return { Icon: InvoiceIcon, tile: KIND_TILE.invoice };
	if (item.kind === "bill") return { Icon: ReceiptIcon, tile: KIND_TILE.bill };
	return item.direction === "out" ? { Icon: ArrowUpRightIcon, tile: KIND_TILE.out } : { Icon: ArrowDownLeftIcon, tile: KIND_TILE.in };
}

function activityStatus(status: string): { tone: StatusTone; glyph: StatusGlyph } {
	const s = status.toLowerCase();
	if (["paid", "succeeded", "completed", "reconciled"].includes(s)) return { tone: "green", glyph: "check" };
	if (["overdue", "failed", "void", "voided"].includes(s)) return { tone: "red", glyph: "x" };
	if (["pending", "processing", "partially_paid"].includes(s)) return { tone: "amber", glyph: "clock" };
	return { tone: "neutral", glyph: "minus" };
}

function relativeTimeShort(iso: string, now: number): string {
	const mins = Math.floor((now - new Date(iso).getTime()) / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return formatDate(iso);
}

/**
 * The unified business feed (cynco dashboard/overview/RecentActivityPanel):
 * invoices raised, payments moved and bills entered, newest first. The status
 * chip moves under the counterparty below 28rem of container width.
 */
export function RecentActivityFeed({
	items,
	now,
	viewAllHref,
	className,
	...props
}: React.ComponentProps<"section"> & { items: ActivityItem[] | null; now?: string | number; viewAllHref?: string }) {
	const clock = now != null ? new Date(now).getTime() : Date.now();
	return (
		<SectionPanel
			flush
			aria-label="Recent activity"
			className={className}
			{...props}
			title="Recent activity"
			actions={
				viewAllHref && (
					<a
						href={viewAllHref}
						className="inline-flex items-center gap-1 rounded-md text-2xs font-medium text-tertiary-foreground outline-none hover:text-foreground focus-ring"
					>
						View all
						<ArrowRightIcon size={12} aria-hidden="true" />
					</a>
				)
			}
		>
			<div className="border-t p-1.5">
				{items === null ? (
					<p className="px-3 py-8 text-center text-2xs text-tertiary-foreground">Couldn&apos;t load activity right now</p>
				) : items.length === 0 ? (
					<div className="px-3 py-8 text-center">
						<p className="text-sm font-semibold text-foreground">Nothing yet</p>
						<p className="mt-0.5 text-2xs text-tertiary-foreground">Raise an invoice or record a payment to get going</p>
					</div>
				) : (
					items.map((item) => {
						const { Icon, tile } = activityVisual(item);
						const st = activityStatus(item.status);
						const label = item.status.replace(/_/g, " ");
						const sign = item.direction === "out" ? "−" : "+";
						const chip = (
							<StatusChip tone={st.tone} glyph={st.glyph}>
								{label.charAt(0).toUpperCase() + label.slice(1)}
							</StatusChip>
						);
						return (
							<RowLink key={item.id} href={item.href} className="items-start rounded-lg px-2.5 py-2 @md:items-center">
								<span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tile)}>
									<Icon size={16} weight="bold" aria-hidden="true" />
								</span>
								<span className="sr-only">{KIND_NAME[item.kind === "payment" ? (item.direction === "out" ? "out" : "in") : item.kind]}:</span>
								<span className="min-w-0 flex-1">
									<span className="block text-sm text-foreground @md:truncate">{item.title}</span>
									{item.subtitle && <span className="block text-tiny-id text-tertiary-foreground [overflow-wrap:anywhere] @md:truncate">{item.subtitle}</span>}
									<span className="mt-1 flex @md:hidden">{chip}</span>
								</span>
								<span className="hidden shrink-0 justify-end @md:flex">{chip}</span>
								<span className="shrink-0 text-right @md:min-w-32">
									<span className={cn("block text-sm font-semibold tabular-nums whitespace-nowrap", item.amount ? "text-foreground" : "text-tertiary-foreground")}>
										{item.amount ? `${sign}${formatCurrency(Math.abs(item.amount), item.currency ?? "MYR")}` : "—"}
									</span>
									<span className="block text-2xs text-tertiary-foreground">{relativeTimeShort(item.date, clock)}</span>
								</span>
							</RowLink>
						);
					})
				)}
			</div>
		</SectionPanel>
	);
}
