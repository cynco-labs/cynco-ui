"use client";

import { BankIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Button, ChartContainer, ChartTooltip, cn, GroupedTabButton, useControllableState } from "../../base";
import { type Amount, sumAmounts, toSen } from "../../lib/money";
import { formatCurrency, formatCurrencyCompact, negativeClass, SectionPanel } from "../../lib/shared";
import { ChartKeyDot } from "./shared";

/** How many trailing months the money-movement chart shows. */
export type CashFlowRange = "3" | "6";

export interface CashFlowPoint {
	label: string;
	credits: Amount;
	debits: Amount;
	net: Amount;
}

const FLOW = { credits: "var(--chart-series-3)", debits: "var(--chart-series-8)", net: "var(--primary)" };
const FLOW_DOT = { credits: "bg-[var(--chart-series-3)]", debits: "bg-[var(--chart-series-8)]", net: "bg-primary" };

function MoneyTooltip({
	active,
	payload,
	label,
	currency,
}: {
	active?: boolean;
	payload?: { dataKey?: string | number; value?: number }[];
	label?: string;
	currency: string;
}) {
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
					<span className={cn("font-mono tabular-nums text-foreground", negativeClass((p.value ?? 0) < 0))}>
						{formatCurrency(p.value ?? 0, currency)}
					</span>
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
	range: rangeProp,
	defaultRange = "6",
	onRangeChange,
	onConnectBank,
	className,
	...props
}: React.ComponentProps<"section"> & {
	/** Up to 6 months, oldest → newest. */
	points: CashFlowPoint[];
	currency?: string;
	hasActivity?: boolean;
	/** Controlled window: how many trailing months the chart shows. */
	range?: CashFlowRange;
	/** Initial window for uncontrolled use. */
	defaultRange?: CashFlowRange;
	/** Called when the user switches the window. */
	onRangeChange?: (range: CashFlowRange) => void;
	/** Called from the empty state's "Connect bank"; omit to hide the button. */
	onConnectBank?: () => void;
}) {
	const [range = defaultRange, setRange] = useControllableState<CashFlowRange>({
		prop: rangeProp,
		defaultProp: defaultRange,
		onChange: onRangeChange,
	});
	const windowed = React.useMemo(() => points.slice(-Number(range)), [points, range]);
	const net = sumAmounts(windowed.map((p) => p.net));
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
							<span className={cn("text-sm font-semibold tabular-nums text-foreground", negativeClass(toSen(net) < 0n))}>
								{formatCurrency(net, currency)}
							</span>
						</span>
						<GroupedTabButton
							aria-label="Range"
							className="w-auto"
							value={range}
							onValueChange={(v) => setRange(v as CashFlowRange)}
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
						config={{
							credits: { label: "Inflows", color: FLOW.credits },
							debits: { label: "Outflows", color: FLOW.debits },
							net: { label: "Net", color: FLOW.net },
						}}
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
							<YAxis
								tickLine={false}
								axisLine={false}
								width={60}
								tickFormatter={(v: number) => formatCurrencyCompact(v, currency)}
							/>
							<ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<MoneyTooltip currency={currency} />} />
							<Bar isAnimationActive={false} dataKey="credits" fill={FLOW.credits} radius={[3, 3, 0, 0]} maxBarSize={22} />
							<Bar
								isAnimationActive={false}
								dataKey="debits"
								fill={FLOW.debits}
								fillOpacity={0.7}
								radius={[3, 3, 0, 0]}
								maxBarSize={22}
							/>
							<Line
								isAnimationActive={false}
								dataKey="net"
								type="monotone"
								stroke={FLOW.net}
								strokeWidth={2}
								dot={{ r: 2.5, fill: FLOW.net, strokeWidth: 0 }}
							/>
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
