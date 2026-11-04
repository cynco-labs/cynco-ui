"use client";

import {
	ArrowDownIcon,
	ArrowUpIcon,
	DownloadSimpleIcon,
	EnvelopeSimpleIcon,
	TrashIcon,
	XIcon,
} from "@phosphor-icons/react";
/**
 * Cynco UI — the Invoicing page: the metric strip above the list, the list itself, the bulk bar
 * for ticked rows and the chips for the active filters.
 */
import * as React from "react";
import { Button, Checkbox, cn, FilterChip, StatusChipIcon, ToolbarButton } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import {
	ActionBar,
	type DataColumn,
	DataList,
	DocStatus,
	formatCurrency,
	formatDate,
	INVOICE_STATUS,
	StatGrid,
	StatTile,
} from "../../lib/shared";
import { useSelection } from "../shared";

/* --------------------------------------------------------- InvoiceListTable */

export type SalesInvoiceRow = {
	id: string;
	invoiceNumber: string;
	customerName: string;
	invoiceDate: string;
	dueDate?: string | null;
	total: Amount;
	currency?: string;
	status: string;
	/** `null` on a posted invoice → "Not posted to GL" signal. Leave it out when the list doesn't track posting. */
	journalEntryId?: string | null;
	emailStatus?: "sent" | "delivered" | "opened" | "failed" | "bounced" | "complained" | null;
};

const GL_EXEMPT = new Set(["draft", "voided", "cancelled", "refunded"]);

/** Status chip plus by-exception signals (GL entry missing, email problem); quiet on the happy path. */
function InvoiceStatusSignals({ invoice }: { invoice: SalesInvoiceRow }) {
	const glMissing = !GL_EXEMPT.has(invoice.status) && invoice.journalEntryId === null;
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
					<EnvelopeSimpleIcon size={14} weight="bold" className="text-error-text" aria-hidden="true" />
				</span>
			)}
		</div>
	);
}

/** A sortable column header: skeleton Button with the direction arrow. */
function SortHeader({
	id,
	label,
	sortField,
	sortDirection,
	onSort,
}: {
	id: string;
	label: string;
	sortField?: string;
	sortDirection?: "asc" | "desc";
	onSort?: (f: string) => void;
}) {
	const active = sortField === id;
	return (
		<Button
			variant="skeleton"
			size="sm"
			onClick={() => onSort?.(id)}
			aria-label={`Sort by ${label}`}
			className={cn(
				"-mx-1 h-5 gap-1 px-1 text-xs font-medium after:absolute after:-inset-y-0.5",
				active ? "text-foreground" : "text-tertiary-foreground",
			)}
		>
			{label}
			{active &&
				(sortDirection === "asc" ? (
					<ArrowUpIcon size={10} weight="bold" aria-hidden="true" />
				) : (
					<ArrowDownIcon size={10} weight="bold" aria-hidden="true" />
				))}
		</Button>
	);
}

