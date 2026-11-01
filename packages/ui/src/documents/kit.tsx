/**
 * Cynco UI — document kit.
 *
 * Composable parts for every printed business document (invoices, receipts, quotations, notes, orders,
 * statements, payslips, reports). A document is a thin assembly of these parts; the parts own layout,
 * typography, brand personalisation, language and print behaviour, so every document stays consistent
 * and a brand change is one prop.
 *
 *   <DocumentBrandProvider brand={brand}>          ← company, logo, layout, font, language
 *     <DocumentPage size="a4" stamp="paid">        ← paper, screen scaling, print CSS, page numbers
 *       <Letterhead title="taxInvoice" number="INV-2026-0142" />
 *       <DocumentMeta items={[…]} />
 *       <PartyGrid parties={[…]} />
 *       <DocumentTable columns={…} rows={…} />
 *       <TotalsBlock rows={…} words />
 *       <PaymentBlock … /> <EInvoiceBlock … />
 *       <SignatureBlock … />
 *       <DocumentFooter />
 *     </DocumentPage>
 *   </DocumentBrandProvider>
 *
 * Rules the parts follow:
 * - Black ink on white paper, nothing else. No colour, no tinted panels, no filled bars: hierarchy comes from
 *   type size, weight, spacing and hairline rules. The only colour on a document is the customer's own logo.
 * - Figures arrive as decimal strings and are printed as given — documents never recalculate posted
 *   totals. `draftLineTotals` exists for unsaved drafts only.
 * - Text labels come from a dictionary (English, Bahasa Melayu, or bilingual) and can be overridden.
 */
import * as React from "react";
import { cn } from "../base";
import { toSen, fromSen, parseAmount, sumAmounts } from "../lib/money";
import { DOC_LABELS, type DocLabelKey, type DocText } from "./labels";

export { DOC_LABELS, type DocLabelKey, type DocText };

/* ═════════════ Brand ═════════════ */

export type DocLayout = "modern" | "classic" | "minimal";
export type DocFont = "inter" | "geist" | "serif";
export type DocLocale = "en" | "ms" | "en-ms";
export type PaperSize = "a4" | "a4-landscape" | "a5" | "letter" | "receipt";

export type DocParty = {
	name: string;
	/** SSM registration number, e.g. "201901023456 (1334567-K)". */
	registrationNo?: string;
	/** LHDN tax identification number. */
	tin?: string;
	/** SST registration number. */
	sstNo?: string;
	address?: string | string[];
	phone?: string;
	email?: string;
	website?: string;
	/** "Attn: …" line for a recipient. */
	attention?: string;
};

export type DocSignatory = { label?: React.ReactNode; name?: string; title?: string; image?: string; date?: string };

export type DocBrand = {
	company: DocParty;
	/** Image URL, or any element (an SVG mark). Omit for a monogram made from the company name. */
	logo?: string | React.ReactNode;
	layout?: DocLayout;
	font?: DocFont;
	locale?: DocLocale;
	/** Override any label: `{ taxInvoice: "Invoice" }`. */
	labels?: Partial<Record<DocLabelKey, string>>;
	/** Default signatory on documents that carry a signature. */
	signature?: DocSignatory;
	/** A line printed in every footer (e.g. "Thank you for your business."). */
	footerNote?: React.ReactNode;
};

const DEFAULT_BRAND: Required<Pick<DocBrand, "layout" | "locale">> = { layout: "minimal", locale: "en" };

const BrandContext = React.createContext<DocBrand | null>(null);

/** Brand for every document inside: company details, logo, layout, font and language. */
export function DocumentBrandProvider({ brand, children }: { brand: DocBrand; children: React.ReactNode }) {
	return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

/** The nearest brand (with defaults filled in). */
export function useDocumentBrand() {
	const b = React.useContext(BrandContext);
	return React.useMemo(() => {
		const layout = b?.layout ?? DEFAULT_BRAND.layout;
		// Classic reads best with a serif display face; the others with the UI face.
		const font: DocFont = b?.font ?? (layout === "classic" ? "serif" : "inter");
		return { ...DEFAULT_BRAND, ...b, layout, font, company: b?.company ?? { name: "Your company" } };
	}, [b]);
}

/* ═════════════ Labels (EN / BM / bilingual) ═════════════ */



/** Is this string a key of the shared label dictionary? */
export const isDocLabelKey = (k: unknown): k is DocLabelKey => typeof k === "string" && Object.prototype.hasOwnProperty.call(DOC_LABELS, k);

function renderPair(pair: readonly [string, string], locale: DocLocale, stacked?: boolean): React.ReactNode {
	if (locale === "en") return pair[0];
	if (locale === "ms") return pair[1];
	if (pair[0] === pair[1]) return pair[0];
	return stacked ? (
		<>
			<span className="block">{pair[0]}</span>
			<span className="block text-[0.82em] font-normal italic opacity-70">{pair[1]}</span>
		</>
	) : (
		<>
			{pair[0]}
			<span className="font-normal opacity-60"> / {pair[1]}</span>
		</>
	);
}

/**
 * `t("billTo")` → "Bill to" | "Bil kepada" | bilingual ("Bill to / Bil kepada", or stacked with `{ stacked: true }`).
 * Also takes `{ en, ms }` text from data. Unknown strings pass through, so `t("Custom heading")` works.
 * `brand.labels` overrides win.
 */
export function useDocLabel() {
	const { locale, labels } = useDocumentBrand();
	return React.useCallback(
		(key: DocLabelKey | DocText | (string & {}), opts: { stacked?: boolean } = {}): React.ReactNode => {
			if (typeof key === "object" && key) return renderPair([key.en, key.ms], locale, opts.stacked);
			const override = (labels as Record<string, string | undefined> | undefined)?.[key as string];
			if (override) return override;
			if (!isDocLabelKey(key)) return key as string;
			return renderPair(DOC_LABELS[key], locale, opts.stacked);
		},
		[locale, labels],
	);
}

/** Render a label prop that may be a key, `{ en, ms }` text, or any node. */
export function useDocLabelNode() {
	const t = useDocLabel();
	return React.useCallback(
		(v: React.ReactNode | DocText, opts?: { stacked?: boolean }): React.ReactNode =>
			typeof v === "string" || (v != null && typeof v === "object" && "en" in (v as object) && "ms" in (v as object) && !React.isValidElement(v)) ? t(v as DocText, opts) : (v as React.ReactNode),
		[t],
	);
}

/** Plain-string label (for aria labels and titles). */
export function docLabelText(key: DocLabelKey | DocText, locale: DocLocale = "en") {
	if (typeof key === "object") return locale === "ms" ? key.ms : locale === "en-ms" && key.en !== key.ms ? `${key.en} / ${key.ms}` : key.en;
	if (!isDocLabelKey(key)) return String(key);
	const [en, ms] = DOC_LABELS[key];
	return locale === "ms" ? ms : locale === "en-ms" && en !== ms ? `${en} / ${ms}` : en;
}

/* ═════════════ Formatting ═════════════ */

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_MS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

/** "2026-10-28" → "28 Oct 2026" (no timezone shift: date-only strings are read as calendar dates). */
export function formatDocDate(value: string | Date | undefined, locale: DocLocale = "en"): string {
	if (!value) return "";
	let y: number, m: number, d: number;
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) [y, m, d] = value.split("-").map(Number) as [number, number, number];
	else {
		const dt = typeof value === "string" ? new Date(value) : value;
		if (Number.isNaN(dt.getTime())) return String(value);
		[y, m, d] = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()];
	}
	return `${d} ${(locale === "ms" ? MONTHS_MS : MONTHS_EN)[m - 1]} ${y}`;
}

