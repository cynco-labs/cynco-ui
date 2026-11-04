"use client";

import {
	BellRingingIcon,
	CalendarBlankIcon,
	CheckCircleIcon,
	EnvelopeIcon,
	MinusCircleIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	ReceiptIcon,
	TruckIcon,
	WarningIcon,
} from "@phosphor-icons/react";
/**
 * Cynco UI — what you can do to one invoice: the status-aware Actions card on the detail page,
 * and the dialog that records a payment received offline.
 */
import * as React from "react";
import {
	Alert,
	AlertDescription,
	Button,
	cn,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	LiveStatus,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatusChipIcon,
	Textarea,
	useControllableState,
} from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { ActionBar, FieldError, fieldErrorProps, formatCurrency, formatDate, SectionPanel } from "../../lib/shared";
import { type InvoiceAction, outstandingOf, PAYMENT_METHODS, type PaymentMethod } from "../shared";

/* ------------------------------------------------------ InvoiceActionsPanel */

export type { InvoiceAction };

type ActionDef = { id: InvoiceAction; icon: React.ElementType; label: string };

/** Which actions an invoice offers, by status (cynco InvoiceActionsCard rules). */
function invoiceActions(rawStatus: string, emailed: boolean): ActionDef[] {
	// "sent" is a finalized invoice whose email has gone out.
	const status = rawStatus === "sent" ? "finalized" : rawStatus;
	const emailSent = emailed || rawStatus === "sent";
	const a: ActionDef[] = [];
	if (status === "finalized" && !emailSent) a.push({ id: "send_email", icon: EnvelopeIcon, label: "Send email" });
	if (emailSent && status !== "paid" && status !== "draft")
		a.push({ id: "send_reminder", icon: BellRingingIcon, label: "Send reminder" });
	if (["finalized", "overdue", "partially_paid", "deposit_due", "deposit_paid"].includes(status))
		a.push({ id: "mark_paid", icon: CheckCircleIcon, label: "Mark as paid" });
	if (status === "paid" || status === "partially_paid")
		a.push({ id: "download_receipt", icon: ReceiptIcon, label: "Download receipt" });
	if (status === "draft" || status === "finalized")
		a.push({ id: "edit_invoice", icon: PencilSimpleIcon, label: "Edit invoice" });
	if (status !== "draft" && status !== "voided")
		a.push(
			{ id: "create_delivery_order", icon: TruckIcon, label: "Create delivery order" },
			{ id: "view_deliveries", icon: TruckIcon, label: "View deliveries" },
		);
	if (["finalized", "overdue", "partially_paid", "paid"].includes(status))
		a.push(
			{ id: "create_credit_note", icon: MinusCircleIcon, label: "Create credit note" },
			{ id: "create_debit_note", icon: PlusCircleIcon, label: "Create debit note" },
		);
	return a;
}

/** The invoice view's side "Actions" card (cynco InvoiceActionsCard): status-aware shortcuts. */
export function InvoiceActionsPanel({
	status,
	emailSent = false,
	onAction,
	className,
	...props
}: Omit<React.ComponentProps<"section">, "title"> & {
	status: string;
	emailSent?: boolean;
	onAction?: (action: InvoiceAction) => void;
}) {
	const actions = invoiceActions(status, emailSent);
	return (
		<SectionPanel title="Actions" className={cn("shadow-sm", className)} {...props}>
			<div className="-mx-2.5 -my-2 flex flex-col gap-0.5">
				{actions.map((a) => (
					<Button
						key={a.id}
						variant="skeleton"
						className="w-full justify-start gap-2 text-muted-foreground"
						onClick={() => onAction?.(a.id)}
					>
						<a.icon size={15} aria-hidden="true" className="text-tertiary-foreground" />
						<span className="truncate">{a.label}</span>
					</Button>
				))}
			</div>
		</SectionPanel>
	);
}

/* --------------------------------------------------------- MarkAsPaidDialog */

export type SalesBankAccount = { accountCode: string; accountName: string };

