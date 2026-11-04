"use client";

import type * as React from "react";
import { cn, Progress } from "../../base";
import type { Amount } from "../../lib/money";
import { formatCurrency, surfaces } from "../../lib/shared";
import { MiniSparkline } from "./shared";

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
	cash: Amount | null;
	accounts?: number | null;
	/** Months at the last 3 months' burn; null when it can't be computed. */
	runwayMonths: number | null;
	/** No burn to divide by — earns a full bar. */
	cashPositive?: boolean;
	/** Implied month-end cash, oldest → newest. */
	trail?: { label: string; cash: Amount }[];
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
					<p className="text-xl font-semibold leading-tight tabular-nums break-words text-foreground @sm:text-display">
						{cash == null ? "—" : formatCurrency(cash, currency)}
					</p>
					<span className="text-2xs text-tertiary-foreground">
						{accounts == null ? "Balance unavailable" : `across ${accounts} account${accounts === 1 ? "" : "s"}`}
					</span>
				</div>
				<div className="w-full shrink-0 @md:w-36 @md:text-end">
					<span className="text-2xs text-tertiary-foreground">Runway</span>
					<Progress
						value={pct}
						aria-label="Runway"
						getAriaValueText={() => runway.value}
						className={cn("mt-1.5 mb-1.5", RUNWAY_INDICATOR[runway.tone])}
					/>
					<p
						className={cn(
							"font-semibold leading-tight tabular-nums",
							runwayMonths == null ? "text-sm" : "text-xl",
							runwayMonths == null && !cashPositive ? "text-tertiary-foreground" : "text-foreground",
						)}
					>
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
					<p className="mt-0.5 text-2xs text-tertiary-foreground @md:hidden">
						Implied from today&rsquo;s balance and bank movement
					</p>
				</div>
			)}
		</section>
	);
}
