/**
 * Cynco UI — sales documents, assembled from the document kit (./documents).
 *
 *   TaxInvoiceDocument      Tax invoice / invoice (A4), foreign-currency aware, payment + e-invoice blocks
 *   QuotationDocument       Quotation with line groups, optional items, T&Cs and customer acceptance
 *   AdjustmentNoteDocument  Credit note / debit note against an original invoice (an e-invoice too)
 *   ReceiptDocument         Official receipt — A4, A5 or 80mm thermal
 *   DeliveryOrderDocument   Delivery order — no prices, ordered / delivered / back-ordered, goods received block
 *
 * Every document takes ONE typed data prop plus presentation props. Money arrives as decimal strings and is
 * printed as given: totals, taxes, rounding and balances are fields of the data, never recomputed here.
 *
 * Parts defined here that other documents can share (candidates for the kit): `useDocLabel`,
 * `DocRule`, `DocFields`, `DocCallout`, `AcceptanceBlock`, `ForeignCurrencyNote`.
 */
import * as React from "react";
import { cn } from "../base";
import {
	useDocumentBrand,
	isDocLabelKey,
	DocRule,
	DocFields,
	DocCallout,
	type DocFieldItem,
	useDocLabel,
	formatDocDate,
	formatDocAmount,
	currencySymbol,
	amountInWords,
	DocumentPage,
	Letterhead,
	DocLabel,
	DocSection,
	DocumentMeta,
	PartyBlock,
	PartyGrid,
	DocumentTable,
	DocItem,
	TotalsBlock,
	PaymentBlock,
	EInvoiceBlock,
	NotesBlock,
	SignatureBlock,
	DocumentFooter,
	DocStack,
	DocColumns,
	type DocBrand,
	type DocLabelKey,
	type DocLocale,
	type DocParty,
	type DocSignatory,
	type DocColumn,
	type DocTableSection,
	type DocumentMetaItem,
	type DocumentStamp,
	type TotalsRow,
	type EInvoiceBlockProps,
} from "./kit";

/* ═════════════ Labels ═════════════ */

type Translate = ReturnType<typeof useDocLabel>;

/** Kit labels resolve in TotalsBlock itself; kept for call-site compatibility. */
const localiseRows = (rows: TotalsRow[], _t: Translate): TotalsRow[] => rows;

/* ═════════════ New parts (candidates for the kit) ═════════════ */

export type AcceptanceField = { label: DocLabelKey | (string & {}) | React.ReactNode; value?: React.ReactNode };

export type AcceptanceBlockProps = Omit<React.ComponentProps<"div">, "title"> & {
	/** Heading, e.g. "acceptance", "goodsReceived", or the issuing company's name. */
	title: DocLabelKey | (string & {}) | React.ReactNode;
	/** One line above the signature, e.g. "We accept this quotation…". */
	statement?: React.ReactNode;
	/** Label under the signature line. */
	signatureLabel?: DocLabelKey | (string & {}) | React.ReactNode;
	/** A signature image when the document is already signed. */
	signatureImage?: string;
	/** Fill-in fields under the signature (Name, IC no., Date). A field with a value prints it; without, a blank line. */
	fields?: AcceptanceField[];
	/** Show a dashed company-stamp box beside the signature. */
	stamp?: boolean;
};

/**
 * A sign-off box: heading, a statement, a signature line, fill-in fields and an optional company-stamp box.
 * Used for customer acceptance on quotations, goods received on delivery orders, and the issuer's side next to
 * them (so both columns share one rhythm and their lines align).
 */
