"use client";

/**
 * Cynco UI — furniture the report components share. A figure, an account label,
 * a chart key, a sparkline and a row that is a link only when it leads somewhere.
 * Internal to this folder; the barrel does not re-export any of it.
 */

import type * as React from "react";
import { cn, StatusChip } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { ReportAmount } from "../../lib/shared";

/**
 * `part` ÷ `whole` as a float, to six places. The one place in this file an exact amount becomes a
 * float: an arc length, a bar width and a percentage are shapes and ratios, not posted figures.
 */
export function ratioOf(part: Amount, whole: Amount): number {
	const w = toSen(whole);
	return w === 0n ? 0 : Number((toSen(part) * 1_000_000n) / w) / 1_000_000;
}

/** Report figure, unsigned symbol: "1,234.00", "(1,234.00)", or a muted em dash at zero. */
export function Figure({ value, red = true, className }: { value: Amount; red?: boolean; className?: string }) {
	return <ReportAmount amount={value} red={red} className={className} />;
}

/** Accountant's rules under totals. */
export const DOUBLE_RULE = "border-b-[3px] border-double border-foreground/40 pb-px";

/** The statement's integrity check (cynco CheckBadge) as a StatusChip. */
export function CheckChip({ ok, children }: { ok: boolean; children: React.ReactNode }) {
	return (
		<StatusChip tone={ok ? "green" : "red"} glyph={ok ? "check" : "alert"}>
			{children}
		</StatusChip>
	);
}

/** "1000-001  Cash at bank" — the code in mono, the name wraps beside it. */
export function AccountLabel({ code, label }: { code?: string | null; label: string }) {
	return (
		<span className="[overflow-wrap:anywhere]">
			{code && (
				<>
					<span className="mr-1.5 inline-block font-mono text-2xs font-medium text-tertiary-foreground">{code}</span>{" "}
				</>
			)}
			<span className="text-foreground">{label}</span>
		</span>
	);
}

/** A coloured dot and its name (cynco ChartKey). The dot decorates; the name carries meaning. */
export function ChartKeyDot({ dotClass, children }: { dotClass: string; children: React.ReactNode }) {
	return (
		<span className="flex items-center gap-1 text-2xs text-tertiary-foreground">
			<span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dotClass)} />
			{children}
		</span>
	);
}

/** Inline SVG sparkline (cynco ui-v2/sparkline): line or area, scaled to its box. */
export function MiniSparkline({
	data,
	color = "var(--chart-series-1)",
	type = "area",
	className,
}: {
	data: readonly Amount[];
	color?: string;
	type?: "line" | "area";
	className?: string;
}) {
	const W = 200;
	const H = 40;
	const P = 2;
	if (data.length < 2) return null;
	// A path is a shape, so the points cross to floats here and nowhere else.
	const values = data.map((v) => ratioOf(v, 1));
	const max = Math.max(...values);
	const min = Math.min(...values);
	const range = max - min || 1;
	const step = (W - P * 2) / (values.length - 1);
	const pts = values.map((v, i) => [P + i * step, P + (1 - (v - min) / range) * (H - P * 2)] as const);
	const line = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
	const area = `${line} L ${pts[pts.length - 1]![0]} ${H} L ${pts[0]![0]} ${H} Z`;
	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			preserveAspectRatio="none"
			aria-hidden="true"
			className={cn("block h-8 w-full", className)}
		>
			{type === "area" && <path d={area} fill={color} opacity={0.14} />}
			<path
				d={line}
				fill="none"
				stroke={color}
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
}

const ROW = "flex items-center gap-3";
const ROW_LINK = cn(ROW, "outline-none hover:bg-table-row-hover focus-ring-inset");

/** A real link when there is somewhere to go; plain content otherwise, never an `href="#"` that does nothing. */
export function RowLink({
	href,
	className,
	children,
}: {
	href?: string;
	className?: string;
	children: React.ReactNode;
}) {
	return href ? (
		<a href={href} className={cn(ROW_LINK, className)}>
			{children}
		</a>
	) : (
		<div className={cn(ROW, className)}>{children}</div>
	);
}
