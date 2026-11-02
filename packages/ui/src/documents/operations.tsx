/**
 * Cynco UI — operational documents, assembled from the document kit (./documents via ./shared).
 *
 *   PurchaseOrderDocument      — purchase order to a vendor (A4)
 *   PaymentVoucherDocument     — payment voucher with the approval chain (A4)
 *   StatementOfAccountDocument — customer / vendor statement with aging and a tear-off remittance slip (A4, multi-page)
 *   PayslipDocument            — Malaysian payslip: EPF / SOCSO / EIS / PCB / zakat / HRDF (A4 or A5)
 *
 * Each document takes ONE typed data prop and the usual presentation props (brand, size, stamp, fit, isolate).
 * Money arrives as decimal strings and is printed as given: totals, balances and statutory amounts are fields
 * of the data, never recomputed here.
 *
 * Parts in this file that other documents can use (candidates for the kit):
 *   useDocLabel / DocText  — extra bilingual labels (and inline {en, ms} text) with the kit's conventions
 *   DocFieldGrid              — label/value pairs in 1–4 columns (employee details, bank details)
 *   DocFigureStrip            — a row of key figures, one emphasised (aging buckets → total due; gross → net pay)
 *   DocAmountWords            — "Ringgit Malaysia … Only" for any amount, EN / BM / bilingual
 *   DocRemittanceSlip         — tear-off remittance advice with a dashed cut line
 */
import * as React from "react";
import { ScissorsIcon } from "@phosphor-icons/react";
import { cn } from "../base";
import {
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
	NotesBlock,
	SignatureBlock,
	DocumentFooter,
	DocStack,
	DocColumns,
	useDocumentBrand,
	DocFields,
	DocFigureStrip,
	DocAmountWords,
	DocSignedFigure,
	type DocFieldItem,
	type DocText,
	type DocFigure,
	useDocLabel,
	formatDocDate,
	formatDocAmount,
	currencySymbol,
	amountInWords,
	type DocBrand,
	type DocParty,
	type DocSignatory,
	type DocumentStamp,
	type DocColumn,
	type DocLabelKey,
	type TotalsRow,
	type DocumentMetaItem,
} from "../lib/shared";

/* ═════════════ Shared types ═════════════ */

/** Presentation props every document here accepts. */
export type OpsDocumentProps = {
	/** Overrides the provider's brand (merged over it). */
	brand?: Partial<DocBrand>;
	stamp?: DocumentStamp;
	fit?: "width" | "none";
	isolate?: boolean;
	className?: string;
};

/** Posted totals, printed as given. Discounts arrive negative ("-120.00"). */
export type OpsDocTotals = {
	subtotal?: string;
	discount?: string;
	discountLabel?: DocText;
	/** One row per tax rate: `{ label: "SST", rate: 10, amount: "86.40" }`. */
	taxes?: Array<{ label?: DocText; rate?: string | number; amount: string }>;
	shipping?: string;
	rounding?: string;
	total: string;
};

function useTotalsRows(x: OpsDocTotals, totalLabel: DocLabelKey = "total"): TotalsRow[] {
	const L = useDocLabel();
	const rows: TotalsRow[] = [];
	if (x.subtotal != null) rows.push({ label: L("subtotal"), value: x.subtotal, kind: "subtotal" });
	if (x.discount != null) rows.push({ label: L(x.discountLabel ?? "discount"), value: x.discount, kind: "discount" });
	for (const tx of x.taxes ?? []) rows.push({ label: L(tx.label ?? "sst"), hint: tx.rate != null ? `${tx.rate}%` : undefined, value: tx.amount, kind: "tax" });
	if (x.shipping != null) rows.push({ label: L("shipping"), value: x.shipping, kind: "line" });
	if (x.rounding != null) rows.push({ label: L("rounding"), value: x.rounding, kind: "rounding" });
	rows.push({ label: L(totalLabel), value: x.total, kind: "total" });
	return rows;
}

/** "1 – 31 Oct 2026", "15 Sep – 14 Oct 2026", "1 Dec 2025 – 31 Jan 2026". */
function period(from: string, to: string, locale: Parameters<typeof formatDocDate>[1]) {
	const a = formatDocDate(from, locale).split(" "), b = formatDocDate(to, locale);
	const [, bm, by] = b.split(" ");
	if (a.length === 3 && a[2] === by) return a[1] === bm ? `${a[0]} – ${b}` : `${a[0]} ${a[1]} – ${b}`;
	return `${a.join(" ")} – ${b}`;
}

/** Display sign only: a positive credit shown in brackets in a summary. Never used to compute. */
const asNegative = (v: string) => (v.trim().startsWith("-") ? v : `-${v.trim()}`);

/* ═════════════ Parts ═════════════ */

export type DocRemittanceSlipProps = {
	/** Who the payment goes to; defaults to the brand's company. */
	payTo?: React.ReactNode;
	/** Customer, account no., statement date… */
	fields: DocFieldItem[];
	/** Decimal string, printed as given. */
	amountDue: string;
	currency?: string;
	/** A short line under the slip (cheque payee, bank account, reference to quote). */
	note?: React.ReactNode;
	className?: string;
};

