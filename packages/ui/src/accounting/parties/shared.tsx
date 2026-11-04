"use client";

/**
 * Helpers two or more files in this folder share. Internal to the folder: the
 * barrel re-exports none of it.
 */
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	Button,
	Checkbox,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	StatusChip,
} from "../../base";
import { parseDate } from "../../base/lib/utils";
import { type Amount, fromSen, toSen } from "../../lib/money";
import { formatCurrency, formatCurrencyCompact } from "../../lib/shared";

function initialsOf(name: string | null | undefined): string {
	if (!name) return "?";
	const words = name
		.replace(/\b(sdn|bhd|berhad|plt|enterprise)\b\.?/gi, "")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || name[0].toUpperCase();
}

export function dayMonth(d: string): string {
	return parseDate(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function monthYear(d: string): string {
	return parseDate(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function confidenceLabel(p: number): "High" | "Medium" | "Low" {
	return p >= 80 ? "High" : p >= 50 ? "Medium" : "Low";
}

export function sentenceCase(v: string): string {
	const w = v.replace(/_/g, " ");
	return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Neutral initials tile — neutral instead of hashed vendor colours. */
export function PartyInitials({
	name,
	size = "md",
	className,
}: {
	name: string | null | undefined;
	size?: "sm" | "md";
	className?: string;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-muted text-2xs font-medium text-muted-foreground",
				size === "sm" ? "size-7" : "size-8",
				className,
			)}
		>
			{initialsOf(name)}
		</span>
	);
}

/** cynco ui-v2 FactStrip: inline label/value facts that wrap under a page title. */
export function FactStrip({ facts, className }: { facts: Array<[string, React.ReactNode]>; className?: string }) {
	return (
		<div className={cn("flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm", className)}>
			{facts
				.filter(([, v]) => v != null && v !== "")
				.map(([l, v]) => (
					<span key={l} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
						<span className="text-tertiary-foreground">{l}</span>
						<span className="text-foreground">{v}</span>
					</span>
				))}
		</div>
	);
}

export function RowSelect({ checked, onToggle, label }: { checked: boolean; onToggle?: () => void; label: string }) {
	return <Checkbox checked={checked} onCheckedChange={() => onToggle?.()} aria-label={label} />;
}

export function SelectAll({
	total,
	selected,
	onChange,
	label,
	ref,
	errorId,
}: {
	total: number;
	selected: number;
	onChange: (all: boolean) => void;
	label: string;
	ref?: React.Ref<HTMLButtonElement>;
	/** Id of an inline error about the selection; marks the checkbox invalid. */
	errorId?: string;
}) {
	const all = total > 0 && selected === total;
	return (
		<Checkbox
			ref={ref}
			checked={all}
			indeterminate={selected > 0 && !all}
			onCheckedChange={() => onChange(!all)}
			aria-label={label}
			aria-invalid={errorId ? true : undefined}
			aria-describedby={errorId}
		/>
	);
}

export const CellNull = () => <span className="text-subtle">—</span>;

/** One entry of a row menu. `action` is the id the table hands back; `label` is only the wording. */
export type RowAction<A extends string> = {
	action: A;
	label: string;
	icon: React.ReactNode;
	destructive?: boolean;
};

export function RowActions<A extends string>({
	items,
	label = "Row actions",
	onAction,
}: {
	items: Array<RowAction<A>>;
	label?: string;
	onAction?: (action: A) => void;
}) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				render={<Button variant="skeleton" size="icon" aria-label={label} className="text-tertiary-foreground" />}
			>
				<DotsThreeVerticalIcon size={14} weight="bold" aria-hidden="true" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				{items.map((it, i) => (
					<React.Fragment key={it.action}>
						{it.destructive && i > 0 && <DropdownMenuSeparator />}
						<DropdownMenuItem variant={it.destructive ? "destructive" : undefined} onClick={() => onAction?.(it.action)}>
							{it.icon}
							{it.label}
						</DropdownMenuItem>
					</React.Fragment>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Avatar + name (+ inactive chip) + one-line subtitle — the first cell of party lists. */
export function NameCell({
	name,
	subtitle,
	inactiveLabel,
	inactive,
}: {
	name: string;
	subtitle?: string;
	inactiveLabel: string;
	inactive?: boolean;
}) {
	return (
		// Spans only: this renders inside the row's button in Customer and Vendor lists.
		<span className="flex min-w-0 items-center gap-2.5">
			<PartyInitials name={name} className="hidden @md:inline-flex" />
			<span className="block min-w-0">
				<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
					<span className="min-w-0 break-words font-medium text-foreground @2xl:truncate">{name}</span>
					{inactive && (
						<StatusChip tone="neutral" glyph="minus" className="shrink-0">
							{inactiveLabel}
						</StatusChip>
					)}
				</span>
				{subtitle && <span className="block truncate text-xs font-normal text-tertiary-foreground">{subtitle}</span>}
			</span>
		</span>
	);
}

/** Per-currency totals, compact, at most two (cynco formatCurrencyTotals). */
export function currencyTotals<T extends { currency?: string }>(
	rows: T[],
	amount: (row: T) => Amount,
	compact = true,
): string {
	const by = new Map<string, bigint>();
	for (const r of rows) by.set(r.currency ?? "MYR", (by.get(r.currency ?? "MYR") ?? 0n) + toSen(amount(r)));
	const parts = [...by].map(([c, sen]) =>
		compact ? formatCurrencyCompact(fromSen(sen), c) : formatCurrency(fromSen(sen), c),
	);
	return parts.length > 2 ? `${parts.slice(0, 2).join(" · ")} +${parts.length - 2}` : parts.join(" · ");
}
