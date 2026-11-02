/**
 * Cynco UI — shared helpers for the accounting/ERP components.
 * Ported conventions from cynco-labs/cynco remix/app/utils/formatting.ts and
 * utils/report-helpers.ts: currency-derived locale (MYR → en-MY, "RM"),
 * bracketed negatives and em-dash zeros in statements, ISO code on foreign lines.
 */
import * as React from "react";
import { StatusChip, cn, type StatusTone, type StatusGlyph } from "../base";
import { parseDate } from "../base/lib/utils";
import { isDecimalString } from "./money";
import { WarningCircleIcon } from "@phosphor-icons/react";

const LOCALE: Record<string, string> = {
	MYR: "en-MY", SGD: "en-SG", USD: "en-US", GBP: "en-GB", AUD: "en-AU", EUR: "en-IE", IDR: "id-ID", THB: "th-TH", PHP: "en-PH", JPY: "ja-JP", CNY: "zh-CN", HKD: "en-HK",
};
const fmtCache = new Map<string, Intl.NumberFormat>();
function fmt(currency: string, opts: Intl.NumberFormatOptions = {}) {
	const key = currency + JSON.stringify(opts);
	let f = fmtCache.get(key);
	if (!f) {
		f = new Intl.NumberFormat(LOCALE[currency] ?? "en-US", { style: "currency", currency, ...opts });
		fmtCache.set(key, f);
	}
	return f;
}