/** Tear-off remittance advice: a dashed cut line, who is paying and how much, and a blank for the amount enclosed. */
export function DocRemittanceSlip({ payTo, fields, amountDue, currency = "MYR", note, className }: DocRemittanceSlipProps) {
	const { company, layout } = useDocumentBrand();
	const L = useDocLabel();
	const sym = currencySymbol(currency);
	return (
		<section data-slot="cy-doc-remittance" className={cn("cy-doc-break-avoid mt-[7mm]", className)}>
			{/* The cut line is decoration; the instruction on it is content. */}
			<div className="flex items-center gap-[2mm] text-[6.5pt] text-[var(--doc-subtle)]">
				<ScissorsIcon size={11} weight="regular" className="shrink-0 -scale-x-100" aria-hidden="true" />
				<div aria-hidden="true" className="h-0 flex-1 border-t border-dashed border-[var(--doc-subtle)]" />
				<span className="shrink-0 tracking-[0.04em]">{L("detachAndReturn")}</span>
				<div aria-hidden="true" className="h-0 w-[10mm] border-t border-dashed border-[var(--doc-subtle)]" />
			</div>
			<div className="mt-[4.5mm] grid grid-cols-[1.25fr_1fr] gap-[8mm]">
				<div className="min-w-0">
					<h2>
						<DocLabel>{L("remittanceAdvice")}</DocLabel>
					</h2>
					<div className="mt-[1.5mm] text-[7.5pt] text-[var(--doc-muted)]">
						{L("payTo")} <span className="font-semibold text-[var(--doc-ink)]">{payTo ?? company.name}</span>
					</div>
					<DocFields variant="grid" items={fields} columns={2} className="mt-[3mm]" />
					{note && <div className="mt-[3mm] text-[7pt] leading-snug text-[var(--doc-muted)]">{note}</div>}
				</div>
				<dl className="flex flex-col gap-[2mm] self-start">
					<div className={cn("flex items-baseline justify-between gap-4 px-[3.5mm] py-[2.4mm]", "border-b border-[var(--doc-rule)]", layout !== "modern" && "px-0")}>
						<dt className="text-[7pt] font-semibold tracking-[0.08em] text-[var(--doc-muted)] uppercase">{L("amountDue")}</dt>
						<dd className={cn("cy-doc-num text-[11pt] font-semibold whitespace-nowrap", layout === "classic" && "[font-family:var(--doc-display)]")}>
							<span className="mr-1 text-[7.5pt] font-medium text-[var(--doc-muted)]">{sym}</span>
							{formatDocAmount(amountDue)}
						</dd>
					</div>
					<div className={cn("flex items-end justify-between gap-4 px-[3.5mm] pt-[2.4mm] pb-[2mm]", layout === "modern" ? "rounded-[2mm] border border-[var(--doc-rule)]" : "border-b border-[var(--doc-rule-strong)] px-0")}>
						<dt className="pb-[0.4mm] text-[7pt] font-semibold tracking-[0.08em] text-[var(--doc-muted)] uppercase">{L("amountEnclosed")}</dt>
						<dd className="flex h-[7mm] min-w-[34mm] items-end gap-1 text-[7.5pt] text-[var(--doc-muted)]">
							{sym}
							<span className="mb-[0.6mm] flex-1 border-b border-dotted border-[var(--doc-subtle)]" />
						</dd>
					</div>
				</dl>
			</div>
		</section>
	);
}

/* ═════════════ 1 · Purchase order ═════════════ */

export type PurchaseOrderLine = {
	itemCode?: string;
	description: string;
	/** Quieter second line: spec, brand, pack size. */
	detail?: string;
	/** Decimal string, e.g. "40" or "12.5". */
	quantity: string;
	/** "bag", "ctn", "pcs", "kg". */
	unit?: string;
	unitPrice: string;
	/** Rate in percent (5, 10 for sales tax; 8 for service tax). Omit for exempt / no tax. */
	taxRate?: string | number;
	/** Tax code shown under the rate, e.g. "ST10", "SV8", "EX". */
	taxCode?: string;
	/** Line amount before tax, as posted. */
	amount: string;
};

export type PurchaseOrderData = {
	number: string;
	/** ISO date. */
	date: string;
	requiredBy?: string;
	terms?: string;
	/** The vendor's quotation this PO accepts. */
	quotationRef?: string;
	requester?: { name: string; department?: string };
	currency?: string;
	/** Line under the number, e.g. "Revision 1". */
	revision?: string;
	vendor: DocParty;
	deliverTo: DocParty;
	lines: PurchaseOrderLine[];
	totals: OpsDocTotals;
	deliveryInstructions?: string;
	termsAndConditions?: string;
	notes?: string;
	preparedBy?: DocSignatory;
	approvedBy?: DocSignatory;
	/** Vendor acknowledgement line (adds a third signature). */
	acceptedBy?: DocSignatory | true;
};