/** The invoices list (cynco InvoiceTable + InvoiceStatusCell): tray table when wide, stacked rows when narrow. */
export function InvoiceListTable({
	invoices,
	selectedIds,
	defaultSelectedIds,
	onSelectionChange,
	sortField = "invoice_date",
	sortDirection = "desc",
	onSort,
	onRowAction,
	footer,
	className,
	...props
}: {
	invoices: SalesInvoiceRow[];
	/** The ticked rows. Pass it to control the selection. */
	selectedIds?: string[];
	/** The rows ticked to begin with when the selection is uncontrolled. */
	defaultSelectedIds?: string[];
	/** The whole new selection, every time it changes. */
	onSelectionChange?: (ids: string[]) => void;
	sortField?: string;
	sortDirection?: "asc" | "desc";
	onSort?: (field: string) => void;
	/** Called from a row's actions button; omit to hide the button. */
	onRowAction?: (invoice: SalesInvoiceRow) => void;
	footer?: React.ReactNode;
} & Omit<React.ComponentProps<"div">, "children">) {
	const selection = useSelection(selectedIds, defaultSelectedIds, onSelectionChange);
	const all = invoices.length > 0 && invoices.every((i) => selection.isSelected(i.id));
	const sh = (id: string, label: string) => (
		<SortHeader id={id} label={label} sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
	);
	// The direction is announced once, by aria-sort on the header cell.
	const sort = (id: string) => (sortField === id ? (sortDirection === "asc" ? "ascending" : "descending") : undefined);
	const columns: DataColumn<SalesInvoiceRow>[] = [
		{
			key: "invoice_number",
			sortDirection: sort("invoice_number"),
			header: sh("invoice_number", "Invoice #"),
			mobile: "table",
			cell: (r) => <span className="font-mono text-2xs font-medium text-primary">{r.invoiceNumber || "—"}</span>,
		},
		{
			key: "customer_name",
			sortDirection: sort("customer_name"),
			header: sh("customer_name", "Customer"),
			mobile: "title",
			className: "min-w-0",
			cell: (r) => <span className="line-clamp-1 break-all">{r.customerName || "—"}</span>,
			stackedCell: (r) => <span className="line-clamp-2 break-words">{r.customerName || "—"}</span>,
		},
		{
			key: "invoice_date",
			sortDirection: sort("invoice_date"),
			header: sh("invoice_date", "Date"),
			mobile: "table",
			className: "whitespace-nowrap",
			cell: (r) => <span className="text-xs tabular-nums text-tertiary-foreground">{formatDate(r.invoiceDate)}</span>,
		},
		{
			key: "due_date",
			sortDirection: sort("due_date"),
			header: sh("due_date", "Due Date"),
			mobile: "table",
			className: "whitespace-nowrap",
			cell: (r) => (
				<span className="text-xs tabular-nums text-tertiary-foreground">{r.dueDate ? formatDate(r.dueDate) : "—"}</span>
			),
		},
		{
			key: "total",
			sortDirection: sort("total"),
			header: sh("total", "Amount"),
			align: "right",
			mobile: "value",
			cell: (r) => formatCurrency(r.total, r.currency || "MYR"),
		},
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			className: "whitespace-nowrap",
			cell: (r) => <InvoiceStatusSignals invoice={r} />,
		},
		{
			// One quiet line on a phone instead of a labelled row per field, each label a sort button.
			key: "details",
			header: "Details",
			mobile: "stacked",
			stackedAs: "badge",
			cell: (r) => (
				<span className="flex flex-wrap items-baseline gap-x-1.5 text-xs tabular-nums whitespace-nowrap text-tertiary-foreground">
					<span className="font-mono text-2xs font-medium text-primary">
						<span className="sr-only">Invoice </span>
						{r.invoiceNumber || "—"}
					</span>
					<span>
						<span className="sr-only">Issued </span>
						{formatDate(r.invoiceDate)}
					</span>
					{r.dueDate && <span>Due {formatDate(r.dueDate)}</span>}
				</span>
			),
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="Invoices"
			columns={columns}
			rows={invoices}
			getKey={(r) => r.id}
			stackBelow="3xl"
			dense
			isRowSelected={(r) => selection.isSelected(r.id)}
			leadingHeader={
				<Checkbox
					aria-label="Select all invoices"
					checked={all}
					indeterminate={!all && selection.ids.size > 0}
					onCheckedChange={() => selection.replace(all ? [] : invoices.map((i) => i.id))}
				/>
			}
			leading={(r) => (
				<Checkbox
					aria-label={`Select invoice ${r.invoiceNumber}`}
					checked={selection.isSelected(r.id)}
					onCheckedChange={() => selection.toggle(r.id)}
				/>
			)}
			trailing={
				onRowAction &&
				((r) => <ToolbarButton aria-label={`Actions for ${r.invoiceNumber}`} onClick={() => onRowAction(r)} />)
			}
			footer={footer}
		/>
	);
}

/* ------------------------------------------------------- InvoiceMetricTiles */

