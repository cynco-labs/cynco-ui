"use client";

/**
 * Cynco UI — printable financial reports, assembled from the document kit.
 *
 *   <ProfitAndLossReport report={…} />     Statement of Profit or Loss, comparative + variance
 *   <BalanceSheetReport report={…} />      Statement of Financial Position, comparative, balance check
 *   <TrialBalanceDocument report={…} />    Trial balance with Balanced / Out-by check
 *   <GeneralLedgerReport report={…} />     Per-account ledger, running balances, A4 landscape
 *   <AgedReceivablesReport report={…} />   Ageing by customer, totals, % of total, bucket summary
 *   <CashFlowReport report={…} />          Statement of Cash Flows, indirect method
 *
 * Two new parts carry the reports and belong in the kit:
 * - `ReportHeader` — letterhead for statements: company + reg. no., title, period line, basis · currency, filters.
 * - `StatementTable` — the accountant's table: period columns, heading / line / subtotal / total / spacer rows,
 *   indents, note refs, optional account codes, brackets for negatives, em dash for zero, rules over the
 *   figures only, double rule under totals. Headers repeat on every printed page.
 * Plus `ReportBalanceCheck` (quiet "Balanced" / red "Out by RM x"), `ReportFooter` (prepared by / on) and
 * `useDocLabel` (report vocabulary in EN / BM / bilingual, falling back to the kit's labels).
 *
 * Figures are decimal strings printed as given: reports never add up their own lines.
 */
import * as React from "react";
import { cn } from "../base";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import {
	DocumentPage,
	DocumentFooter,
	DocumentLogo,
	DocumentTable,
	DocLabel,
	DocStack,
	DocSignedFigure,
	NotesBlock,
	currencySymbol,
	formatDocDate,
	formatReportDate,
	type StatementTableFormat,
	type StatementTableValue,
	DOC_LABELS,
	useDocLabel,
	useDocumentBrand,
	type DocColumn,
	type DocLabelKey,
	type DocumentPageProps,
} from "./kit";
import { formatDocAmount, formatStatementValue, isZero } from "./format";

/* ═════════════ Labels (shared dictionary: ./doc-labels) ═════════════ */

const label = (t: ReturnType<typeof useDocLabel>, v: React.ReactNode, stacked?: boolean) => (typeof v === "string" ? t(v, { stacked }) : v);

/* ═════════════ Periods ═════════════ */

/**
 * What a report covers. `year`/`month`/`months` end on `end`; `range` runs `start`→`end`; `asAt` is a point in time.
 * `months` is the count for "For the 10 months ended …".
 */
export type ReportPeriod = { kind: "year" | "month" | "months" | "range" | "asAt"; end: string; start?: string; months?: number };

function periodText(p: ReportPeriod, lang: "en" | "ms"): string {
	const d = (s?: string) => formatReportDate(s ?? "", lang);
	if (lang === "ms") {
		switch (p.kind) {
			case "year": return `Bagi tahun berakhir ${d(p.end)}`;
			case "month": return `Bagi bulan berakhir ${d(p.end)}`;
			case "months": return `Bagi tempoh ${p.months ?? ""} bulan berakhir ${d(p.end)}`;
			case "range": return `Bagi tempoh ${d(p.start)} hingga ${d(p.end)}`;
			case "asAt": return `Pada ${d(p.end)}`;
		}
	}
	switch (p.kind) {
		case "year": return `For the year ended ${d(p.end)}`;
		case "month": return `For the month ended ${d(p.end)}`;
		case "months": return `For the ${p.months ?? ""} months ended ${d(p.end)}`;
		case "range": return `For the period ${d(p.start)} to ${d(p.end)}`;
		case "asAt": return `As at ${d(p.end)}`;
	}
}

const isPeriod = (v: unknown): v is ReportPeriod => typeof v === "object" && v !== null && "kind" in v && "end" in v;

/* ═════════════ ReportHeader ═════════════ */

export type ReportBasis = "accrual" | "cash";
export type ReportFilter = { label: React.ReactNode; value: React.ReactNode };

export type ReportHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
	/** A report label key ("statementOfProfitOrLoss"), a kit key, or any text. */
	title: DocLabelKey | DocLabelKey | (string & {}) | React.ReactNode;
	/** Period object (formatted in the brand's language) or your own text. */
	period?: ReportPeriod | React.ReactNode;
	/** "accrual" | "cash" or your own text. */
	basis?: ReportBasis | React.ReactNode;
	/** ISO code; printed as "RM" for MYR. */
	currency?: string;
	/** "Branch: Penang HQ", "Project: All" — what the figures were filtered by. */
	filters?: ReportFilter[];
	/** Show the brand logo (modern and classic). Default true. */
	logo?: boolean;
};