const NUM = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Decimal string → "1,234.50"; negative → "(1,234.50)" when `brackets`. Exact (no float round-trip). */
export function formatDocAmount(value: string | number | undefined | null, opts: { brackets?: boolean; zero?: string } = {}): string {
	if (value == null || value === "") return "";
	const s = fromSen(toSen(value));
	if (opts.zero !== undefined && toSen(s) === 0n) return opts.zero;
	const neg = s.startsWith("-");
	const out = NUM.format((neg ? s.slice(1) : s) as unknown as number);
	return neg ? (opts.brackets ? `(${out})` : `-${out}`) : out;
}

/** "RM" for MYR, the ISO code otherwise. */
export const currencySymbol = (currency = "MYR") => (currency === "MYR" ? "RM" : currency);

/* Amount in words — English and Bahasa Melayu, exact to the sen. */
const EN_ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const EN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const MS_ONES = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Lapan", "Sembilan"];

function en999(n: number): string {
	const h = Math.floor(n / 100), r = n % 100;
	const rest = r < 20 ? EN_ONES[r] : EN_TENS[Math.floor(r / 10)] + (r % 10 ? "-" + EN_ONES[r % 10] : "");
	return [h ? EN_ONES[h] + " Hundred" : "", rest].filter(Boolean).join(" ");
}
function ms999(n: number): string {
	const h = Math.floor(n / 100), r = n % 100;
	const hs = h === 0 ? "" : h === 1 ? "Seratus" : MS_ONES[h] + " Ratus";
	let rs = "";
	if (r === 10) rs = "Sepuluh";
	else if (r === 11) rs = "Sebelas";
	else if (r > 11 && r < 20) rs = MS_ONES[r - 10] + " Belas";
	else if (r >= 20) rs = MS_ONES[Math.floor(r / 10)] + " Puluh" + (r % 10 ? " " + MS_ONES[r % 10] : "");
	else rs = MS_ONES[r];
	return [hs, rs].filter(Boolean).join(" ");
}
function intWords(n: bigint, lang: "en" | "ms"): string {
	if (n === 0n) return lang === "en" ? "Zero" : "Kosong";
	const scales = lang === "en" ? ["", "Thousand", "Million", "Billion", "Trillion"] : ["", "Ribu", "Juta", "Bilion", "Trilion"];
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
	const whole = abs / 100n, cents = Number(abs % 100n);
	const cur = (opts.currency ?? "MYR") === "MYR" ? (lang === "en" ? ["Ringgit Malaysia", "Sen"] : ["Ringgit Malaysia", "Sen"]) : [opts.currency ?? "", lang === "en" ? "Cents" : "Sen"];
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
	const taxes = [...byRate.entries()].sort((a, b) => a[0] - b[0]).map(([rate, list]) => ({ rate, amount: sumAmounts(list) }));
	const beforeRounding = sumAmounts([subtotal, ...taxes.map((t) => t.amount)]);
	let rounding = "0.00";
	if (opts.rounding === "5sen") {
		const s = toSen(beforeRounding), r = ((s % 5n) + 5n) % 5n;
		rounding = fromSen(r >= 3n ? 5n - r : -r);
	}
	return { lineNet: rows.map((r) => r.net), subtotal, taxes, rounding, total: sumAmounts([beforeRounding, rounding]) };
}

/* ═════════════ Page ═════════════ */

const PAPER: Record<PaperSize, { w: string; h: string; px: number; pad: string; page: string }> = {
	a4: { w: "210mm", h: "297mm", px: (210 * 96) / 25.4, pad: "16mm", page: "cy-a4" },
	"a4-landscape": { w: "297mm", h: "210mm", px: (297 * 96) / 25.4, pad: "14mm", page: "cy-a4l" },
	letter: { w: "8.5in", h: "11in", px: 8.5 * 96, pad: "0.6in", page: "cy-letter" },
	a5: { w: "148mm", h: "210mm", px: (148 * 96) / 25.4, pad: "11mm", page: "cy-a5" },
	receipt: { w: "80mm", h: "auto", px: (80 * 96) / 25.4, pad: "5mm", page: "cy-receipt" },
};

const FONTS: Record<DocFont, { body: string; display: string }> = {
	inter: { body: "'Inter', ui-sans-serif, system-ui, sans-serif", display: "'Inter', ui-sans-serif, system-ui, sans-serif" },
	geist: { body: "'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif", display: "'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif" },
	serif: { body: "'Inter', ui-sans-serif, system-ui, sans-serif", display: "'Newsreader', 'Iowan Old Style', Georgia, serif" },
};

const DOC_CSS = `
[data-cy-doc]{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"cv11" 1,"ss03" 1;}
[data-cy-doc] .cy-doc-num{font-variant-numeric:tabular-nums lining-nums;}
@page cy-a4{size:A4;margin:14mm 16mm 16mm;@bottom-right{content:counter(page) " / " counter(pages);font:500 8pt Inter,sans-serif;color:#8a8f98}}
@page cy-a4l{size:A4 landscape;margin:12mm 14mm 14mm;@bottom-right{content:counter(page) " / " counter(pages);font:500 8pt Inter,sans-serif;color:#8a8f98}}
@page cy-letter{size:letter;margin:0.55in 0.6in 0.6in;@bottom-right{content:counter(page) " / " counter(pages);font:500 8pt Inter,sans-serif;color:#8a8f98}}
@page cy-a5{size:A5;margin:10mm 11mm 12mm;@bottom-right{content:counter(page) " / " counter(pages);font:500 7pt Inter,sans-serif;color:#8a8f98}}
@page cy-receipt{size:80mm auto;margin:4mm}
@media print{
  html,body{background:#fff!important;color-scheme:light}
  body:has([data-cy-doc-isolate]) *{visibility:hidden}
  body:has([data-cy-doc-isolate]) [data-cy-doc-isolate],body:has([data-cy-doc-isolate]) [data-cy-doc-isolate] *{visibility:visible}
  body:has([data-cy-doc-isolate]) [data-cy-doc-isolate]{position:absolute;left:0;top:0}
  [data-cy-doc]{zoom:1!important;width:auto!important;min-height:0!important;padding:0!important;box-shadow:none!important;border-radius:0!important;outline:none!important}
  [data-cy-doc] .cy-doc-break-avoid{break-inside:avoid}
  [data-cy-doc] thead{display:table-header-group}
}`;

function DocStyles() {
	return <style data-cy-doc-css="">{DOC_CSS}</style>;
}

const PRINT_PAGE: Record<PaperSize, string> = {
	a4: "size:A4;margin:14mm 16mm 16mm",
	"a4-landscape": "size:A4 landscape;margin:12mm 14mm 14mm",
	letter: "size:letter;margin:0.55in 0.6in 0.6in",
	a5: "size:A5;margin:10mm 11mm 12mm",
	receipt: "size:80mm auto;margin:4mm",
};

/**
 * The print's default page (size, margins, page numbers) comes from the document: browsers size the paper
 * from the default @page, and named pages don't reach an isolated (absolutely positioned) sheet. Print one
 * document at a time; the isolated sheet is also pinned to the page width.
 */
