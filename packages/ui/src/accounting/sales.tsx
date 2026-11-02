/**
 * Cynco UI — invoicing & sales.
 * Ports of cynco-labs/cynco remix/app/components/{invoice,creditDebitNotes,quotations,recurring-invoices}.
 * Presentational only: data and handlers come in as props. Every component responds to the width
 * of its own container (DataList / StatGrid / container queries), from 320px to a full page.
 */
import * as React from "react";
import { parseDate } from "../base/lib/utils";
import {
	Alert,
	AlertDescription,
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FilterChip,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatusChipIcon,
	Textarea,
	ToolbarButton,
	cn,
	LiveStatus,
} from "../base";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	BellRingingIcon,
	CalendarBlankIcon,
	CaretDownIcon,
	CheckCircleIcon,
	CheckIcon,
	DownloadSimpleIcon,
	EnvelopeIcon,
	MagnifyingGlassIcon,
	MinusCircleIcon,
	NotePencilIcon,
	PaperPlaneTiltIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	PlusIcon,
	ReceiptIcon,
	TrashIcon,
	TruckIcon,
	WarningIcon,
	XCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import {
	FieldError,
	fieldErrorProps,
	ActionBar,
	DataList,
	DocStatus,
	INVOICE_STATUS,
	SectionPanel,
	SectionLabel,
	StatGrid,
	StatTile,
	formatCurrency,
	formatDate,
	surfaces,
	type DataColumn,
	type StatusEntry,
	ToneDot,
} from "../lib/shared";

/* ------------------------------------------------------------------ helpers */

/** Signed money in a totals list: "−RM 120.00" for a deduction. */
function signedTotal(value: number, currency: string, negative?: boolean) {
	return `${negative ? "−" : ""}${formatCurrency(Math.abs(value), currency)}`;
}

/** cynco QUOTATION_STATUS (components/quotations/quotationStatusConfig.ts). */
const QUOTATION_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral" },
	sent: { label: "Sent", variant: "info" },
	viewed: { label: "Viewed", variant: "neutral" },
	accepted: { label: "Accepted", variant: "success" },
	rejected: { label: "Rejected", variant: "error" },
	expired: { label: "Expired", variant: "warning" },
	converted: { label: "Converted", variant: "info", glyph: "refresh" },
};

/** cynco NOTE_STATUS (components/creditDebitNotes/utils/noteRules.ts). */
const NOTE_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "warning" },
	issued: { label: "Issued", variant: "info" },
	partially_applied: { label: "Partially applied", variant: "info" },
	fully_applied: { label: "Fully applied", variant: "neutral" },
	refunded: { label: "Refunded", variant: "neutral" },
	partially_paid: { label: "Partially paid", variant: "info" },
	paid: { label: "Paid", variant: "success" },
	voided: { label: "Voided", variant: "error" },
};

/** cynco StatusBadge "lifecycle" preset, used by recurring templates. */
const LIFECYCLE_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral" },
	active: { label: "Active", variant: "success" },
	paused: { label: "Paused", variant: "warning", glyph: "pause" },
	expired: { label: "Expired", variant: "neutral" },
	cancelled: { label: "Cancelled", variant: "error" },
	archived: { label: "Archived", variant: "neutral" },
};

/* --------------------------------------------------------- InvoiceListTable */

export type SalesInvoiceRow = {
	id: string;
	invoiceNumber: string;
	customerName: string;
	invoiceDate: string;
	dueDate?: string | null;
	total: number;
	currency?: string;
	status: string;
	/** Missing on a posted invoice → "Not posted to GL" signal. */
	journalEntryId?: string | null;
	emailStatus?: "sent" | "delivered" | "opened" | "failed" | "bounced" | "complained" | null;
};

const GL_EXEMPT = new Set(["draft", "voided", "cancelled", "refunded"]);

/** Status chip plus by-exception signals (GL entry missing, email problem); quiet on the happy path. */
function InvoiceStatusSignals({ invoice }: { invoice: SalesInvoiceRow }) {
	const glMissing = !GL_EXEMPT.has(invoice.status) && !invoice.journalEntryId;
	const e = invoice.emailStatus;
	const emailProblem = e === "failed" || e === "bounced" || e === "complained";
	const emailLabel = e === "complained" ? "Email marked as spam" : `Email ${e}`;
	return (
		<div className="flex items-center gap-1.5">
			<DocStatus status={invoice.status} config={INVOICE_STATUS} />
			{glMissing && (
				<span title="Not posted to the general ledger" role="img" aria-label="Not posted to GL" className="inline-flex">
					<StatusChipIcon tone="amber" glyph="alert" />
				</span>
			)}
			{emailProblem && (
				<span title={emailLabel} role="img" aria-label={emailLabel} className="inline-flex">
					<StatusChipIcon tone="red" glyph="x" />
				</span>
			)}
		</div>
	);
}

/** A sortable column header: skeleton Button with the direction arrow. */
function SortHeader({ id, label, sortField, sortDirection, onSort }: { id: string; label: string; sortField?: string; sortDirection?: "asc" | "desc"; onSort?: (f: string) => void }) {
	const active = sortField === id;
	return (
		<Button
			variant="skeleton"
			size="sm"
			onClick={() => onSort?.(id)}
			aria-label={`Sort by ${label}`}
			className={cn("-mx-1 h-5 gap-1 !px-1 text-xs font-medium", active ? "text-foreground" : "text-tertiary-foreground")}
		>
			{label}
			{active && (sortDirection === "asc" ? <ArrowUpIcon size={10} weight="bold" aria-hidden="true" /> : <ArrowDownIcon size={10} weight="bold" aria-hidden="true" />)}
		</Button>
	);
}

/** The invoices list (cynco InvoiceTable + InvoiceStatusCell): tray table when wide, stacked rows when narrow. */
export function InvoiceListTable({
	invoices,
	selectedIds = [],
	onToggleRow,
	onToggleAll,
	sortField = "invoice_date",
	sortDirection = "desc",
	onSort,
	footer,
	className,
}: {
	invoices: SalesInvoiceRow[];
	selectedIds?: string[];
	onToggleRow?: (id: string) => void;
	onToggleAll?: () => void;
	sortField?: string;
	sortDirection?: "asc" | "desc";
	onSort?: (field: string) => void;
	footer?: React.ReactNode;
	className?: string;
}) {
	const selected = new Set(selectedIds);
	const all = invoices.length > 0 && invoices.every((i) => selected.has(i.id));
	const sh = (id: string, label: string) => <SortHeader id={id} label={label} sortField={sortField} sortDirection={sortDirection} onSort={onSort} />;
	// The direction is announced once, by aria-sort on the header cell.
	const sort = (id: string) => (sortField === id ? (sortDirection === "asc" ? "ascending" : "descending") : undefined);
	const columns: DataColumn<SalesInvoiceRow>[] = [
		{ key: "invoice_number", sortDirection: sort("invoice_number"), header: sh("invoice_number", "Invoice #"), mobile: "meta", cell: (r) => <span className="text-tiny-id text-primary">{r.invoiceNumber || "—"}</span> },
		{ key: "customer_name", sortDirection: sort("customer_name"), header: sh("customer_name", "Customer"), mobile: "title", className: "min-w-0", cell: (r) => <span className="line-clamp-1 break-all">{r.customerName || "—"}</span> },
		{ key: "invoice_date", sortDirection: sort("invoice_date"), header: sh("invoice_date", "Date"), mobile: "meta", className: "whitespace-nowrap", cell: (r) => <span className="text-xs tabular-nums text-tertiary-foreground">{formatDate(r.invoiceDate)}</span> },
		{ key: "due_date", sortDirection: sort("due_date"), header: sh("due_date", "Due Date"), mobile: "meta", className: "whitespace-nowrap", cell: (r) => <span className="text-xs tabular-nums text-tertiary-foreground">{r.dueDate ? formatDate(r.dueDate) : "—"}</span> },
		{ key: "total", sortDirection: sort("total"), header: sh("total", "Amount"), align: "right", mobile: "value", cell: (r) => formatCurrency(r.total, r.currency || "MYR") },
		{ key: "status", header: "Status", mobile: "badge", className: "whitespace-nowrap", cell: (r) => <InvoiceStatusSignals invoice={r} /> },
	];
	return (
		<DataList
			className={className}
			caption="Invoices"
			columns={columns}
			rows={invoices}
			getKey={(r) => r.id}
			stackBelow="3xl"
			dense
			isRowSelected={(r) => selected.has(r.id)}
			leadingHeader={<Checkbox aria-label="Select all invoices" checked={all} indeterminate={!all && selected.size > 0} onCheckedChange={() => onToggleAll?.()} />}
			leading={(r) => <Checkbox aria-label={`Select invoice ${r.invoiceNumber}`} checked={selected.has(r.id)} onCheckedChange={() => onToggleRow?.(r.id)} />}
			trailing={(r) => <ToolbarButton aria-label={`Actions for ${r.invoiceNumber}`} />}
			footer={footer}
		/>
	);
}