/** Letterhead for financial statements: company and reg. no., report title, period, basis · currency, filters. */
export function ReportHeader({ title, period, basis = "accrual", currency = "MYR", filters, logo = true, className, ...props }: ReportHeaderProps) {
	const { company, layout, locale } = useDocumentBrand();
	const t = useDocLabel();
	const titleNode = label(t, title as React.ReactNode, true);

	const periodNode = isPeriod(period) ? (
		locale === "en-ms" ? (
			<>
				<span className="block">{periodText(period, "en")}</span>
				<span lang="ms" className="block text-[0.86em] italic opacity-75">
					{periodText(period, "ms")}
				</span>
			</>
		) : (
			periodText(period, locale === "ms" ? "ms" : "en")
		)
	) : (
		period
	);
	const basisNode = basis === "accrual" ? t("accrualBasis") : basis === "cash" ? t("cashBasis") : basis;
	const basisLine = (
		<>
			{basisNode}
			{basisNode != null && <span className="px-[0.45em] opacity-50">·</span>}
			{currencySymbol(currency)}
		</>
	);
	const reg = company.registrationNo && (
		<>
			<span className="text-[var(--doc-subtle)]">{t("registrationNo")}</span> {company.registrationNo}
		</>
	);
	const filterList = filters?.length ? filters : null;

	if (layout === "classic") {
		return (
			<header data-slot="cy-report-header" className={cn("flex flex-col items-center text-center", className)} {...props}>
				{logo && <DocumentLogo className="mb-[2.5mm]" />}
				<div className="text-[14pt] leading-tight font-medium tracking-[0.01em] [font-family:var(--doc-display)]">{company.name}</div>
				{reg && <div className="mt-[1mm] text-[7.5pt] text-[var(--doc-muted)]">{reg}</div>}
				<div className="mt-[5mm] flex w-full items-center gap-4">
					<div className="h-px flex-1 bg-[var(--doc-rule-strong)]" />
					<h1 className="text-[17pt] leading-[1.1] font-medium tracking-[0.015em] [font-family:var(--doc-display)]">{titleNode}</h1>
					<div className="h-px flex-1 bg-[var(--doc-rule-strong)]" />
				</div>
				{periodNode && <div className="mt-[2.5mm] text-[10.5pt] leading-snug italic [font-family:var(--doc-display)]">{periodNode}</div>}
				<div className="mt-[1.8mm] text-[6.75pt] font-semibold tracking-[0.14em] text-[var(--doc-muted)] uppercase">{basisLine}</div>
				{filterList && (
					<div className="mt-[1.5mm] text-[7.5pt] text-[var(--doc-muted)]">
						{filterList.map((f, i) => (
							<span key={i} className="whitespace-nowrap">
								{i > 0 && <span className="px-[0.6em] opacity-50">·</span>}
								{f.label}: <span className="text-[var(--doc-ink)]">{f.value}</span>
							</span>
						))}
					</div>
				)}
			</header>
		);
	}

	if (layout === "minimal") {
		return (
			<header data-slot="cy-report-header" className={cn("flex flex-col", className)} {...props}>
				<div className="flex items-baseline justify-between gap-6 text-[7pt] font-semibold tracking-[0.14em] text-[var(--doc-muted)] uppercase">
					<span className="min-w-0">{company.name}</span>
					{company.registrationNo && <span className="shrink-0 font-medium tracking-[0.06em] normal-case">{reg}</span>}
				</div>
				<div className="mt-[9mm] flex items-end justify-between gap-10">
					<div className="min-w-0">
						<h1 className="text-[19pt] leading-[1.05] font-medium tracking-[-0.02em] [font-family:var(--doc-display)]">{titleNode}</h1>
						{periodNode && <div className="mt-[2mm] text-[9.5pt] leading-snug text-[var(--doc-muted)]">{periodNode}</div>}
					</div>
					<div className="shrink-0 pb-[0.5mm] text-right text-[7.5pt] leading-[1.6] text-[var(--doc-muted)]">
						<div>{basisLine}</div>
						{filterList?.map((f, i) => (
							<div key={i}>
								{f.label} <span className="text-[var(--doc-ink)]">{f.value}</span>
							</div>
						))}
					</div>
				</div>
			</header>
		);
	}

	// modern
	return (
		<header data-slot="cy-report-header" className={cn("flex flex-col pt-[2mm]", className)} {...props}>
			<div className="flex items-center gap-3">
				{logo && <DocumentLogo size="sm" />}
				<div className="min-w-0">
					<div className="text-[10.5pt] leading-tight font-semibold tracking-[-0.01em]">{company.name}</div>
					{reg && <div className="mt-[0.6mm] text-[7.5pt] text-[var(--doc-muted)]">{reg}</div>}
				</div>
			</div>
			<div className="mt-[8mm] flex items-end justify-between gap-10">
				<div className="min-w-0">
					<h1 className="text-[21pt] leading-[1.02] font-semibold tracking-[-0.025em] [font-family:var(--doc-display)]">{titleNode}</h1>
					{periodNode && <div className="mt-[2mm] text-[9.5pt] leading-snug text-[var(--doc-muted)]">{periodNode}</div>}
				</div>
				<div className="shrink-0 text-[7.25pt] font-medium tracking-[0.04em] whitespace-nowrap text-[var(--doc-muted)]">{basisLine}</div>
			</div>
			{filterList && (
				<div className="mt-[3.5mm] flex flex-wrap gap-[1.5mm]">
					{filterList.map((f, i) => (
						<span key={i} className="rounded-[1.2mm] border border-[var(--doc-rule)] px-[2mm] py-[0.6mm] text-[7pt] whitespace-nowrap">
							<span className="text-[var(--doc-subtle)]">{f.label}</span> <span className="font-medium">{f.value}</span>
						</span>
					))}
				</div>
			)}
		</header>
	);
}

/* ═════════════ StatementTable ═════════════ */

export type StatementTableColumn = {
	key: string;
	/** Label key or text, e.g. "Oct 2026", "variance". */
	header: React.ReactNode;
	/** Small line under the header, e.g. "RM". */
	sublabel?: React.ReactNode;
	format?: StatementTableFormat;
	/** The current period: set in a stronger weight. */
	emphasis?: boolean;
	/** Quieter figures (variance columns). */
	muted?: boolean;
	/** CSS width; amounts default to 25mm, percentages to 15mm. */
	width?: string;
	/** What a zero prints as. Default "—". */
	zero?: string;
};

type FigureRowBase = {
	key?: string;
	label: React.ReactNode;
	/** One value per column, in column order. */
	values: StatementTableValue[];
	indent?: 0 | 1 | 2 | 3;
	/** Note reference ("4") printed in the Note column. */
	note?: React.ReactNode;
	/** Account code, shown when the table has `codes`. */
	code?: React.ReactNode;
	/** Overrides every column's format for this row (e.g. a "% of total" row). */
	format?: StatementTableFormat;
};

export type StatementTableRow =
	| { kind: "heading"; key?: string; label: React.ReactNode; /** 1 = section (Assets, Revenue), 2 = group (Current assets, Staff costs). */ level?: 1 | 2; indent?: 0 | 1 | 2 | 3 }
	| (FigureRowBase & { kind: "line"; /** Quieter second line under the label. */ detail?: React.ReactNode; muted?: boolean })
	| (FigureRowBase & { kind: "subtotal" })
	| (FigureRowBase & { kind: "total" })
	| { kind: "spacer"; key?: string };