function PurchaseOrderBody({ order }: { order: PurchaseOrderData }) {
	const { locale } = useDocumentBrand();
	const L = useDocLabel();
	const currency = order.currency ?? "MYR";
	const rows = useTotalsRows(order.totals);

	const columns: DocColumn<PurchaseOrderLine>[] = [
		{ key: "code", header: L("itemCode"), width: "25mm", cell: (r) => <span className="cy-doc-num text-[7.25pt] whitespace-nowrap text-[var(--doc-muted)]">{r.itemCode}</span> },
		{ key: "desc", header: L("description"), cell: (r) => <DocItem title={r.description} detail={r.detail} /> },
		{
			key: "qty",
			header: L("qty"),
			numeric: true,
			width: "21mm",
			cell: (r) => (
				<>
					{r.quantity}
					{r.unit && <span className="ml-1 text-[7.5pt] text-[var(--doc-muted)]">{r.unit}</span>}
				</>
			),
		},
		{ key: "price", header: L("unitPrice"), numeric: true, width: "23mm", cell: (r) => formatDocAmount(r.unitPrice) },
		{
			key: "tax",
			header: L("tax"),
			numeric: true,
			width: "14mm",
			cell: (r) =>
				r.taxRate != null && Number(r.taxRate) !== 0 ? (
					<>
						{r.taxRate}%{r.taxCode && <div className="text-[6.75pt] text-[var(--doc-subtle)]">{r.taxCode}</div>}
					</>
				) : (
					<span className="text-[var(--doc-subtle)]">{r.taxCode ?? "—"}</span>
				),
		},
		{ key: "amt", header: L("amount"), numeric: true, width: "25mm", cell: (r) => formatDocAmount(r.amount) },
	];

	const meta: DocumentMetaItem[] = [
		{ label: L("poDate"), value: formatDocDate(order.date, locale) },
		{ label: L("requiredBy"), value: formatDocDate(order.requiredBy, locale), emphasis: true },
		{ label: L("terms"), value: order.terms },
		{ label: L("quotationRef"), value: order.quotationRef },
		{
			label: L("requestedBy"),
			value: order.requester && (
				<>
					{order.requester.name}
					{order.requester.department && <div className="text-[7.5pt] font-normal text-[var(--doc-muted)]">{order.requester.department}</div>}
				</>
			),
		},
	];

	const signatories: DocSignatory[] = [
		{ ...order.preparedBy, label: L("preparedBy") },
		{ ...order.approvedBy, label: L("approvedBy") },
	];
	if (order.acceptedBy) signatories.push({ ...(order.acceptedBy === true ? {} : order.acceptedBy), label: L("acceptedBy") });

	return (
		<>
			<DocStack gap="sm">
				<Letterhead title="purchaseOrder" number={order.number} subtitle={order.revision} />
				<DocumentMeta items={meta} />
				<PartyGrid
					parties={[
						{ heading: L("vendor"), party: order.vendor },
						{ heading: L("deliverTo"), party: order.deliverTo },
					]}
				/>
				<DocumentTable numbered dense columns={columns} rows={order.lines} />
				{/* Instructions, terms and notes share the space beside the totals. */}
				<TotalsBlock
					rows={rows}
					currency={currency}
					words
					aside={
						(order.deliveryInstructions || order.termsAndConditions || order.notes) && (
							<DocStack gap="sm">
								{order.deliveryInstructions && <NotesBlock title={L("deliveryInstructions")}>{order.deliveryInstructions}</NotesBlock>}
								{order.termsAndConditions && <NotesBlock title="termsAndConditions">{order.termsAndConditions}</NotesBlock>}
								{order.notes && <NotesBlock title="notes">{order.notes}</NotesBlock>}
							</DocStack>
						)
					}
				/>
				<SignatureBlock signatories={signatories} />
			</DocStack>
			<DocumentFooter hideNotice className="pt-[4mm]" />
		</>
	);
}

/** A purchase order to a vendor: deliver-to, required-by date, requester, priced lines with SST, posted totals, terms and signatures. */
export function PurchaseOrderDocument({ order, size = "a4", brand, stamp, fit, isolate, className }: OpsDocumentProps & { order: PurchaseOrderData; size?: "a4" | "letter" }) {
	return (
		<DocumentPage brand={brand} size={size} stamp={stamp} fit={fit} isolate={isolate} className={className}>
			<PurchaseOrderBody order={order} />
		</DocumentPage>
	);
}

/* ═════════════ 2 · Payment voucher ═════════════ */

export type PaymentVoucherMethod = {
	kind: "bank_transfer" | "cheque" | "cash" | "duitnow" | "card";
	/** Cheque number (cheque payments). */
	chequeNo?: string;
	/** The bank the cheque is drawn on, or the transfer rail ("IBG", "DuitNow Transfer"). */
	bank?: string;
	/** Bank transfer reference / transaction ID. */
	reference?: string;
};

