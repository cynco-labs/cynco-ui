"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon, TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn, StatusChip, type StatusTone } from "../../base";
import type { Amount } from "../../lib/money";
import { StatGrid, StatTile, ToneDot } from "../../lib/shared";
import { MiniSparkline } from "./shared";

/** Status-token colour classes (the theme has no status utilities; literal strings so Tailwind sees them). */
const STATUS_TEXT: Record<"green" | "red" | "amber", string> = {
	green: "text-status-green-text",
	red: "text-error-text",
	amber: "text-status-amber-text",
};

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
	/** Trend under the figure: a shape, so the points are read as a curve and never as totals. */
	sparkline?: Amount[];
	accent?: KpiAccent;
}

const SUB_ICON: Record<NonNullable<KpiTileData["subTone"]>, React.ReactNode> = {
	up: <TrendUpIcon size={12} weight="bold" aria-hidden="true" className={cn("shrink-0", STATUS_TEXT.green)} />,
	down: <TrendDownIcon size={12} weight="bold" aria-hidden="true" className={cn("shrink-0", STATUS_TEXT.red)} />,
	warn: <ToneDot tone="amber" />,
	muted: null,
};
const BADGE_DOT: Partial<Record<StatusTone, StatusTone>> = {
	green: "green",
	red: "red",
	amber: "amber",
	blue: "blue",
	orange: "orange",
};

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
						{t.sparkline && t.sparkline.length > 1 && (
							<MiniSparkline data={t.sparkline} color={ACCENT_SERIES[t.accent ?? "default"]} className="mt-0.5 h-7" />
						)}
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
