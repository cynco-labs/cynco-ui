/**
 * Cynco UI — shared helpers for the accounting/ERP components.
 * Ported conventions from cynco-labs/cynco remix/app/utils/formatting.ts and
 * utils/report-helpers.ts: currency-derived locale (MYR → en-MY, "RM"),
 * bracketed negatives and em-dash zeros in statements, ISO code on foreign lines.
 */
import type * as React from "react";
import { cn, StatusChip, type StatusGlyph, type StatusTone } from "../base";
import { type Amount, fromSen, isDecimalString, toSen } from "./money";

const LOCALE: Record<string, string> = {
	MYR: "en-MY",
	SGD: "en-SG",
	USD: "en-US",
	GBP: "en-GB",
	AUD: "en-AU",
	EUR: "en-IE",
	IDR: "id-ID",
	THB: "th-TH",
	PHP: "en-PH",
	JPY: "ja-JP",
	CNY: "zh-CN",
	HKD: "en-HK",
};
/**
 * ISO 4217 minor units, fixed rather than left to the runtime: newer CLDR data prints IDR with no decimals, which
 * would round a posted "10000.50" to "Rp 10.001". Currencies not listed keep the runtime's default.
 */
const MINOR_UNITS: Record<string, number> = {
	MYR: 2,
	SGD: 2,
	USD: 2,
	GBP: 2,
	AUD: 2,
	EUR: 2,
	IDR: 2,
	THB: 2,
	PHP: 2,
	JPY: 0,
	CNY: 2,
	HKD: 2,
};
const fmtCache = new Map<string, Intl.NumberFormat>();
function fmt(currency: string, opts: Intl.NumberFormatOptions = {}) {
	const key = currency + JSON.stringify(opts);
	let f = fmtCache.get(key);
	if (!f) {
		const digits = MINOR_UNITS[currency];
		const minor = digits === undefined ? {} : { minimumFractionDigits: digits, maximumFractionDigits: digits };
		f = new Intl.NumberFormat(LOCALE[currency] ?? "en-US", { style: "currency", currency, ...minor, ...opts });
		fmtCache.set(key, f);
	}
	return f;
}

/**
 * Applies `f` to an `Amount`. Decimal strings ("1234.565") are handed to Intl as strings and format
 * exactly, with no float round-trip; anything unparseable formats as zero.
 */
function formatAmount(f: Intl.NumberFormat, amount: Amount): string {
	if (typeof amount === "string") {
		const s = amount.trim().replace(/,(?=\d{3}(?:\D|$))/g, "");
		return isDecimalString(s) ? f.format(s) : f.format(0);
	}
	return f.format(Number.isFinite(amount) ? amount : 0);
}

/** "RM 1,234.56" — locale derived from the currency, as cynco's formatCurrency. */
export function formatCurrency(amount: Amount, currency = "MYR"): string {
	return formatAmount(fmt(currency), amount);
}
/** Whole-unit currency for KPIs and charts: "RM 184,500". */
export function formatCurrencyWhole(amount: Amount, currency = "MYR"): string {
	return formatAmount(fmt(currency, { maximumFractionDigits: 0, minimumFractionDigits: 0 }), amount);
}
/** Compact currency: "RM 184.5K". */
export function formatCurrencyCompact(amount: Amount, currency = "MYR"): string {
	// minimumFractionDigits is explicit because engines disagree on the default (Node prints "RM 208.0K", Chrome "RM 208K").
	return formatAmount(
		fmt(currency, { notation: "compact", compactDisplay: "short", minimumFractionDigits: 0, maximumFractionDigits: 1 }),
		amount,
	);
}

const plainFmt = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/**
 * A figure with no currency symbol, exact to the sen: "1,234.50". Negatives keep a minus sign and zero
 * prints "0.00". Statement figures use `formatBracketed`, which brackets negatives and dashes zero.
 */
export function formatPlain(amount: Amount): string {
	return plainFmt.format(fromSen(toSen(amount)));
}
/** Report figure without a symbol: "1,234.00"; negative bracketed, zero "—". Decimal strings format exactly. */
export function formatBracketed(amount: Amount): string {
	const sen = toSen(amount);
	if (sen === 0n) return "—";
	const s = plainFmt.format(fromSen(sen < 0n ? -sen : sen));
	return sen < 0n ? `(${s})` : s;
}
/** A money figure: tabular numerals, right-aligned by its cell. */
export function Money({
	amount,
	currency = "MYR",
	className,
	muted,
	...props
}: Omit<React.ComponentProps<"span">, "children"> & { amount: Amount; currency?: string; muted?: boolean }) {
	return (
		<span className={cn("tabular-nums whitespace-nowrap", muted && "text-tertiary-foreground", className)} {...props}>
			{formatCurrency(amount, currency)}
		</span>
	);
}

