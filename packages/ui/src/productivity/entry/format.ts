/** Cynco UI — how the entry components print and compare money on screen. */
import { formatCurrency, isDecimalString, toSen } from "../../lib/shared";

const plainFmt = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "1234.5" → "1,234.50" exactly (Intl formats the decimal string without a float round-trip). "" → "". */
export function formatPlain(v: string) {
	if (!isDecimalString(v)) return v;
	return plainFmt.format(v);
}
/** Accounting display: negatives bracketed, "(500.00)". */
export function formatAccounting(v: string) {
	return v.startsWith("-") ? `(${formatPlain(v.slice(1))})` : formatPlain(v);
}
/** The currency's symbol as Cynco prints it: MYR → "RM", USD → "$". */
export function currencySymbol(currency: string) {
	return formatCurrency("0", currency).replace(/[\d.,\s -]/g, "") || currency;
}
export const sameAmount = (a: string, b: string) => (a === "" || b === "" ? a === b : toSen(a) === toSen(b));
export const money = (v: string, currency?: string) =>
	currency ? formatCurrency(v || "0", currency) : formatPlain(v || "0.00");
