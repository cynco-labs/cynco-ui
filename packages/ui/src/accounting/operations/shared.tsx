"use client";

/**
 * Cynco UI — what the operations components agree on: how a figure prints, how an
 * empty state and a totals line look, and the one place an exact amount becomes a
 * float. Internal to this folder; the barrel does not re-export any of it.
 */
import { TrashIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Badge, Button } from "../../base";
import { fixed } from "../../lib/decimal";
import { type Amount, isDecimalString, toSen } from "../../lib/money";
import { formatPlain } from "../../lib/shared";

/** An amount as a caller may hand it over: a decimal string, a number, or nothing at all. */
export type Num = Amount | null | undefined;
/** Native div props minus the ones a component defines itself. */
export type DivProps<P> = P & Omit<React.ComponentProps<"div">, keyof P>;

/** cynco formatAmount: "1,234.00", "—" for a missing or unreadable figure. */
export function amt(v: Num): string {
	if (v === null || v === undefined || v === "") return "—";
	if (typeof v === "number" ? !Number.isFinite(v) : !isDecimalString(v.trim())) return "—";
	return formatPlain(v);
}

/** A quantity or weighted average cost at four decimals, exact: stock is counted finer than the sen. */
export function qty4(v: Num): string {
	const scaled = fixed(v ?? 0); // the value × 10⁶
	const a = scaled < 0n ? -scaled : scaled;
	const q = a / 100n + ((a % 100n) * 2n >= 100n ? 1n : 0n); // → × 10⁴, half away from zero
	return `${scaled < 0n ? "-" : ""}${q / 10_000n}.${String(q % 10_000n).padStart(4, "0")}`;
}

/**
 * `part` as a percentage of `whole`, to two decimals, or null when `whole` is zero. The one place an
 * exact amount becomes a float: a progress bar and a margin label are ratios, not posted figures.
 */
export function percentOf(part: Num, whole: Num): number | null {
	const w = toSen(whole);
	if (w === 0n) return null;
	return Number((toSen(part) * 10_000n) / w) / 100;
}

/** cynco KpiTile accents → status dot colours. */
export const DOT = {
	success: "var(--status-green)",
	error: "var(--status-red)",
	warning: "var(--status-amber)",
	violet: "var(--status-purple)",
} as const;

export function MutedBadge({ children }: { children: React.ReactNode }) {
	return (
		<Badge variant="muted" size="sm" className="shrink-0 text-tertiary-foreground">
			{children}
		</Badge>
	);
}

export function OpsEmpty({
	icon,
	title,
	description,
}: {
	icon?: React.ReactNode;
	title: string;
	description?: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-6 py-8 text-center">
			{icon && <span className="text-subtle">{icon}</span>}
			<div className="text-sm text-foreground">{title}</div>
			{description && <div className="text-sm font-normal text-tertiary-foreground">{description}</div>}
		</div>
	);
}

/** Totals line that sits on the tray under a DataList: label left, figures right, wrapping when narrow. */
export function TrayTotals({
	label,
	items,
}: {
	label: React.ReactNode;
	items: { label?: string; value: React.ReactNode }[];
}) {
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold text-foreground">
			<span>{label}</span>
			<span className="flex flex-wrap items-baseline justify-end gap-x-4 gap-y-0.5">
				{items.map((it, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: tray figures are a fixed positional row with no id
					<span key={`${it.label ?? ""}-${i}`} className="whitespace-nowrap tabular-nums">
						{it.label && <span className="mr-1.5 text-xs font-normal text-tertiary-foreground">{it.label}</span>}
						{it.value}
					</span>
				))}
			</span>
		</div>
	);
}

/** Row-level icon action (delete etc.). */
export function RowIconButton({
	label,
	onClick,
	disabled,
	...props
}: { label: string; onClick?: () => void; disabled?: boolean } & Omit<
	React.ComponentProps<"button">,
	"onClick" | "disabled"
>) {
	return (
		<Button
			variant="skeleton"
			size="icon"
			aria-label={label}
			disabled={disabled}
			focusableWhenDisabled
			onClick={onClick}
			className="text-tertiary-foreground hover:text-error-text"
			{...props}
		>
			<TrashIcon size={14} aria-hidden="true" />
		</Button>
	);
}
