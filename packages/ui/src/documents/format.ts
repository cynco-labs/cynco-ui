import { parseDate } from "../base/lib/utils";
import { fromSen, isDecimalString, parseAmount, sumAmounts, toSen } from "../lib/money";
import { DOC_LABELS, type DocLabelKey, type DocText } from "./labels";

/* Document formatting and draft maths. No React here: server code can call all of it. */

export type DocLocale = "en" | "ms" | "en-ms";

/** Is this string a key of the shared label dictionary? */
export const isDocLabelKey = (k: unknown): k is DocLabelKey => typeof k === "string" && Object.hasOwn(DOC_LABELS, k);

/** Plain-string label (for aria labels and titles). */
export function docLabelText(key: DocLabelKey | DocText, locale: DocLocale = "en") {
	if (typeof key === "object")
		return locale === "ms" ? key.ms : locale === "en-ms" && key.en !== key.ms ? `${key.en} / ${key.ms}` : key.en;
	if (!isDocLabelKey(key)) return String(key);
	const [en, ms] = DOC_LABELS[key];
	return locale === "ms" ? ms : locale === "en-ms" && en !== ms ? `${en} / ${ms}` : en;
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_MS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

/** "2026-10-28" → "28 Oct 2026" (no timezone shift: date-only strings are read as calendar dates). */
export function formatDocDate(value: string | Date | undefined, locale: DocLocale = "en"): string {
	if (!value) return "";
	const dt = parseDate(value);
	if (Number.isNaN(dt.getTime())) return String(value);
	return `${dt.getDate()} ${(locale === "ms" ? MONTHS_MS : MONTHS_EN)[dt.getMonth()]} ${dt.getFullYear()}`;
}

const NUM = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Decimal string → "1,234.50"; negative → "(1,234.50)" when `brackets`. Exact (no float round-trip). */
export function formatDocAmount(
	value: string | number | undefined | null,
	opts: { brackets?: boolean; zero?: string } = {},
): string {
	if (value == null || value === "") return "";
	const s = fromSen(toSen(value));
	if (opts.zero !== undefined && toSen(s) === 0n) return opts.zero;
	const neg = s.startsWith("-");
	const abs = neg ? s.slice(1) : s;
	const out = isDecimalString(abs) ? NUM.format(abs) : abs;
	return neg ? (opts.brackets ? `(${out})` : `-${out}`) : out;
}

/** "RM" for MYR, the ISO code otherwise. */
export const currencySymbol = (currency = "MYR") => (currency === "MYR" ? "RM" : currency);

/* Amount in words — English and Bahasa Melayu, exact to the sen. */
const EN_ONES = [
	"",
	"One",
	"Two",
	"Three",
	"Four",
	"Five",
	"Six",
	"Seven",
	"Eight",
	"Nine",
	"Ten",
	"Eleven",
	"Twelve",
	"Thirteen",
	"Fourteen",
	"Fifteen",
	"Sixteen",
	"Seventeen",
	"Eighteen",
	"Nineteen",
];
const EN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const MS_ONES = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Lapan", "Sembilan"];

function en999(n: number): string {
	const h = Math.floor(n / 100),
		r = n % 100;
	const rest = r < 20 ? EN_ONES[r] : EN_TENS[Math.floor(r / 10)] + (r % 10 ? `-${EN_ONES[r % 10]}` : "");
	return [h ? `${EN_ONES[h]} Hundred` : "", rest].filter(Boolean).join(" ");
}
function ms999(n: number): string {
	const h = Math.floor(n / 100),
		r = n % 100;
	const hs = h === 0 ? "" : h === 1 ? "Seratus" : `${MS_ONES[h]} Ratus`;
	let rs = "";
	if (r === 10) rs = "Sepuluh";
	else if (r === 11) rs = "Sebelas";
	else if (r > 11 && r < 20) rs = `${MS_ONES[r - 10]} Belas`;
	else if (r >= 20) rs = `${MS_ONES[Math.floor(r / 10)]} Puluh${r % 10 ? ` ${MS_ONES[r % 10]}` : ""}`;
	else rs = MS_ONES[r];
	return [hs, rs].filter(Boolean).join(" ");
}
function intWords(n: bigint, lang: "en" | "ms"): string {
	if (n === 0n) return lang === "en" ? "Zero" : "Kosong";
	const scales =
		lang === "en" ? ["", "Thousand", "Million", "Billion", "Trillion"] : ["", "Ribu", "Juta", "Bilion", "Trilion"];
	const parts: string[] = [];
	let i = 0;
	while (n > 0n) {
		const chunk = Number(n % 1000n);
		if (chunk) {
			if (lang === "ms" && i === 1 && chunk === 1) parts.unshift("Seribu");
			else parts.unshift([lang === "en" ? en999(chunk) : ms999(chunk), scales[i]].filter(Boolean).join(" "));
		}
		n /= 1000n;
		i++;
	}
	return parts.join(" ");
}

/** "Ringgit Malaysia One Thousand Two Hundred Thirty-Four and Sen Fifty Only" (or Bahasa Melayu). */
export function amountInWords(amount: string | number, opts: { currency?: string; lang?: "en" | "ms" } = {}): string {
	const lang = opts.lang ?? "en";
	const sen = toSen(amount);
	const abs = sen < 0n ? -sen : sen;
	const whole = abs / 100n,
		cents = Number(abs % 100n);
	const cur =
		(opts.currency ?? "MYR") === "MYR"
			? lang === "en"
				? ["Ringgit Malaysia", "Sen"]
				: ["Ringgit Malaysia", "Sen"]
			: [opts.currency ?? "", lang === "en" ? "Cents" : "Sen"];
	const and = lang === "en" ? "and" : "dan";
	const only = lang === "en" ? "Only" : "Sahaja";
	const minus = sen < 0n ? (lang === "en" ? "Minus " : "Negatif ") : "";
	return `${minus}${cur[0]} ${intWords(whole, lang)}${cents ? ` ${and} ${cur[1]} ${intWords(BigInt(cents), lang)}` : ""} ${only}`;
}

/* ═════════════ Draft maths (unsaved documents only) ═════════════ */

export type DraftLine = { quantity: string | number; unitPrice: string; discount?: string; taxRate?: string | number };

/** For drafts the user is still editing. Posted documents pass their stored totals instead. */
export function draftLineTotals(lines: DraftLine[], opts: { rounding?: "none" | "5sen" } = {}) {
	const exact = (e: string) => {
		const r = parseAmount(e);
		return r.ok && r.value ? r.value : "0.00";
	};
	const rows = lines.map((l) => {
		const gross = exact(`${l.quantity}*${l.unitPrice}`);
		const net = l.discount ? exact(`${gross}-${l.discount}`) : gross;
		const rate = Number(l.taxRate ?? 0) || 0;
		return { net, rate, tax: rate ? exact(`${net}*${rate}/100`) : "0.00" };
	});
	const subtotal = sumAmounts(rows.map((r) => r.net));
	const byRate = new Map<number, string[]>();
	for (const r of rows) if (r.rate) byRate.set(r.rate, [...(byRate.get(r.rate) ?? []), r.tax]);
	const taxes = [...byRate.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([rate, list]) => ({ rate, amount: sumAmounts(list) }));
	const beforeRounding = sumAmounts([subtotal, ...taxes.map((t) => t.amount)]);
	let rounding = "0.00";
	if (opts.rounding === "5sen") {
		const s = toSen(beforeRounding),
			r = ((s % 5n) + 5n) % 5n;
		rounding = fromSen(r >= 3n ? 5n - r : -r);
	}
	return { lineNet: rows.map((r) => r.net), subtotal, taxes, rounding, total: sumAmounts([beforeRounding, rounding]) };
}

/* Statements */

const MONTHS_LONG = {
	en: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	],
	ms: [
		"Januari",
		"Februari",
		"Mac",
		"April",
		"Mei",
		"Jun",
		"Julai",
		"Ogos",
		"September",
		"Oktober",
		"November",
		"Disember",
	],
};