/** The invoice list's all-time metric strip (cynco InvoiceTotal): Sales, Paid, Pending, Overdue. */
export function InvoiceMetricTiles({
	stats,
	currency = "MYR",
	onShowOverdue,
	className,
	...props
}: React.ComponentProps<"div"> & {
	/** null when the tenant-wide stats could not load: tiles show "—". */
	stats: {
		totalValue: Amount;
		paidValue: Amount;
		pendingValue: Amount;
		overdueValue: Amount;
		overdueCount: number;
	} | null;
	currency?: string;
	onShowOverdue?: () => void;
}) {
	const tiles = [
		{ title: "Sales", value: stats?.totalValue },
		{ title: "Paid", value: stats?.paidValue },
		{ title: "Pending", value: stats?.pendingValue },
		{
			title: "Overdue",
			value: stats?.overdueValue,
			badge:
				stats && stats.overdueCount > 0 ? `${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"}` : null,
		},
	];
	return (
		<StatGrid min="sm" className={className} {...props}>
			{tiles.map((t) => {
				const overdue = t.title === "Overdue" && toSen(t.value ?? 0) > 0n;
				const tile = (
					// biome-ignore lint/correctness/useJsxKeyInIterable: the key sits on the element this callback returns, which wraps this one
					<StatTile
						label={t.title}
						value={stats ? formatCurrency(t.value ?? 0, currency) : <span className="text-tertiary-foreground">—</span>}
						negative={overdue}
						badge={
							t.badge ? (
								<span className="shrink-0 text-2xs tabular-nums text-error-text">{t.badge}</span>
							) : !stats ? (
								<span className="text-2xs text-subtle">Unavailable</span>
							) : undefined
						}
						className={cn(
							"h-full shadow-sm",
							overdue && onShowOverdue && "transition-colors hover:bg-interactive-secondary-hover",
						)}
					/>
				);
				return overdue && onShowOverdue ? (
					<button
						key={t.title}
						type="button"
						onClick={onShowOverdue}
						aria-label={`${t.title}: ${formatCurrency(t.value ?? 0, currency)}, ${t.badge}. Show these invoices`}
						className="min-w-0 cursor-pointer rounded-xl text-left outline-none focus-ring"
					>
						{tile}
					</button>
				) : (
					<React.Fragment key={t.title}>{tile}</React.Fragment>
				);
			})}
		</StatGrid>
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
	const blocked = selected.filter(
		(i) => i.hasPayments || i.status === "voided" || i.status === "paid" || i.status === "partially_paid",
	);
	const downloadBlocked =
		downloadable.length === 0
			? "Drafts have no PDF yet."
			: downloadable.length > 50
				? "Select 50 or fewer invoices to download."
				: null;
	const deleteBlocked =
		blocked.length > 0 ? `${plural(blocked.length)} with payments or voided can't be deleted.` : null;
	return (
		<div
			role="toolbar"
			aria-label="Bulk actions"
			className={cn(
				"flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border bg-card p-1 pl-3 shadow-lg",
				floating && "fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2",
				className,
			)}
			{...props}
		>
			<span className="mr-auto whitespace-nowrap pr-1.5 text-sm tabular-nums text-foreground" aria-live="polite">
				{count} selected
			</span>
			<div className="flex items-center gap-1">
				<Button
					variant="skeleton"
					title={downloadBlocked ?? undefined}
					aria-label={downloadBlocked ? `Download PDFs — ${downloadBlocked}` : undefined}
					aria-disabled={downloadBlocked || downloading ? true : undefined}
					onClick={() => !downloadBlocked && !downloading && onDownload?.()}
					className={cn("gap-1.5", downloadBlocked && "opacity-50")}
				>
					<DownloadSimpleIcon size={14} aria-hidden="true" />
					{downloading ? "Preparing…" : "Download PDFs"}
				</Button>
				<Button
					variant="skeleton"
					title={deleteBlocked ?? undefined}
					aria-label={deleteBlocked ? `Delete — ${deleteBlocked}` : undefined}
					aria-disabled={deleteBlocked || deleting ? true : undefined}
					onClick={() => !deleteBlocked && !deleting && onDelete?.()}
					className={cn("gap-1.5 text-error-text hover:text-error-text", deleteBlocked && "opacity-50")}
				>
					<TrashIcon size={14} aria-hidden="true" />
					{deleting ? "Deleting…" : "Delete"}
				</Button>
				<span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
				<Button variant="skeleton" size="icon" aria-label="Clear selection" onClick={onClear} className="size-7">
					<XIcon size={14} aria-hidden="true" />
				</Button>
			</div>
		</div>
	);
}

/* ------------------------------------------------------- InvoiceFilterChips */

export type SalesFilterChip = { key: string; label: string; value: string };

/** One removable chip per active invoice filter (cynco ActiveFilterChips) using FilterChip. */
export function InvoiceFilterChips({
	chips,
	onRemove,
	onClearAll,
	className,
	...props
}: React.ComponentProps<"div"> & {
	chips: SalesFilterChip[];
	onRemove?: (key: string) => void;
	onClearAll?: () => void;
}) {
	if (chips.length === 0) return null;
	return (
		<ActionBar className={cn("gap-1.5", className)} {...props}>
			{chips.map((c) => (
				<FilterChip key={c.key} label={c.label} value={c.value} onRemove={() => onRemove?.(c.key)} />
			))}
			{chips.length > 1 && (
				<Button variant="skeleton" size="sm" onClick={onClearAll} className="text-tertiary-foreground">
					Clear all
				</Button>
			)}
		</ActionBar>
	);
}
