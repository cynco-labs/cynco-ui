"use client";

/**
 * Cynco UI — money in and money out per month, with net across them.
 */
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, cn } from "../../base";
import { type Amount, sumAmounts } from "../../lib/money";
import { formatCurrency, formatCurrencyCompact, SectionPanel } from "../../lib/shared";
import type { With } from "./shared";

export type BankCashFlowPoint = { label: string; credits: Amount; debits: Amount; net: Amount };

/** CashFlowChart — inflow and outflow bars per month, with net as the line across them. The legend wraps under the title when narrow. */
export function BankCashFlowChart({
	data,
	currency = "MYR",
	title = "Cash flow",
	className,
	...props
}: With<{ data: BankCashFlowPoint[]; currency?: string; title?: string; className?: string }, "section">) {
	const config = {
		credits: { label: "Inflows", color: "var(--chart-series-3)" },
		debits: { label: "Outflows", color: "var(--chart-series-8)" },
		net: { label: "Net", color: "var(--primary)" },
	};
	const totals = { in: sumAmounts(data.map((p) => p.credits)), out: sumAmounts(data.map((p) => p.debits)) };
	const legend = (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
			{(Object.keys(config) as (keyof typeof config)[]).map((k) => (
				<span key={k} className="inline-flex items-center gap-1.5 text-2xs text-muted-foreground">
					{/* chart swatch: fill from the chart token */}
					<span
						aria-hidden="true"
						className={cn(k === "net" ? "h-0.5 w-3 rounded-full" : "size-2 rounded-xs", k === "debits" && "opacity-75")}
						style={{ backgroundColor: config[k].color }}
					/>
					{config[k].label}
					{k !== "net" && (
						<span className="tabular-nums text-foreground">
							{formatCurrencyCompact(k === "credits" ? totals.in : totals.out, currency)}
						</span>
					)}
				</span>
			))}
		</div>
	);
	return (
		<SectionPanel
			title={title}
			description={`${data[0]?.label ?? ""} – ${data[data.length - 1]?.label ?? ""}`}
			actions={legend}
			className={className}
			{...props}
		>
			<ChartContainer config={config} className="aspect-auto h-56 w-full">
				<ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
					<CartesianGrid vertical={false} stroke="var(--chart-grid-stroke)" />
					<XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={8} />
					<YAxis
						tickLine={false}
						axisLine={false}
						width={64}
						tickFormatter={(v: number) => formatCurrencyCompact(v, currency)}
					/>
					<ChartTooltip
						content={
							<ChartTooltipContent
								formatter={(v, name) => (
									<span className="flex w-full justify-between gap-4">
										<span className="text-muted-foreground">{config[name as keyof typeof config]?.label ?? String(name)}</span>
										<span className="tabular-nums text-foreground">
											{formatCurrency(typeof v === "number" || typeof v === "string" ? v : 0, currency)}
										</span>
									</span>
								)}
							/>
						}
					/>
					<Bar
						dataKey="credits"
						fill="var(--color-credits)"
						radius={[3, 3, 0, 0]}
						maxBarSize={18}
						isAnimationActive={false}
					/>
					<Bar
						dataKey="debits"
						fill="var(--color-debits)"
						fillOpacity={0.75}
						radius={[3, 3, 0, 0]}
						maxBarSize={18}
						isAnimationActive={false}
					/>
					<Line
						dataKey="net"
						type="monotone"
						stroke="var(--color-net)"
						strokeWidth={2}
						dot={{ r: 2.5, fill: "var(--color-net)" }}
						isAnimationActive={false}
					/>
				</ComposedChart>
			</ChartContainer>
			{/* The chart's figures for screen readers: the SVG and its hover tooltip expose none of them. */}
			<table className="sr-only">
				<caption>{`${title}, ${currency}`}</caption>
				<thead>
					<tr>
						<th scope="col">Month</th>
						<th scope="col">{config.credits.label}</th>
						<th scope="col">{config.debits.label}</th>
						<th scope="col">{config.net.label}</th>
					</tr>
				</thead>
				<tbody>
					{data.map((p) => (
						<tr key={p.label}>
							<th scope="row">{p.label}</th>
							<td>{formatCurrency(p.credits, currency)}</td>
							<td>{formatCurrency(p.debits, currency)}</td>
							<td>{formatCurrency(p.net, currency)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</SectionPanel>
	);
}