/** "2026-10-31" → "31 October 2026" / "31 Oktober 2026" — the long form statements use. */
export function formatReportDate(iso: string, lang: "en" | "ms" = "en"): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return iso;
	return `${Number(m[3])} ${MONTHS_LONG[lang][Number(m[2]) - 1]} ${m[1]}`;
}

export type StatementTableFormat = "amount" | "percent";

/** A figure as a decimal string; null/undefined prints nothing. Negative → (1,234.00); zero → —. */
export type StatementTableValue = string | null | undefined;

/** Internal: a decimal string equal to zero. */
export const isZero = (v: string) => /^-?\d+(\.\d+)?$/.test(v.trim()) && toSen(v) === 0n;

/** A statement figure as printed: (1,234.00) for negatives, — for zero, "12.4%" / "(3.1%)" for percentages. */
export function formatStatementValue(
	v: StatementTableValue,
	format: StatementTableFormat = "amount",
	zero = "—",
): string {
	if (v == null || v.trim() === "") return "";
	const s = v.trim();
	if (!/^-?\d+(\.\d+)?$/.test(s)) return s;
	if (isZero(s)) return zero;
	if (format === "percent") return s.startsWith("-") ? `(${s.slice(1)}%)` : `${s}%`;
	return formatDocAmount(s, { brackets: true });
}