/**
 * One debit/credit cell (cynco AmountCell). A foreign line shows its ISO code
 * and the base-currency equivalent underneath; zero renders `zero` (blank).
 */
export function AmountCell({
	amount,
	baseAmount,
	currency = "MYR",
	baseCurrency = "MYR",
	zero = null,
	className,
	...props
}: Omit<React.ComponentProps<"span">, "children"> & {
	amount: Amount;
	baseAmount?: Amount;
	currency?: string;
	baseCurrency?: string;
	zero?: React.ReactNode;
}) {
	if (toSen(amount) === 0n) return <>{zero}</>;
	if (currency === baseCurrency)
		return (
			<span className={cn("tabular-nums whitespace-nowrap", className)} {...props}>
				{formatCurrency(amount, currency)}
			</span>
		);
	return (
		<span
			className={cn("inline-flex flex-col items-end leading-tight tabular-nums", className)}
			title={`${currency} line · ${formatCurrency(baseAmount ?? 0, baseCurrency)} in ${baseCurrency}`}
			{...props}
		>
			<span className="whitespace-nowrap">
				<span className="mr-1 text-2xs text-tertiary-foreground">{currency}</span>
				{formatCurrency(amount, currency)}
			</span>
			<span className="whitespace-nowrap text-2xs text-tertiary-foreground">
				≈ {formatCurrency(baseAmount ?? 0, baseCurrency)}
			</span>
		</span>
	);
}

/**
 * "1,234.00" or "(1,234.00)" as text. Screen readers often skip brackets, so a negative is also spoken
 * as "−1,234.00". Use this wherever a bracketed figure is rendered.
 */
export function BracketedFigure({ value }: { value: Amount }) {
	const sen = toSen(value);
	if (sen >= 0n) return <>{formatBracketed(value)}</>;
	return (
		<>
			<span aria-hidden="true">{formatBracketed(value)}</span>
			<span className="sr-only">−{formatBracketed(fromSen(-sen))}</span>
		</>
	);
}

/** A figure in a financial statement (cynco ReportAmount): negatives bracketed (and red unless `red={false}`), zero a muted em dash. */
export function ReportAmount({
	amount,
	red = true,
	className,
	...props
}: Omit<React.ComponentProps<"span">, "children"> & { amount: Amount; red?: boolean }) {
	const sen = toSen(amount);
	if (sen === 0n)
		return (
			<span className={cn("text-tertiary-foreground tabular-nums", className)} {...props}>
				<span aria-hidden="true">—</span>
				<span className="sr-only">0.00</span>
			</span>
		);
	return (
		<span className={cn("tabular-nums whitespace-nowrap", red && sen < 0n && "text-error-text", className)} {...props}>
			<BracketedFigure value={amount} />
		</span>
	);
}

/** Re-exported so existing imports keep working; the field kit owns them (base/components/ui/field.tsx). */
export { FieldError, fieldErrorProps } from "../base";

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
export function DocStatus({
	status,
	config,
	className,
	...props
}: Omit<React.ComponentProps<typeof StatusChip>, "children" | "tone" | "glyph"> & {
	status: string;
	config: Record<string, StatusEntry>;
}) {
	const e = config[status] ?? { label: status, variant: "neutral" as CyncoVariant };
	const v = VARIANT[e.variant];
	return (
		<StatusChip
			tone={v.tone}
			glyph={e.glyph ?? v.glyph}
			dashed={status === "draft"}
			className={cn(e.strike && "line-through", className)}
			{...props}
		>
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
export function DetailRow({
	label,
	children,
	className,
	...props
}: React.ComponentProps<"div"> & { label: React.ReactNode }) {
	return (
		<div
			className={cn(
				"flex items-baseline justify-between gap-4 py-1.5 text-sm font-medium text-muted-foreground",
				className,
			)}
			{...props}
		>
			<span className="text-tertiary-foreground">{label}</span>
			<span className="text-foreground text-right">{children}</span>
		</div>
	);
}

/** Section label used above groups in sheets and rails. */
export function SectionLabel({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("text-2xs font-medium uppercase tracking-[0.04em] text-tertiary-foreground", className)}
			{...props}
		/>
	);
}

export * from "../documents/kit";
export * from "../layout";
export * from "./money";
export * from "./time";