/* --------------------------------------------------------- InvoiceLineItems */

export type SalesLineItem = {
	name: string;
	description?: string;
	quantity: number;
	price: number;
	discount?: number;
	discountType?: "percentage" | "fixed";
	/** Tax code value from `taxCodes`, or "exempt". */
	taxCode?: string;
	/** Estimated profit health from item cost (ADR 0010). */
	margin?: "healthy" | "below_target" | "below_cost";
};

export type SalesTaxCode = { value: string; label: string; rate: number };

const DEFAULT_TAX_CODES: SalesTaxCode[] = [
	{ value: "none", label: "No tax", rate: 0 },
	{ value: "sst8", label: "SST 8%", rate: 8 },
	{ value: "sst6", label: "SST 6%", rate: 6 },
	{ value: "st10", label: "Sales 10%", rate: 10 },
	{ value: "exempt", label: "Exempt", rate: 0 },
];

/** Line amount incl. per-line discount and tax (cynco calculateLineItemTotal). */
export function salesLineAmount(item: SalesLineItem, taxCodes: SalesTaxCode[] = DEFAULT_TAX_CODES) {
	const gross = item.quantity * item.price;
	const disc = item.discountType === "fixed" ? item.discount ?? 0 : (gross * (item.discount ?? 0)) / 100;
	const net = Math.max(0, gross - disc);
	const rate = taxCodes.find((t) => t.value === item.taxCode)?.rate ?? 0;
	return Math.round((net + (net * rate) / 100) * 100) / 100;
}

const MARGIN_TONE = { healthy: "green", below_target: "amber", below_cost: "red" } as const;
const MARGIN_GLYPH = { healthy: "check", below_target: "alert", below_cost: "x" } as const;

/** Wide-container (48rem+) grid: description | qty | unit price | disc. | tax | amount | remove. */
const LINE_GRID = "@3xl:grid-cols-[minmax(0,1fr)_4.5rem_6.5rem_5rem_7rem_7.5rem_1.75rem]";
const LINE_GRID_RO = "@3xl:grid-cols-[minmax(0,1fr)_4.5rem_6.5rem_5rem_7rem_7.5rem]";
const NUM = "h-input w-full text-right tabular-nums px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/** A per-field label that shows only in the stacked (narrow) layout. */
function LineLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
	return <label htmlFor={htmlFor} className="text-2xs text-tertiary-foreground @3xl:sr-only">{children}</label>;
}