function PrintPage({ size, isolate }: { size: PaperSize; isolate: boolean }) {
	const numbers = size === "receipt" ? "" : `@bottom-right{content:counter(page) " / " counter(pages);font:500 ${size === "a5" ? 7 : 8}pt Inter,sans-serif;color:#8a8f98}`;
	return <style data-cy-doc-page="">{`@page{${PRINT_PAGE[size]};${numbers}}${isolate ? "@media print{body:has([data-cy-doc-isolate]) [data-cy-doc-isolate]{right:0}}" : ""}`}</style>;
}

export type DocumentStamp = "paid" | "void" | "draft" | "copy" | "overdue";

export type DocumentPageProps = Omit<React.ComponentProps<"article">, "title"> & {
	/** Overrides the provider's brand (merged over it). */
	brand?: Partial<DocBrand>;
	size?: PaperSize;
	/** A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue. */
	stamp?: DocumentStamp;
	/** On screen: scale the sheet down to fit its container (default) or keep 100% and scroll. */
	fit?: "width" | "none";
	/** When printing, hide the rest of the app and print only this page. Default true. */
	isolate?: boolean;
};

const PageContext = React.createContext<{ size: PaperSize }>({ size: "a4" });
const usePage = () => React.useContext(PageContext);

/**
 * One sheet of paper. On screen: a white sheet scaled to its container. In print: the page itself,
 * with paper size, margins and page numbers ("2 / 3") from a named @page rule.
 */
