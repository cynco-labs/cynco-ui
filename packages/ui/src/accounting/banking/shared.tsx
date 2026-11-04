"use client";

/**
 * Cynco UI — the pieces more than one banking file needs: the prop-merging
 * helper, the two text steps the banking views use, the signed-amount and
 * count formatters, the AI-suggestion chip class and the loading placeholder.
 * Internal to `accounting/banking`; nothing here is re-exported from the barrel.
 */
import type * as React from "react";
import { cn, StatusRing } from "../../base";
import { type Amount, absAmount } from "../../lib/money";
import { formatCurrency } from "../../lib/shared";

/** Own props win over the native ones of the root element. */
export type With<O, E extends keyof React.JSX.IntrinsicElements = "div"> = O & Omit<React.ComponentProps<E>, keyof O>;

/** 13px copy in the two text steps the banking views use (`text-body` would pin muted-foreground). */
export const FG = "text-sm leading-5 text-foreground";
export const MUTED = "text-sm leading-5 text-tertiary-foreground";
export const TINY = "text-2xs leading-4 text-tertiary-foreground";

export function signedByType(amount: Amount, type: "credit" | "debit", currency = "MYR") {
	return `${type === "credit" ? "+" : "−"}${formatCurrency(absAmount(amount), currency)}`;
}

export function countOf(n: number, word: string) {
	return `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
}

export const pctOf = (c: number) => `${Math.round(c * 100)}%`;

/** The dashed primary chip an AI suggestion is drawn as. */
export const SUGGEST =
	"h-6 min-w-0 shrink gap-1 [&>span]:min-w-0 border-dashed border-primary/45 bg-active-primary px-1.5 text-2xs font-normal text-primary hover:border-solid hover:bg-active-primary";

/** Tiny ring in primary, fill ∝ AI confidence (cynco ReviewCard ConfidenceRing). */
export function ConfidenceRing({ value, className, ...props }: With<{ value: number; className?: string }, "span">) {
	return (
		<span className={cn("inline-flex items-center gap-1", className)} title={`${pctOf(value)} confidence`} {...props}>
			<StatusRing tone="purple" fraction={value} className="size-3.5" />
			<span className="text-sm tabular-nums text-primary">{pctOf(value)}</span>
		</span>
	);
}

/** A loading placeholder; `label` is what a screen reader hears in its place. */
export function Shimmer({ className, label = "Loading" }: { className?: string; label?: string }) {
	return (
		<span className={cn("inline-block animate-pulse rounded-md bg-foreground/8", className)}>
			<span className="sr-only">{label}</span>
		</span>
	);
}