/** "RM 1,234.56" — locale derived from the currency, as cynco's formatCurrency. */
export function formatCurrency(amount: number | string, currency = "MYR"): string {
	// Decimal strings ("1234.565") are formatted exactly — Intl accepts them without a float round-trip.
	if (typeof amount === "string") {
		const s = amount.trim();
		return isDecimalString(s) ? fmt(currency).format(s) : fmt(currency).format(0);
	}
	return fmt(currency).format(Number.isFinite(amount) ? amount : 0);
}
/** Whole-unit currency for KPIs and charts: "RM 184,500". */
export function formatCurrencyWhole(amount: number, currency = "MYR"): string {
	return fmt(currency, { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(amount);
}
/** Compact currency: "RM 184.5K". */
export function formatCurrencyCompact(amount: number, currency = "MYR"): string {
	// minimumFractionDigits is explicit because engines disagree on the default (Node prints "RM 208.0K", Chrome "RM 208K").
	return fmt(currency, { notation: "compact", compactDisplay: "short", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(amount);
}
/** Report figure without a symbol: "1,234.00"; negative bracketed, zero "—". */
export function formatBracketed(amount: number): string {
	if (amount === 0) return "—";
	const s = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(amount));
	return amount < 0 ? `(${s})` : s;
}
/** "29 Oct 2026" */
export function formatDate(d: string | Date): string {
	const date = parseDate(d);
	const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return `${date.getDate()} ${M[date.getMonth()]} ${date.getFullYear()}`;
}

/** A money figure: tabular numerals, right-aligned by its cell. */
export function Money({ amount, currency = "MYR", className, muted }: { amount: number | string; currency?: string; className?: string; muted?: boolean }) {
	return <span className={cn("tabular-nums whitespace-nowrap", muted && "text-tertiary-foreground", className)}>{formatCurrency(amount, currency)}</span>;
}

/**
 * One debit/credit cell (cynco AmountCell). A foreign line shows its ISO code
 * and the base-currency equivalent underneath; zero renders `zero` (blank).
 */
export function AmountCell({ amount, baseAmount, currency = "MYR", baseCurrency = "MYR", zero = null, className }: { amount: number; baseAmount?: number; currency?: string; baseCurrency?: string; zero?: React.ReactNode; className?: string }) {
	if (!amount) return <>{zero}</>;
	if (currency === baseCurrency) return <span className={cn("tabular-nums whitespace-nowrap", className)}>{formatCurrency(amount, currency)}</span>;
	return (
		<span className={cn("inline-flex flex-col items-end leading-tight tabular-nums", className)} title={`${currency} line · ${formatCurrency(baseAmount ?? 0, baseCurrency)} in ${baseCurrency}`}>
			<span className="whitespace-nowrap"><span className="mr-1 text-2xs text-tertiary-foreground">{currency}</span>{formatCurrency(amount, currency)}</span>
			<span className="whitespace-nowrap text-2xs text-tertiary-foreground">≈ {formatCurrency(baseAmount ?? 0, baseCurrency)}</span>
		</span>
	);
}

/**
 * "1,234.00" or "(1,234.00)" as text. Screen readers often skip brackets, so a negative is also spoken
 * as "−1,234.00". Use this wherever a bracketed figure is rendered.
 */
export function BracketedFigure({ value }: { value: number }) {
	if (value >= 0) return <>{formatBracketed(value)}</>;
	return (
		<>
			<span aria-hidden="true">{formatBracketed(value)}</span>
			<span className="sr-only">−{formatBracketed(-value)}</span>
		</>
	);
}

/** A figure in a financial statement (cynco ReportAmount): negatives bracketed (and red unless `red={false}`), zero a muted em dash. */
export function ReportAmount({ amount, red = true, className }: { amount: number; red?: boolean; className?: string }) {
	if (amount === 0)
		return <span className={cn("text-tertiary-foreground tabular-nums", className)}><span aria-hidden="true">—</span><span className="sr-only">0.00</span></span>;
	return (
		<span className={cn("tabular-nums whitespace-nowrap", red && amount < 0 && "text-error-text", className)}>
			<BracketedFigure value={amount} />
		</span>
	);
}

/** An inline field error: a warning glyph plus the words, so it never relies on colour. Point the field at it with `fieldErrorProps`. */
export function FieldError({ className, children, ...props }: React.ComponentProps<"p"> & { id: string }) {
	return (
		<p className={cn("flex items-start gap-1 text-2xs text-error-text", className)} {...props}>
			<WarningCircleIcon size={12} weight="fill" aria-hidden="true" className="mt-px shrink-0" />
			{children}
		</p>
	);
}

/** `aria-invalid` + `aria-describedby` for a field while its error (with id `errorId`) is shown. */
export function fieldErrorProps(errorId: string, shown: boolean) {
	return shown ? { "aria-invalid": true, "aria-describedby": errorId } : {};
}

/** cynco badge variants → StatusChip tone + glyph. */
export type CyncoVariant = "success" | "info" | "warning" | "error" | "neutral";
const VARIANT: Record<CyncoVariant, { tone: StatusTone; glyph: StatusGlyph }> = {
	success: { tone: "green", glyph: "check" },
	info: { tone: "blue", glyph: "clock" },
	warning: { tone: "amber", glyph: "alert" },
	error: { tone: "red", glyph: "x" },
	neutral: { tone: "neutral", glyph: "minus" },
};
export type StatusEntry = { label: string; variant: CyncoVariant; strike?: boolean; glyph?: StatusGlyph };

/** Document status as a StatusChip (label neutral, square carries the state). */
export function DocStatus({ status, config, className }: { status: string; config: Record<string, StatusEntry>; className?: string }) {
	const e = config[status] ?? { label: status, variant: "neutral" as CyncoVariant };
	const v = VARIANT[e.variant];
	return (
		<StatusChip tone={v.tone} glyph={e.glyph ?? v.glyph} dashed={status === "draft"} className={cn(e.strike && "line-through", className)}>
			{e.label}
		</StatusChip>
	);
}

/** cynco INVOICE_STATUS_CONFIG (components/invoice/ui/invoiceTableColumns.tsx). */
export const INVOICE_STATUS: Record<string, StatusEntry> = {
	paid: { label: "Paid", variant: "success" },
	finalized: { label: "Pending", variant: "info" },
	draft: { label: "Draft", variant: "neutral" },
	overdue: { label: "Overdue", variant: "error" },
	partially_paid: { label: "Partially Paid", variant: "info" },
	deposit_paid: { label: "Deposit Paid", variant: "info" },
	deposit_due: { label: "Deposit Due", variant: "warning" },
	voided: { label: "Voided", variant: "neutral", strike: true },
	cancelled: { label: "Cancelled", variant: "neutral" },
	refunded: { label: "Refunded", variant: "neutral" },
};

/** A label/value pair used in detail rails. */
export function DetailRow({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
	return (
		<div className={cn("flex items-baseline justify-between gap-4 py-1.5 text-body", className)}>
			<span className="text-tertiary-foreground">{label}</span>
			<span className="text-foreground text-right">{children}</span>
		</div>
	);
}

/** Section label used above groups in sheets and rails. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cn("text-2xs font-medium uppercase tracking-[0.04em] text-tertiary-foreground", className)}>{children}</div>;
}

export * from "../layout";
export * from "./money";
export * from "../documents/kit";