export type PaymentVoucherLine = {
	/** Bill / invoice number being paid, or a claim reference. */
	reference?: string;
	/** Date of the bill. */
	date?: string;
	description: string;
	detail?: string;
	accountCode?: string;
	accountName?: string;
	amount: string;
};

export type PaymentVoucherData = {
	number: string;
	/** Payment date (ISO). */
	date: string;
	method: PaymentVoucherMethod;
	/** The company's bank / cash account the money left: "Petty cash", or `{ name: "Maybank Current", accountNumber: "5140 1234 5678" }`. */
	paidFrom?: string | { name: string; accountNumber?: string };
	currency?: string;
	payee: DocParty;
	payeeBank?: { bankName?: string; accountName?: string; accountNumber?: string; swiftCode?: string };
	/** "Being payment for …" — the purpose in one line. */
	memo?: string;
	lines: PaymentVoucherLine[];
	totals: OpsDocTotals;
	notes?: string;
	preparedBy?: DocSignatory;
	checkedBy?: DocSignatory;
	approvedBy?: DocSignatory;
	receivedBy?: DocSignatory;
};

const METHOD_LABEL: Record<PaymentVoucherMethod["kind"], DocLabelKey> = { bank_transfer: "bankTransfer", cheque: "cheque", cash: "cash", duitnow: "duitnow", card: "card" };

function PaymentVoucherBody({ voucher }: { voucher: PaymentVoucherData }) {
	const { locale } = useDocumentBrand();
	const L = useDocLabel();
	const currency = voucher.currency ?? "MYR";
	const rows = useTotalsRows(voucher.totals, "totalPaid");
	const m = voucher.method;

	const meta: DocumentMetaItem[] = [
		{ label: L("paymentDate"), value: formatDocDate(voucher.date, locale) },
		{
			label: L("method"),
			value: (
				<>
					{L(METHOD_LABEL[m.kind])}
					{m.bank && <div className="text-[7.5pt] font-normal text-[var(--doc-muted)]">{m.bank}</div>}
				</>
			),
		},
		m.kind === "cheque" ? { label: L("chequeNo"), value: m.chequeNo, emphasis: true } : { label: L("transactionRef"), value: m.reference },
		{
			label: L("paidFrom"),
			value:
				typeof voucher.paidFrom === "object" ? (
					<>
						{voucher.paidFrom.name}
						{voucher.paidFrom.accountNumber && <div className="cy-doc-num text-[7.5pt] font-normal text-[var(--doc-muted)]">{voucher.paidFrom.accountNumber}</div>}
					</>
				) : (
					voucher.paidFrom
				),
		},
	];

	const columns: DocColumn<PaymentVoucherLine>[] = [
		{
			key: "ref",
			header: L("reference"),
			width: "30mm",
			cell: (r) => (
				<div>
					<div className="cy-doc-num font-medium">{r.reference}</div>
					{r.date && <div className="mt-0.5 text-[7.5pt] text-[var(--doc-muted)]">{formatDocDate(r.date, locale)}</div>}
				</div>
			),
		},
		{ key: "desc", header: L("description"), cell: (r) => <DocItem title={r.description} detail={r.detail} /> },
		{
			key: "acct",
			header: L("account"),
			width: "38mm",
			cell: (r) => (
				<div>
					<div className="cy-doc-num text-[8pt] tracking-[0.02em]">{r.accountCode}</div>
					{r.accountName && <div className="mt-0.5 text-[7.5pt] leading-snug text-[var(--doc-muted)]">{r.accountName}</div>}
				</div>
			),
		},
		{ key: "amt", header: L("amount"), numeric: true, width: "27mm", cell: (r) => <DocSignedFigure text={formatDocAmount(r.amount, { brackets: true })} /> },
	];

	const bank = voucher.payeeBank;
	const sign = (s: DocSignatory | undefined, label: DocLabelKey): DocSignatory => ({ ...s, label: L(label) });

	return (
		<>
			<DocStack gap="sm">
				<Letterhead title="paymentVoucher" number={voucher.number} />
				<DocumentMeta items={meta} />
				<div className="grid grid-cols-[1.15fr_1fr] gap-[8mm]">
					<PartyBlock heading={L("payee")} party={voucher.payee} />
					{bank && (
						<DocSection title={L("payeeBank")}>
							<DocFields variant="grid"
								columns={2}
								className="mt-[1mm]"
								items={[
									{ label: "bank", value: bank.bankName },
									{ label: "accountNo", value: bank.accountNumber, figures: true },
									{ label: "accountName", value: bank.accountName, span: 2 },
									{ label: "SWIFT", value: bank.swiftCode, figures: true },
								]}
							/>
						</DocSection>
					)}
				</div>
				{voucher.memo && (
					<DocSection title={L("beingPaymentFor")}>
						<div className={cn("text-[9pt] leading-snug")}>{voucher.memo}</div>
					</DocSection>
				)}
				<DocumentTable numbered columns={columns} rows={voucher.lines} />
				<TotalsBlock rows={rows} currency={currency} words aside={voucher.notes ? <NotesBlock>{voucher.notes}</NotesBlock> : undefined} />
				<SignatureBlock
					className="mt-[3mm] grid-cols-4 gap-[6mm]"
					signatories={[sign(voucher.preparedBy, "preparedBy"), sign(voucher.checkedBy, "checkedBy"), sign(voucher.approvedBy, "approvedBy"), sign(voucher.receivedBy, "receivedBy")]}
				/>
			</DocStack>
			<DocumentFooter hideNotice className="pt-[4mm]" />
		</>
	);
}

