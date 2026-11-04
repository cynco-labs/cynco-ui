"use client";

import type * as React from "react";
import { cn, type StatusTone } from "../base";
import { surfaces } from "./surfaces";

export type StatGridProps = React.ComponentProps<"div"> & {
	/** Smallest tile width before tiles wrap to a new row. */
	min?: "sm" | "md" | "lg";
	/**
	 * `fit` (default): tiles stretch to fill the row, so 3 tiles fill a wide page.
	 * `fill`: keep empty tracks so tiles line up with other grids above/below.
	 */
	mode?: "fit" | "fill";
};
const STAT_MIN = {
	fit: {
		sm: "grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]",
		md: "grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]",
		lg: "grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]",
	},
	fill: {
		sm: "grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]",
		md: "grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]",
		lg: "grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]",
	},
} as const;

/** Tiles that fill the row and wrap — 4-up on a page, 2-up in a sheet, 1-up on a phone. */
export function StatGrid({ min = "md", mode = "fit", className, role, ...props }: StatGridProps) {
	// A labelled grid is announced as a named group of figures.
	const named = props["aria-label"] != null || props["aria-labelledby"] != null;
	return (
		<div
			data-slot="cy-stat-grid"
			role={role ?? (named ? "group" : undefined)}
			className={cn("grid gap-3", STAT_MIN[mode][min], className)}
			{...props}
		/>
	);
}

/** Background class for each status tone (dots, bars, legend keys). */
export const toneBg: Record<StatusTone, string> = {
	green: "bg-status-green",
	blue: "bg-status-blue",
	red: "bg-status-red",
	orange: "bg-status-orange",
	amber: "bg-status-amber",
	yellow: "bg-status-yellow",
	purple: "bg-status-purple",
	pink: "bg-status-pink",
	fuchsia: "bg-status-fuchsia",
	neutral: "bg-status-neutral",
};

export type ToneDotProps = Omit<React.ComponentProps<"span">, "children"> & {
	tone: StatusTone;
	/** Square corners (StatusChip style) instead of a round dot. */
	square?: boolean;
};

/** A 6px status dot in a status tone. Decorative: put the meaning in nearby text or a title. */
export function ToneDot({ tone, square, className, ...props }: ToneDotProps) {
	return (
		<span
			aria-hidden="true"
			data-slot="cy-tone-dot"
			className={cn("inline-block size-1.5 shrink-0", square ? "rounded-[2px]" : "rounded-full", toneBg[tone], className)}
			{...props}
		/>
	);
}

export type StatTileProps = Omit<React.ComponentProps<"div">, "title"> & {
	label: React.ReactNode;
	value: React.ReactNode;
	/** Small suffix after the value, e.g. "MYR" or "days". */
	unit?: React.ReactNode;
	/** Small line under the value. */
	sub?: React.ReactNode;
	/** Chip or delta at the top right. */
	badge?: React.ReactNode;
	/** Leading status dot, by status tone. */
	tone?: StatusTone;
	/** Leading status dot as any CSS colour or var() (prefer `tone`). */
	dot?: string;
	/** Paint the value as negative/error text. */
	negative?: boolean;
};

/** One KPI. The value wraps only between words (e.g. after "RM"), never mid-number, and never truncates. */
export function StatTile({
	label,
	value,
	unit,
	sub,
	badge,
	tone,
	dot,
	negative,
	className,
	children,
	...props
}: StatTileProps) {
	return (
		<div
			data-slot="cy-stat"
			className={cn("@container flex min-w-0 flex-col gap-1.5 p-3.5", surfaces.card, className)}
			{...props}
		>
			<div className="flex items-start justify-between gap-2">
				<span className="flex min-w-0 items-center gap-1.5 text-xs text-tertiary-foreground">
					{tone && <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", toneBg[tone])} />}
					{!tone && dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: dot }} />}
					<span className="min-w-0">{label}</span>
				</span>
				{badge && <span className="shrink-0">{badge}</span>}
			</div>
			<div
				className={cn(
					"text-lg font-semibold leading-tight tabular-nums text-foreground @[13rem]:text-xl",
					negative && surfaces.negative,
				)}
			>
				{value}
				{unit && <span className="ml-1 text-xs font-normal text-tertiary-foreground">{unit}</span>}
			</div>
			{sub && <div className="text-xs text-tertiary-foreground">{sub}</div>}
			{children}
		</div>
	);
}
