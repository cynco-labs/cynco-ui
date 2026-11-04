"use client";

/**
 * Cynco UI — credit and debit notes: one note's money summary, and the list of them all.
 */
import type * as React from "react";
import { cn, ToolbarButton } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import {
	type DataColumn,
	DataList,
	DocStatus,
	formatCurrency,
	formatDate,
	SectionLabel,
	type StatusEntry,
	surfaces,
	ToneDot,
} from "../../lib/shared";
import { outstandingOf } from "../shared";

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

/* -------------------------------------------------------- CreditNoteSummary */

export type SalesNote = {
	noteType: "credit" | "debit";
	status: string;
	currency?: string;
	subtotal: Amount;
	discountAmount?: Amount;
	taxAmount: Amount;
	totalAmount: Amount;
	appliedAmount?: Amount;
	refundAmount?: Amount;
	remainingAmount?: Amount;
	paidAmount?: Amount;
	isInvoiceAmendment?: boolean;
};

export type SalesNotePayment = { id: string; paymentDate?: string; method: string; reference?: string; amount: Amount };

function NoteRow({ label, value, strong, total }: { label: string; value: string; strong?: boolean; total?: boolean }) {
	return (
		<div
			className={cn(
				"flex flex-wrap justify-between gap-x-4 text-sm tabular-nums",
				strong || total ? "text-foreground" : "text-tertiary-foreground",
				total && "border-t border-table-row-divider pt-1.5 font-semibold",
				strong && "font-semibold",
			)}
		>
			<dt>{label}</dt>
			<dd className="ml-auto whitespace-nowrap">{value}</dd>
		</div>
	);
}

/** A credit/debit note's totals and where its money went (cynco NoteMoneySummary + NotePaymentsList). */
export function CreditNoteSummary({
	note,
	payments = [],
	className,
	...props
}: React.ComponentProps<"div"> & { note: SalesNote; payments?: SalesNotePayment[] }) {
	const cur = note.currency || "MYR";
	const m = (n: Amount | undefined) => formatCurrency(n ?? 0, cur);
	const settled = note.status !== "draft" && note.status !== "voided" && !note.isInvoiceAmendment;
	const outstanding = outstandingOf(note.totalAmount, note.paidAmount);
	return (
		<div className={cn("flex min-w-0 flex-col gap-4", className)} {...props}>
			<dl className="ml-auto flex w-full max-w-xs flex-col gap-1.5">
				<NoteRow label="Subtotal" value={m(note.subtotal)} />
				{toSen(note.discountAmount ?? 0) > 0n && <NoteRow label="Discount" value={`−${m(note.discountAmount)}`} />}
				<NoteRow label="Tax" value={m(note.taxAmount)} />
				<NoteRow label="Total" value={m(note.totalAmount)} total />
				{settled &&
					(note.noteType === "credit" ? (
						<>
							<NoteRow label="Applied" value={m(note.appliedAmount)} />
							{toSen(note.refundAmount ?? 0) > 0n && <NoteRow label="Refunded" value={m(note.refundAmount)} />}
							<NoteRow label="Credit left" value={m(note.remainingAmount)} strong />
						</>
					) : (
						<>
							<NoteRow label="Paid" value={m(note.paidAmount)} />
							<NoteRow label="Still owed" value={m(outstanding)} strong />
						</>
					))}
			</dl>
			{payments.length > 0 && (
				<div className="flex flex-col gap-2 border-t border-table-row-divider pt-3">
					<SectionLabel>Payments</SectionLabel>
					<ul className={surfaces.surface}>
						{payments.map((p) => (
							<li
								key={p.id}
								className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-b border-table-row-divider px-3 py-2 last:border-b-0"
							>
								<div className="min-w-0">
									<p className="text-sm text-foreground">{p.paymentDate ? formatDate(p.paymentDate) : "Payment"}</p>
									<p className="break-words text-2xs text-tertiary-foreground">
										{p.method || "—"}
										{p.reference && (
											<>
												{" "}
												· <span className="font-mono text-2xs font-medium text-primary">{p.reference}</span>
											</>
										)}
									</p>
								</div>
								<span className="ml-auto whitespace-nowrap text-sm tabular-nums text-foreground">
									{formatCurrency(p.amount, cur)}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------ CreditDebitNoteList */

export type SalesNoteRow = {
	id: string;
	noteNumber?: string | null;
	noteType: "credit" | "debit";
	customerName: string;
	totalAmount: Amount;
	currency?: string;
	status: string;
	date: string;
};

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
export function CreditDebitNoteList({
	notes,
	onRowClick,
	onRowAction,
	className,
	...props
}: {
	notes: SalesNoteRow[];
	/** Called with the whole note when its row is opened; omit to leave rows inert. */
	onRowClick?: (note: SalesNoteRow) => void;
	/** Called from a row's actions button; omit to hide the button. */
	onRowAction?: (note: SalesNoteRow) => void;
} & Omit<React.ComponentProps<"div">, "children">) {
	const columns: DataColumn<SalesNoteRow>[] = [
		{
			key: "note",
			header: "Note",
			mobile: "title",
			className: "whitespace-nowrap",
			cell: (n) => (
				<span
					className={
						n.noteNumber
							? "font-mono text-2xs font-medium text-foreground"
							: "font-mono text-2xs font-medium text-tertiary-foreground"
					}
				>
					{n.noteNumber || "Draft"}
				</span>
			),
		},
		{ key: "type", header: "Type", mobile: "badge", cell: (n) => <NoteTypeTag type={n.noteType} /> },
		{ key: "customer", header: "Customer", mobile: "meta", cell: (n) => n.customerName || "—" },
		{
			key: "amount",
			header: "Amount",
			align: "right",
			mobile: "value",
			cell: (n) => formatCurrency(n.totalAmount, n.currency || "MYR"),
		},
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			className: "whitespace-nowrap",
			cell: (n) => <DocStatus status={n.status} config={NOTE_STATUS} />,
		},
		{
			key: "date",
			header: "Date",
			mobile: "meta",
			className: "whitespace-nowrap",
			cell: (n) => <span className="text-xs tabular-nums text-tertiary-foreground">{formatDate(n.date)}</span>,
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="Credit and debit notes"
			columns={columns}
			rows={notes}
			getKey={(n) => n.id}
			stackBelow="3xl"
			dense
			onRowClick={onRowClick}
			trailing={
				onRowAction &&
				((n) => <ToolbarButton aria-label={`Actions for ${n.noteNumber || "Draft"}`} onClick={() => onRowAction(n)} />)
			}
			empty="No credit or debit notes"
		/>
	);
}