/** A payment voucher: payee and bank details, method (transfer / cheque / cash), the bills paid with account codes, total in words and four signatures. */
export function PaymentVoucherDocument({ voucher, size = "a4", brand, stamp, fit, isolate, className }: OpsDocumentProps & { voucher: PaymentVoucherData; size?: "a4" | "letter" }) {
	return (
		<DocumentPage brand={brand} size={size} stamp={stamp} fit={fit} isolate={isolate} className={className}>
			<PaymentVoucherBody voucher={voucher} />
		</DocumentPage>
	);
}

/* ═════════════ 3 · Statement of account ═════════════ */

export type StatementTransactionRow = {
	date: string;
	/** A label key ("invoice", "payment", "creditNote", "debitNote", "refund", "journal") or any text. */
	type: DocLabelKey | DocText;
	number?: string;
	description?: string;
	debit?: string;
	credit?: string;
	/** Running balance as posted. */
	balance: string;
};

export type StatementAging = { current: string; days1to30: string; days31to60: string; days61to90: string; days90plus: string };

export type StatementOfAccountData = {
	number?: string;
	/** Statement date (ISO). */
	date: string;
	periodFrom: string;
	periodTo: string;
	accountNo?: string;
	terms?: string;
	currency?: string;
	/** "customer" (default) prints a remittance slip; "vendor" doesn't. */
	role?: "customer" | "vendor";
	party: DocParty;
	openingBalance: string;
	/** Period totals for the summary (optional). */
	totalDebit?: string;
	totalCredit?: string;
	closingBalance: string;
	transactions: StatementTransactionRow[];
	aging: StatementAging;
	totalDue: string;
	payment?: { bankName?: string; accountName?: string; accountNumber?: string; reference?: string; qr?: React.ReactNode };
	notes?: string;
	/** Force the remittance slip on/off (default: on for customers). */
	remittance?: boolean;
};

type StatementLine = StatementTransactionRow & { opening?: true };