export function AcceptanceBlock({ title, statement, signatureLabel = "customerSignature", signatureImage, fields = [], stamp, className, ...props }: AcceptanceBlockProps) {
	const t = useDocLabel();
	const tx = (v: unknown) => (typeof v === "string" ? t(v) : (v as React.ReactNode));
	return (
		<div data-slot="cy-doc-acceptance" className={cn("cy-doc-break-avoid flex min-w-0 flex-col", className)} {...props}>
			<DocLabel>{tx(title)}</DocLabel>
			<div className="mt-1.5 min-h-[8mm] text-[7.75pt] leading-[1.5] text-[var(--doc-muted)]">{statement}</div>
			<div className="mt-auto flex items-end gap-[5mm]">
				<div className="min-w-0 flex-1">
					<div className="flex h-[17mm] items-end">{signatureImage && <img src={signatureImage} alt="" className="max-h-[15mm] w-auto object-contain" />}</div>
					<div className="border-t border-[var(--doc-rule-strong)] pt-[1.5mm] text-[7pt] font-semibold tracking-[0.08em] text-[var(--doc-muted)] uppercase">{tx(signatureLabel)}</div>
				</div>
				{stamp && (
					<div className="flex h-[22mm] w-[30mm] shrink-0 items-end justify-center rounded-[1.5mm] border border-dashed border-[var(--doc-subtle)] pb-[1.5mm] text-center text-[6.5pt] tracking-[0.06em] text-[var(--doc-subtle)] uppercase">
						<span>{t("companyStamp", { stacked: true })}</span>
					</div>
				)}
			</div>
			{fields.length > 0 && (
				<dl className={cn("mt-[3mm] grid gap-x-[5mm] gap-y-[2.5mm]", fields.length >= 3 ? "grid-cols-3" : fields.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
					{fields.map((f, i) => (
						<div key={i} className="min-w-0">
							<dt className="text-[6.75pt] font-semibold tracking-[0.08em] text-[var(--doc-subtle)] uppercase">{tx(f.label)}</dt>
							<dd className="mt-[1mm] flex h-[5mm] items-end truncate border-b border-dotted border-[var(--doc-subtle)] pb-[0.5mm] font-medium">{f.value}</dd>
						</div>
					))}
				</dl>
			)}
		</div>
	);
}

export type ForeignCurrencyNoteProps = Omit<React.ComponentProps<"div">, "children"> & {
	/** Document currency, e.g. "USD". */
	currency: string;
	/** MYR per one unit of `currency`, as posted (e.g. "4.4350"). */
	rate: string;
	/** Rate date (ISO). */
	rateDate?: string;
	/** Where the rate comes from, e.g. "Bank Negara Malaysia". */
	source?: string;
	/** MYR equivalents, as posted: [{ label: "sstMyr", value: "1036.73" }, { label: "totalMyr", value: "13995.84" }]. */
	rows: Array<{ label: DocLabelKey | (string & {}) | React.ReactNode; value: string; strong?: boolean }>;
};

/**
 * Exchange rate and the MYR equivalents of tax and total on a foreign-currency document. LHDN requires the tax
 * amount in MYR on e-invoices issued in another currency; the values are printed as posted.
 */
export function ForeignCurrencyNote({ currency, rate, rateDate, source, rows, className, ...props }: ForeignCurrencyNoteProps) {
	const t = useDocLabel();
	const { locale, layout } = useDocumentBrand();
	return (
		<div data-slot="cy-doc-fx" className={cn("cy-doc-break-avoid text-[7.75pt]", className)} {...props}>
			<div className={cn("rounded-[2mm] px-[3.5mm] py-[2.5mm]", "border border-[var(--doc-rule)]")}>
				<div className="flex items-baseline justify-between gap-3">
					<DocLabel>{t("exchangeRate")}</DocLabel>
					<span className="cy-doc-num font-medium whitespace-nowrap">
						1 {currency} = {rate} MYR
					</span>
				</div>
				{(source || rateDate) && <div className="mt-0.5 text-right text-[7pt] text-[var(--doc-subtle)]">{[source, formatDocDate(rateDate, locale)].filter(Boolean).join(" · ")}</div>}
				<div className="mt-[1.5mm] border-t border-[var(--doc-rule)] pt-[1mm]">
					{rows.map((r, i) => (
						<div key={i} className={cn("flex items-baseline justify-between gap-3 py-[0.6mm]", r.strong && "font-semibold")}>
							<span className={r.strong ? "" : "text-[var(--doc-muted)]"}>{typeof r.label === "string" ? t(r.label) : r.label}</span>
							<span className="cy-doc-num whitespace-nowrap">
								<span className="mr-1 text-[0.85em] font-medium text-[var(--doc-muted)]">RM</span>
								{formatDocAmount(r.value)}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* ═════════════ Shared data shapes ═════════════ */

/** One priced line, as posted. All figures are decimal strings printed as given. */
export type SalesDocLine = {
	description: string;
	/** Quieter second line (spec, period, serial numbers). */
	detail?: string;
	/** Item / SKU code. */
	code?: string;
	quantity: string;
	/** "pcs", "hr", "m²", "lot"… */
	unit?: string;
	unitPrice: string;
	/** Discount on the line: an amount ("50.00") or a rate ("10%"). */
	discount?: string;
	/** SST code as configured in Cynco, e.g. "SV8", "ST10", "EX". */
	taxCode?: string;
	/** Rate in percent, e.g. "8". */
	taxRate?: string;
	/** Line amount (net of discount, excluding tax), as posted. */
	amount: string;
};

export type SalesDocStatus = "draft" | "issued" | "sent" | "paid" | "partially_paid" | "overdue" | "void";

export type SalesDocPresentation = {
	/** Overrides the provider's brand (merged over it). */
	brand?: Partial<DocBrand>;
	/** Overrides the stamp derived from the document status. `null` hides it. */
	stamp?: DocumentStamp | null;
	fit?: "width" | "none";
	isolate?: boolean;
	className?: string;
};

export type EInvoiceInfo = Pick<EInvoiceBlockProps, "status" | "uuid" | "validatedAt" | "url" | "qr">;

export type PaymentInstructions = {
	bankName?: string;
	accountName?: string;
	accountNumber?: string;
	swiftCode?: string;
	reference?: string;
	note?: React.ReactNode;
	/** DuitNow QR element (e.g. `<QRCodeSVG value={duitNowPayload} />`). */
	qr?: React.ReactNode;
};

function stampFor(status: SalesDocStatus | undefined, override: DocumentStamp | null | undefined): DocumentStamp | undefined {
	if (override !== undefined) return override ?? undefined;
	if (status === "paid" || status === "void" || status === "overdue" || status === "draft") return status;
	return undefined;
}

function signatoryFor(sig: DocSignatory | boolean | undefined, brandSig: DocSignatory | undefined): DocSignatory | null {
	if (!sig) return null;
	if (sig === true) return brandSig ? { label: "authorisedSignature", ...brandSig } : { label: "authorisedSignature" };
	return { label: "authorisedSignature", ...brandSig, ...sig };
}

const hasAny = <T,>(rows: T[], f: (r: T) => unknown) => rows.some((r) => f(r) != null && f(r) !== "");

/** Qty with its unit, figures tabular: "24 pcs". */
function Qty({ quantity, unit }: { quantity: string; unit?: string }) {
	return (
		<>
			{quantity}
			{unit && <span className="ml-[1.2mm] inline-block min-w-[6.5mm] text-left text-[0.88em] text-[var(--doc-muted)]">{unit}</span>}
		</>
	);
}

/** The priced line-item columns, showing discount / tax columns only when a line uses them. */
function useLineColumns(lines: SalesDocLine[]): DocColumn<SalesDocLine>[] {
	const showCode = hasAny(lines, (l) => l.code);
	const showDiscount = hasAny(lines, (l) => l.discount);
	const showTax = hasAny(lines, (l) => l.taxRate ?? l.taxCode);
	const cols: DocColumn<SalesDocLine>[] = [];
	if (showCode) cols.push({ key: "code", header: "item", width: "20mm", cell: (l) => <span className="cy-doc-num text-[7.5pt] text-[var(--doc-muted)]">{l.code}</span> });
	cols.push({ key: "description", header: "description", cell: (l) => <DocItem title={l.description} detail={l.detail} /> });
	cols.push({ key: "qty", header: "qty", numeric: true, width: "21mm", cell: (l) => <Qty quantity={l.quantity} unit={l.unit} /> });
	cols.push({ key: "price", header: "unitPrice", numeric: true, width: "24mm", cell: (l) => formatDocAmount(l.unitPrice) });
	if (showDiscount)
		cols.push({ key: "discount", header: "discount", numeric: true, width: "18mm", cell: (l) => (!l.discount ? <span className="text-[var(--doc-subtle)]">—</span> : l.discount.trim().endsWith("%") ? l.discount : formatDocAmount(l.discount)) });
	if (showTax)
		cols.push({
			key: "tax",
			header: "tax",
			numeric: true,
			width: "15mm",
			cell: (l) =>
				l.taxRate == null && !l.taxCode ? (
					<span className="text-[var(--doc-subtle)]">—</span>
				) : (
					<span className="inline-flex flex-col items-end leading-tight">
						<span>{l.taxRate != null && l.taxRate !== "" ? `${l.taxRate}%` : l.taxCode}</span>
						{l.taxCode && l.taxRate != null && l.taxRate !== "" && <span className="text-[6.5pt] tracking-[0.04em] text-[var(--doc-subtle)]">{l.taxCode}</span>}
					</span>
				),
		});
	cols.push({ key: "amount", header: "amount", numeric: true, width: "26mm", cell: (l) => <span className="font-medium">{formatDocAmount(l.amount)}</span> });
	return cols;
}

/** "Subtotal · Phase 1    12,500.00" for a section footer row. */
function SectionSubtotal({ label, value }: { label: React.ReactNode; value: string }) {
	return (
		<span className="inline-flex items-baseline gap-[6mm]">
			<span className="font-normal text-[var(--doc-muted)]">{label}</span>
			<span className="cy-doc-num">{formatDocAmount(value)}</span>
		</span>
	);
}

/* ═════════════ 1 · Tax invoice ═════════════ */

export type TaxInvoiceData = {
	/** "taxInvoice" when the seller is SST-registered, "invoice" when not — or any text. */
	title?: "taxInvoice" | "invoice" | (string & {});
	number: string;
	status?: SalesDocStatus;
	/** Small line under the number, e.g. "Original" or "Revision 2". */
	subtitle?: string;
	invoiceDate: string;
	dueDate?: string;
	/** "Net 30", "COD"… */
	terms?: string;
	/** Customer PO / reference. */
	reference?: string;
	/** ISO currency; MYR when omitted. */
	currency?: string;
	billTo: DocParty;
	shipTo?: DocParty;
	lines: SalesDocLine[];
	/** Subtotal, discount, SST by rate, rounding, total, deposit / paid, balance — in print order. */
	totals: TotalsRow[];
	/** Print the grand total (or balance) in words. Default true. */
	amountInWords?: boolean;
	/** Foreign-currency invoices: the posted rate and MYR equivalents of SST and total. */
	exchange?: { rate: string; rateDate?: string; source?: string; taxMyr?: string; totalMyr: string };
	payment?: PaymentInstructions;
	einvoice?: EInvoiceInfo;
	notes?: string;
	termsAndConditions?: string;
	/** `true` uses the brand's signatory. */
	signature?: DocSignatory | boolean;
};

export type TaxInvoiceDocumentProps = SalesDocPresentation & { invoice: TaxInvoiceData; size?: "a4" | "letter" };

/** Malaysian tax invoice (or plain invoice for a seller not registered for SST). */
export function TaxInvoiceDocument({ invoice: inv, size = "a4", brand, stamp, fit, isolate, className }: TaxInvoiceDocumentProps) {
	return (
		<DocumentPage brand={brand} size={size} stamp={stampFor(inv.status, stamp)} fit={fit} isolate={isolate} className={className}>
			<TaxInvoiceBody inv={inv} />
		</DocumentPage>
	);
}

function TaxInvoiceBody({ inv }: { inv: TaxInvoiceData }) {
	const t = useDocLabel();
	const { locale, signature: brandSig } = useDocumentBrand();
	const currency = inv.currency ?? "MYR";
	const foreign = currency !== "MYR";
	const columns = useLineColumns(inv.lines);
	const sig = signatoryFor(inv.signature, brandSig);
	const meta: DocumentMetaItem[] = [
		{ label: "invoiceDate", value: formatDocDate(inv.invoiceDate, locale) },
		{ label: "dueDate", value: formatDocDate(inv.dueDate, locale), emphasis: inv.status === "overdue" },
		{ label: "terms", value: inv.terms },
		{ label: "reference", value: inv.reference },
		...(foreign ? [{ label: "currency", value: currency }] : []),
	];
	const fxRows = inv.exchange
		? [...(inv.exchange.taxMyr ? [{ label: "sstMyr", value: inv.exchange.taxMyr }] : []), { label: "totalMyr", value: inv.exchange.totalMyr, strong: true }]
		: [];

	return (
		<>
			<DocStack>
				<Letterhead title={inv.title ?? "taxInvoice"} number={inv.number} subtitle={inv.subtitle} />
				<DocumentMeta items={meta} />
				<PartyGrid parties={[{ heading: "billTo", party: inv.billTo }, ...(inv.shipTo ? [{ heading: "shipTo", party: inv.shipTo }] : [])]} />
				<DocumentTable numbered columns={columns} rows={inv.lines} />
				<div className="flex flex-col gap-[3.5mm]">
					<TotalsBlock
						rows={localiseRows(inv.totals, t)}
						currency={currency}
						words={inv.amountInWords !== false}
						aside={
							inv.payment && (
								<PaymentBlock
									bankName={inv.payment.bankName}
									accountName={inv.payment.accountName}
									accountNumber={inv.payment.accountNumber}
									swiftCode={inv.payment.swiftCode}
									reference={inv.payment.reference ?? inv.number}
									note={inv.payment.note}
									qr={inv.payment.qr}
								/>
							)
						}
					/>
					{inv.exchange && foreign && <ForeignCurrencyNote className="ml-auto w-[78mm]" currency={currency} rate={inv.exchange.rate} rateDate={inv.exchange.rateDate} source={inv.exchange.source} rows={fxRows} />}
				</div>
				{(inv.notes || inv.termsAndConditions) && (
					<DocColumns>
						{inv.notes && <NotesBlock>{inv.notes}</NotesBlock>}
						{inv.termsAndConditions && <NotesBlock title="termsAndConditions">{inv.termsAndConditions}</NotesBlock>}
					</DocColumns>
				)}
				{(inv.einvoice || sig) && (
					<div className="cy-doc-break-avoid flex items-end justify-between gap-10">
						<div className="min-w-0 flex-1">{inv.einvoice && <EInvoiceBlock {...inv.einvoice} />}</div>
						{sig && <SignatureBlock className="w-[64mm] grid-cols-1" signatories={[sig]} />}
					</div>
				)}
			</DocStack>
			<DocumentFooter hideNotice={!!sig} />
		</>
	);
}

/* ═════════════ 2 · Quotation ═════════════ */

export type QuotationSection = {
	/** "Phase 1 · Installation" */
	title: string;
	lines: SalesDocLine[];
	/** Section subtotal, as posted. */
	subtotal?: string;
};

export type QuotationData = {
	number: string;
	status?: "draft" | "sent" | "accepted" | "declined" | "expired";
	subtitle?: string;
	date: string;
	validUntil: string;
	reference?: string;
	/** Payment terms, e.g. "50% deposit, balance on completion". */
	terms?: string;
	currency?: string;
	/** Who prepared it (shown in meta). */
	preparedBy?: string;
	customer: DocParty;
	/** Site / delivery address when different. */
	shipTo?: DocParty;
	/** Flat lines — or `sections` for grouped lines with subtotals. */
	lines?: SalesDocLine[];
	sections?: QuotationSection[];
	/** Optional add-ons, priced but not included in the total. */
	optionalItems?: SalesDocLine[];
	totals: TotalsRow[];
	amountInWords?: boolean;
	notes?: string;
	/** Numbered when given as a list. */
	termsAndConditions?: string | string[];
	/** Customer acceptance block. Default shown; `false` hides it. */
	acceptance?: boolean | { statement?: string; name?: string; date?: string };
	/** Issuer's signature. `true` uses the brand's signatory. Default true. */
	signature?: DocSignatory | boolean;
};

export type QuotationDocumentProps = SalesDocPresentation & { quotation: QuotationData; size?: "a4" | "letter" };

/** Quotation: grouped lines with subtotals, optional items, T&Cs, and customer acceptance beside the issuer's signature. */
export function QuotationDocument({ quotation: q, size = "a4", brand, stamp, fit, isolate, className }: QuotationDocumentProps) {
	const st = stamp !== undefined ? stamp ?? undefined : q.status === "draft" ? "draft" : q.status === "declined" || q.status === "expired" ? "void" : undefined;
	return (
		<DocumentPage brand={brand} size={size} stamp={st} fit={fit} isolate={isolate} className={className}>
			<QuotationBody q={q} />
		</DocumentPage>
	);
}

function QuotationBody({ q }: { q: QuotationData }) {
	const t = useDocLabel();
	const { locale, company, signature: brandSig } = useDocumentBrand();
	const currency = q.currency ?? "MYR";
	const all = [...(q.lines ?? []), ...(q.sections ?? []).flatMap((s) => s.lines), ...(q.optionalItems ?? [])];
	const columns = useLineColumns(all);
	const sections: DocTableSection<SalesDocLine>[] = q.sections?.length
		? q.sections.map((s) => ({ title: s.title, rows: s.lines, subtotal: s.subtotal != null ? <SectionSubtotal label={<>{t("subtotal")} · {s.title.split("·")[0].trim()}</>} value={s.subtotal} /> : undefined }))
		: [{ rows: q.lines ?? [] }];
	if (q.optionalItems?.length)
		sections.push({
			title: (
				<>
					{t("optionalItems")}
					<span className="ml-2 font-normal tracking-normal normal-case text-[var(--doc-subtle)]">— {t("notIncluded")}</span>
				</>
			),
			rows: q.optionalItems,
		});
	const sig = signatoryFor(q.signature ?? true, brandSig);
	const acc = q.acceptance === false ? null : typeof q.acceptance === "object" ? q.acceptance : {};
	const tnc = q.termsAndConditions;

	return (
		<>
			<DocStack>
				<Letterhead title="quotation" number={q.number} subtitle={q.subtitle} />
				<DocumentMeta
					items={[
						{ label: "date", value: formatDocDate(q.date, locale) },
						{ label: "validUntil", value: formatDocDate(q.validUntil, locale), emphasis: true },
						{ label: "reference", value: q.reference },
						{ label: "terms", value: q.terms },
						...(currency !== "MYR" ? [{ label: "currency", value: currency }] : []),
						...(q.preparedBy ? [{ label: "preparedBy", value: q.preparedBy }] : []),
					]}
				/>
				<PartyGrid parties={[{ heading: "customer", party: q.customer }, ...(q.shipTo ? [{ heading: t("deliverTo"), party: q.shipTo }] : [])]} />
				<DocumentTable numbered columns={columns} sections={sections} />
				<TotalsBlock rows={localiseRows(q.totals, t)} currency={currency} words={q.amountInWords !== false} aside={q.notes && <NotesBlock>{q.notes}</NotesBlock>} />
				{tnc && (Array.isArray(tnc) ? tnc.length > 0 : tnc) && (
					<DocSection title="termsAndConditions">
						{Array.isArray(tnc) ? (
							<ol className="grid list-decimal grid-cols-2 gap-x-8 gap-y-[1mm] pl-[4mm] text-[7.5pt] leading-[1.55] text-[var(--doc-muted)] marker:text-[var(--doc-subtle)]">
								{tnc.map((c, i) => (
									<li key={i} className="pl-[1mm]">
										{c}
									</li>
								))}
							</ol>
						) : (
							<div className="text-[7.75pt] leading-[1.6] whitespace-pre-line text-[var(--doc-muted)]">{tnc}</div>
						)}
					</DocSection>
				)}
				{(sig || acc) && (
					<div className="cy-doc-break-avoid grid grid-cols-2 items-stretch gap-[12mm] pt-[2mm]">
						{sig ? (
							<AcceptanceBlock
								title={
									<>
										{t("forAndOnBehalf")} <span className="normal-case tracking-normal">{company.name}</span>
									</>
								}
								statement={null}
								signatureLabel={sig.label ?? "authorisedSignature"}
								signatureImage={sig.image}
								fields={[
									{ label: "name", value: sig.name },
									{ label: "designation", value: sig.title },
								]}
							/>
						) : (
							<div />
						)}
						{acc && (
							<AcceptanceBlock
								title="acceptance"
								statement={acc.statement ?? t("acceptanceStatement")}
								signatureLabel="customerSignature"
								stamp
								fields={[
									{ label: "name", value: acc.name },
									{ label: "date", value: acc.date ? formatDocDate(acc.date, locale) : undefined },
								]}
							/>
						)}
					</div>
				)}
			</DocStack>
			<DocumentFooter hideNotice />
		</>
	);
}

/* ═════════════ 3 · Credit / debit note ═════════════ */

export type AdjustmentNoteData = {
	kind: "credit" | "debit";
	number: string;
	status?: "draft" | "issued" | "void";
	date: string;
	currency?: string;
	customer: DocParty;
	/** The invoice this note adjusts. */
	originalInvoice: { number: string; date: string; amount: string };
	/** Why: a category ("Goods returned", "Price adjustment", "Additional charges") and a free-text explanation. */
	reason: { category?: string; text: string };
	reference?: string;
	lines: SalesDocLine[];
	/** Subtotal, SST adjusted, total; then settlement rows (applied to invoice, refunded) if any. */
	totals: TotalsRow[];
	amountInWords?: boolean;
	exchange?: TaxInvoiceData["exchange"];
	einvoice?: EInvoiceInfo;
	notes?: string;
	signature?: DocSignatory | boolean;
};

export type AdjustmentNoteDocumentProps = SalesDocPresentation & { note: AdjustmentNoteData; size?: "a4" | "letter" };

/** Credit note or debit note against an original invoice. Under MyInvois both are e-invoices in their own right. */
export function AdjustmentNoteDocument({ note, size = "a4", brand, stamp, fit, isolate, className }: AdjustmentNoteDocumentProps) {
	const st = stamp !== undefined ? stamp ?? undefined : note.status === "draft" ? "draft" : note.status === "void" ? "void" : undefined;
	return (
		<DocumentPage brand={brand} size={size} stamp={st} fit={fit} isolate={isolate} className={className}>
			<AdjustmentNoteBody n={note} />
		</DocumentPage>
	);
}

function AdjustmentNoteBody({ n }: { n: AdjustmentNoteData }) {
	const t = useDocLabel();
	const { locale, signature: brandSig } = useDocumentBrand();
	const currency = n.currency ?? "MYR";
	const columns = useLineColumns(n.lines);
	const sig = signatoryFor(n.signature, brandSig);
	return (
		<>
			<DocStack>
				<Letterhead title={n.kind === "credit" ? "creditNote" : "debitNote"} number={n.number} />
				<DocumentMeta
					items={[
						{ label: "date", value: formatDocDate(n.date, locale) },
						{
							label: t("originalInvoice"),
							value: (
								<>
									{n.originalInvoice.number}
									<span className="block text-[7.5pt] font-normal text-[var(--doc-muted)]">{formatDocDate(n.originalInvoice.date, locale)}</span>
								</>
							),
						},
						{ label: t("originalAmount"), value: <span className="cy-doc-num">{`${currencySymbol(currency)} ${formatDocAmount(n.originalInvoice.amount)}`}</span> },
						{ label: "reference", value: n.reference },
						...(currency !== "MYR" ? [{ label: "currency", value: currency }] : []),
					]}
				/>
				<div className="grid grid-cols-2 items-start gap-8">
					<PartyBlock heading="customer" party={n.customer} />
					<DocCallout>
						<DocLabel>{t("reason")}</DocLabel>
						{n.reason.category && <div className="mt-1.5 text-[9pt] leading-tight font-semibold">{n.reason.category}</div>}
						<div className="mt-1 text-[7.75pt] leading-[1.55] text-[var(--doc-muted)]">{n.reason.text}</div>
					</DocCallout>
				</div>
				<DocumentTable numbered columns={columns} rows={n.lines} />
				<div className="flex flex-col gap-[3.5mm]">
					<TotalsBlock rows={localiseRows(n.totals, t)} currency={currency} words={n.amountInWords !== false} aside={n.einvoice && <EInvoiceBlock {...n.einvoice} />} />
					{n.exchange && currency !== "MYR" && (
						<ForeignCurrencyNote
							className="ml-auto w-[78mm]"
							currency={currency}
							rate={n.exchange.rate}
							rateDate={n.exchange.rateDate}
							source={n.exchange.source}
							rows={[...(n.exchange.taxMyr ? [{ label: "sstMyr", value: n.exchange.taxMyr }] : []), { label: "totalMyr", value: n.exchange.totalMyr, strong: true }]}
						/>
					)}
				</div>
				{(n.notes || sig) && (
					<div className="cy-doc-break-avoid flex items-end justify-between gap-10">
						<div className="min-w-0 flex-1">{n.notes && <NotesBlock>{n.notes}</NotesBlock>}</div>
						{sig && <SignatureBlock className="w-[64mm] grid-cols-1" signatories={[sig]} />}
					</div>
				)}
			</DocStack>
			<DocumentFooter hideNotice={!!sig} />
		</>
	);
}

/* ═════════════ 4 · Official receipt ═════════════ */

export type ReceiptPaymentMethod = "cash" | "cheque" | "bank_transfer" | "duitnow" | "card" | "fpx";

export type ReceiptData = {
	number: string;
	status?: "issued" | "void" | "draft";
	date: string;
	currency?: string;
	receivedFrom: DocParty;
	payment: {
		method: ReceiptPaymentMethod;
		/** Cheque number (cheque). */
		chequeNo?: string;
		/** Drawee bank (cheque) or paying bank (transfer). */
		bank?: string;
		/** Transfer / DuitNow / FPX reference, or card approval code. */
		reference?: string;
		/** Card: "Visa •••• 4417". */
		card?: string;
	};
	/** The figure in the headline and in words, as posted (after rounding for cash). */
	amountReceived: string;
	/** Invoices this payment settles. */
	allocations?: Array<{ number: string; date?: string; invoiceAmount?: string; applied: string }>;
	/**
	 * Totals in print order, e.g. [{label:"total", value:"1284.42"}, {label:"rounding", value:"-0.02", kind:"rounding"},
	 * {label:"amountReceived", value:"1284.40", kind:"total"}]. Cash receipts carry the 5-sen rounding row.
	 */
	totals?: TotalsRow[];
	notes?: string;
	/** The person who received the payment. `true` uses the brand's signatory. A4 / A5 only. Default true. */
	receivedBy?: DocSignatory | boolean;
};

export type ReceiptDocumentProps = SalesDocPresentation & {
	receipt: ReceiptData;
	/** A4, A5, or an 80mm thermal roll ("receipt"). */
	size?: "a4" | "a5" | "receipt";
	/** Print in ink only (thermal printers are monochrome). Default: true for `size="receipt"`. */
	monochrome?: boolean;
};

const METHOD_KEY: Record<ReceiptPaymentMethod, DocLabelKey> = { cash: "cash", cheque: "cheque", bank_transfer: "bankTransfer", duitnow: "duitnow", card: "card", fpx: "fpx" };

/** Official receipt: A4 / A5 with allocation table and received-by signature, or a compact 80mm thermal slip. */
export function ReceiptDocument({ receipt, size = "a4", monochrome, brand, stamp, fit, isolate, className }: ReceiptDocumentProps) {
	const mono = monochrome ?? size === "receipt";
	const b = mono ? { ...brand, accent: "#16181d" } : brand;
	const st = stamp !== undefined ? stamp ?? undefined : receipt.status === "void" ? "void" : receipt.status === "draft" ? "draft" : undefined;
	return (
		<DocumentPage brand={b} size={size} stamp={st} fit={fit} isolate={isolate} className={className}>
			{size === "receipt" ? <ThermalReceiptBody r={receipt} /> : <ReceiptBody r={receipt} size={size} />}
		</DocumentPage>
	);
}

function usePaymentLines(r: ReceiptData) {
	const t = useDocLabel();
	const p = r.payment;
	const method = (
		<>
			{t(METHOD_KEY[p.method])}
			{p.card && <span className="font-normal text-[var(--doc-muted)]"> · {p.card}</span>}
		</>
	);
	const items: DocFieldItem[] = [{ label: t("paymentMethod"), value: method }];
	if (p.chequeNo) items.push({ label: t("chequeNo"), value: p.chequeNo });
	if (p.bank) items.push({ label: t("bank"), value: p.bank });
	if (p.reference) items.push({ label: t(p.method === "cheque" ? "reference" : "transactionRef"), value: p.reference });
	return items;
}

function ReceiptBody({ r, size }: { r: ReceiptData; size: "a4" | "a5" }) {
	const t = useDocLabel();
	const { locale, layout, signature: brandSig } = useDocumentBrand();
	const currency = r.currency ?? "MYR";
	const sym = currencySymbol(currency);
	const payLines = usePaymentLines(r);
	const signer = r.receivedBy === false ? null : r.receivedBy && r.receivedBy !== true ? { label: "receivedBy", ...r.receivedBy } : { label: "receivedBy", ...brandSig, image: brandSig?.image };
	const a5 = size === "a5";
	const allocations = r.allocations ?? [];
	const showInvAmt = hasAny(allocations, (a) => a.invoiceAmount);
	const allocCols: DocColumn<NonNullable<ReceiptData["allocations"]>[number]>[] = [
		{ key: "n", header: t("invoiceNo"), cell: (a) => <span className="font-medium">{a.number}</span> },
		{ key: "d", header: "invoiceDate", width: a5 ? "24mm" : "30mm", cell: (a) => formatDocDate(a.date, locale) },
		...(showInvAmt ? [{ key: "i", header: t("invoiceAmount"), numeric: true, width: a5 ? "26mm" : "32mm", cell: (a: { invoiceAmount?: string }) => formatDocAmount(a.invoiceAmount) }] : []),
		{ key: "a", header: t("amountApplied"), numeric: true, width: a5 ? "26mm" : "32mm", cell: (a) => <span className="font-medium">{formatDocAmount(a.applied)}</span> },
	];

	return (
		<>
			<DocStack gap={a5 ? "sm" : "md"}>
				<Letterhead title="officialReceipt" number={r.number} />
				<div className={cn("grid items-stretch", a5 ? "grid-cols-[1fr_auto] gap-5" : "grid-cols-[1fr_auto] gap-8")}>
					<div className="flex min-w-0 flex-col gap-[4mm]">
						<PartyBlock heading="receivedFrom" party={r.receivedFrom} />
					</div>
					<div
						className={cn(
							"flex flex-col justify-center text-right",
							a5 ? "min-w-[46mm]" : "min-w-[64mm]",
							layout === "modern" && "border-y border-[var(--doc-rule)] py-[4mm]",
							layout === "classic" && "border-y border-[var(--doc-rule-strong)] py-[3mm] [border-bottom-style:double] [border-bottom-width:3px]",
							layout === "minimal" && "border-t border-[var(--doc-rule-strong)] pt-[3mm]",
						)}
					>
						<DocLabel>{t("amountReceived")}</DocLabel>
						<div className={cn("cy-doc-num mt-[1.5mm] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap", a5 ? "text-[15pt]" : "text-[20pt]", layout === "classic" && "font-medium [font-family:var(--doc-display)]", layout !== "classic" && "text-[var(--doc-accent-text)]")}>
							<span className="mr-1.5 align-[0.2em] text-[0.45em] font-medium text-[var(--doc-muted)]">{sym}</span>
							{formatDocAmount(r.amountReceived)}
						</div>
					</div>
				</div>
				<div className={cn("grid gap-x-8 gap-y-3", a5 ? "grid-cols-2" : "grid-cols-[repeat(auto-fit,minmax(30mm,1fr))]", "border-y border-[var(--doc-rule)] py-[3mm]")}>
					{[{ label: t("receiptDate"), value: formatDocDate(r.date, locale) }, ...payLines].map((f, i) => (
						<div key={i} className="min-w-0">
							<DocLabel>{f.label as React.ReactNode}</DocLabel>
							<div className="mt-1 font-medium">{f.value}</div>
						</div>
					))}
				</div>
				<div className="text-[8pt] leading-[1.55]">
					<DocLabel className="mb-1">{t("theSumOf")}</DocLabel>
					<div className="text-[var(--doc-ink)] italic">{amountInWords(r.amountReceived, { currency, lang: locale === "ms" ? "ms" : "en" })}</div>
					{locale === "en-ms" && <div className="text-[var(--doc-muted)] italic">{amountInWords(r.amountReceived, { currency, lang: "ms" })}</div>}
				</div>
				{allocations.length > 0 && (
					<DocSection title={t("paymentFor")}>
						<DocumentTable dense={a5} columns={allocCols} rows={allocations} />
					</DocSection>
				)}
				{r.totals && r.totals.length > 0 && <TotalsBlock rows={localiseRows(r.totals, t)} currency={currency} aside={r.notes && <NotesBlock>{r.notes}</NotesBlock>} />}
				{!r.totals?.length && r.notes && <NotesBlock>{r.notes}</NotesBlock>}
				{signer && <SignatureBlock className={a5 ? "w-[56mm] grid-cols-1" : "w-[70mm] grid-cols-1"} signatories={[signer]} />}
			</DocStack>
			<DocumentFooter hideNotice={!!signer} />
		</>
	);
}

/** No aside on a thermal slip: drop the empty aside column's gap so totals sit right under the rule. */
const THERMAL_TOTALS = "[&>div:first-child]:gap-0";

function ThermalReceiptBody({ r }: { r: ReceiptData }) {
	const t = useDocLabel();
	const { locale } = useDocumentBrand();
	const currency = r.currency ?? "MYR";
	const payLines = usePaymentLines(r);
	const allocations = r.allocations ?? [];
	return (
		<>
			<div className="flex flex-col gap-[3mm]">
				<Letterhead title="officialReceipt" number={r.number} />
				<DocFields items={[{ label: t("date"), value: formatDocDate(r.date, locale) }, { label: t("receivedFrom"), value: r.receivedFrom.name, hint: r.receivedFrom.tin ? `TIN ${r.receivedFrom.tin}` : undefined }, ...payLines]} />
				{allocations.length > 0 && (
					<>
						<DocRule dashed />
						<div>
							<div className="mb-[1mm] text-[7pt] font-semibold tracking-[0.1em] uppercase">{t("paymentFor")}</div>
							{allocations.map((a, i) => (
								<div key={i} className="flex items-baseline justify-between gap-3 py-[0.6mm]">
									<span className="min-w-0">
										{a.number}
										{a.date && <span className="ml-1.5 text-[7.5pt] text-[var(--doc-muted)]">{formatDocDate(a.date, locale)}</span>}
									</span>
									<span className="cy-doc-num whitespace-nowrap">{formatDocAmount(a.applied)}</span>
								</div>
							))}
						</div>
					</>
				)}
				{(r.totals?.length ?? 0) > 1 && <DocRule dashed />}
				{r.totals && r.totals.length > 0 ? (
					<TotalsBlock className={THERMAL_TOTALS} rows={localiseRows(r.totals, t)} currency={currency} words />
				) : (
					<TotalsBlock className={THERMAL_TOTALS} rows={[{ label: "amountReceived", value: r.amountReceived, kind: "total" }]} currency={currency} words />
				)}
				{r.notes && (
					<>
						<DocRule dashed />
						<div className="text-center text-[7.5pt] leading-snug whitespace-pre-line text-[var(--doc-muted)]">{r.notes}</div>
					</>
				)}
			</div>
			<DocumentFooter className="pt-[3mm]" />
		</>
	);
}

/* ═════════════ 5 · Delivery order ═════════════ */

export type DeliveryOrderLine = {
	description: string;
	detail?: string;
	code?: string;
	unit?: string;
	ordered: string;
	delivered: string;
	/** Still to come. "0" or omitted prints a dash. */
	backOrdered?: string;
};

export type DeliveryOrderData = {
	number: string;
	status?: "draft" | "issued" | "delivered" | "void";
	date: string;
	deliveryDate?: string;
	/** Customer PO number. */
	reference?: string;
	salesOrder?: string;
	/** Invoice issued (or to be issued) for this delivery. */
	invoiceNo?: string;
	billTo: DocParty;
	shipTo: DocParty;
	vehicleNo?: string;
	driver?: string;
	lines: DeliveryOrderLine[];
	/** "14 cartons, 2 pallets" */
	packages?: string;
	/** "412.5 kg" */
	weight?: string;
	notes?: string;
	/** Issuer's signature. `true` uses the brand's signatory. Default true. */
	signature?: DocSignatory | boolean;
	/** Pre-filled receiver details (after delivery). */
	received?: { name?: string; icNo?: string; date?: string; signatureImage?: string };
};

export type DeliveryOrderDocumentProps = SalesDocPresentation & { order: DeliveryOrderData; size?: "a4" | "a5" | "letter" };

/** Delivery order: no prices; ordered / delivered / back-ordered quantities and a goods-received sign-off. */
export function DeliveryOrderDocument({ order, size = "a4", brand, stamp, fit, isolate, className }: DeliveryOrderDocumentProps) {
	const st = stamp !== undefined ? stamp ?? undefined : order.status === "draft" ? "draft" : order.status === "void" ? "void" : undefined;
	return (
		<DocumentPage brand={brand} size={size} stamp={st} fit={fit} isolate={isolate} className={className}>
			<DeliveryOrderBody o={order} />
		</DocumentPage>
	);
}

const isZero = (q?: string) => !q || /^0*(\.0*)?$/.test(q.trim());

function DeliveryOrderBody({ o }: { o: DeliveryOrderData }) {
	const t = useDocLabel();
	const { locale, company, signature: brandSig } = useDocumentBrand();
	const sig = signatoryFor(o.signature ?? true, brandSig);
	const showCode = hasAny(o.lines, (l) => l.code);
	const showUnit = hasAny(o.lines, (l) => l.unit);
	const anyBack = o.lines.some((l) => !isZero(l.backOrdered));
	const dash = <span className="text-[var(--doc-subtle)]">—</span>;
	const columns: DocColumn<DeliveryOrderLine>[] = [
		...(showCode ? [{ key: "code", header: "item" as const, width: "24mm", cell: (l: DeliveryOrderLine) => <span className="cy-doc-num text-[7.5pt] text-[var(--doc-muted)]">{l.code}</span> }] : []),
		{ key: "d", header: "description", cell: (l) => <DocItem title={l.description} detail={l.detail} /> },
		...(showUnit ? [{ key: "u", header: t("unit"), width: "14mm", align: "center" as const, cell: (l: DeliveryOrderLine) => <span className="text-[var(--doc-muted)]">{l.unit}</span> }] : []),
		{ key: "o", header: t("ordered"), numeric: true, width: "19mm", cell: (l) => <span className="text-[var(--doc-muted)]">{l.ordered}</span> },
		{ key: "v", header: t("delivered"), numeric: true, width: "20mm", cell: (l) => <span className="font-semibold">{l.delivered}</span> },
		...(anyBack ? [{ key: "b", header: t("backOrdered"), numeric: true, width: "27mm", cell: (l: DeliveryOrderLine) => (isZero(l.backOrdered) ? dash : <span className="font-semibold">{l.backOrdered}</span>) }] : []),
	];
	const logistics: DocFieldItem[] = [
		{ label: t("vehicleNo"), value: o.vehicleNo },
		{ label: t("driver"), value: o.driver },
		{ label: t("packages"), value: o.packages },
		{ label: t("totalWeight"), value: o.weight },
	];
	const hasLogistics = logistics.some((l) => l.value);

	return (
		<>
			<DocStack>
				<Letterhead title="deliveryOrder" number={o.number} />
				<DocumentMeta
					items={[
						{ label: t("doDate"), value: formatDocDate(o.date, locale) },
						{ label: "deliveryDate", value: formatDocDate(o.deliveryDate, locale), emphasis: true },
						{ label: t("purchaseOrderNo"), value: o.reference },
						{ label: t("salesOrder"), value: o.salesOrder },
						{ label: t("invoiceNo"), value: o.invoiceNo },
					]}
				/>
				<PartyGrid
					parties={[
						{ heading: t("deliverTo"), party: o.shipTo },
						{ heading: "billTo", party: o.billTo },
					]}
				/>
				<DocumentTable numbered columns={columns} rows={o.lines} />
				{(hasLogistics || o.notes) && (
					<div className="cy-doc-break-avoid grid grid-cols-[1.25fr_1fr] items-start gap-8">
						{hasLogistics ? (
							<DocCallout>
								<DocLabel className="mb-[2mm]">{t("deliveryDetails")}</DocLabel>
								<DocFields variant="columns" className="grid-cols-2 gap-y-[2.5mm]" items={logistics.map((l) => ({ ...l, label: <span className="text-[var(--doc-subtle)]">{l.label as React.ReactNode}</span> }))} />
							</DocCallout>
						) : (
							<div />
						)}
						{o.notes ? <NotesBlock>{o.notes}</NotesBlock> : <div />}
					</div>
				)}
				<div className="cy-doc-break-avoid grid grid-cols-2 items-stretch gap-[12mm] pt-[2mm]">
					{sig ? (
						<AcceptanceBlock
							title={
								<>
									{t("issuedBy")} · <span className="normal-case tracking-normal">{company.name}</span>
								</>
							}
							statement={null}
							signatureLabel={sig.label ?? "authorisedSignature"}
							signatureImage={sig.image}
							fields={[
								{ label: "name", value: sig.name },
								{ label: "date", value: sig.date ?? formatDocDate(o.date, locale) },
							]}
						/>
					) : (
						<div />
					)}
					<AcceptanceBlock
						title="goodsReceived"
						statement={t("goodsReceivedStatement")}
						signatureLabel="receiverSignature"
						signatureImage={o.received?.signatureImage}
						stamp
						fields={[
							{ label: "name", value: o.received?.name },
							{ label: "icNo", value: o.received?.icNo },
							{ label: "date", value: o.received?.date ? formatDocDate(o.received.date, locale) : undefined },
						]}
					/>
				</div>
			</DocStack>
			<DocumentFooter hideNotice />
		</>
	);
}