export function DocumentPage({ brand: brandOverride, size = "a4", stamp, fit = "width", isolate = true, className, style, children, ...props }: DocumentPageProps) {
	const ctx = useDocumentBrand();
	const brand = React.useMemo(() => {
		const merged = { ...ctx, ...brandOverride, company: brandOverride?.company ?? ctx.company };
		if (brandOverride?.layout && !brandOverride.font) merged.font = brandOverride.layout === "classic" ? "serif" : ctx.font === "serif" ? "inter" : ctx.font;
		return merged;
	}, [ctx, brandOverride]);
	const paper = PAPER[size];
	const font = FONTS[brand.font ?? "inter"];
	const wrap = React.useRef<HTMLDivElement>(null);
	const [zoom, setZoom] = React.useState(1);

	React.useLayoutEffect(() => {
		const el = wrap.current;
		if (!el || fit !== "width" || typeof ResizeObserver === "undefined") return;
		const measure = () => {
			const z = Math.min(1, el.clientWidth / paper.px);
			setZoom((p) => (Math.abs(p - z) < 0.002 ? p : Math.floor(z * 1000) / 1000));
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [fit, paper.px]);

	const vars = {
		// Monochrome by design. The accent variables remain as aliases of ink so any part keeps working.
		"--doc-accent": "#16181d",
		"--doc-accent-text": "#16181d",
		"--doc-on-accent": "#ffffff",
		"--doc-tint": "#f6f6f7",
		"--doc-tint-strong": "#ededef",
		"--doc-ink": "#16181d",
		"--doc-muted": "#596070",
		"--doc-subtle": "#8a909c",
		"--doc-rule": "#e7e8ec",
		"--doc-rule-strong": "#16181d",
		"--doc-font": font.body,
		"--doc-display": font.display,
		"--doc-zoom": fit === "width" ? zoom : 1,
		page: paper.page,
		...style,
	} as React.CSSProperties;

	return (
		<BrandContext.Provider value={brand}>
			<PageContext.Provider value={{ size }}>
				<div ref={wrap} data-slot="cy-document" className={cn("w-full min-w-0 print:overflow-visible", fit === "width" ? "overflow-hidden" : "overflow-x-auto")}>
					<DocStyles />
					<PrintPage size={size} isolate={isolate} />
					<article
						data-cy-doc={brand.layout}
						data-cy-doc-isolate={isolate ? "" : undefined}
						data-theme="light"
						lang={brand.locale === "ms" ? "ms" : "en"}
						style={{ ...vars, width: paper.w, minHeight: paper.h === "auto" ? undefined : paper.h, padding: paper.pad }}
						className={cn(
							"relative isolate flex flex-col overflow-hidden bg-white text-[var(--doc-ink)] antialiased [font-family:var(--doc-font)] [zoom:var(--doc-zoom)]",
							"rounded-[2px] shadow-[0_1px_2px_rgba(16,24,40,.06),0_8px_24px_-6px_rgba(16,24,40,.12)] outline outline-1 outline-black/[.06]",
							size === "receipt" ? "text-[8.5pt] leading-snug" : size === "a5" ? "text-[8pt] leading-normal" : "text-[8.75pt] leading-normal",
							className,
						)}
						{...props}
					>
						{stamp && <Stamp kind={stamp} />}
						<div className="relative z-[1] flex min-h-full flex-1 flex-col">{children}</div>
					</article>
				</div>
			</PageContext.Provider>
		</BrandContext.Provider>
	);
}

function Stamp({ kind }: { kind: DocumentStamp }) {
	const t = useDocLabel();
	const tone = "#5a5f6a";
	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
			<div
				className="-rotate-[18deg] rounded-[6px] border-[3px] px-[0.5em] py-[0.05em] text-[64pt] leading-none font-semibold tracking-[0.14em] uppercase opacity-[0.09] [font-family:var(--doc-display)]"
				style={{ color: tone, borderColor: tone }}
			>
				{t(kind)}
			</div>
		</div>
	);
}

/* ═════════════ Letterhead ═════════════ */

function Monogram({ name }: { name: string }) {
	const { layout } = useDocumentBrand();
	const initials = name.replace(/\b(sdn|bhd|berhad|enterprise|plt|trading|the)\b/gi, "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "·";
	if (layout === "classic")
		return (
			<div className="flex size-[12mm] shrink-0 items-center justify-center rounded-full border border-[var(--doc-ink)] text-[13pt] font-normal tracking-[0.04em] text-[var(--doc-ink)] [font-family:var(--doc-display)]">
				{initials}
			</div>
		);
	if (layout === "minimal")
		return (
			<div className="flex size-[11mm] shrink-0 items-end justify-start text-[17pt] leading-none font-semibold tracking-[-0.04em] text-[var(--doc-ink)] [font-family:var(--doc-display)]">
				{initials}
				<span className="text-[var(--doc-subtle)]">.</span>
			</div>
		);
	return (
		<div className="flex size-[12mm] shrink-0 items-center justify-center border-[1.5px] border-[var(--doc-ink)] text-[12pt] font-semibold tracking-[-0.02em] text-[var(--doc-ink)] [font-family:var(--doc-display)]">
			{initials}
		</div>
	);
}

/** The brand's logo: image URL, custom element, or a monogram. */
export function DocumentLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
	const { logo, company } = useDocumentBrand();
	const h = size === "sm" ? "max-h-[9mm]" : size === "lg" ? "max-h-[18mm]" : "max-h-[13mm]";
	if (!logo) return <Monogram name={company.name} />;
	if (typeof logo === "string") return <img src={logo} alt={company.name} className={cn("w-auto max-w-[45mm] object-contain", h, className)} />;
	return <div className={cn("shrink-0", className)}>{logo}</div>;
}

const addressLines = (a?: string | string[]) => (a == null ? [] : Array.isArray(a) ? a : a.split("\n"));

function CompanyIds({ party, className }: { party: DocParty; className?: string }) {
	const t = useDocLabel();
	const ids = [party.registrationNo && [t("registrationNo"), party.registrationNo], party.sstNo && [t("sstNo"), party.sstNo], party.tin && [t("tin"), party.tin]].filter(Boolean) as [React.ReactNode, string][];
	if (!ids.length) return null;
	return (
		<div className={cn("flex flex-wrap gap-x-3 gap-y-0.5", className)}>
			{ids.map(([k, v], i) => (
				<span key={i}>
					<span className="text-[var(--doc-subtle)]">{k}</span> <span className="whitespace-nowrap">{v}</span>
				</span>
			))}
		</div>
	);
}

export type LetterheadProps = Omit<React.ComponentProps<"header">, "title"> & {
	/** A label key ("taxInvoice") or any text. */
	title: DocLabelKey | (string & {}) | React.ReactNode;
	number?: React.ReactNode;
	/** Small line under the number, e.g. "Original" or "Revision 2". */
	subtitle?: React.ReactNode;
	/** Hide the company block (e.g. when a document repeats the letterhead elsewhere). */
	hideCompany?: boolean;
};

/** Company identity and the document's title + number, styled by the brand's layout. */
export function Letterhead({ title, number, subtitle, hideCompany, className, ...props }: LetterheadProps) {
	const { company, layout } = useDocumentBrand();
	const { size } = usePage();
	const t = useDocLabel();
	const titleNode = typeof title === "string" ? t(title, { stacked: true }) : title;
	const lines = addressLines(company.address);
	const contact = [company.phone, company.email, company.website].filter(Boolean).join("  ·  ");

	if (size === "receipt") {
		return (
			<header data-slot="cy-letterhead" className={cn("flex flex-col items-center gap-1 border-b border-dashed border-[var(--doc-rule-strong)]/40 pb-3 text-center", className)} {...props}>
				<DocumentLogo size="sm" />
				<div className="mt-1 text-[10pt] font-semibold">{company.name}</div>
				<CompanyIds party={company} className="justify-center text-[7pt] text-[var(--doc-muted)]" />
				{lines.length > 0 && <div className="text-[7pt] leading-snug text-[var(--doc-muted)]">{lines.join(", ")}</div>}
				<div className="mt-2 text-[9pt] font-semibold tracking-[0.12em] uppercase">{titleNode}</div>
				{number && <div className="font-medium tracking-[0.02em]">{number}</div>}
			</header>
		);
	}

	const companyBlock = !hideCompany && (
		<div className={cn("flex min-w-0", layout === "classic" ? "flex-col items-center gap-2.5 text-center" : "items-start gap-4")}>
			<DocumentLogo />
			<div className="min-w-0">
				<div className={cn("leading-tight font-semibold tracking-[-0.01em]", layout === "classic" ? "text-[15pt] [font-family:var(--doc-display)]" : "text-[11.5pt]")}>{company.name}</div>
				<CompanyIds party={company} className={cn("mt-1 text-[7.5pt] text-[var(--doc-muted)]", layout === "classic" && "justify-center")} />
				{(lines.length > 0 || contact) && (
					<address className="mt-1.5 text-[7.5pt] leading-[1.5] text-[var(--doc-muted)] not-italic">
						{lines.length > 0 && <div>{lines.join(", ")}</div>}
						{contact && <div>{contact}</div>}
					</address>
				)}
			</div>
		</div>
	);

	if (layout === "classic") {
		return (
			<header data-slot="cy-letterhead" className={cn("flex flex-col items-center gap-3.5", className)} {...props}>
				{companyBlock}
				<div className="flex w-full items-center gap-4">
					<div className="h-px flex-1 bg-[var(--doc-rule-strong)]" />
					<div className="text-center">
						<h1 className="text-[16pt] leading-none font-medium tracking-[0.02em] [font-family:var(--doc-display)]">{titleNode}</h1>
					</div>
					<div className="h-px flex-1 bg-[var(--doc-rule-strong)]" />
				</div>
				{(number || subtitle) && (
					<div className="-mt-1.5 text-center">
						{number && <div className="text-[9.5pt] font-medium tracking-[0.06em] text-[var(--doc-muted)]">{number}</div>}
						{subtitle && <div className="text-[7.5pt] text-[var(--doc-subtle)]">{subtitle}</div>}
					</div>
				)}
			</header>
		);
	}

	if (layout === "minimal") {
		return (
			<header data-slot="cy-letterhead" className={cn("flex items-start justify-between gap-10", className)} {...props}>
				{companyBlock}
				<div className="shrink-0 text-right">
					<h1 className="text-[8pt] font-semibold tracking-[0.18em] text-[var(--doc-muted)] uppercase">{titleNode}</h1>
					{number && <div className="mt-1.5 text-[16pt] leading-none font-medium tracking-[-0.02em] text-[var(--doc-ink)] [font-family:var(--doc-display)]">{number}</div>}
					{subtitle && <div className="mt-1 text-[7.5pt] text-[var(--doc-subtle)]">{subtitle}</div>}
				</div>
			</header>
		);
	}

	// modern
	return (
		<header data-slot="cy-letterhead" className={cn("flex items-start justify-between gap-10 pt-[2mm]", className)} {...props}>
			{companyBlock}
			<div className="shrink-0 text-right">
				<h1 className="text-[22pt] leading-[0.95] font-semibold tracking-[-0.025em] [font-family:var(--doc-display)]">{titleNode}</h1>
				{number && <div className="mt-2 text-[10pt] font-medium tracking-[0.02em] text-[var(--doc-muted)]">{number}</div>}
				{subtitle && <div className="mt-0.5 text-[7.5pt] text-[var(--doc-subtle)]">{subtitle}</div>}
			</div>
		</header>
	);
}

/* ═════════════ Small building blocks ═════════════ */

/** Uppercase micro-label used above every block. */
export function DocLabel({ children, className }: { children: React.ReactNode; className?: string }) {
	const { layout } = useDocumentBrand();
	return (
		<div className={cn("text-[6.75pt] leading-tight font-semibold tracking-[0.12em] uppercase", "text-[var(--doc-subtle)]", className)}>
			{children}
		</div>
	);
}

/** A titled block with consistent spacing. */
export function DocSection({ title, children, className, ...props }: Omit<React.ComponentProps<"section">, "title"> & { title?: DocLabelKey | (string & {}) | React.ReactNode }) {
	const t = useDocLabel();
	return (
		<section className={cn("cy-doc-break-avoid", className)} {...props}>
			{title != null && <DocLabel className="mb-1.5">{typeof title === "string" ? t(title) : title}</DocLabel>}
			{children}
		</section>
	);
}

export type DocumentMetaItem = { label: DocLabelKey | (string & {}) | React.ReactNode; value: React.ReactNode; emphasis?: boolean };

/** Dates, terms, references — a tidy row of label/value pairs. */
export function DocumentMeta({ items, className, ...props }: Omit<React.ComponentProps<"dl">, "children"> & { items: DocumentMetaItem[] }) {
	const { layout } = useDocumentBrand();
	const t = useDocLabel();
	const shown = items.filter((i) => i.value != null && i.value !== "");
	return (
		<dl
			data-slot="cy-doc-meta"
			className={cn(
				"grid grid-cols-[repeat(auto-fit,minmax(24mm,1fr))] gap-x-5 gap-y-3",
				layout === "modern" && "border-y border-[var(--doc-rule)] py-[3.5mm]",
				layout === "classic" && "border-y border-[var(--doc-rule)] py-[3mm] text-center",
				layout === "minimal" && "border-t border-[var(--doc-rule)] pt-[4mm]",
				className,
			)}
			{...props}
		>
			{shown.map((m, i) => (
				<div key={i} className="min-w-0">
					<dt>
						<DocLabel>{typeof m.label === "string" ? t(m.label) : m.label}</DocLabel>
					</dt>
					<dd className={cn("mt-1 font-medium", m.emphasis && "font-semibold")}>{m.value}</dd>
				</div>
			))}
		</dl>
	);
}

/** One party (customer, supplier, employee…) with IDs and address. */
export function PartyBlock({ heading, party, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { heading: DocLabelKey | (string & {}) | React.ReactNode; party: DocParty }) {
	const t = useDocLabel();
	const lines = addressLines(party.address);
	const contact = [party.phone, party.email].filter(Boolean).join("  ·  ");
	return (
		<div data-slot="cy-doc-party" className={cn("min-w-0", className)} {...props}>
			<DocLabel>{typeof heading === "string" ? t(heading) : heading}</DocLabel>
			<div className="mt-1.5 text-[9.5pt] leading-tight font-semibold">{party.name}</div>
			<CompanyIds party={party} className="mt-1 text-[7.5pt] text-[var(--doc-muted)]" />
			{(party.attention || lines.length > 0 || contact) && (
				<address className="mt-1.5 text-[7.75pt] leading-[1.55] text-[var(--doc-muted)] not-italic">
					{party.attention && <div className="text-[var(--doc-ink)]">Attn: {party.attention}</div>}
					{lines.map((l, i) => (
						<div key={i}>{l}</div>
					))}
					{contact && <div>{contact}</div>}
				</address>
			)}
		</div>
	);
}

/** Two or three parties side by side (Bill to · Ship to · Supplier). */
export function PartyGrid({ parties, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { parties: Array<{ heading: DocLabelKey | (string & {}) | React.ReactNode; party: DocParty }> }) {
	const { size } = usePage();
	return (
		<div data-slot="cy-doc-parties" className={cn("grid gap-x-8 gap-y-5", size === "receipt" ? "grid-cols-1" : parties.length >= 3 ? "grid-cols-3" : "grid-cols-2", className)} {...props}>
			{parties.map((p, i) => (
				<PartyBlock key={i} heading={p.heading} party={p.party} />
			))}
		</div>
	);
}

/* ═════════════ Table ═════════════ */

export type DocColumn<T> = {
	key: string;
	header: DocLabelKey | (string & {}) | React.ReactNode;
	cell: (row: T, index: number) => React.ReactNode;
	align?: "left" | "right" | "center";
	/** CSS width, e.g. "18mm" or "40%". */
	width?: string;
	/** Figures: tabular, right-aligned, never wrap. */
	numeric?: boolean;
	className?: string;
};

export type DocTableSection<T> = { title?: React.ReactNode; rows: T[]; subtotal?: React.ReactNode };

export type DocumentTableProps<T> = Omit<React.ComponentProps<"table">, "children"> & {
	columns: DocColumn<T>[];
	/** Rows, or `sections` for grouped rows (earnings / deductions, delivered / back-ordered). */
	rows?: T[];
	sections?: DocTableSection<T>[];
	getKey?: (row: T, index: number) => string;
	/** Number each row (1, 2, 3…) in a leading column. */
	numbered?: boolean;
	/** Text for an empty table. */
	empty?: React.ReactNode;
	dense?: boolean;
};

/** Line items, payslip lines, statement rows — the one table every document uses. Headers repeat on each printed page. */
export function DocumentTable<T>({ columns, rows, sections, getKey, numbered, empty, dense, className, ...props }: DocumentTableProps<T>) {
	const { layout } = useDocumentBrand();
	const t = useDocLabel();
	const groups: DocTableSection<T>[] = sections ?? [{ rows: rows ?? [] }];
	const span = columns.length + (numbered ? 1 : 0);
	const pad = dense ? "py-[1.6mm]" : "py-[2.4mm]";
	const align = (c: DocColumn<T>) => (c.align ?? (c.numeric ? "right" : "left"));
	let n = 0;

	return (
		<table data-slot="cy-doc-table" className={cn("w-full border-collapse", className)} {...props}>
			<colgroup>
				{numbered && <col style={{ width: "7mm" }} />}
				{columns.map((c) => (
					<col key={c.key} style={c.width ? { width: c.width } : undefined} />
				))}
			</colgroup>
			<thead>
				<tr
					className={cn(
						layout === "modern" && "border-b-[1.5px] border-[var(--doc-rule-strong)]",
						layout === "classic" && "border-y-[1.5px] border-[var(--doc-rule-strong)]",
						layout === "minimal" && "border-b border-[var(--doc-rule-strong)]",
					)}
				>
					{numbered && <th scope="col" className="py-[2mm] pl-0 text-left text-[6.75pt] font-semibold tracking-[0.1em] uppercase">#</th>}
					{columns.map((c, i) => (
						<th
							key={c.key}
							scope="col"
							className={cn(
								"py-[2mm] text-[6.75pt] font-semibold tracking-[0.1em] uppercase",
								align(c) === "right" ? "text-right" : align(c) === "center" ? "text-center" : "text-left",
								i === 0 && !numbered ? "pl-0" : "pl-[3mm]",
								i === columns.length - 1 ? "pr-0" : "",
								layout === "modern" ? "text-[var(--doc-ink)]" : "text-[var(--doc-muted)]",
							)}
						>
							{typeof c.header === "string" ? t(c.header) : c.header}
						</th>
					))}
				</tr>
			</thead>
			{groups.map((g, gi) => (
				<tbody key={gi}>
					{g.title && (
						<tr>
							<td colSpan={span} className="pt-[3.5mm] pb-[1mm]">
								<DocLabel>{g.title}</DocLabel>
							</td>
						</tr>
					)}
					{g.rows.map((r, i) => {
						n++;
						return (
							<tr key={getKey ? getKey(r, i) : `${gi}-${i}`} className="cy-doc-break-avoid border-b border-[var(--doc-rule)] align-top">
								{numbered && <td className={cn(pad, "cy-doc-num pl-0 text-[var(--doc-subtle)]")}>{n}</td>}
								{columns.map((c, ci) => (
									<td
										key={c.key}
										className={cn(
											pad,
											align(c) === "right" ? "text-right" : align(c) === "center" ? "text-center" : "text-left",
											c.numeric && "cy-doc-num whitespace-nowrap",
											ci === 0 && !numbered ? "pl-0" : "pl-[3mm]",
											ci === columns.length - 1 ? "pr-0" : "",
											c.className,
										)}
									>
										{c.cell(r, i)}
									</td>
								))}
							</tr>
						);
					})}
					{g.subtotal != null && (
						<tr className="cy-doc-break-avoid">
							<td colSpan={span} className="py-[1.8mm] text-right font-semibold">
								{g.subtotal}
							</td>
						</tr>
					)}
				</tbody>
			))}
			{groups.every((g) => g.rows.length === 0) && empty && (
				<tbody>
					<tr>
						<td colSpan={span} className="py-[6mm] text-center text-[var(--doc-subtle)]">
							{empty}
						</td>
					</tr>
				</tbody>
			)}
		</table>
	);
}

/** Description cell with an optional quieter second line. */
export function DocItem({ title, detail, className }: { title: React.ReactNode; detail?: React.ReactNode; className?: string }) {
	return (
		<div className={cn("min-w-0", className)}>
			<div className="font-medium">{title}</div>
			{detail && <div className="mt-0.5 text-[7.5pt] leading-snug text-[var(--doc-muted)]">{detail}</div>}
		</div>
	);
}

/* ═════════════ Totals ═════════════ */

export type TotalsRowKind = "line" | "subtotal" | "discount" | "tax" | "rounding" | "total" | "paid" | "balance";
export type TotalsRow = {
	label: DocLabelKey | (string & {}) | React.ReactNode;
	/** Decimal string. Discounts and payments are shown with a minus/brackets when negative. */
	value: string;
	kind?: TotalsRowKind;
	/** Small note after the label, e.g. "8%". */
	hint?: React.ReactNode;
};

export type TotalsBlockProps = Omit<React.ComponentProps<"div">, "children"> & {
	rows: TotalsRow[];
	currency?: string;
	/** Print the grand total (or balance) in words underneath — "Ringgit Malaysia … Only". */
	words?: boolean;
	/** Content on the left of the totals (notes, a QR, bank details). */
	aside?: React.ReactNode;
};

/** Subtotal → discounts → taxes → rounding → total → paid → balance. Values are printed as given. */
export function TotalsBlock({ rows, currency = "MYR", words, aside, className, ...props }: TotalsBlockProps) {
	const { layout, locale } = useDocumentBrand();
	const { size } = usePage();
	const t = useDocLabel();
	const sym = currencySymbol(currency);
	const grand = [...rows].reverse().find((r) => r.kind === "balance") ?? rows.find((r) => r.kind === "total");

	const body = (
		<dl className={cn("min-w-0", size === "receipt" ? "w-full" : "w-[78mm]")}>
			{rows.map((r, i) => {
				const label = typeof r.label === "string" ? t(r.label) : r.label;
				const isGrand = r === grand;
				const strong = r.kind === "total" || r.kind === "balance";
				return (
					<div
						key={i}
						className={cn(
							"flex items-baseline justify-between gap-4 py-[1.3mm]",
							strong && "font-semibold",
							isGrand && layout === "classic" && "mt-[1.5mm] border-t border-[var(--doc-rule-strong)] pt-[2.2mm] pb-[2mm] [border-bottom:3px_double_var(--doc-rule-strong)]",
							isGrand && layout === "minimal" && "mt-[2mm] border-t border-[var(--doc-rule-strong)] pt-[2.5mm]",
							isGrand && layout === "modern" && "mt-[2mm] border-t-[1.5px] border-[var(--doc-rule-strong)] pt-[2.8mm]",
							!isGrand && r.kind === "total" && "border-t border-[var(--doc-rule)] pt-[2mm]",
						)}
					>
						<dt className={cn(strong ? "text-[var(--doc-ink)]" : "text-[var(--doc-muted)]")}>
							{label}
							{r.hint && <span className="ml-1 text-[var(--doc-subtle)]">{r.hint}</span>}
						</dt>
						<dd
							className={cn(
								"cy-doc-num whitespace-nowrap",
								isGrand ? "text-[12pt] leading-none tracking-[-0.01em]" : "",
								isGrand && layout === "modern" && "text-[14pt] font-semibold tracking-[-0.02em]",
								isGrand && layout === "classic" && "[font-family:var(--doc-display)] text-[13pt]",
							)}
						>
							{isGrand && <span className="mr-1 text-[8pt] font-medium text-[var(--doc-muted)]">{sym}</span>}
							{formatDocAmount(r.value, { brackets: r.kind === "discount" || r.kind === "paid" })}
						</dd>
					</div>
				);
			})}
		</dl>
	);

	return (
		<div data-slot="cy-doc-totals" className={cn("cy-doc-break-avoid", className)} {...props}>
			<div className={cn("flex gap-8", size === "receipt" ? "flex-col" : "items-start justify-between")}>
				{aside != null && aside !== false && <div className="min-w-0 flex-1">{aside}</div>}
				{aside == null || aside === false ? <div className={cn(size === "receipt" ? "" : "ml-auto")}>{body}</div> : body}
			</div>
			{words && grand && (
				<div className={cn("mt-[3mm] text-[7.5pt] leading-snug", size === "receipt" ? "" : "ml-auto max-w-[110mm] text-right")}>
					<DocLabel className="mb-0.5">{t("amountInWords")}</DocLabel>
					<div className="text-[var(--doc-ink)] italic">{amountInWords(grand.value, { currency, lang: locale === "ms" ? "ms" : "en" })}</div>
					{locale === "en-ms" && <div className="text-[var(--doc-muted)] italic">{amountInWords(grand.value, { currency, lang: "ms" })}</div>}
				</div>
			)}
		</div>
	);
}

/* ═════════════ Payment, e-Invoice, notes, signatures, footer ═════════════ */

export type PaymentBlockProps = Omit<React.ComponentProps<"div">, "children"> & {
	bankName?: string;
	accountName?: string;
	accountNumber?: string;
	swiftCode?: string;
	reference?: string;
	/** A DuitNow / payment QR element (e.g. `<QRCodeSVG value=… />`). */
	qr?: React.ReactNode;
	note?: React.ReactNode;
};

/** Where and how to pay. */
export function PaymentBlock({ bankName, accountName, accountNumber, swiftCode, reference, qr, note, className, ...props }: PaymentBlockProps) {
	const t = useDocLabel();
	const rows = [
		[t("bank", { stacked: true }), bankName],
		[t("accountName", { stacked: true }), accountName],
		[t("accountNo", { stacked: true }), accountNumber],
		["SWIFT", swiftCode],
		[t("reference", { stacked: true }), reference],
	].filter(([, v]) => v) as [React.ReactNode, string][];
	return (
		<DocSection title="paymentDetails" className={className} {...props}>
			<div className="flex items-start gap-4">
				{qr && <div className="size-[20mm] shrink-0 [&>svg]:size-full">{qr}</div>}
				<div className="min-w-0">
					<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
						{rows.map(([k, v], i) => (
							<React.Fragment key={i}>
								<dt className="text-[var(--doc-muted)]">{k}</dt>
								<dd className="font-medium">{v}</dd>
							</React.Fragment>
						))}
					</dl>
					{note && <div className="mt-1.5 text-[7.5pt] text-[var(--doc-muted)]">{note}</div>}
				</div>
			</div>
		</DocSection>
	);
}

export type EInvoiceBlockProps = Omit<React.ComponentProps<"div">, "children"> & {
	status: "validated" | "pending" | "rejected";
	uuid?: string;
	validatedAt?: string;
	url?: string;
	/** The real QR element from MyInvois (e.g. `<QRCodeSVG value={url} />`). Never faked: without it, a clear placeholder is shown. */
	qr?: React.ReactNode;
};

/** LHDN MyInvois validation: QR + UUID when validated; an unmistakable placeholder while pending. */
export function EInvoiceBlock({ status, uuid, validatedAt, url, qr, className, ...props }: EInvoiceBlockProps) {
	const t = useDocLabel();
	const validated = status === "validated";
	return (
		<div data-slot="cy-doc-einvoice" className={cn("cy-doc-break-avoid flex items-start gap-3", className)} {...props}>
			{validated && (
				<div className={cn("flex size-[20mm] shrink-0 items-center justify-center", !qr && "border border-dashed border-[var(--doc-rule)] text-center text-[6pt] leading-tight text-[var(--doc-subtle)]")}>
					{qr ? <div className="size-full [&>svg]:size-full">{qr}</div> : <span className="px-1">MyInvois QR</span>}
				</div>
			)}
			<div className="min-w-0 text-[7.5pt] leading-[1.55]">
				<div className={cn("font-semibold", status === "rejected" && "uppercase tracking-[0.06em]")}>{t(validated ? "eInvoiceValidated" : status === "pending" ? "eInvoicePending" : "eInvoiceRejected")}</div>
				{uuid && (
					<div className="break-all text-[var(--doc-muted)]">
						{t("uuid")} <span className="text-[var(--doc-ink)]">{uuid}</span>
					</div>
				)}
				{validatedAt && (
					<div className="text-[var(--doc-muted)]">
						{t("validatedOn")} {validatedAt}
					</div>
				)}
				{url && validated && (
					<a href={url} className="text-[var(--doc-ink)] underline decoration-[0.5px] underline-offset-2">
						{t("verify")}
					</a>
				)}
			</div>
		</div>
	);
}

/** Free text under a label (notes, terms & conditions). Keeps line breaks. */
export function NotesBlock({ title = "notes", children, className, ...props }: Omit<React.ComponentProps<"section">, "title"> & { title?: DocLabelKey | (string & {}) | React.ReactNode }) {
	return (
		<DocSection title={title} className={className} {...props}>
			<div className="text-[7.75pt] leading-[1.6] whitespace-pre-line text-[var(--doc-muted)]">{children}</div>
		</DocSection>
	);
}

/** Signature lines: authorised signatory, received by, prepared/approved by. */
export function SignatureBlock({ signatories, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { signatories: DocSignatory[] }) {
	const t = useDocLabel();
	return (
		<div data-slot="cy-doc-signatures" className={cn("cy-doc-break-avoid grid gap-10", signatories.length >= 3 ? "grid-cols-3" : "grid-cols-2", className)} {...props}>
			{signatories.map((s, i) => (
				<div key={i} className="min-w-0">
					<div className="flex h-[16mm] items-end">{s.image && <img src={s.image} alt="" className="max-h-[15mm] w-auto object-contain" />}</div>
					<div className="border-t border-[var(--doc-rule-strong)] pt-[1.5mm]">
						<div className="text-[7pt] font-semibold tracking-[0.08em] text-[var(--doc-muted)] uppercase">{typeof s.label === "string" ? t(s.label) : s.label ?? t("authorisedSignature")}</div>
						{s.name && <div className="mt-0.5 font-medium">{s.name}</div>}
						{(s.title || s.date) && <div className="text-[7.5pt] text-[var(--doc-muted)]">{[s.title, s.date].filter(Boolean).join(" · ")}</div>}
					</div>
				</div>
			))}
		</div>
	);
}

/** Page footer: brand note, company line, and the computer-generated notice. Sits at the bottom of the sheet. */
export function DocumentFooter({ children, note, hideNotice, className, ...props }: React.ComponentProps<"footer"> & { note?: React.ReactNode; hideNotice?: boolean }) {
	const { company, footerNote, layout } = useDocumentBrand();
	const { size } = usePage();
	const t = useDocLabel();
	return (
		<footer data-slot="cy-doc-footer" className={cn("mt-auto pt-[8mm] [break-before:avoid] [break-inside:avoid] text-[7pt] leading-snug text-[var(--doc-subtle)]", size === "receipt" && "pt-[4mm] text-center", className)} {...props}>
			{(note ?? footerNote) && <div className={cn("mb-[2.5mm] text-[8pt] text-[var(--doc-ink)]", layout === "classic" && "text-center italic [font-family:var(--doc-display)]")}>{note ?? footerNote}</div>}
			{children}
			<div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-t border-[var(--doc-rule)] pt-[2.5mm]", size === "receipt" && "justify-center")}>
				<span>
					{company.name}
					{company.registrationNo && <span className="whitespace-nowrap"> · {company.registrationNo}</span>}
				</span>
				{!hideNotice && <span>{t("computerGenerated")}</span>}
			</div>
		</footer>
	);
}

/** Vertical rhythm between blocks: `<DocStack>` spaces its children evenly. */
export function DocStack({ gap = "md", className, ...props }: React.ComponentProps<"div"> & { gap?: "sm" | "md" | "lg" }) {
	return <div className={cn("flex flex-col", gap === "sm" ? "gap-[4mm] print:gap-[3.5mm]" : gap === "lg" ? "gap-[9mm] print:gap-[7mm]" : "gap-[6.5mm] print:gap-[5mm]", className)} {...props} />;
}

/** Two blocks side by side (payment + e-invoice, notes + totals). Stacks on receipts. */
export function DocColumns({ className, ...props }: React.ComponentProps<"div">) {
	const { size } = usePage();
	return <div className={cn("grid gap-8", size === "receipt" ? "grid-cols-1" : "grid-cols-2", className)} {...props} />;
}

/* ═════════════ More shared parts ═════════════ */

/** A horizontal separator: hairline, strong, or dashed (receipts, tear lines). */
export function DocRule({ dashed, strong, className }: { dashed?: boolean; strong?: boolean; className?: string }) {
	return (
		<hr
			aria-hidden
			className={cn(
				"m-0 h-0 border-0 border-t",
				dashed ? "border-dashed" : "border-solid",
				strong ? "border-[var(--doc-rule-strong)]" : dashed ? "border-[var(--doc-subtle)]" : "border-[var(--doc-rule)]",
				className,
			)}
		/>
	);
}

export type DocFieldItem = {
	/** Label key, `{ en, ms }` text, or any node. */
	label: DocLabelKey | DocText | React.ReactNode;
	value?: React.ReactNode;
	/** Accent the value (a reference that matters). */
	emphasis?: boolean;
	/** Quieter second line under the value. */
	hint?: React.ReactNode;
	/** Tabular figures, never wrapped (IDs, account numbers). */
	figures?: boolean;
	/** `grid` only: columns to span. */
	span?: 1 | 2 | 3 | 4;
};

const FIELD_COLS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5" } as const;
const FIELD_SPAN = { 1: "", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4" } as const;

/**
 * Label/value pairs without a panel. Empty values are skipped.
 * - `rows`: label left, value right (receipts, logistics), optionally separated by dashed rules.
 * - `columns`: micro-label above value in an even, auto-fitting row (references, delivery details).
 * - `grid`: quiet label above value in a fixed number of columns (employee particulars, bank details).
 */
export function DocFields({ items, variant = "rows", columns = 3, dashed, className }: { items: DocFieldItem[]; variant?: "rows" | "columns" | "grid"; columns?: 1 | 2 | 3 | 4 | 5; dashed?: boolean; className?: string }) {
	const node = useDocLabelNode();
	const shown = items.filter((i) => i.value != null && i.value !== "" && i.value !== false);
	const value = (f: DocFieldItem) => <span className={cn(f.figures && "cy-doc-num whitespace-nowrap")}>{f.value}</span>;
	if (variant === "grid")
		return (
			<dl data-slot="cy-doc-fields" className={cn("grid gap-x-[6mm] gap-y-[2.6mm]", FIELD_COLS[columns], className)}>
				{shown.map((f, i) => (
					<div key={i} className={cn("min-w-0", f.span && FIELD_SPAN[f.span])}>
						<dt className="text-[7pt] leading-tight text-[var(--doc-subtle)]">{node(f.label)}</dt>
						<dd className={cn("mt-[0.7mm] leading-snug font-medium break-words", f.emphasis && "font-semibold")}>{value(f)}</dd>
						{f.hint && <dd className="text-[7.5pt] text-[var(--doc-muted)]">{f.hint}</dd>}
					</div>
				))}
			</dl>
		);
	if (variant === "columns")
		return (
			<dl data-slot="cy-doc-fields" className={cn("grid grid-cols-[repeat(auto-fit,minmax(26mm,1fr))] gap-x-5 gap-y-3", className)}>
				{shown.map((f, i) => (
					<div key={i} className="min-w-0">
						<dt>
							<DocLabel>{node(f.label)}</DocLabel>
						</dt>
						<dd className={cn("mt-1 font-medium", f.emphasis && "font-semibold")}>{value(f)}</dd>
						{f.hint && <dd className="text-[7.5pt] text-[var(--doc-muted)]">{f.hint}</dd>}
					</div>
				))}
			</dl>
		);
	return (
		<dl data-slot="cy-doc-fields" className={cn("flex flex-col", className)}>
			{shown.map((f, i) => (
				<div key={i} className={cn("flex items-baseline justify-between gap-3 py-[0.9mm]", dashed && i > 0 && "border-t border-dashed border-[var(--doc-rule)]")}>
					<dt className="shrink-0 text-[var(--doc-muted)]">{node(f.label)}</dt>
					<dd className={cn("min-w-0 text-right font-medium", f.emphasis && "font-semibold")}>
						{value(f)}
						{f.hint && <div className="text-[0.9em] font-normal text-[var(--doc-muted)]">{f.hint}</div>}
					</dd>
				</div>
			))}
		</dl>
	);
}

/**
 * A quiet framed panel for a reference or summary that must stand apart from the flow (the invoice a credit
 * note adjusts, delivery details). Modern: hairline box; classic: double rule; minimal: a left rule.
 */
export function DocCallout({ className, children, ...props }: React.ComponentProps<"div">) {
	const { layout } = useDocumentBrand();
	return (
		<div
			className={cn(
				"cy-doc-break-avoid",
				layout === "modern" && "rounded-[2.5mm] border border-[var(--doc-rule)] px-[5mm] py-[3.5mm]",
				layout === "classic" && "border-y border-[var(--doc-rule-strong)] py-[3mm] [border-bottom-style:double] [border-bottom-width:3px]",
				layout === "minimal" && "border-l-[1.5px] border-[var(--doc-rule-strong)] py-[0.5mm] pl-[4.5mm]",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export type DocFigure = {
	label: DocLabelKey | DocText | React.ReactNode;
	/** Decimal string, printed as given. */
	value: string;
	/** The figure the strip leads to (Total due, Net pay). One per strip. */
	emphasis?: boolean;
};

/**
 * A row of key figures read left to right, ending in the one that matters (aging buckets → total due,
 * gross → deductions → net pay). `quiet` for secondary figures (employer contributions, year to date).
 */
export function DocFigureStrip({ items, currency = "MYR", quiet, zero, className }: { items: DocFigure[]; currency?: string; quiet?: boolean; zero?: string; className?: string }) {
	const { layout } = useDocumentBrand();
	const L = useDocLabel();
	const sym = currencySymbol(currency);
	const node = useDocLabelNode();
	const label = (f: DocFigure) => node(f.label, { stacked: true });
	// The emphasised figure never truncates: its column is at least as wide as its content.
	const cols = { gridTemplateColumns: items.map((f) => (f.emphasis ? "minmax(max-content, 1.25fr)" : "minmax(0, 1fr)")).join(" ") } as React.CSSProperties;

	if (quiet)
		return (
			<dl data-slot="cy-doc-figures" style={cols} className={cn("cy-doc-break-avoid grid border-t border-[var(--doc-rule)]", className)}>
				{items.map((f, i) => (
					<div key={i} className={cn("flex min-w-0 flex-col justify-between pt-[2.2mm]", i > 0 && "border-l border-[var(--doc-rule)] pl-[3mm]", layout === "classic" && "text-center")}>
						<dt className="text-[7pt] leading-tight text-[var(--doc-subtle)]">{label(f)}</dt>
						<dd className={cn("cy-doc-num mt-[0.8mm] text-[8.5pt] whitespace-nowrap", f.emphasis ? "font-semibold" : "font-medium text-[var(--doc-muted)]")}>{formatDocAmount(f.value, { brackets: true, zero })}</dd>
					</div>
				))}
			</dl>
		);

	return (
		<dl
			data-slot="cy-doc-figures"
			style={cols}
			className={cn(
				"cy-doc-break-avoid grid",
				layout === "modern" && "border-y-[1.5px] border-[var(--doc-rule-strong)]",
				layout === "classic" && "border-y-[1.5px] border-[var(--doc-rule-strong)]",
				layout === "minimal" && "gap-[4mm] border-t border-[var(--doc-rule-strong)]",
				className,
			)}
		>
			{items.map((f, i) => {
				const strong = f.emphasis;
				return (
					<div
						key={i}
						className={cn(
							"flex min-w-0 flex-col justify-between gap-[2mm]",
							layout === "modern" && "px-[3mm] py-[3mm] first:pl-0",
							layout === "modern" && i > 0 && "border-l border-[var(--doc-rule)]",
							layout === "classic" && "px-[3mm] py-[3mm] text-center",
							layout === "classic" && i > 0 && "border-l border-[var(--doc-rule)]",
							layout === "minimal" && "pt-[3mm]",
						)}
					>
						<dt
							className={cn(
								"text-[6.5pt] leading-tight font-semibold tracking-[0.1em] uppercase",
								strong ? "text-[var(--doc-ink)]" : "text-[var(--doc-subtle)]",
							)}
						>
							{label(f)}
						</dt>
						<dd
							className={cn(
								"cy-doc-num leading-none whitespace-nowrap",
								strong ? "text-[13pt] font-semibold tracking-[-0.01em]" : "text-[10pt] font-medium",
								layout === "classic" && "[font-family:var(--doc-display)]",
								layout === "classic" && strong && "text-[14pt]",
							)}
						>
							{strong && <span className="mr-1 text-[7.5pt] font-medium text-[var(--doc-muted)]">{sym}</span>}
							{formatDocAmount(f.value, { brackets: true, zero: strong ? undefined : zero })}
						</dd>
					</div>
				);
			})}
		</dl>
	);
}

/** An amount spelled out — "Ringgit Malaysia … Only" — in the brand's language (both lines when bilingual). */
export function DocAmountWords({ amount, currency = "MYR", label = "amountInWords", align = "left", className }: { amount: string; currency?: string; label?: DocLabelKey | DocText; align?: "left" | "right"; className?: string }) {
	const { locale } = useDocumentBrand();
	const L = useDocLabel();
	return (
		<div data-slot="cy-doc-words" className={cn("cy-doc-break-avoid text-[7.5pt] leading-snug", align === "right" && "ml-auto max-w-[115mm] text-right", className)}>
			<DocLabel className="mb-0.5">{L(label)}</DocLabel>
			<div className="text-[var(--doc-ink)] italic">{amountInWords(amount, { currency, lang: locale === "ms" ? "ms" : "en" })}</div>
			{locale === "en-ms" && <div className="text-[var(--doc-muted)] italic">{amountInWords(amount, { currency, lang: "ms" })}</div>}
		</div>
	);
}