function StatementOfAccountBody({ statement: s }: { statement: StatementOfAccountData }) {
	const { locale } = useDocumentBrand();
	const L = useDocLabel();
	const currency = s.currency ?? "MYR";
	const role = s.role ?? "customer";
	const remittance = s.remittance ?? role === "customer";
	const amt = (v?: string) => (v == null ? "" : formatDocAmount(v, { zero: "" }));

	const columns: DocColumn<StatementLine>[] = [
		{ key: "date", header: L("date"), width: "19mm", cell: (r) => <span className="cy-doc-num whitespace-nowrap">{formatDocDate(r.date, locale)}</span> },
		{ key: "type", header: L("type"), width: "21mm", cell: (r) => (r.opening ? "" : <span className="text-[var(--doc-muted)]">{L(r.type, { stacked: true })}</span>) },
		{ key: "no", header: L("number"), width: "23mm", cell: (r) => <span className="cy-doc-num font-medium whitespace-nowrap">{r.number}</span> },
		{ key: "desc", header: L("description"), cell: (r) => (r.opening ? <span className="text-[var(--doc-muted)] italic">{L("balanceBroughtForward")}</span> : <span className="text-[var(--doc-muted)]">{r.description}</span>) },
		{ key: "dr", header: L("debit"), numeric: true, width: "19mm", cell: (r) => amt(r.debit) },
		{ key: "cr", header: L("credit"), numeric: true, width: "19mm", cell: (r) => amt(r.credit) },
		{ key: "bal", header: L("balance"), numeric: true, width: "21mm", cell: (r) => (
				<span className="font-medium">
					<DocSignedFigure text={formatDocAmount(r.balance, { brackets: true })} />
				</span>
			),
		},
	];

	const lines: StatementLine[] = [{ opening: true, date: s.periodFrom, type: "", balance: s.openingBalance }, ...s.transactions];

	const summary: TotalsRow[] = [{ label: L("openingBalance"), value: s.openingBalance, kind: "line" }];
	if (s.totalDebit != null) summary.push({ label: L("invoicesAndCharges"), value: s.totalDebit, kind: "line" });
	if (s.totalCredit != null) summary.push({ label: L("paymentsAndCredits"), value: asNegative(s.totalCredit), kind: "paid" });
	summary.push({ label: L("closingBalance"), value: s.closingBalance, kind: "balance" });

	const a = s.aging;

	return (
		<>
			<DocStack gap="sm">
				<Letterhead title="statementOfAccount" number={s.number} />
				<DocumentMeta
					items={[
						{ label: L("statementDate"), value: formatDocDate(s.date, locale) },
						{ label: L("period"), value: period(s.periodFrom, s.periodTo, locale) },
						{ label: L("accountNo"), value: s.accountNo },
						{ label: L("terms"), value: s.terms },
						{ label: L("currency"), value: currency === "MYR" ? "MYR (RM)" : currency },
					]}
				/>
				<TotalsBlock rows={summary} currency={currency} aside={<PartyBlock heading={L(role === "vendor" ? "vendor" : "customer")} party={s.party} />} />
				<DocumentTable
					dense
					columns={columns}
					sections={[
						{
							rows: lines,
							subtotal: (
								<div className="flex items-baseline justify-between gap-4">
									<span>
										{L("closingBalance")}
										<span className="ml-1.5 font-normal text-[var(--doc-subtle)]">
											{L("asAt")} {formatDocDate(s.periodTo, locale)}
										</span>
									</span>
									<span className="cy-doc-num">
										<DocSignedFigure text={formatDocAmount(s.closingBalance, { brackets: true })} />
									</span>
								</div>
							),
						},
					]}
				/>
				<DocSection title={L("aging")}>
					<DocFigureStrip
						currency={currency}
						zero="—"
						items={[
							{ label: "current", value: a.current },
							{ label: "days1to30", value: a.days1to30 },
							{ label: "days31to60", value: a.days31to60 },
							{ label: "days61to90", value: a.days61to90 },
							{ label: "days90plus", value: a.days90plus },
							{ label: "totalDue", value: s.totalDue, emphasis: true },
						]}
					/>
				</DocSection>
				{(s.payment || s.notes) && (
					<DocColumns>
						{s.payment ? <PaymentBlock {...s.payment} /> : <div />}
						{s.notes && <NotesBlock>{s.notes}</NotesBlock>}
					</DocColumns>
				)}
			</DocStack>
			<DocumentFooter />
			{remittance && (
				<DocRemittanceSlip
					amountDue={s.totalDue}
					currency={currency}
					fields={[
						{ label: "customer", value: s.party.name, span: 2 },
						{ label: "accountNo", value: s.accountNo, figures: true },
						{ label: "statementDate", value: formatDocDate(s.date, locale) },
						{ label: "reference", value: s.number, figures: true },
					]}
					note={s.payment?.bankName && s.payment.accountNumber ? `${s.payment.bankName} ${s.payment.accountNumber}${s.payment.accountName ? ` · ${s.payment.accountName}` : ""}` : undefined}
				/>
			)}
		</>
	);
}

/**
 * A statement of account: period, opening balance, transactions with running balance (printed as given),
 * closing balance, an aging strip ending in the total due, and a tear-off remittance slip.
 * Long statements flow onto more pages; the table header repeats on each printed page.
 */
export function StatementOfAccountDocument({ statement, size = "a4", brand, stamp, fit, isolate, className }: OpsDocumentProps & { statement: StatementOfAccountData; size?: "a4" | "letter" }) {
	return (
		<DocumentPage brand={brand} size={size} stamp={stamp} fit={fit} isolate={isolate} className={className}>
			<StatementOfAccountBody statement={statement} />
		</DocumentPage>
	);
}

/* ═════════════ 4 · Payslip ═════════════ */

export type PayslipLine = {
	/** A label key ("basicSalary", "overtime", "commission", "allowance", "epf", "socso", "eis", "pcb", "zakat", "advance", "hrdf"), `{ en, ms }`, or text. */
	label: DocLabelKey | DocText;
	/** Basis, e.g. "11% of RM 4,930.00" or "10.0 hrs × RM 30.29". */
	detail?: DocText;
	amount: string;
};

export type PayslipEmployee = {
	name: string;
	staffId?: string;
	icNo?: string;
	position?: string;
	department?: string;
	epfNo?: string;
	socsoNo?: string;
	taxNo?: string;
	bankName?: string;
	bankAccount?: string;
};

export type PayslipDocumentData = {
	number?: string;
	periodFrom: string;
	periodTo: string;
	payDate: string;
	currency?: string;
	/** Employer statutory numbers (the company itself comes from the brand). */
	employer?: { epfNo?: string; socsoNo?: string; taxNo?: string };
	employee: PayslipEmployee;
	earnings: PayslipLine[];
	deductions: PayslipLine[];
	employerContributions?: PayslipLine[];
	grossPay: string;
	totalDeductions: string;
	netPay: string;
	totalEmployerContributions?: string;
	/** Year-to-date figures, left to right (gross, EPF, SOCSO, EIS, PCB, zakat, net…). */
	ytd?: PayslipLine[];
	/** Replaces the default confidentiality note. */
	note?: React.ReactNode;
};