/** Record a manual payment against an invoice (cynco MarkAsPaidDialog + PaymentFields). */
export function MarkAsPaidDialog({
	open,
	defaultOpen,
	modal = true,
	onOpenChange,
	invoice,
	paymentDate,
	paymentMethod,
	defaultPaymentMethod = "bank_transfer",
	onPaymentMethodChange,
	bankAccounts = [],
	bankAccount,
	defaultBankAccount = null,
	onBankAccountChange,
	note,
	defaultNote = "",
	onNoteChange,
	showSuccess = false,
	isSubmitting = false,
	onConfirm,
	className,
}: {
	open?: boolean;
	defaultOpen?: boolean;
	modal?: boolean;
	onOpenChange?: (open: boolean) => void;
	invoice: { invoiceNumber: string; customerName: string; total: Amount; currency?: string; paidAmount?: Amount };
	paymentDate?: string;
	/** The chosen payment method. Pass it to control the chips. */
	paymentMethod?: PaymentMethod;
	defaultPaymentMethod?: PaymentMethod;
	onPaymentMethodChange?: (method: PaymentMethod) => void;
	bankAccounts?: SalesBankAccount[];
	/** The account code the payment lands in, or null for none chosen. Pass it to control the select. */
	bankAccount?: string | null;
	defaultBankAccount?: string | null;
	onBankAccountChange?: (accountCode: string | null) => void;
	/** The note on the payment. Pass it to control the field. */
	note?: string;
	defaultNote?: string;
	onNoteChange?: (note: string) => void;
	showSuccess?: boolean;
	isSubmitting?: boolean;
	onConfirm?: (p: { method: PaymentMethod; bankAccount: string | null; note: string }) => void;
	/** Merged onto the dialog panel. */
	className?: string;
}) {
	const cur = invoice.currency || "MYR";
	const uid = React.useId();
	const [method = "bank_transfer", setMethod] = useControllableState<PaymentMethod>({
		prop: paymentMethod,
		defaultProp: defaultPaymentMethod,
		onChange: onPaymentMethodChange,
	});
	const [account = null, setAccount] = useControllableState<string | null>({
		prop: bankAccount,
		defaultProp: defaultBankAccount,
		onChange: onBankAccountChange,
	});
	const [noteText = "", setNote] = useControllableState<string>({
		prop: note,
		defaultProp: defaultNote,
		onChange: onNoteChange,
	});
	// Errors show only after "Mark as paid" is pressed, then clear on their own as each field is fixed.
	const [attempted, setAttempted] = React.useState(false);
	const errors = {
		date: paymentDate ? null : "Choose a payment date.",
		account: bankAccounts.length > 0 && account === null ? "Choose a bank account." : null,
	};
	const errorProps = (k: keyof typeof errors) => fieldErrorProps(`${uid}-${k}-error`, attempted && !!errors[k]);
	const fieldError = (k: keyof typeof errors) =>
		attempted && errors[k] ? <FieldError id={`${uid}-${k}-error`}>{errors[k]}</FieldError> : null;
	const confirm = () => {
		if (isSubmitting) return;
		const firstInvalid = (["date", "account"] as const).find((k) => errors[k]);
		if (firstInvalid) {
			setAttempted(true);
			document.getElementById(`${uid}-${firstInvalid}`)?.focus();
			return;
		}
		onConfirm?.({ method, bankAccount: account, note: noteText });
	};
	const changeOpen = (o: boolean) => {
		setAttempted(false);
		onOpenChange?.(o);
	};
	const pad = "px-4 py-2.5";
	return (
		<Dialog
			open={open}
			defaultOpen={defaultOpen}
			modal={modal}
			onOpenChange={(o) => {
				if (!isSubmitting && !showSuccess) changeOpen(o);
			}}
		>
			<DialogContent className={cn("@container max-h-[calc(100dvh-2rem)] max-w-md gap-0 overflow-y-auto p-0", className)}>
				<LiveStatus>{showSuccess ? `Payment recorded. Invoice ${invoice.invoiceNumber} marked as paid` : ""}</LiveStatus>
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
							<DialogDescription className="text-sm text-tertiary-foreground">
								Record a manual payment for invoice {invoice.invoiceNumber}
							</DialogDescription>
						</DialogHeader>
						<dl
							className={cn(
								pad,
								"grid grid-cols-1 gap-x-4 gap-y-0.5 border-y border-table-row-divider bg-table-tray text-sm @[22rem]:grid-cols-[auto_1fr] @[22rem]:gap-y-1.5",
							)}
						>
							<dt className="text-tertiary-foreground">Customer</dt>
							<dd className="min-w-0 break-words text-foreground">{invoice.customerName}</dd>
							<dt className="text-tertiary-foreground">Invoice</dt>
							<dd className="self-center font-mono text-2xs font-medium text-foreground">{invoice.invoiceNumber}</dd>
							<dt className="text-tertiary-foreground">Amount</dt>
							<dd className="tabular-nums text-foreground">{formatCurrency(invoice.total, cur)}</dd>
							{!!invoice.paidAmount && toSen(invoice.paidAmount) > 0n && (
								<>
									<dt className="text-tertiary-foreground">Balance to record</dt>
									<dd className="tabular-nums text-foreground">
										{formatCurrency(outstandingOf(invoice.total, invoice.paidAmount), cur)}
									</dd>
								</>
							)}
						</dl>
						<div className={cn(pad, "flex flex-col gap-1.5")}>
							<label className="text-2xs text-tertiary-foreground" htmlFor={`${uid}-date`}>
								Payment date
							</label>
							<div className="relative">
								<CalendarBlankIcon
									size={14}
									className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-tertiary-foreground"
									aria-hidden="true"
								/>
								<Input
									id={`${uid}-date`}
									readOnly
									value={paymentDate ? formatDate(paymentDate) : ""}
									placeholder="Pick a date"
									{...errorProps("date")}
									className="pl-7"
								/>
							</div>
							{fieldError("date")}
						</div>
						<div className={cn(pad, "flex flex-col gap-1.5 border-t border-table-row-divider")}>
							<span id={`${uid}-method`} className="text-2xs text-tertiary-foreground">
								Payment method
							</span>
							<ActionBar role="group" aria-labelledby={`${uid}-method`} className="gap-1.5">
								{PAYMENT_METHODS.map((m) => (
									<Button
										key={m.value}
										aria-pressed={method === m.value}
										variant="secondary"
										size="sm"
										onClick={() => setMethod(m.value)}
										className={cn(
											"h-6 text-2xs",
											method === m.value ? "border-primary bg-active-primary text-foreground" : "text-tertiary-foreground",
										)}
									>
										{m.label}
									</Button>
								))}
							</ActionBar>
						</div>
						{bankAccounts.length > 0 && (
							<div className={cn(pad, "flex flex-col gap-1.5 border-t border-table-row-divider")}>
								<span className="text-2xs text-tertiary-foreground">Deposited to</span>
								<Select
									value={account}
									onValueChange={(v) => setAccount(v ?? null)}
									items={bankAccounts.map((a) => ({ value: a.accountCode, label: `${a.accountCode} · ${a.accountName}` }))}
								>
									<SelectTrigger
										id={`${uid}-account`}
										className="h-7 w-full px-2 text-sm"
										aria-label="Deposited to"
										aria-required="true"
										{...errorProps("account")}
									>
										<SelectValue placeholder="Choose a bank account" />
									</SelectTrigger>
									<SelectContent>
										{bankAccounts.map((a) => (
											<SelectItem key={a.accountCode} value={a.accountCode}>
												<span className="mr-1.5 font-mono text-2xs font-medium">{a.accountCode}</span>
												{a.accountName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldError("account")}
							</div>
						)}
						<div className={cn(pad, "flex flex-col gap-1.5 border-t border-table-row-divider")}>
							<label className="text-2xs text-tertiary-foreground" htmlFor={`${uid}-note`}>
								Note <span className="text-subtle">(optional)</span>
							</label>
							<Textarea
								id={`${uid}-note`}
								rows={2}
								value={noteText}
								onChange={(e) => setNote(e.target.value)}
								placeholder="e.g. Received via Maybank, ref #12345"
								className="min-h-11 resize-none text-sm"
							/>
						</div>
						<div className="px-4 pb-2.5">
							<Alert variant="warning" className="py-2">
								<WarningIcon aria-hidden="true" />
								<AlertDescription className="text-2xs">
									This will create a manual payment record. Use only for payments received offline (bank transfer, cash, cheque,
									etc.).
								</AlertDescription>
							</Alert>
						</div>
						<DialogFooter className="border-t border-table-row-divider px-4 py-2.5">
							<Button variant="secondary" onClick={() => changeOpen(false)}>
								Cancel
							</Button>
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