export type StatementTableProps = Omit<React.ComponentProps<"table">, "children"> & {
	columns: StatementTableColumn[];
	rows: StatementTableRow[];
	/** Show an account code column (default: when any row has a code). */
	codes?: boolean;
	/** Show a Note column (default: when any row has a note). */
	notes?: boolean;
	/** Header over the label column (e.g. "account"). Blank by default, as statements are. */
	labelHeader?: React.ReactNode;
	/** Hairline between line rows — for long lists (trial balance, ageing). */
	ruled?: boolean;
	dense?: boolean;
};

/**
 * The financial-statement table. Period columns of figures; rows are headings, lines (indented, with note refs
 * and optional codes), subtotals (single rule over the figures), totals (single rule over, double rule under),
 * and spacers. Figures are printed exactly as given. The header repeats on every printed page.
 */
export function StatementTable({ columns, rows, codes, notes, labelHeader, ruled, dense, className, ...props }: StatementTableProps) {
	const { layout } = useDocumentBrand();
	const t = useDocLabel();
	const showCodes = codes ?? rows.some((r) => "code" in r && r.code != null && r.code !== "");
	const showNotes = notes ?? rows.some((r) => "note" in r && r.note != null && r.note !== "");
	const span = 1 + (showCodes ? 1 : 0) + (showNotes ? 1 : 0) + columns.length;
	const modern = layout === "modern";
	const edge = 0;
	const lastKey = columns[columns.length - 1]?.key;
	const pad = dense ? "py-[1.05mm]" : "py-[1.2mm]";
	// Labels on subtotal/total rows sit on the figures' baseline (figures carry a rule and padding above).
	const strongPad = "pt-[2.9mm] pb-[1.2mm]";

	const beforeBand = new Set<string>();
	const colPad = (c: StatementTableColumn) => cn("pl-[3.5mm]", beforeBand.has(c.key) && "pr-[2mm]", c.key === lastKey && "pr-0");
	const band = (_c: StatementTableColumn): string | undefined => undefined;
	const leadPad = (indent = 0) => ({ paddingLeft: `${edge + indent * 4}mm` });
	const firstLead = showCodes ? "code" : "label";

	return (
		<table data-slot="cy-statement-table" className={cn("w-full border-collapse", className)} {...props}>
			<colgroup>
				{showCodes && <col style={{ width: "19mm" }} />}
				<col />
				{showNotes && <col style={{ width: "11mm" }} />}
				{columns.map((c) => (
					<col key={c.key} style={{ width: c.width ?? (c.format === "percent" ? "15mm" : "25mm") }} />
				))}
			</colgroup>
			<thead>
				<tr
					className={cn(
						"align-bottom",
						modern && "border-b-[1.5px] border-[var(--doc-rule-strong)]",
						layout === "classic" && "border-y-[1.5px] border-[var(--doc-rule-strong)]",
						layout === "minimal" && "border-b border-[var(--doc-rule-strong)]",
					)}
				>
					{showCodes && (
						<th scope="col" className={cn(thBase, "text-left")} style={leadPad()}>
							{t("code", { stacked: true })}
						</th>
					)}
					<th scope="col" className={cn(thBase, "text-left", showCodes && "pl-[3mm]")} style={showCodes ? undefined : leadPad()}>
						{labelHeader != null ? label(t, labelHeader, true) : <span className="sr-only">{t("account")}</span>}
					</th>
					{showNotes && (
						<th scope="col" className={cn(thBase, "text-center")}>
							{t("note", { stacked: true })}
						</th>
					)}
					{columns.map((c) => (
						<th key={c.key} scope="col" className={cn(thBase, "text-right", colPad(c), !modern && "text-[var(--doc-muted)]", !modern && c.emphasis && "text-[var(--doc-ink)]")}>
							<span className="block">{label(t, c.header, true)}</span>
							{c.sublabel != null && <span className="mt-[0.3mm] block font-medium tracking-[0.06em] normal-case">{c.sublabel}</span>}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((r, i) => {
					const key = r.key ?? `${r.kind}-${i}`;
					if (r.kind === "spacer")
						return (
							<tr key={key} aria-hidden>
								<td colSpan={span - columns.length} className="h-[2.6mm] p-0" />
								{columns.map((c) => (
									<td key={c.key} className={cn("p-0", band(c))} />
								))}
							</tr>
						);
					if (r.kind === "heading") {
						const level = r.level ?? 1;
						const top = i === 0 ? "pt-[2.5mm]" : level === 1 ? "pt-[4.5mm]" : "pt-[2.6mm]";
						return (
							<tr key={key} className="cy-doc-break-avoid break-after-avoid">
								<td colSpan={span - columns.length} className={cn(top, "pb-[1mm]")} style={leadPad(r.indent)}>
									{level === 1 ? (
										<div
											className={cn(
												layout === "classic"
													? "text-[10pt] leading-tight font-semibold [font-family:var(--doc-display)]"
													: "text-[7pt] leading-tight font-semibold tracking-[0.12em] uppercase",
												modern && "text-[var(--doc-ink)]",
												layout === "minimal" && "text-[var(--doc-muted)]",
											)}
										>
											{label(t, r.label, false)}
										</div>
									) : (
										<div className={cn("leading-tight font-semibold", layout === "classic" && "text-[9.5pt] font-medium italic [font-family:var(--doc-display)]")}>{label(t, r.label, false)}</div>
									)}
								</td>
								{columns.map((c) => (
									<td key={c.key} className={band(c) || undefined} />
								))}
							</tr>
						);
					}
					const strong = r.kind === "subtotal" || r.kind === "total";
					const muted = r.kind === "line" && r.muted;
					const rowLabel = label(t, r.label, false);
					// A row with no label (a spacer or a bare figure) has nothing to head it, so it gets a plain cell.
					const LabelCell = rowLabel == null || rowLabel === "" ? "td" : "th";
					return (
						<tr
							key={key}
							className={cn(
								"cy-doc-break-avoid align-top",
								strong && "break-before-avoid",
								ruled && r.kind === "line" && "border-b border-[var(--doc-rule)]",
								muted && "text-[var(--doc-muted)]",
							)}
						>
							{showCodes && (
								<td className={cn(strong ? strongPad : pad, "cy-doc-num text-[7.75pt] whitespace-nowrap text-[var(--doc-muted)]")} style={leadPad()}>
									{r.code}
								</td>
							)}
							{/* The line's label heads its row, so each figure is announced with the line it belongs to (WCAG 1.3.1). */}
							<LabelCell
								scope={LabelCell === "th" ? "row" : undefined}
								className={cn("text-left", strong ? strongPad : pad, r.kind === "subtotal" ? "font-semibold" : r.kind === "total" ? "font-bold" : "font-normal", firstLead === "label" ? "" : "pl-[3mm]")}
								style={firstLead === "label" ? leadPad(r.indent) : { paddingLeft: `${3 + (r.indent ?? 0) * 4}mm` }}
							>
								{rowLabel}
								{r.kind === "line" && r.detail && <div className="mt-[0.3mm] text-[7.25pt] leading-snug font-normal text-[var(--doc-muted)]">{r.detail}</div>}
							</LabelCell>
							{showNotes && <td className={cn(strong ? strongPad : pad, "cy-doc-num text-center text-[7.5pt] text-[var(--doc-muted)]")}>{r.note}</td>}
							{columns.map((c, ci) => {
								const v = r.values[ci];
								const fmt = r.format ?? c.format ?? "amount";
								const text = formatStatementValue(v, fmt, c.zero ?? "—");
								const zero = v != null && isZero(v);
								const fig = (
									<span className={cn(zero && "text-[var(--doc-subtle)]", c.muted && !strong && "text-[var(--doc-muted)]")}>
										<DocSignedFigure text={text} />
									</span>
								);
								return (
									<td
										key={c.key}
										className={cn(
											r.kind === "line" ? pad : "pt-[1.6mm] pb-[1.2mm]",
											"cy-doc-num text-right whitespace-nowrap",
											colPad(c),
											band(c),
											r.kind === "subtotal" && "font-semibold",
											r.kind === "total" && "font-bold",
										)}
									>
										{strong ? (
											<div
												className={cn(
													"border-t pt-[1.3mm]",
													c.muted ? "border-[var(--doc-subtle)]" : "border-[var(--doc-rule-strong)]",
													r.kind === "total" && "pb-[1mm] [border-bottom-style:double] [border-bottom-width:3px]",
													r.kind === "total" && (c.muted ? "[border-bottom-color:var(--doc-subtle)]" : "[border-bottom-color:var(--doc-rule-strong)]"),
												)}
											>
												{text ? fig : <span aria-hidden="true" className="opacity-0">0</span>}
											</div>
										) : (
											fig
										)}
									</td>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}

const thBase = "py-[2mm] text-[6.75pt] leading-tight font-semibold tracking-[0.1em] uppercase";

/* ═════════════ Checks and footer ═════════════ */

export type ReportBalanceCheckProps = Omit<React.ComponentProps<"div">, "children"> & {
	/** From the data: never computed here. */
	status: "ok" | "error";
	/** Label key or text, e.g. "tbBalanced" or "outBy". */
	label: React.ReactNode;
	/** Difference to print after an error label ("Out of balance by RM 120.00"). */
	amount?: string;
	currency?: string;
};

/** A quiet "Balanced" line, or a red "Out of balance by RM x" — straight from the data's flags. */
export function ReportBalanceCheck({ status, label: text, amount, currency = "MYR", className, ...props }: ReportBalanceCheckProps) {
	const t = useDocLabel();
	const ok = status === "ok";
	const Icon = ok ? CheckCircleIcon : WarningCircleIcon;
	return (
		<div
			data-slot="cy-report-check"
			role={ok ? undefined : "alert"}
			className={cn("cy-doc-break-avoid flex items-center gap-[1.5mm] text-[7.5pt]", ok ? "text-[var(--doc-muted)]" : "font-semibold text-[var(--doc-ink)]", className)}
			{...props}
		>
			<Icon size={11} weight={ok ? "regular" : "fill"} className="shrink-0" aria-hidden />
			<span>
				{label(t, text, false)}
				{!ok && amount && (
					<span className="cy-doc-num whitespace-nowrap">
						{" "}
						{currencySymbol(currency)} {formatDocAmount(amount.replace(/^-/, ""))}
					</span>
				)}
			</span>
		</div>
	);
}

export type ReportFooterProps = React.ComponentProps<"footer"> & { preparedBy?: string; /** ISO date. */ preparedOn?: string };

/** Report footer: "Prepared by … · Prepared on …" above the kit's company line (the brand's sales footer note is left off). */
export function ReportFooter({ preparedBy, preparedOn, children, ...props }: ReportFooterProps) {
	const t = useDocLabel();
	const { locale } = useDocumentBrand();
	return (
		<DocumentFooter note={false} {...props}>
			{children}
			{(preparedBy || preparedOn) && (
				<div className="mb-[2.5mm] flex flex-wrap gap-x-[7mm] gap-y-[1mm] text-[7.5pt] text-[var(--doc-muted)]">
					{preparedBy && (
						<span>
							{t("preparedBy")} <span className="font-medium text-[var(--doc-ink)]">{preparedBy}</span>
						</span>
					)}
					{preparedOn && (
						<span>
							{t("preparedOn")} <span className="font-medium text-[var(--doc-ink)]">{formatDocDate(preparedOn, locale === "ms" ? "ms" : "en")}</span>
						</span>
					)}
				</div>
			)}
		</DocumentFooter>
	);
}

/* ═════════════ Shared report data ═════════════ */

/** What every report carries besides its figures. */
export type ReportBaseData = {
	period: ReportPeriod;
	/** Default "accrual". */
	basis?: ReportBasis;
	/** ISO code, default "MYR". */
	currency?: string;
	filters?: ReportFilter[];
	/** Replaces the default title. */
	title?: React.ReactNode;
	preparedBy?: string;
	/** ISO date. */
	preparedOn?: string;
	notes?: React.ReactNode;
};

/** A period column: "Oct 2026", "31 Dec 2025". The first is the current period. */
export type ReportColumn = { label: string; sublabel?: string };

/** Figures for one row: one value per period, plus variance and variance % when the report shows them. */
export type StatementFigures = { values: string[]; variance?: string; variancePct?: string };
export type StatementLineData = StatementFigures & { label: React.ReactNode; code?: string; note?: string };
export type StatementGroupData = { label: React.ReactNode; lines: StatementLineData[]; total: StatementFigures; /** Label on the group total; blank (rule and figures only) by default. */ totalLabel?: React.ReactNode };

export type ReportDocumentProps = Pick<DocumentPageProps, "brand" | "size" | "stamp" | "fit" | "isolate" | "className">;

function ReportShell({ data, title, size = "a4", brand, stamp, fit, isolate = true, className, children }: ReportDocumentProps & { data: ReportBaseData; title: DocLabelKey; children: React.ReactNode }) {
	return (
		<DocumentPage brand={brand} size={size} stamp={stamp} fit={fit} isolate={isolate} className={className}>
			<DocStack>
				<ReportHeader title={data.title ?? title} period={data.period} basis={data.basis ?? "accrual"} currency={data.currency} filters={data.filters} />
				{children}
				{data.notes != null && data.notes !== "" && <NotesBlock>{data.notes}</NotesBlock>}
			</DocStack>
			<ReportFooter preparedBy={data.preparedBy} preparedOn={data.preparedOn} />
		</DocumentPage>
	);
}

function periodColumns(cols: ReportColumn[], currency: string | undefined, variance?: boolean): StatementTableColumn[] {
	const sym = currencySymbol(currency);
	const out: StatementTableColumn[] = cols.map((c, i) => ({ key: `p${i}`, header: c.label, sublabel: c.sublabel ?? sym, emphasis: i === 0 && cols.length > 1 }));
	if (variance) out.push({ key: "var", header: "variance", sublabel: sym, muted: true }, { key: "varPct", header: "variancePct", format: "percent", muted: true, sublabel: "%" });
	return out;
}
const figs = (f: StatementFigures, variance?: boolean): StatementTableValue[] => (variance ? [...f.values, f.variance, f.variancePct] : f.values);
const lineRows = (lines: StatementLineData[] | undefined, variance?: boolean, indent: 0 | 1 | 2 = 1): StatementTableRow[] =>
	(lines ?? []).map((l, i) => ({ kind: "line", key: `${l.code ?? ""}-${i}-${typeof l.label === "string" ? l.label : ""}`, label: l.label, code: l.code, note: l.note, indent, values: figs(l, variance) }));
const neg = (f: StatementFigures) => (f.values[0] ?? "").trim().startsWith("-");

/* ═════════════ 1. Profit and loss ═════════════ */

export type ProfitAndLossData = ReportBaseData & {
	columns: ReportColumn[];
	/** Show variance and variance % columns (from each row's `variance` / `variancePct`). */
	variance?: boolean;
	/** Show account codes. */
	codes?: boolean;
	revenue: StatementLineData[];
	totalRevenue: StatementFigures;
	/** Costs as negative figures — printed in brackets. */
	costOfSales: StatementLineData[];
	totalCostOfSales: StatementFigures;
	grossProfit: StatementFigures;
	operatingExpenses: StatementGroupData[];
	totalOperatingExpenses: StatementFigures;
	operatingProfit: StatementFigures;
	otherIncome?: StatementLineData[];
	otherExpenses?: StatementLineData[];
	profitBeforeTax: StatementFigures;
	tax: StatementLineData[];
	netProfit: StatementFigures;
};

/** Statement of Profit or Loss: revenue → cost of sales → gross profit → grouped operating expenses → operating profit → other items → PBT → tax → profit; comparative + variance. */
export function ProfitAndLossReport({ report: d, ...page }: ReportDocumentProps & { report: ProfitAndLossData }) {
	const v = d.variance;
	const rows: StatementTableRow[] = [
		{ kind: "heading", label: "revenue" },
		...lineRows(d.revenue, v),
		{ kind: "subtotal", label: "totalRevenue", values: figs(d.totalRevenue, v) },
		{ kind: "heading", label: "costOfSales" },
		...lineRows(d.costOfSales, v),
		{ kind: "subtotal", label: "totalCostOfSales", values: figs(d.totalCostOfSales, v) },
		{ kind: "spacer" },
		{ kind: "subtotal", label: neg(d.grossProfit) ? "grossLoss" : "grossProfit", values: figs(d.grossProfit, v) },
		{ kind: "heading", label: "operatingExpenses" },
		...d.operatingExpenses.flatMap((g, gi): StatementTableRow[] => [
			{ kind: "heading", key: `g${gi}`, label: g.label, level: 2, indent: 0 },
			...lineRows(g.lines, v),
			{ kind: "subtotal", key: `g${gi}-t`, label: g.totalLabel ?? "", values: figs(g.total, v) },
		]),
		{ kind: "spacer" },
		{ kind: "subtotal", label: "totalOperatingExpenses", values: figs(d.totalOperatingExpenses, v) },
		{ kind: "spacer" },
		{ kind: "subtotal", label: neg(d.operatingProfit) ? "operatingLoss" : "operatingProfit", values: figs(d.operatingProfit, v) },
		...(d.otherIncome?.length ? ([{ kind: "heading", label: "otherIncome" }, ...lineRows(d.otherIncome, v)] as StatementTableRow[]) : []),
		...(d.otherExpenses?.length ? ([{ kind: "heading", label: "otherExpenses" }, ...lineRows(d.otherExpenses, v)] as StatementTableRow[]) : []),
		{ kind: "spacer" },
		{ kind: "subtotal", label: neg(d.profitBeforeTax) ? "lossBeforeTax" : "profitBeforeTax", values: figs(d.profitBeforeTax, v) },
		...lineRows(d.tax, v, 0),
		{ kind: "total", label: neg(d.netProfit) ? "lossForThePeriod" : "profitForThePeriod", values: figs(d.netProfit, v) },
	];
	return (
		<ReportShell data={d} title="statementOfProfitOrLoss" {...page}>
			<StatementTable columns={periodColumns(d.columns, d.currency, v)} rows={rows} codes={d.codes ?? false} />
		</ReportShell>
	);
}

/* ═════════════ 2. Balance sheet ═════════════ */

export type BalanceSheetData = ReportBaseData & {
	columns: ReportColumn[];
	codes?: boolean;
	nonCurrentAssets: StatementLineData[];
	totalNonCurrentAssets: StatementFigures;
	currentAssets: StatementLineData[];
	totalCurrentAssets: StatementFigures;
	totalAssets: StatementFigures;
	currentLiabilities: StatementLineData[];
	totalCurrentLiabilities: StatementFigures;
	nonCurrentLiabilities: StatementLineData[];
	totalNonCurrentLiabilities: StatementFigures;
	totalLiabilities: StatementFigures;
	equity: StatementLineData[];
	totalEquity: StatementFigures;
	totalEquityAndLiabilities: StatementFigures;
	/** From the ledger: total assets equal total equity and liabilities. */
	balanced: boolean;
	/** The difference when not balanced (decimal string). */
	difference?: string;
};

/** Statement of Financial Position: assets (non-current, current), liabilities (current, non-current), equity, and the "Total equity and liabilities" check line. */
export function BalanceSheetReport({ report: d, ...page }: ReportDocumentProps & { report: BalanceSheetData }) {
	const rows: StatementTableRow[] = [
		{ kind: "heading", label: "assets" },
		{ kind: "heading", label: "nonCurrentAssets", level: 2 },
		...lineRows(d.nonCurrentAssets),
		{ kind: "subtotal", label: "totalNonCurrentAssets", values: d.totalNonCurrentAssets.values },
		{ kind: "heading", label: "currentAssets", level: 2 },
		...lineRows(d.currentAssets),
		{ kind: "subtotal", label: "totalCurrentAssets", values: d.totalCurrentAssets.values },
		{ kind: "total", label: "totalAssets", values: d.totalAssets.values },
		{ kind: "heading", label: "liabilities" },
		{ kind: "heading", label: "currentLiabilities", level: 2 },
		...lineRows(d.currentLiabilities),
		{ kind: "subtotal", label: "totalCurrentLiabilities", values: d.totalCurrentLiabilities.values },
		{ kind: "heading", label: "nonCurrentLiabilities", level: 2 },
		...lineRows(d.nonCurrentLiabilities),
		{ kind: "subtotal", label: "totalNonCurrentLiabilities", values: d.totalNonCurrentLiabilities.values },
		{ kind: "spacer" },
		{ kind: "subtotal", label: "totalLiabilities", values: d.totalLiabilities.values },
		{ kind: "heading", label: "equity" },
		...lineRows(d.equity),
		{ kind: "subtotal", label: "totalEquity", values: d.totalEquity.values },
		{ kind: "spacer" },
		{ kind: "total", label: "totalEquityAndLiabilities", values: d.totalEquityAndLiabilities.values },
	];
	return (
		<ReportShell data={d} title="statementOfFinancialPosition" {...page}>
			<div className="flex flex-col gap-[3mm]">
				<StatementTable columns={periodColumns(d.columns, d.currency)} rows={rows} codes={d.codes ?? false} />
				<ReportBalanceCheck status={d.balanced ? "ok" : "error"} label={d.balanced ? "bsBalanced" : "outBy"} amount={d.difference} currency={d.currency} className="justify-end" />
			</div>
		</ReportShell>
	);
}

/* ═════════════ 3. Trial balance ═════════════ */

export type TrialBalanceLine = {
	code: string;
	name: React.ReactNode;
	/** Consecutive accounts with the same group print under one heading (label key or text, e.g. "assets"). */
	group?: string;
	debit?: string;
	credit?: string;
};

export type TrialBalanceData = ReportBaseData & {
	accounts: TrialBalanceLine[];
	totalDebit: string;
	totalCredit: string;
	/** From the ledger: debits equal credits. */
	balanced: boolean;
	/** The difference when not balanced. */
	difference?: string;
};

/** Trial balance: code, account, debit, credit, matching totals, and a quiet "Balanced" or red "Out of balance by RM x" line. (Named `…Document` because `TrialBalanceReport` is the on-screen report.) */
export function TrialBalanceDocument({ report: d, ...page }: ReportDocumentProps & { report: TrialBalanceData }) {
	const rows: StatementTableRow[] = [];
	let group: string | undefined;
	d.accounts.forEach((a, i) => {
		if (a.group && a.group !== group) rows.push({ kind: "heading", key: `h-${a.group}-${i}`, label: a.group, level: 2 });
		group = a.group;
		rows.push({ kind: "line", key: `${a.code}-${i}`, code: a.code, label: a.name, values: [a.debit, a.credit] });
	});
	rows.push({ kind: "total", label: "total", values: [d.totalDebit, d.totalCredit] });
	const sym = currencySymbol(d.currency);
	return (
		<ReportShell data={d} title="trialBalance" {...page}>
			<div className="flex flex-col gap-[3mm]">
				<StatementTable
					columns={[
						{ key: "dr", header: "debit", sublabel: sym, width: "30mm", zero: "" },
						{ key: "cr", header: "credit", sublabel: sym, width: "30mm", zero: "" },
					]}
					rows={rows}
					codes
					labelHeader="account"
					ruled
					dense
				/>
				<ReportBalanceCheck status={d.balanced ? "ok" : "error"} label={d.balanced ? "tbBalanced" : "outBy"} amount={d.difference} currency={d.currency} className="justify-end" />
			</div>
		</ReportShell>
	);
}

/* ═════════════ 4. General ledger ═════════════ */

export type GeneralLedgerLine = {
	/** ISO date. */
	date: string;
	journalNo: string;
	description: React.ReactNode;
	debit?: string;
	credit?: string;
	/** Running balance after this line, debit-positive. */
	balance: string;
};

export type GeneralLedgerAccount = {
	code: string;
	name: React.ReactNode;
	/** Debit-positive. */
	openingBalance: string;
	lines: GeneralLedgerLine[];
	totalDebit: string;
	totalCredit: string;
	closingBalance: string;
};

export type GeneralLedgerData = ReportBaseData & {
	accounts: GeneralLedgerAccount[];
	/** How balances print: "12,345.00 Dr" (default) or "(12,345.00)" for credit balances. */
	balanceStyle?: "drcr" | "brackets";
};

type LedgerRow = { kind: "line"; line: GeneralLedgerLine } | { kind: "closing"; account: GeneralLedgerAccount };

function LedgerBalance({ value, style }: { value: string; style: "drcr" | "brackets" }) {
	const { locale } = useDocumentBrand();
	if (isZero(value)) return <span className="text-[var(--doc-subtle)]">—</span>;
	if (style === "brackets") return <DocSignedFigure text={formatDocAmount(value, { brackets: true })} />;
	const credit = value.trim().startsWith("-");
	const lang = locale === "ms" ? 1 : 0;
	// "Dr" / "Cr" print as abbreviations; screen readers hear the word ("Dr" is otherwise read as "Doctor").
	return (
		<>
			{formatDocAmount(value.replace(/^-/, ""))}
			<span aria-hidden="true" className="ml-[1mm] inline-block w-[4mm] text-left text-[7pt] font-normal text-[var(--doc-subtle)]">
				{(credit ? DOC_LABELS.cr : DOC_LABELS.dr)[lang]}
			</span>
			<span className="sr-only"> {(credit ? DOC_LABELS.credit : DOC_LABELS.debit)[lang]}</span>
		</>
	);
}

/** General ledger: per account — header with code, name and opening balance; dated lines with journal no., debit, credit and running balance; closing balance. A4 landscape by default. */
export function GeneralLedgerReport({ report: d, size = "a4-landscape", ...page }: ReportDocumentProps & { report: GeneralLedgerData }) {
	const { layout, locale } = useDocumentBrand();
	const t = useDocLabel();
	const style = d.balanceStyle ?? "drcr";
	const lang = locale === "ms" ? "ms" : "en";
	const amt = (v?: string) => (v == null || v === "" ? "" : isZero(v) ? <span className="text-[var(--doc-subtle)]">—</span> : formatDocAmount(v));
	const strong = (r: LedgerRow, node: React.ReactNode) => (r.kind === "closing" ? <span className="font-semibold">{node}</span> : node);
	const columns: DocColumn<LedgerRow>[] = [
		{ key: "date", header: t("date", { stacked: true }), width: "24mm", cell: (r) => (r.kind === "line" ? <span className="cy-doc-num whitespace-nowrap">{formatDocDate(r.line.date, lang)}</span> : null) },
		{ key: "jn", header: t("journalNo", { stacked: true }), width: "30mm", cell: (r) => (r.kind === "line" ? <span className="cy-doc-num whitespace-nowrap text-[var(--doc-muted)]">{r.line.journalNo}</span> : null) },
		{ key: "desc", header: t("description", { stacked: true }), cell: (r) => (r.kind === "line" ? r.line.description : <span className="font-semibold">{t("closingBalance")}</span>) },
		{ key: "dr", header: t("debit", { stacked: true }), numeric: true, width: "30mm", cell: (r) => strong(r, amt(r.kind === "line" ? r.line.debit : r.account.totalDebit)) },
		{ key: "cr", header: t("credit", { stacked: true }), numeric: true, width: "30mm", cell: (r) => strong(r, amt(r.kind === "line" ? r.line.credit : r.account.totalCredit)) },
		{ key: "bal", header: t("balance", { stacked: true }), numeric: true, width: "36mm", cell: (r) => strong(r, <LedgerBalance value={r.kind === "line" ? r.line.balance : r.account.closingBalance} style={style} />) },
	];
	const sections = d.accounts.map((a) => ({
		title: (
			<span className={cn("flex items-baseline justify-between gap-6 text-[9pt] font-semibold tracking-normal text-[var(--doc-ink)] normal-case", false)}>
				<span className="min-w-0">
					<span className="cy-doc-num mr-[2.5mm] text-[var(--doc-muted)]">{a.code}</span>
					{a.name}
				</span>
				<span className="shrink-0 text-[7.75pt] font-normal text-[var(--doc-muted)]">
					{t("openingBalance")}{" "}
					<span className="cy-doc-num font-semibold text-[var(--doc-ink)]">
						<LedgerBalance value={a.openingBalance} style={style} />
					</span>
				</span>
			</span>
		),
		rows: [...a.lines.map((line): LedgerRow => ({ kind: "line", line })), { kind: "closing", account: a } as LedgerRow],
	}));
	return (
		<ReportShell data={d} title="generalLedger" size={size} {...page}>
			<DocumentTable
				columns={columns}
				sections={sections}
				dense
				className="[&_tbody>tr:first-child]:break-after-avoid [&_tbody>tr:last-child]:break-before-avoid [&_tbody>tr:last-child>td]:border-t [&_tbody>tr:last-child>td]:border-[var(--doc-rule-strong)]"
			/>
		</ReportShell>
	);
}

/* ═════════════ 5. Aged receivables ═════════════ */

export type AgeingBuckets = { current: string; days1to30: string; days31to60: string; days61to90: string; over90: string; total: string };
export type AgedReceivablesCustomer = AgeingBuckets & { name: React.ReactNode; /** Quieter second line: code, terms. */ detail?: React.ReactNode };

export type AgedReceivablesData = ReportBaseData & {
	customers: AgedReceivablesCustomer[];
	totals: AgeingBuckets;
	/** Share of the total per bucket, e.g. "49.2" (as calculated by the ledger). */
	percentages: AgeingBuckets;
	/** Bucket totals and shares above the table. Default true. */
	summary?: boolean;
};

const BUCKETS = ["current", "days1to30", "days31to60", "days61to90", "over90"] as const;

/** Bucket summary: amount and share of total per ageing bucket. */
function AgeingSummary({ totals, percentages }: { totals: AgeingBuckets; percentages: AgeingBuckets }) {
	const t = useDocLabel();
	const { layout } = useDocumentBrand();
	return (
		<dl className={cn("cy-doc-break-avoid grid grid-cols-5 gap-x-[5mm]", layout === "modern" && "border-y border-[var(--doc-rule)] py-[3.5mm]", layout === "classic" && "border-y border-[var(--doc-rule)] py-[3mm]")}>
			{BUCKETS.map((b) => (
				<div key={b} className="min-w-0">
					<dt>
						<DocLabel>{t(b)}</DocLabel>
					</dt>
					<dd className="cy-doc-num mt-[1.2mm] text-[10pt] leading-none font-semibold">{formatDocAmount(totals[b])}</dd>
					<dd className="cy-doc-num mt-[1mm] text-[7pt] text-[var(--doc-muted)]">{formatStatementValue(percentages[b], "percent", "0%")}</dd>
				</div>
			))}
		</dl>
	);
}

/** Aged receivables by customer: current, 1–30, 31–60, 61–90, over 90, total; totals and % of total; bucket summary. */
export function AgedReceivablesReport({ report: d, ...page }: ReportDocumentProps & { report: AgedReceivablesData }) {
	const sym = currencySymbol(d.currency);
	const cols: StatementTableColumn[] = [...BUCKETS.map((b) => ({ key: b, header: b, sublabel: sym, width: "20.5mm" })), { key: "total", header: "total", sublabel: sym, width: "24mm", emphasis: true }];
	const vals = (b: AgeingBuckets) => [...BUCKETS.map((k) => b[k]), b.total];
	const rows: StatementTableRow[] = [
		...d.customers.map((c, i): StatementTableRow => ({ kind: "line", key: `c${i}`, label: c.name, detail: c.detail, values: vals(c) })),
		{ kind: "total", label: "total", values: vals(d.totals) },
		{ kind: "line", label: "percentOfTotal", values: vals(d.percentages), format: "percent", muted: true },
	];
	return (
		<ReportShell data={d} title="agedReceivables" {...page}>
			{d.summary !== false && <AgeingSummary totals={d.totals} percentages={d.percentages} />}
			<StatementTable columns={cols} rows={rows} labelHeader="customer" ruled dense codes={false} notes={false} />
		</ReportShell>
	);
}

/* ═════════════ 6. Cash flow ═════════════ */

export type CashFlowData = ReportBaseData & {
	columns: ReportColumn[];
	profitBeforeTax: StatementFigures;
	adjustments: StatementLineData[];
	operatingProfitBeforeWorkingCapital: StatementFigures;
	workingCapitalChanges: StatementLineData[];
	cashGeneratedFromOperations: StatementFigures;
	/** Interest paid, income tax paid… */
	operatingOther?: StatementLineData[];
	netOperating: StatementFigures;
	investing: StatementLineData[];
	netInvesting: StatementFigures;
	financing: StatementLineData[];
	netFinancing: StatementFigures;
	netChange: StatementFigures;
	openingCash: StatementFigures;
	fxEffect?: StatementFigures;
	closingCash: StatementFigures;
	/** From the ledger: opening + net change (+ FX) equals closing. A red line prints when false. */
	reconciled?: boolean;
};

/** Statement of Cash Flows (indirect method): profit before tax, adjustments, working-capital changes, investing, financing, net change, opening and closing cash. */
export function CashFlowReport({ report: d, ...page }: ReportDocumentProps & { report: CashFlowData }) {
	const rows: StatementTableRow[] = [
		{ kind: "heading", label: "operatingActivities" },
		{ kind: "line", label: "profitBeforeTax", values: d.profitBeforeTax.values },
		{ kind: "heading", label: "adjustmentsFor", level: 2 },
		...lineRows(d.adjustments),
		{ kind: "subtotal", label: "operatingProfitBeforeWorkingCapital", values: d.operatingProfitBeforeWorkingCapital.values },
		{ kind: "heading", label: "changesInWorkingCapital", level: 2 },
		...lineRows(d.workingCapitalChanges),
		{ kind: "subtotal", label: "cashGeneratedFromOperations", values: d.cashGeneratedFromOperations.values },
		...lineRows(d.operatingOther, false, 0),
		{ kind: "subtotal", label: "netCashOperating", values: d.netOperating.values },
		{ kind: "heading", label: "investingActivities" },
		...lineRows(d.investing, false, 0),
		{ kind: "subtotal", label: "netCashInvesting", values: d.netInvesting.values },
		{ kind: "heading", label: "financingActivities" },
		...lineRows(d.financing, false, 0),
		{ kind: "subtotal", label: "netCashFinancing", values: d.netFinancing.values },
		{ kind: "spacer" },
		{ kind: "spacer" },
		{ kind: "subtotal", label: "netChangeInCash", values: d.netChange.values },
		{ kind: "line", label: "openingCash", values: d.openingCash.values },
		...(d.fxEffect ? ([{ kind: "line", label: "fxEffect", values: d.fxEffect.values }] as StatementTableRow[]) : []),
		{ kind: "total", label: "closingCash", values: d.closingCash.values },
	];
	return (
		<ReportShell data={d} title="statementOfCashFlows" {...page}>
			<div className="flex flex-col gap-[3mm]">
				<StatementTable columns={periodColumns(d.columns, d.currency)} rows={rows} codes={false} />
				{d.reconciled != null && <ReportBalanceCheck status={d.reconciled ? "ok" : "error"} label={d.reconciled ? "cfReconciled" : "cfUnreconciled"} className="justify-end" />}
			</div>
		</ReportShell>
	);
}
