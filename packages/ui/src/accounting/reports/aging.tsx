"use client";

import type * as React from "react";
import { cn } from "../../base";
import { type Amount, subtractAmounts, sumAmounts, toSen } from "../../lib/money";
import {
	type DataColumn,
	DataList,
	formatCurrency,
	formatCurrencyCompact,
	SectionLabel,
	SectionPanel,
	StatGrid,
	StatTile,
	surfaces,
	ToneDot,
	toneBg,
} from "../../lib/shared";
import { ChartKeyDot, DOUBLE_RULE, Figure, ratioOf } from "./shared";

export interface AgingBucket {
	current: Amount;
	days1to30: Amount;
	days31to60: Amount;
	days61to90: Amount;
	over90: Amount;
	/** The posted total. Omit it and the bands are added, which an aging report built from them may do. */
	total?: Amount;
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
const bucketTotal = (b: AgingBucket): Amount => b.total ?? sumAmounts(AGE_BANDS.map((x) => b[x.key]));

function AgingRing({ bucket, currency, size = 92 }: { bucket: AgingBucket; currency: string; size?: number }) {
	const stroke = 9;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const total = bucketTotal(bucket);
	let used = 0;
	const arcs = AGE_BANDS.flatMap((band) => {
		const v = bucket[band.key];
		if (toSen(v) <= 0n) return [];
		const len = ratioOf(v, total) * c;
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
			<text
				x="50%"
				y="50%"
				textAnchor="middle"
				dominantBaseline="central"
				className="fill-foreground text-2xs font-semibold tabular-nums"
			>
				{formatCurrencyCompact(total, currency)}
			</text>
		</svg>
	);
}

function OwedColumn({
	title,
	bucket,
	currency,
	footnote,
}: {
	title: string;
	bucket: AgingBucket | null;
	currency: string;
	footnote?: string;
}) {
	const total = bucket ? bucketTotal(bucket) : 0;
	const overdueSen = bucket ? toSen(total) - toSen(bucket.current) : 0n;
	const overdue = bucket ? subtractAmounts(total, bucket.current) : 0;
	return (
		<div className="flex min-w-0 flex-1 flex-col items-center gap-2 rounded-lg p-2 hover:bg-interactive-secondary-hover">
			<span className="text-2xs text-tertiary-foreground">{title}</span>
			{bucket && toSen(total) > 0n ? (
				<>
					<AgingRing bucket={bucket} currency={currency} />
					<span className="sr-only">Total {formatCurrency(total, currency)}</span>
					<ul className="flex flex-wrap justify-center gap-x-2.5 gap-y-0.5">
						{AGE_BANDS.filter((b) => toSen(bucket[b.key]) > 0n).map((b) => (
							<li key={b.key}>
								<ChartKeyDot dotClass={b.dot}>
									{b.label}{" "}
									<span className="tabular-nums text-muted-foreground">{formatCurrencyCompact(bucket[b.key], currency)}</span>
								</ChartKeyDot>
							</li>
						))}
					</ul>
				</>
			) : (
				<span className="grid h-[92px] place-items-center text-2xs text-tertiary-foreground">
					{bucket ? "Nothing outstanding" : "Unavailable"}
				</span>
			)}
			{(overdueSen > 0n || footnote) && (
				<span className="flex flex-wrap items-center justify-center gap-x-1.5 text-center text-2xs text-tertiary-foreground">
					{overdueSen > 0n && (
						<span className="flex items-center gap-1.5">
							<ToneDot tone="amber" />
							<span className="text-foreground tabular-nums">{formatCurrencyCompact(overdue, currency)} overdue</span>
						</span>
					)}
					{overdueSen > 0n && footnote ? <span aria-hidden="true">·</span> : null}
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
				<OwedColumn
					title="Receivables"
					bucket={receivables}
					currency={currency}
					footnote={dso == null ? undefined : `${Math.round(dso)}d to collect`}
				/>
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
	totals,
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
	/** The report's posted band totals. Omit them and the rows are added, which `limit` then under-counts. */
	totals?: AgingBucket;
	dso?: number | null;
	/** Show only the top N debtors (by total). */
	limit?: number;
	currency?: string;
	/** "Customer" for receivables, "Vendor" for payables. */
	partyLabel?: string;
}) {
	const sorted = [...rows].sort((a, b) => {
		const d = toSen(bucketTotal(b)) - toSen(bucketTotal(a));
		return d > 0n ? 1 : d < 0n ? -1 : 0;
	});
	const shown = limit ? sorted.slice(0, limit) : sorted;
	const sum = (k: BandKey) => totals?.[k] ?? sumAmounts(rows.map((r) => r[k]));
	const total = totals ? bucketTotal(totals) : sumAmounts(rows.map(bucketTotal));
	const current = sum("current");
	const overdueParties = rows.filter((r) => toSen(bucketTotal(r)) > toSen(r.current)).length;
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
					<span
						className={cn(
							r.__total && "font-semibold",
							b.key === "over90" && toSen(r.over90) > 0n && !r.__total && surfaces.negative,
						)}
					>
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
				<StatTile
					className="p-3"
					label="Current (not due)"
					value={formatCurrency(current, currency)}
					dot="var(--status-green)"
				/>
				<StatTile
					className="p-3"
					label="Total overdue"
					value={formatCurrency(subtractAmounts(total, current), currency)}
					dot="var(--status-red)"
				/>
				<StatTile
					className="p-3"
					label={`Overdue ${partyLabel.toLowerCase()}s`}
					value={String(overdueParties)}
					dot="var(--status-amber)"
				/>
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