/** Editable line-item rows (cynco LineItemsTable): a grid on wide containers, one card per line on narrow ones. */
export function InvoiceLineItems({
	items,
	onChange,
	currency = "MYR",
	taxCodes = DEFAULT_TAX_CODES,
	readOnly = false,
	estimatedProfit,
	onAddItem,
	onBrowseLibrary,
	className,
	...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
	items: SalesLineItem[];
	onChange?: (items: SalesLineItem[]) => void;
	currency?: string;
	taxCodes?: SalesTaxCode[];
	readOnly?: boolean;
	/** Document-level estimated profit line under the total. */
	estimatedProfit?: { amount: number; percent: number; health: NonNullable<SalesLineItem["margin"]> };
	onAddItem?: () => void;
	onBrowseLibrary?: () => void;
}) {
	const uid = React.useId();
	const update = (i: number, patch: Partial<SalesLineItem>) => {
		const next = items.slice();
		next[i] = { ...next[i]!, ...patch };
		onChange?.(next);
	};
	const remove = (i: number) => onChange?.(items.filter((_, j) => j !== i));
	// The Qty field being edited holds its raw text, so it can be cleared and retyped freely. Whole numbers of 1 or
	// more are applied as typed; anything else is flagged inline and reverts to the last valid quantity on blur.
	const [qtyDraft, setQtyDraft] = React.useState<{ i: number; text: string } | null>(null);
	const parseQty = (text: string) => {
		const t = text.trim();
		const n = Number(t);
		return t !== "" && Number.isInteger(n) && n >= 1 ? n : null;
	};
	const total = items.reduce((s, it) => s + salesLineAmount(it, taxCodes), 0);
	const grid = readOnly ? LINE_GRID_RO : LINE_GRID;
	const ro = "flex h-input items-center justify-end tabular-nums text-sm @3xl:justify-end";

	return (
		<div className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			{!readOnly && items.length > 0 && (
				<div role="toolbar" aria-label="Line item actions" className="flex w-fit max-w-full flex-wrap items-center rounded-lg border bg-interactive-secondary p-px">
					<Button variant="skeleton" size="sm" className="h-6 gap-1.5" onClick={onAddItem}><PlusIcon size={12} weight="bold" aria-hidden="true" />Add item</Button>
					<span className="h-4 w-px bg-border" aria-hidden="true" />
					<Button variant="skeleton" size="sm" className="h-6 gap-1.5" onClick={onBrowseLibrary}><MagnifyingGlassIcon size={12} aria-hidden="true" />Browse library</Button>
				</div>
			)}
			<div className={surfaces.tray}>
				<div role="table" aria-label="Line items" className={surfaces.surface}>
					<div role="row" className={cn("hidden gap-2 border-b border-table-row-divider px-3 py-2 text-xs font-medium text-tertiary-foreground @3xl:grid", grid)}>
						<span role="columnheader">Description</span>
						<span role="columnheader" className="text-right">Qty</span>
						<span role="columnheader" className="text-right">Unit Price</span>
						<span role="columnheader" className="text-right">Disc.</span>
						<span role="columnheader">Tax</span>
						<span role="columnheader" className="text-right">Amount</span>
						{!readOnly && <span role="columnheader"><span className="sr-only">Actions</span></span>}
					</div>
					{items.map((it, i) => {
						const id = `${uid}-${i}`;
						const label = it.name || `line ${i + 1}`;
						const nameMissing = !it.name;
						const qtyText = qtyDraft?.i === i ? qtyDraft.text : String(it.quantity);
						const qtyInvalid = qtyDraft?.i === i && parseQty(qtyDraft.text) === null;
						return (
							<div role="row" key={i} className={cn("grid grid-cols-2 gap-x-2 gap-y-2 border-b border-table-row-divider px-3 py-2.5 last:border-b-0 @md:grid-cols-4 @3xl:items-start @3xl:py-2", grid)}>
								{/* Description */}
								<div role="cell" className="col-span-2 min-w-0 @md:col-span-4 @3xl:col-span-1">
									{readOnly ? (
										<div className="flex flex-col @3xl:pt-1">
											<span className="line-clamp-2 text-sm text-foreground">{it.name || "Unnamed item"}</span>
											{it.description && <span className="line-clamp-2 text-2xs text-tertiary-foreground">{it.description}</span>}
										</div>
									) : (
										<div className="flex flex-col gap-0.5">
											<Input
												aria-label={`Item name, line ${i + 1}`}
												aria-invalid={nameMissing || undefined}
												aria-describedby={nameMissing ? `${id}-name-error` : undefined}
												value={it.name}
												placeholder="Item name"
												onChange={(e) => update(i, { name: e.target.value })}
												variant={nameMissing ? "destructive" : "default"}
											/>
											{nameMissing && (
												<FieldError id={`${id}-name-error`} className="px-2">
													Enter an item name
												</FieldError>
											)}
											<Input aria-label={`Description, line ${i + 1}`} value={it.description ?? ""} placeholder="Description (optional)" onChange={(e) => update(i, { description: e.target.value })} variant="headless" className="h-5 !px-2 text-2xs text-tertiary-foreground" />
										</div>
									)}
								</div>
								{/* Qty */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel htmlFor={`${id}-q`}>Qty</LineLabel>
									{readOnly ? (
										<div className={ro}>{it.quantity}</div>
									) : (
										<>
											<Input
												id={`${id}-q`}
												aria-label={`Qty for ${label}`}
												type="number"
												inputMode="numeric"
												min={1}
												step={1}
												value={qtyText}
												aria-invalid={qtyInvalid || undefined}
												aria-describedby={qtyInvalid ? `${id}-q-error` : undefined}
												variant={qtyInvalid ? "destructive" : "default"}
												onChange={(e) => {
													const text = e.target.value;
													setQtyDraft({ i, text });
													const n = parseQty(text);
													if (n !== null && n !== it.quantity) update(i, { quantity: n });
												}}
												onBlur={() => setQtyDraft(null)}
												className={NUM}
											/>
											{qtyInvalid && (
												<FieldError id={`${id}-q-error`}>
													{Number(qtyDraft?.text) >= 1 ? "Enter a whole number." : "Enter 1 or more."}
												</FieldError>
											)}
										</>
									)}
								</div>
								{/* Unit price */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel htmlFor={`${id}-p`}>Unit price</LineLabel>
									{readOnly ? <div className={ro}>{formatCurrency(it.price, currency)}</div> : <Input id={`${id}-p`} aria-label={`Unit price for ${label}`} type="number" min={0} step={0.01} value={it.price} onChange={(e) => update(i, { price: Math.max(0, +e.target.value || 0) })} className={NUM} />}
								</div>
								{/* Discount */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel htmlFor={`${id}-d`}>Discount</LineLabel>
									{readOnly ? (
										<div className={ro}>{it.discount ? (it.discountType === "fixed" ? formatCurrency(it.discount, currency) : `${it.discount}%`) : "—"}</div>
									) : (
										<div className="relative">
											<Input id={`${id}-d`} aria-label={`Discount for ${label}`} aria-describedby={`${id}-du`} type="number" min={0} value={it.discount ?? 0} onChange={(e) => update(i, { discount: Math.max(0, +e.target.value || 0) })} className={cn(NUM, "!pr-6")} />
											<span id={`${id}-du`} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-subtle">{it.discountType === "fixed" ? "RM" : "%"}</span>
										</div>
									)}
								</div>
								{/* Tax */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel>Tax</LineLabel>
									{readOnly ? (
										<div className="flex h-input items-center text-sm text-tertiary-foreground">{taxCodes.find((t) => t.value === it.taxCode)?.label ?? "No tax"}</div>
									) : (
										<Select value={it.taxCode ?? "none"} onValueChange={(v) => update(i, { taxCode: v })} items={taxCodes.map((t) => ({ value: t.value, label: t.label }))}>
											<SelectTrigger className="h-input w-full px-2 text-sm" aria-label={`Tax code for ${label}`}><SelectValue /></SelectTrigger>
											<SelectContent>{taxCodes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
										</Select>
									)}
								</div>
								{/* Amount + remove: one line on the stacked card */}
								<div role="cell" className="col-span-2 flex items-center justify-between gap-2 border-t border-dashed border-table-row-divider pt-2 @md:col-span-4 @3xl:col-span-1 @3xl:h-7 @3xl:justify-end @3xl:border-0 @3xl:pt-0">
									<span className="text-2xs text-tertiary-foreground @3xl:hidden">Amount</span>
									<span className="flex items-center gap-1.5 whitespace-nowrap text-sm tabular-nums text-foreground">
										{it.margin && (
											<span role="img" aria-label={`Estimated profit: ${it.margin.replace("_", " ")}`} title={`Estimated profit: ${it.margin.replace("_", " ")}`} className="inline-flex">
												<StatusChipIcon tone={MARGIN_TONE[it.margin]} glyph={MARGIN_GLYPH[it.margin]} />
											</span>
										)}
										{formatCurrency(salesLineAmount(it, taxCodes), currency)}
										{!readOnly && (
											<Button variant="skeleton" size="icon" aria-label={`Remove ${label}`} onClick={() => remove(i)} className="size-6 text-tertiary-foreground hover:!text-error-text @3xl:hidden"><TrashIcon size={14} aria-hidden="true" /></Button>
										)}
									</span>
								</div>
								{!readOnly && (
									<div role="cell" className="hidden h-input items-center justify-end @3xl:flex">
										<Button variant="skeleton" size="icon" aria-label={`Remove ${label}`} onClick={() => remove(i)} className="size-6 text-tertiary-foreground hover:!text-error-text"><TrashIcon size={14} aria-hidden="true" /></Button>
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className="flex flex-col gap-1 px-3 pt-2.5 pb-2">
					<div className="flex flex-wrap items-center justify-between gap-x-3">
						<span className="text-2xs text-tertiary-foreground">Total ({items.length} item{items.length !== 1 ? "s" : ""})</span>
						<span className={cn("text-sm tabular-nums text-foreground", !readOnly && "@3xl:pr-9")}>{formatCurrency(total, currency)}</span>
					</div>
					{estimatedProfit && (
						<div className="flex flex-wrap items-center justify-between gap-x-3">
							<span className="text-2xs text-subtle">Estimated profit</span>
							<span className={cn("text-2xs tabular-nums", !readOnly && "@3xl:pr-9", estimatedProfit.health === "healthy" ? "text-muted-foreground" : "text-error-text")}>
								{formatCurrency(estimatedProfit.amount, currency)} ({estimatedProfit.percent}%){estimatedProfit.health === "below_target" ? " · below profit goal" : estimatedProfit.health === "below_cost" ? " · selling below cost" : ""}
							</span>
						</div>
					)}
				</div>
			</div>
			{!readOnly && (
				<Button variant="dotted" className="w-full gap-1.5" onClick={onAddItem}><PlusIcon size={14} aria-hidden="true" />Add line</Button>
			)}
		</div>
	);
}

/* ------------------------------------------------------- InvoiceTotalsPanel */

export type SalesTotalRow = { label: string; value: number; bold?: boolean; accent?: boolean; negative?: boolean };

/** Build cynco's totals rows (domain/invoice/totals.ts): Subtotal, Discount, tax, Total, Deposit, Balance Due. */
export function buildSalesTotals(input: { subtotal: number; discount?: number; discountPercent?: number; taxes?: { label: string; amount: number }[]; deposit?: number }): SalesTotalRow[] {
	const rows: SalesTotalRow[] = [{ label: "Subtotal", value: input.subtotal }];
	const d = input.discount ?? 0;
	if (d > 0) rows.push({ label: `Discount${input.discountPercent ? ` (${input.discountPercent}%)` : ""}`, value: d, negative: true });
	let tax = 0;
	for (const t of input.taxes ?? []) if (t.amount > 0) { rows.push({ label: t.label, value: t.amount }); tax += t.amount; }
	const total = input.subtotal - d + tax;
	rows.push({ label: "Total", value: total, bold: true });
	if ((input.deposit ?? 0) > 0) {
		rows.push({ label: "Deposit", value: input.deposit!, negative: true });
		const bal = total - input.deposit!;
		rows.push({ label: "Balance Due", value: Math.abs(bal), bold: true, accent: true, negative: bal < 0 });
	}
	return rows;
}

/** The document totals block under the line items (cynco InvoiceTotalsBreakdown). */
export function InvoiceTotalsPanel({ rows, currency = "MYR", className, ...props }: React.ComponentProps<"dl"> & { rows: SalesTotalRow[]; currency?: string }) {
	if (rows.length === 0) return null;
	return (
		<dl className={cn("flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card px-3 py-2.5", className)} {...props}>
			{rows.map((r, i) => (
				<div key={`${r.label}-${i}`} className={cn("flex flex-wrap items-baseline justify-between gap-x-3 text-sm tabular-nums", r.bold ? "text-foreground" : "text-tertiary-foreground", r.label === "Total" && "mt-0.5 border-t border-table-row-divider pt-1.5 font-semibold", r.accent && "font-semibold text-primary")}>
					<dt className="min-w-0">{r.label}</dt>
					<dd className="ml-auto whitespace-nowrap">{signedTotal(r.value, currency, r.negative)}</dd>
				</div>
			))}
		</dl>
	);
}

/* ------------------------------------------------------- InvoiceMetricTiles */

/** Four tiles that stretch to fill the row (auto-fit, not StatGrid's auto-fill which leaves empty tracks on wide pages). */

/** The invoice list's all-time metric strip (cynco InvoiceTotal): Sales, Paid, Pending, Overdue. */
export function InvoiceMetricTiles({
	stats,
	currency = "MYR",
	onShowOverdue,
	className,
	...props
}: React.ComponentProps<"div"> & {
	/** null when the tenant-wide stats could not load: tiles show "—". */
	stats: { totalValue: number; paidValue: number; pendingValue: number; overdueValue: number; overdueCount: number } | null;
	currency?: string;
	onShowOverdue?: () => void;
}) {
	const tiles = [
		{ title: "Sales", value: stats?.totalValue },
		{ title: "Paid", value: stats?.paidValue },
		{ title: "Pending", value: stats?.pendingValue },
		{ title: "Overdue", value: stats?.overdueValue, badge: stats && stats.overdueCount > 0 ? `${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"}` : null },
	];
	return (
		<StatGrid min="sm" className={className} {...props}>
			{tiles.map((t) => {
				const overdue = t.title === "Overdue" && (t.value ?? 0) > 0;
				const tile = (
					<StatTile
						label={t.title}
						value={stats ? formatCurrency(t.value ?? 0, currency) : <span className="text-tertiary-foreground">—</span>}
						negative={overdue}
						badge={t.badge ? <span className="shrink-0 text-2xs tabular-nums text-error-text">{t.badge}</span> : !stats ? <span className="text-2xs text-subtle">Unavailable</span> : undefined}
						className={cn("h-full shadow-sm", overdue && onShowOverdue && "transition-colors hover:bg-interactive-secondary-hover")}
					/>
				);
				return overdue && onShowOverdue ? (
					<button key={t.title} type="button" onClick={onShowOverdue} aria-label={`${t.title}: ${formatCurrency(t.value ?? 0, currency)}, ${t.badge}. Show these invoices`} className="min-w-0 cursor-pointer rounded-xl text-left outline-none focus-ring">{tile}</button>
				) : (
					<React.Fragment key={t.title}>{tile}</React.Fragment>
				);
			})}
		</StatGrid>
	);
}

/* ------------------------------------------------------- InvoiceCreateSteps */

const STEP_META = [
	{ title: "Customer Information", description: "Who is this invoice for?" },
	{ title: "Line Items", description: "Products or services to bill" },
	{ title: "Invoice Summary", description: "Terms, tax & final details" },
];

/** The invoice-builder's vertical step rail (cynco InvoiceProgressBar): Customer → Line items → Details. */
export function InvoiceCreateSteps({ currentStep, completed = [], children, className, ...props }: Omit<React.ComponentProps<"ol">, "children"> & { currentStep: 1 | 2 | 3; completed?: number[]; children?: Partial<Record<1 | 2 | 3, React.ReactNode>> }) {
	return (
		<ol className={cn("flex min-w-0 flex-col", className)} {...props}>
			{STEP_META.map((m, idx) => {
				const n = (idx + 1) as 1 | 2 | 3;
				const done = completed.includes(n) || n < currentStep;
				const active = n === currentStep;
				const last = idx === STEP_META.length - 1;
				return (
					<li key={n} aria-current={active ? "step" : undefined} className="relative flex gap-3.5">
						<div className="flex flex-col items-center">
							<div className={cn("z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-2xs tabular-nums", done ? "bg-active-primary text-primary ring-1 ring-primary/25" : active ? "bg-primary text-primary-foreground ring-[3px] ring-primary/15" : "bg-muted text-subtle ring-1 ring-border")}>
								{done ? (
									<>
										<CheckIcon size={12} weight="bold" aria-hidden="true" />
										<span className="sr-only">Completed:</span>
									</>
								) : (
									n
								)}
							</div>
							{!last && <div className={cn("mt-2 w-px flex-1 rounded-full", done ? "bg-primary/30" : "bg-border")} />}
						</div>
						<div className={cn("min-w-0 flex-1", !last && "pb-6")}>
							<div className="pt-0.5">
								<div className={cn("text-sm leading-5", active ? "text-foreground" : done ? "text-muted-foreground" : "text-subtle")}>{m.title}</div>
								<div className={cn("text-2xs", active ? "text-tertiary-foreground" : "text-subtle")}>{m.description}</div>
							</div>
							{children?.[n] && <div className="mt-3 min-w-0">{children[n]}</div>}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

/* ------------------------------------------------------- InvoiceSummaryRail */

/** The always-visible total bar under the builder (cynco InvoiceSummaryRail); the breakdown expands upward. */
export function InvoiceSummaryRail({
	rows,
	currency = "MYR",
	actions,
	defaultOpen = false,
	className,
	...props
}: React.ComponentProps<"div"> & {
	/** Totals rows; empty means no line items yet. */
	rows: SalesTotalRow[];
	currency?: string;
	actions?: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = React.useState(defaultOpen);
	const pick = (l: string) => rows.find((r) => r.label.startsWith(l));
	const subtotal = pick("Subtotal")?.value ?? 0;
	const discount = pick("Discount")?.value ?? 0;
	const tax = rows.filter((r) => !["Subtotal", "Total", "Deposit", "Balance Due"].includes(r.label) && !r.label.startsWith("Discount")).reduce((s, r) => s + r.value, 0);
	const total = pick("Total")?.value ?? 0;
	const hasItems = rows.length > 0;
	return (
		<div className={cn("@container min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm", className)} {...props}>
			{open && hasItems && (
				<dl className="flex flex-col gap-1.5 border-b border-table-row-divider px-4 py-3">
					{rows.map((r, i) => (
						<div key={`${r.label}-${i}`} className={cn("flex items-baseline justify-between gap-3 text-2xs tabular-nums", r.bold ? "text-foreground" : "text-tertiary-foreground", r.accent && "text-primary")}>
							<dt className="min-w-0">{r.label}</dt>
							<dd className="shrink-0 whitespace-nowrap">{signedTotal(r.value, currency, r.negative)}</dd>
						</div>
					))}
				</dl>
			)}
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
				{hasItems ? (
					// Raw button: the trigger carries the whole figures row; it keeps a focus ring and its visible text is the name.
					<button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="group/rail -mx-2 flex min-w-0 flex-[1_1_14rem] cursor-pointer items-center gap-4 rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-interactive-secondary-hover focus-ring">
						<span className="hidden min-w-0 items-center gap-3 whitespace-nowrap text-2xs tabular-nums text-tertiary-foreground @xl:flex">
							<span>Subtotal <span className="text-foreground">{formatCurrency(subtotal, currency)}</span></span>
							{discount > 0 && <span>Discount <span className="text-foreground">−{formatCurrency(discount, currency)}</span></span>}
							{tax > 0 && <span>Tax <span className="text-foreground">{formatCurrency(tax, currency)}</span></span>}
						</span>
						<span className="ml-auto flex shrink-0 items-baseline gap-2">
							<SectionLabel>Total</SectionLabel>
							<span className="text-md font-semibold tabular-nums text-foreground">{formatCurrency(Math.abs(total), currency)}</span>
							<CaretDownIcon size={14} aria-hidden="true" className={cn("self-center text-tertiary-foreground transition-transform", open && "rotate-180")} />
						</span>
						<span className="sr-only">{open ? ", hide amount breakdown" : ", show amount breakdown"}</span>
					</button>
				) : (
					<span className="ml-auto text-2xs text-tertiary-foreground">Add a line item to see the total</span>
				)}
				{actions && <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
			</div>
		</div>
	);
}

/* ------------------------------------------------------ InvoiceActionsPanel */

type ActionDef = { icon: React.ElementType; label: string };

/** Which actions an invoice offers, by status (cynco InvoiceActionsCard rules). */
function invoiceActions(status: string, emailSent: boolean): ActionDef[] {
	const a: ActionDef[] = [];
	if (status === "finalized" && !emailSent) a.push({ icon: EnvelopeIcon, label: "Send email" });
	if (emailSent && status !== "paid" && status !== "draft") a.push({ icon: BellRingingIcon, label: "Send reminder" });
	if (["finalized", "overdue", "partially_paid", "deposit_due", "deposit_paid"].includes(status)) a.push({ icon: CheckCircleIcon, label: "Mark as paid" });
	if (status === "paid" || status === "partially_paid") a.push({ icon: ReceiptIcon, label: "Download receipt" });
	if (status === "draft" || status === "finalized") a.push({ icon: PencilSimpleIcon, label: "Edit invoice" });
	if (status !== "draft" && status !== "voided") a.push({ icon: TruckIcon, label: "Create delivery order" }, { icon: TruckIcon, label: "View deliveries" });
	if (["finalized", "overdue", "partially_paid", "paid"].includes(status)) a.push({ icon: MinusCircleIcon, label: "Create credit note" }, { icon: PlusCircleIcon, label: "Create debit note" });
	return a;
}

/** The invoice view's side "Actions" card (cynco InvoiceActionsCard): status-aware shortcuts. */
export function InvoiceActionsPanel({ status, emailSent = false, onAction, className, ...props }: Omit<React.ComponentProps<"section">, "title"> & { status: string; emailSent?: boolean; onAction?: (label: string) => void }) {
	const actions = invoiceActions(status, emailSent);
	return (
		<SectionPanel title="Actions" className={cn("shadow-sm", className)} {...props}>
			<div className="-mx-2.5 -my-2 flex flex-col gap-0.5">
				{actions.map((a) => (
					<Button key={a.label} variant="skeleton" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => onAction?.(a.label)}>
						<a.icon size={15} aria-hidden="true" className="text-tertiary-foreground" />
						<span className="truncate">{a.label}</span>
					</Button>
				))}
			</div>
		</SectionPanel>
	);
}

/* --------------------------------------------------------- MarkAsPaidDialog */

const PAYMENT_METHODS = [
	{ value: "bank_transfer", label: "Bank Transfer" },
	{ value: "cash", label: "Cash" },
	{ value: "cheque", label: "Cheque" },
	{ value: "card", label: "Card" },
	{ value: "e_wallet", label: "E-Wallet" },
	{ value: "other", label: "Other" },
];

export type SalesBankAccount = { accountCode: string; accountName: string };

/** Record a manual payment against an invoice (cynco MarkAsPaidDialog + PaymentFields). */
export function MarkAsPaidDialog({
	open,
	defaultOpen,
	modal = true,
	onOpenChange,
	invoice,
	paymentDate,
	paymentMethod: methodProp,
	bankAccounts = [],
	bankAccount: accountProp,
	note: noteProp,
	showSuccess = false,
	isSubmitting = false,
	onConfirm,
	className,
}: {
	open?: boolean;
	defaultOpen?: boolean;
	modal?: boolean;
	onOpenChange?: (open: boolean) => void;
	invoice: { invoiceNumber: string; customerName: string; total: number; currency?: string; paidAmount?: number };
	paymentDate?: string;
	paymentMethod?: string;
	bankAccounts?: SalesBankAccount[];
	bankAccount?: string;
	note?: string;
	showSuccess?: boolean;
	isSubmitting?: boolean;
	onConfirm?: (p: { method: string; bankAccount: string; note: string }) => void;
	/** Merged onto the dialog panel. */
	className?: string;
}) {
	const cur = invoice.currency || "MYR";
	const uid = React.useId();
	const [method, setMethod] = React.useState(methodProp ?? "bank_transfer");
	const [account, setAccount] = React.useState(accountProp ?? "");
	const [note, setNote] = React.useState(noteProp ?? "");
	// Errors show only after "Mark as paid" is pressed, then clear on their own as each field is fixed.
	const [attempted, setAttempted] = React.useState(false);
	const errors = {
		date: paymentDate ? null : "Choose a payment date.",
		account: bankAccounts.length > 0 && account === "" ? "Choose a bank account." : null,
	};
	const errorProps = (k: keyof typeof errors) => fieldErrorProps(`${uid}-${k}-error`, attempted && !!errors[k]);
	const fieldError = (k: keyof typeof errors) => (attempted && errors[k] ? <FieldError id={`${uid}-${k}-error`}>{errors[k]}</FieldError> : null);
	const confirm = () => {
		if (isSubmitting) return;
		const firstInvalid = (["date", "account"] as const).find((k) => errors[k]);
		if (firstInvalid) {
			setAttempted(true);
			document.getElementById(`${uid}-${firstInvalid}`)?.focus();
			return;
		}
		onConfirm?.({ method, bankAccount: account, note });
	};
	const changeOpen = (o: boolean) => {
		setAttempted(false);
		onOpenChange?.(o);
	};
	const pad = "px-4 py-2.5";
	return (
		<Dialog open={open} defaultOpen={defaultOpen} modal={modal} onOpenChange={(o) => { if (!isSubmitting && !showSuccess) changeOpen(o); }}>
			<DialogContent className={cn("@container max-h-[calc(100dvh-2rem)] max-w-md gap-0 overflow-y-auto p-0", className)}>
				<LiveStatus>
					{showSuccess ? `Payment recorded. Invoice ${invoice.invoiceNumber} marked as paid` : ""}
				</LiveStatus>
				{showSuccess ? (
					<div className="flex flex-col items-center justify-center px-6 py-14 text-center">
						<DialogTitle className="sr-only">Mark as paid</DialogTitle>
						<div className="flex size-14 items-center justify-center rounded-full bg-active-primary">
							<CheckCircleIcon weight="fill" size={30} className="text-primary" aria-hidden="true" />
						</div>
						<p className="mt-4 text-md font-semibold text-foreground">Payment recorded</p>
						<p className="mt-1 text-2xs text-tertiary-foreground">Invoice {invoice.invoiceNumber} marked as paid</p>
					</div>
				) : (
					<>
						<DialogHeader className="px-4 pt-3.5 pb-2.5">
							<DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
								<StatusChipIcon tone="green" glyph="check" />
								Mark as paid
							</DialogTitle>
							<DialogDescription className="text-sm text-tertiary-foreground">Record a manual payment for invoice {invoice.invoiceNumber}</DialogDescription>
						</DialogHeader>
						<dl className={cn(pad, "grid grid-cols-1 gap-x-4 gap-y-0.5 border-y border-table-row-divider bg-table-tray text-sm @[22rem]:grid-cols-[auto_1fr] @[22rem]:gap-y-1.5")}>
							<dt className="text-tertiary-foreground">Customer</dt>
							<dd className="min-w-0 break-words text-foreground">{invoice.customerName}</dd>
							<dt className="text-tertiary-foreground">Invoice</dt>
							<dd className="self-center text-tiny-id text-foreground">{invoice.invoiceNumber}</dd>
							<dt className="text-tertiary-foreground">Amount</dt>
							<dd className="tabular-nums text-foreground">{formatCurrency(invoice.total, cur)}</dd>
							{!!invoice.paidAmount && invoice.paidAmount > 0 && (
								<>
									<dt className="text-tertiary-foreground">Balance to record</dt>
									<dd className="tabular-nums text-foreground">{formatCurrency(Math.max(0, invoice.total - invoice.paidAmount), cur)}</dd>
								</>
							)}
						</dl>
						<div className={cn(pad, "flex flex-col gap-1.5")}>
							<label className="text-2xs text-tertiary-foreground" htmlFor={`${uid}-date`}>Payment date</label>
							<div className="relative">
								<CalendarBlankIcon size={14} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-tertiary-foreground" aria-hidden="true" />
								<Input id={`${uid}-date`} readOnly value={paymentDate ? formatDate(paymentDate) : ""} placeholder="Pick a date" {...errorProps("date")} className="!pl-7" />
							</div>
							{fieldError("date")}
						</div>
						<div className={cn(pad, "flex flex-col gap-1.5 border-t border-table-row-divider")}>
							<span id={`${uid}-method`} className="text-2xs text-tertiary-foreground">Payment method</span>
							<ActionBar role="group" aria-labelledby={`${uid}-method`} className="gap-1.5">
								{PAYMENT_METHODS.map((m) => (
									<Button
										key={m.value}
										aria-pressed={method === m.value}
										variant="secondary"
										size="sm"
										onClick={() => setMethod(m.value)}
										className={cn("h-6 text-2xs", method === m.value ? "!border-primary !bg-active-primary text-foreground" : "text-tertiary-foreground")}
									>
										{m.label}
									</Button>
								))}
							</ActionBar>
						</div>
						{bankAccounts.length > 0 && (
							<div className={cn(pad, "flex flex-col gap-1.5 border-t border-table-row-divider")}>
								<span className="text-2xs text-tertiary-foreground">Deposited to</span>
																<Select value={account || null} onValueChange={(v) => setAccount(v ?? "")} items={bankAccounts.map((a) => ({ value: a.accountCode, label: `${a.accountCode} · ${a.accountName}` }))}>
									<SelectTrigger id={`${uid}-account`} className="h-input w-full px-2 text-sm" aria-label="Deposited to" aria-required="true" {...errorProps("account")}><SelectValue placeholder="Choose a bank account" /></SelectTrigger>
									<SelectContent>{bankAccounts.map((a) => <SelectItem key={a.accountCode} value={a.accountCode}><span className="mr-1.5 text-tiny-id">{a.accountCode}</span>{a.accountName}</SelectItem>)}</SelectContent>
								</Select>
								{fieldError("account")}
							</div>
						)}
						<div className={cn(pad, "flex flex-col gap-1.5 border-t border-table-row-divider")}>
							<label className="text-2xs text-tertiary-foreground" htmlFor={`${uid}-note`}>Note <span className="text-subtle">(optional)</span></label>
							<Textarea id={`${uid}-note`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Received via Maybank, ref #12345" className="min-h-11 resize-none text-sm" />
						</div>
						<div className="px-4 pb-2.5">
							<Alert variant="warning" className="py-2">
								<WarningIcon aria-hidden="true" />
								<AlertDescription className="text-2xs">This will create a manual payment record. Use only for payments received offline (bank transfer, cash, cheque, etc.).</AlertDescription>
							</Alert>
						</div>
						<DialogFooter className="border-t border-table-row-divider px-4 py-2.5">
							<Button variant="secondary" onClick={() => changeOpen(false)}>Cancel</Button>
							{/* Always enabled: pressing it names each problem and focuses the first one. isLoading keeps focus (aria-disabled). */}
							<Button variant="primary" isLoading={isSubmitting} onClick={confirm} className="gap-1.5">
								<CheckCircleIcon size={14} weight="bold" aria-hidden="true" />
								Mark as paid
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

/* ----------------------------------------------------------- InvoiceBulkBar */

/** Floating toolbar for ticked invoice rows (cynco InvoiceBulkBar): download PDFs or delete; blocked actions say why. */
export function InvoiceBulkBar({
	selected,
	onClear,
	onDownload,
	onDelete,
	downloading = false,
	deleting = false,
	floating = false,
	className,
	...props
}: React.ComponentProps<"div"> & {
	selected: { id: string; status: string; hasPayments?: boolean }[];
	onClear?: () => void;
	onDownload?: () => void;
	onDelete?: () => void;
	downloading?: boolean;
	deleting?: boolean;
	/** Pin to the bottom of the viewport, as in the app; off for inline previews. */
	floating?: boolean;
}) {
	const count = selected.length;
	if (count === 0) return null;
	const plural = (n: number) => `${n} invoice${n === 1 ? "" : "s"}`;
	const downloadable = selected.filter((i) => i.status !== "draft");
	const blocked = selected.filter((i) => i.hasPayments || i.status === "voided" || i.status === "paid" || i.status === "partially_paid");
	const downloadBlocked = downloadable.length === 0 ? "Drafts have no PDF yet." : downloadable.length > 50 ? "Select 50 or fewer invoices to download." : null;
	const deleteBlocked = blocked.length > 0 ? `${plural(blocked.length)} with payments or voided can't be deleted.` : null;
	return (
		<div
			role="toolbar"
			aria-label="Bulk actions"
			className={cn("flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border bg-card p-1 pl-3 shadow-lg", floating && "fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2", className)}
			{...props}
		>
			<span className="mr-auto whitespace-nowrap pr-1.5 text-sm tabular-nums text-foreground" aria-live="polite">{count} selected</span>
			<div className="flex items-center gap-1">
				<Button variant="skeleton" title={downloadBlocked ?? undefined} aria-label={downloadBlocked ? `Download PDFs — ${downloadBlocked}` : undefined} aria-disabled={downloadBlocked || downloading ? true : undefined} onClick={() => !downloadBlocked && !downloading && onDownload?.()} className={cn("gap-1.5", downloadBlocked && "opacity-50")}>
					<DownloadSimpleIcon size={14} aria-hidden="true" />
					{downloading ? "Preparing…" : "Download PDFs"}
				</Button>
				<Button variant="skeleton" title={deleteBlocked ?? undefined} aria-label={deleteBlocked ? `Delete — ${deleteBlocked}` : undefined} aria-disabled={deleteBlocked || deleting ? true : undefined} onClick={() => !deleteBlocked && !deleting && onDelete?.()} className={cn("gap-1.5 text-error-text hover:!text-error-text", deleteBlocked && "opacity-50")}>
					<TrashIcon size={14} aria-hidden="true" />
					{deleting ? "Deleting…" : "Delete"}
				</Button>
				<span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
				<Button variant="skeleton" size="icon" aria-label="Clear selection" onClick={onClear} className="size-7"><XIcon size={14} aria-hidden="true" /></Button>
			</div>
		</div>
	);
}

/* ------------------------------------------------------- InvoiceFilterChips */

export type SalesFilterChip = { key: string; label: string; value: string };

/** One removable chip per active invoice filter (cynco ActiveFilterChips) using FilterChip. */
export function InvoiceFilterChips({ chips, onRemove, onClearAll, className, ...props }: React.ComponentProps<"div"> & { chips: SalesFilterChip[]; onRemove?: (key: string) => void; onClearAll?: () => void }) {
	if (chips.length === 0) return null;
	return (
		<ActionBar className={cn("gap-1.5", className)} {...props}>
			{chips.map((c) => <FilterChip key={c.key} label={c.label} value={c.value} onRemove={() => onRemove?.(c.key)} />)}
			{chips.length > 1 && (
				<Button variant="skeleton" size="sm" onClick={onClearAll} className="text-tertiary-foreground">Clear all</Button>
			)}
		</ActionBar>
	);
}

/* -------------------------------------------------------- CreditNoteSummary */

export type SalesNote = {
	noteType: "credit" | "debit";
	status: string;
	currency?: string;
	subtotal: number;
	discountAmount?: number;
	taxAmount: number;
	totalAmount: number;
	appliedAmount?: number;
	refundAmount?: number;
	remainingAmount?: number;
	paidAmount?: number;
	isInvoiceAmendment?: boolean;
};

export type SalesNotePayment = { id: string; paymentDate?: string; method: string; reference?: string; amount: number };

function NoteRow({ label, value, strong, total }: { label: string; value: string; strong?: boolean; total?: boolean }) {
	return (
		<div className={cn("flex flex-wrap justify-between gap-x-4 text-sm tabular-nums", strong || total ? "text-foreground" : "text-tertiary-foreground", total && "border-t border-table-row-divider pt-1.5 font-semibold", strong && "font-semibold")}>
			<dt>{label}</dt>
			<dd className="ml-auto whitespace-nowrap">{value}</dd>
		</div>
	);
}

/** A credit/debit note's totals and where its money went (cynco NoteMoneySummary + NotePaymentsList). */
export function CreditNoteSummary({ note, payments = [], className, ...props }: React.ComponentProps<"div"> & { note: SalesNote; payments?: SalesNotePayment[] }) {
	const cur = note.currency || "MYR";
	const m = (n: number | undefined) => formatCurrency(n ?? 0, cur);
	const settled = note.status !== "draft" && note.status !== "voided" && !note.isInvoiceAmendment;
	const owed = Math.max(0, note.totalAmount - (note.paidAmount ?? 0));
	return (
		<div className={cn("flex min-w-0 flex-col gap-4", className)} {...props}>
			<dl className="ml-auto flex w-full max-w-xs flex-col gap-1.5">
				<NoteRow label="Subtotal" value={m(note.subtotal)} />
				{(note.discountAmount ?? 0) > 0 && <NoteRow label="Discount" value={`−${m(note.discountAmount)}`} />}
				<NoteRow label="Tax" value={m(note.taxAmount)} />
				<NoteRow label="Total" value={m(note.totalAmount)} total />
				{settled && (note.noteType === "credit" ? (
					<>
						<NoteRow label="Applied" value={m(note.appliedAmount)} />
						{(note.refundAmount ?? 0) > 0 && <NoteRow label="Refunded" value={m(note.refundAmount)} />}
						<NoteRow label="Credit left" value={m(note.remainingAmount)} strong />
					</>
				) : (
					<>
						<NoteRow label="Paid" value={m(note.paidAmount)} />
						<NoteRow label="Still owed" value={m(owed)} strong />
					</>
				))}
			</dl>
			{payments.length > 0 && (
				<div className="flex flex-col gap-2 border-t border-table-row-divider pt-3">
					<SectionLabel>Payments</SectionLabel>
					<ul className={surfaces.surface}>
						{payments.map((p) => (
							<li key={p.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-b border-table-row-divider px-3 py-2 last:border-b-0">
								<div className="min-w-0">
									<p className="text-sm text-foreground">{p.paymentDate ? formatDate(p.paymentDate) : "Payment"}</p>
									<p className="break-words text-2xs text-tertiary-foreground">
										{p.method || "—"}
										{p.reference && <> · <span className="text-tiny-id text-primary">{p.reference}</span></>}
									</p>
								</div>
								<span className="ml-auto whitespace-nowrap text-sm tabular-nums text-foreground">{formatCurrency(p.amount, cur)}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------ CreditDebitNoteList */

export type SalesNoteRow = { id: string; noteNumber?: string | null; noteType: "credit" | "debit"; customerName: string; totalAmount: number; currency?: string; status: string; date: string };

/** Credit/Debit type as a quiet tag with a status-coloured square, not a tinted pill. */
function NoteTypeTag({ type }: { type: "credit" | "debit" }) {
	return (
		<span className="inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-muted px-1.5 text-2xs text-muted-foreground">
			<ToneDot tone={type === "credit" ? "green" : "amber"} square />
			{type === "credit" ? "Credit" : "Debit"}
		</span>
	);
}

/** The credit & debit notes list (cynco CreditDebitNoteTable): Note, Type, Customer, Amount, Status, Date. */
export function CreditDebitNoteList({ notes, onOpen, className }: { notes: SalesNoteRow[]; onOpen?: (id: string) => void; className?: string }) {
	const columns: DataColumn<SalesNoteRow>[] = [
		{ key: "note", header: "Note", mobile: "title", className: "whitespace-nowrap", cell: (n) => <span className={n.noteNumber ? "text-tiny-id text-foreground" : "text-tiny-id text-tertiary-foreground"}>{n.noteNumber || "Draft"}</span> },
		{ key: "type", header: "Type", mobile: "badge", cell: (n) => <NoteTypeTag type={n.noteType} /> },
		{ key: "customer", header: "Customer", mobile: "meta", cell: (n) => n.customerName || "—" },
		{ key: "amount", header: "Amount", align: "right", mobile: "value", cell: (n) => formatCurrency(n.totalAmount, n.currency || "MYR") },
		{ key: "status", header: "Status", mobile: "badge", className: "whitespace-nowrap", cell: (n) => <DocStatus status={n.status} config={NOTE_STATUS} /> },
		{ key: "date", header: "Date", mobile: "meta", className: "whitespace-nowrap", cell: (n) => <span className="text-xs tabular-nums text-tertiary-foreground">{formatDate(n.date)}</span> },
	];
	return (
		<DataList
			className={className}
			caption="Credit and debit notes"
			columns={columns}
			rows={notes}
			getKey={(n) => n.id}
			stackBelow="3xl"
			dense
			onRowClick={onOpen ? (n) => onOpen(n.id) : undefined}
			trailing={(n) => <ToolbarButton aria-label={`Actions for ${n.noteNumber || "Draft"}`} />}
			empty="No credit or debit notes"
		/>
	);
}

/* ---------------------------------------------- QuotationBoardCard / Column */

export type SalesQuotation = { id: string; quotationNumber?: string | null; customerName: string; totalAmount: number; currency?: string; status: string; createdAt: string };

function relativeTime(dateStr: string, now = new Date()) {
	const d = parseDate(dateStr);
	if (isNaN(d.getTime())) return "";
	const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
	if (days <= 0) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 7) return `${days}d ago`;
	if (days < 30) return `${Math.floor(days / 7)}w ago`;
	return `${Math.floor(days / 30)}mo ago`;
}

/** One quotation on the Kanban board (cynco QuotationBoardCard). */
export function QuotationBoardCard({ quotation, now, onOpen, className, ...props }: Omit<React.ComponentProps<"button">, "type"> & { quotation: SalesQuotation; now?: string; onOpen?: (id: string) => void }) {
	return (
		// Raw button: the whole card is the click target; it keeps a focus ring and its text is the name.
		<button
			type="button"
			onClick={() => onOpen?.(quotation.id)}
			className={cn("@container w-full min-w-0 cursor-pointer rounded-xl border bg-card p-3 text-left shadow-sm outline-none transition-colors hover:bg-interactive-secondary-hover focus-ring", className)}
			{...props}
		>
			<div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
				<div className="min-w-0 flex-[1_1_5rem]">
					<p className="truncate text-sm text-foreground" title={quotation.customerName}>{quotation.customerName || "—"}</p>
					<p className="mt-0.5 text-tiny-id text-tertiary-foreground">{quotation.quotationNumber || "—"}</p>
				</div>
				<DocStatus status={quotation.status} config={QUOTATION_STATUS} />
			</div>
			<div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2">
				<span className="whitespace-nowrap text-sm tabular-nums text-foreground">{formatCurrency(quotation.totalAmount ?? 0, quotation.currency || "MYR")}</span>
				<span className="text-2xs text-subtle">{relativeTime(quotation.createdAt, now ? parseDate(now) : undefined)}</span>
			</div>
		</button>
	);
}

const BOARD_COLUMNS = {
	draft: { label: "Draft", icon: NotePencilIcon, empty: "No drafts" },
	active: { label: "Sent / Viewed", icon: PaperPlaneTiltIcon, empty: "No active quotations" },
	accepted: { label: "Accepted", icon: CheckCircleIcon, empty: "No accepted quotations" },
	terminal: { label: "Rejected / Expired", icon: XCircleIcon, empty: "No rejected or expired quotations" },
} as const;

/** A Kanban column of the quotations board (cynco QuotationsBoardView column): header count, cards, column total. */
export function QuotationBoardColumn({ column, quotations, currency = "MYR", now, onOpen, className, ...props }: React.ComponentProps<"section"> & { column: keyof typeof BOARD_COLUMNS; quotations: SalesQuotation[]; currency?: string; now?: string; onOpen?: (id: string) => void }) {
	const def = BOARD_COLUMNS[column];
	const total = quotations.reduce((s, q) => s + (q.totalAmount ?? 0), 0);
	return (
		<section aria-label={def.label} className={cn("flex min-w-0 flex-1 flex-col", className)} {...props}>
			<div className="mb-2 flex items-center gap-2 px-1">
				<def.icon size={15} aria-hidden="true" className="shrink-0 text-tertiary-foreground" />
				<span className="truncate text-sm text-foreground">{def.label}</span>
				<span className="rounded-md bg-muted px-1.5 text-2xs tabular-nums text-tertiary-foreground">{quotations.length}</span>
			</div>
			<div className="flex flex-1 flex-col rounded-xl border border-table-tray-border bg-table-tray">
				{quotations.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
						<def.icon size={28} aria-hidden="true" className="mb-2 text-subtle opacity-50" />
						<p className="text-2xs text-tertiary-foreground">{def.empty}</p>
					</div>
				) : (
					<>
						<div className="flex flex-col gap-1.5 p-1.5">
							{quotations.map((q) => <QuotationBoardCard key={q.id} quotation={q} now={now} onOpen={onOpen} />)}
						</div>
						<div className="flex flex-wrap items-center justify-between gap-x-2 px-3 py-2">
							<span className="text-2xs text-tertiary-foreground">Total</span>
							<span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatCurrency(total, currency)}</span>
						</div>
					</>
				)}
			</div>
		</section>
	);
}

/* ----------------------------------------------------------- QuotationStats */

/** Quotation KPI row (cynco QuotationStats): Total quoted, Sent, Accepted, Conversion rate. */
export function QuotationStats({ stats, className, ...props }: React.ComponentProps<"div"> & { stats: { totalQuotedAmount: number; currency?: string; sentCount: number; acceptedCount: number; conversionRate: number } }) {
	return (
		<StatGrid aria-label="Quotation statistics" min="sm" className={className} {...props}>
			<StatTile label="Total quoted" value={formatCurrency(stats.totalQuotedAmount || 0, stats.currency || "MYR")} className="shadow-sm" />
			<StatTile label="Sent" value={String(stats.sentCount || 0)} dot="var(--chart-series-4)" className="shadow-sm" />
			<StatTile label="Accepted" value={String(stats.acceptedCount || 0)} dot="var(--chart-series-3)" className="shadow-sm" />
			<StatTile label="Conversion rate" value={`${(stats.conversionRate || 0).toFixed(1)}%`} dot="var(--primary)" className="shadow-sm" />
		</StatGrid>
	);
}

/* --------------------------------------------------- RecurringTemplateTable */

const FREQUENCY_LABELS: Record<string, string> = { weekly: "Weekly", biweekly: "Bi-weekly", monthly: "Monthly", quarterly: "Quarterly", semiannually: "Semi-annually", annually: "Annually" };

export type SalesRecurringTemplate = { id: string; customerName: string; customerEmail?: string; frequency: string; nextGenerationDate?: string | null; totalAmount?: number | null; currency?: string; totalGenerated: number; status: string };

/** Recurring invoice templates list (cynco RECURRING_TEMPLATE_COLUMNS). */
export function RecurringTemplateTable({ templates, className }: { templates: SalesRecurringTemplate[]; className?: string }) {
	const columns: DataColumn<SalesRecurringTemplate>[] = [
		{
			key: "customer", header: "Customer", mobile: "title",
			cell: (t) => (
				<div className="flex min-w-0 flex-col leading-tight">
					<span className="break-words text-sm text-foreground">{t.customerName}</span>
					{t.customerEmail && <span className="break-all text-2xs font-normal text-tertiary-foreground">{t.customerEmail}</span>}
				</div>
			),
		},
		{ key: "frequency", header: "Frequency", mobile: "meta", className: "whitespace-nowrap", cell: (t) => FREQUENCY_LABELS[t.frequency] ?? t.frequency },
		{ key: "next", header: "Next generation", mobile: "meta", className: "whitespace-nowrap", cell: (t) => <span className="tabular-nums text-tertiary-foreground">{t.nextGenerationDate ? formatDate(t.nextGenerationDate) : "—"}</span> },
		{ key: "amount", header: "Amount", align: "right", mobile: "value", cell: (t) => (t.totalAmount != null ? formatCurrency(t.totalAmount, t.currency || "MYR") : <span className="text-tertiary-foreground">—</span>) },
		{ key: "generated", header: "Generated", align: "right", mobile: "meta", cell: (t) => <span className="tabular-nums text-tertiary-foreground">{t.totalGenerated}</span> },
		{ key: "status", header: "Status", mobile: "badge", className: "whitespace-nowrap", cell: (t) => <DocStatus status={t.status} config={LIFECYCLE_STATUS} /> },
	];
	return <DataList className={className} caption="Recurring invoice templates" columns={columns} rows={templates} getKey={(t) => t.id} stackBelow="xl" />;
}