function PayslipBody({ payslip: p, size }: { payslip: PayslipDocumentData; size: "a4" | "a5" }) {
	const { locale } = useDocumentBrand();
	const L = useDocLabel();
	const currency = p.currency ?? "MYR";
	const a5 = size === "a5";
	// Bilingual payslips stack the line label (English, Malay beneath); the basis line stays in English to keep rows short.
	const detail = (d?: DocText) => (d == null ? undefined : typeof d === "object" && locale === "en-ms" ? d.en : L(d));
	const e = p.employee;

	const lineColumns: DocColumn<PayslipLine>[] = [
		// A5 drops the basis lines so the slip fits one half-sheet.
		{ key: "label", header: "", cell: (r) => <DocItem title={L(r.label, { stacked: true })} detail={a5 ? undefined : detail(r.detail)} /> },
		{ key: "amt", header: currencySymbol(currency), numeric: true, width: a5 ? "19mm" : "26mm", cell: (r) => formatDocAmount(r.amount) },
	];
	const ledger = (title: DocLabelKey, rows: PayslipLine[], totalLabel: DocLabelKey, total: string) => (
		<DocumentTable
			dense
			className={cn(a5 && "[&_td]:py-[1.15mm] [&_th]:py-[1.5mm]")}
			columns={[{ ...lineColumns[0], header: L(title) }, lineColumns[1]]}
			sections={[
				{
					rows,
					subtotal: (
						<div className="flex items-baseline justify-between gap-3">
							<span className="text-left">{L(totalLabel, { stacked: true })}</span>
							<span className="cy-doc-num">{formatDocAmount(total)}</span>
						</div>
					),
				},
			]}
		/>
	);

	const employerFields: DocFieldItem[] = [
		{ label: "employerEpfNo", value: p.employer?.epfNo, figures: true },
		{ label: "employerSocsoNo", value: p.employer?.socsoNo, figures: true },
		{ label: "employerTaxNo", value: p.employer?.taxNo, figures: true },
	];
	const hasEmployer = employerFields.some((f) => f.value);
	// A5: the employer's statutory numbers share the "Employee" label row, on one quiet line.
	const employerLine = hasEmployer && (
		<div className="flex flex-wrap justify-end gap-x-3 gap-y-0.5 text-[7pt] leading-tight text-[var(--doc-muted)]">
			<span className="text-[var(--doc-subtle)]">{L("employer")}</span>
			{(
				[
					["epf", p.employer?.epfNo],
					["socso", p.employer?.socsoNo],
					["lhdn", p.employer?.taxNo],
				] as const
			)
				.filter(([, v]) => v)
				.map(([k, v]) => (
					<span key={k} className="whitespace-nowrap">
						<span className="text-[var(--doc-subtle)]">{L(k)}</span> <span className="cy-doc-num text-[var(--doc-ink)]">{v}</span>
					</span>
				))}
		</div>
	);
	const payFields: DocFieldItem[] = [
		{ label: "payPeriod", value: period(p.periodFrom, p.periodTo, locale) },
		{ label: "payDate", value: formatDocDate(p.payDate, locale) },
		{ label: "bankAccount", value: e.bankAccount ? [e.bankName, e.bankAccount].filter(Boolean).join(" · ") : undefined },
	];
	const employeeFields: DocFieldItem[] = [
		{ label: "staffId", value: e.staffId, figures: true },
		{ label: "icNo", value: e.icNo, figures: true },
		{ label: "position", value: e.position },
		{ label: "department", value: e.department },
		{ label: "epfNo", value: e.epfNo, figures: true },
		{ label: "socsoNo", value: e.socsoNo, figures: true },
		{ label: "taxNo", value: e.taxNo, figures: true },
	];

	return (
		<>
			<DocStack gap="sm" className={cn(a5 && "gap-[2.4mm]")}>
				<Letterhead
					title="payslip"
					number={p.number}
					subtitle={
						a5 ? (
							<>
								<span className="mt-0.5 grid grid-cols-[auto_auto] items-baseline justify-end gap-x-2 gap-y-0.5 leading-tight">
									<span>{L("payPeriod", { stacked: true })}</span>
									<span className="font-medium whitespace-nowrap text-[var(--doc-ink)]">{period(p.periodFrom, p.periodTo, locale)}</span>
									<span>{L("payDate", { stacked: true })}</span>
									<span className="font-medium whitespace-nowrap text-[var(--doc-ink)]">{formatDocDate(p.payDate, locale)}</span>
								</span>
								<span className="mt-1 block">{L("privateConfidential", { stacked: true })}</span>
							</>
						) : (
							L("privateConfidential")
						)
					}
				/>
				{a5 ? (
					// A5: pay details join the employee particulars; employer numbers on one quiet line.
					<section className="min-w-0">
						<div className="flex items-baseline justify-between gap-4">
							<h2 className="shrink-0">
								<DocLabel>{L("employee")}</DocLabel>
							</h2>
							{employerLine}
						</div>
						<div className="mt-1 text-[9.5pt] leading-tight font-semibold">{e.name}</div>
						<DocFields variant="grid" className="mt-[2.5mm] gap-x-[4mm] gap-y-[2mm]" columns={4} items={[payFields[2], ...employeeFields]} />
					</section>
				) : (
					<>
						<DocumentMeta
							items={[
								{ label: L("payPeriod"), value: period(p.periodFrom, p.periodTo, locale) },
								{ label: L("payDate"), value: formatDocDate(p.payDate, locale), emphasis: true },
								{ label: L("bankAccount"), value: payFields[2].value },
							]}
						/>
						<div className={cn("grid gap-x-[8mm] gap-y-[4mm]", hasEmployer ? "grid-cols-[1fr_46mm]" : "grid-cols-1")}>
							<section className="min-w-0">
								<h2>
									<DocLabel>{L("employee")}</DocLabel>
								</h2>
								<div className="mt-1.5 text-[10pt] leading-tight font-semibold">{e.name}</div>
								<DocFields variant="grid" className="mt-[3mm]" columns={4} items={employeeFields} />
							</section>
							{hasEmployer && (
								<section className="min-w-0 border-l border-[var(--doc-rule)] pl-[6mm]">
									<h2>
										<DocLabel>{L("employer")}</DocLabel>
									</h2>
									<DocFields variant="grid" className="mt-[2mm]" columns={1} items={employerFields} />
								</section>
							)}
						</div>
					</>
				)}
				<div className={cn("grid items-start", a5 ? "grid-cols-2 gap-[5mm]" : "grid-cols-2 gap-[8mm]")}>
					{ledger("earnings", p.earnings, "grossPay", p.grossPay)}
					{ledger("deductions", p.deductions, "totalDeductions", p.totalDeductions)}
				</div>
				{a5 ? (
					// A5: gross and deductions are already the ledger totals — lead straight to net pay, words beside it.
					<TotalsBlock rows={[{ label: L("netPay"), value: p.netPay, kind: "total" }]} currency={currency} aside={<DocAmountWords amount={p.netPay} currency={currency} className="pt-[1.5mm]" />} className="[&_dl]:w-[60mm]" />
				) : (
					<div>
						<DocFigureStrip
							currency={currency}
							items={[
								{ label: "grossPay", value: p.grossPay },
								{ label: "totalDeductions", value: p.totalDeductions },
								{ label: "netPay", value: p.netPay, emphasis: true },
							]}
						/>
						<DocAmountWords amount={p.netPay} currency={currency} align="right" className="mt-[2.5mm]" />
					</div>
				)}
				{p.employerContributions && p.employerContributions.length > 0 && (
					<DocSection
						title={
							<>
								{L("employerContributions")}
								<span className={cn("font-normal tracking-normal text-[var(--doc-subtle)] normal-case", locale === "en-ms" ? "mt-0.5 block" : "ml-2")}>{L("notDeducted")}</span>
							</>
						}
					>
						<DocFigureStrip
							quiet
							className={cn(a5 && "[&>div]:pt-[1.5mm]")}
							currency={currency}
							items={[
								...p.employerContributions.map((c) => ({ label: c.label, value: c.amount })),
								...(p.totalEmployerContributions ? [{ label: "total" as const, value: p.totalEmployerContributions, emphasis: true }] : []),
							]}
						/>
					</DocSection>
				)}
				{p.ytd && p.ytd.length > 0 && (
					<DocSection title={L("ytd")}>
						<DocFigureStrip quiet className={cn(a5 && "[&>div]:pt-[1.5mm]")} currency={currency} items={p.ytd.map((y, i) => ({ label: y.label, value: y.amount, emphasis: i === p.ytd!.length - 1 }))} />
					</DocSection>
				)}
			</DocStack>
			<DocumentFooter hideNotice={a5} className={a5 ? "pt-[3mm]" : "pt-[4mm]"} note={<span className="text-[7.25pt] text-[var(--doc-muted)] not-italic [font-family:var(--doc-font)]">{p.note ?? L(a5 ? "confidentialShort" : "confidentialNote")}</span>} />
		</>
	);
}

/**
 * A Malaysian payslip: employer and employee particulars (IC, EPF, SOCSO, tax numbers), earnings and deductions
 * side by side, gross / deductions / net pay (net in words), employer EPF/SOCSO/EIS/HRDF contributions, year to date.
 * A4 by default; A5 for the half-sheet many SMEs print.
 */
export function PayslipDocument({ payslip, size = "a4", brand, stamp, fit, isolate, className }: OpsDocumentProps & { payslip: PayslipDocumentData; size?: "a4" | "a5" }) {
	return (
		<DocumentPage brand={brand} size={size} stamp={stamp} fit={fit} isolate={isolate} className={cn(size === "a5" && "text-[7.5pt]", className)}>
			<PayslipBody payslip={payslip} size={size} />
		</DocumentPage>
	);
}
