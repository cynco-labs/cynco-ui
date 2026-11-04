"use client";

/**
 * Cynco UI — recording a full or partial payment against a bill, in a sheet.
 */
import { CurrencyCircleDollarIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	Button,
	cn,
	IconButton,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	ShortcutButton,
	Textarea,
	useControllableState,
} from "../../base";
import { todayISO } from "../../base/lib/utils";
import { type Amount, parseAmount, toSen } from "../../lib/money";
import { FieldError, fieldErrorProps, formatCurrency, KeyValueList, surfaces } from "../../lib/shared";
import { outstandingOf, PAYMENT_METHODS, type PaymentMethod } from "../shared";
import type { CyncoBankAccount } from "./pay-run";

const isPaymentMethod = (v: string | null): v is PaymentMethod =>
	PAYMENT_METHODS.some((m) => (m.value as string) === v);

/** Inline field error: a glyph plus words, so it never relies on colour. Link it with aria-describedby. */
function FormField({
	label,
	htmlFor,
	error,
	hint,
	children,
}: {
	label: string;
	htmlFor: string;
	error?: string | null;
	hint?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<label htmlFor={htmlFor} className="text-sm font-medium text-muted-foreground">
				{label}
			</label>
			{children}
			{error ? (
				<FieldError className="text-xs" id={`${htmlFor}-error`}>
					{error}
				</FieldError>
			) : (
				hint
			)}
		</div>
	);
}

export type RecordBillPaymentDialogProps = {
	billAmount: Amount;
	paidAmount?: Amount;
	currency?: string;
	bankAccounts: CyncoBankAccount[];
	/** Whether the sheet is open (controlled). */
	open?: boolean;
	/** Whether the sheet starts open when uncontrolled. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** YYYY-MM-DD; defaults to today. */
	defaultDate?: string;
	disabled?: boolean;
	onSubmit?: (data: {
		paymentDate: string;
		paymentAmount: string;
		/** `null` when the method was left unspecified. */
		paymentMethod: PaymentMethod | null;
		paymentReference?: string;
		bankAccountId: string;
		notes?: string;
	}) => void;
	/** Classes for the "Record payment" trigger button. */
	className?: string;
	/** Classes for the sheet panel. */
	contentClassName?: string;
};

export function RecordBillPaymentDialog({
	billAmount,
	paidAmount = 0,
	currency = "MYR",
	bankAccounts,
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	defaultDate,
	disabled,
	onSubmit,
	className,
	contentClassName,
}: RecordBillPaymentDialogProps) {
	const outstanding = outstandingOf(billAmount, paidAmount);
	const hasPrior = toSen(paidAmount) > 0n;
	const [open = false, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen,
		onChange: onOpenChange,
	});
	const [amount, setAmount] = React.useState(outstanding);
	const [date, setDate] = React.useState(defaultDate ?? todayISO);
	const [method, setMethod] = React.useState<PaymentMethod | null>(null);
	const [bank, setBank] = React.useState<string | null>(null);
	const [reference, setReference] = React.useState("");
	const [notes, setNotes] = React.useState("");
	// Errors show only after a submit attempt, then clear on their own as each field is fixed.
	const [attempted, setAttempted] = React.useState(false);
	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const uid = React.useId();
	const fid = (k: string) => `${uid}-${k}`;

	const parsed = parseAmount(amount);
	const errors = {
		amount:
			!parsed.ok || parsed.value === "" || toSen(parsed.value) <= 0n
				? "Enter an amount greater than zero."
				: toSen(parsed.value) > toSen(outstanding)
					? `Enter ${formatCurrency(outstanding, currency)} or less, the amount still outstanding.`
					: null,
		date: date ? null : "Choose a payment date.",
		bank:
			bank !== null
				? null
				: bankAccounts.length === 0
					? "Add a bank or cash account to your Chart of Accounts first."
					: "Choose a bank or cash account.",
	};
	const shown = (k: keyof typeof errors) => (attempted ? errors[k] : null);
	const invalidProps = (k: keyof typeof errors) => fieldErrorProps(`${fid(k)}-error`, !!shown(k));
	const openSheet = (o: boolean) => {
		setOpen(o);
		if (o) setAttempted(false);
	};
	const submit = () => {
		if (disabled) return;
		const firstInvalid = (["amount", "date", "bank"] as const).find((k) => errors[k]);
		if (firstInvalid || bank === null) {
			setAttempted(true);
			document.getElementById(fid(firstInvalid ?? "bank"))?.focus();
			return;
		}
		setAttempted(false);
		onSubmit?.({
			paymentDate: date,
			paymentAmount: parsed.value ?? "",
			paymentMethod: method,
			paymentReference: reference || undefined,
			bankAccountId: bank,
			notes: notes || undefined,
		});
		setOpen(false);
	};
	const bankItems = bankAccounts.map((a) => ({
		value: a.id,
		label: `${a.accountCode ? `${a.accountCode} · ` : ""}${a.accountName}`,
	}));

	return (
		<>
			<IconButton
				ref={triggerRef}
				variant="primary"
				icon={<CurrencyCircleDollarIcon size={14} />}
				disabled={disabled}
				onClick={() => openSheet(true)}
				className={className}
			>
				Record payment
			</IconButton>
			{/* Modal: the sheet and its backdrop cover the page, so focus stays inside, the page behind is inert, and focus returns to "Record payment" on close. */}
			<Sheet open={open} onOpenChange={openSheet}>
				<SheetContent side="right" finalFocus={triggerRef} className={contentClassName}>
					<SheetHeader className="border-b border-border pr-12">
						<SheetTitle>Record payment</SheetTitle>
						<SheetDescription>Record a full or partial payment.</SheetDescription>
					</SheetHeader>
					<div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
						<KeyValueList
							className="rounded-lg border border-border bg-muted px-3 py-0"
							items={[
								...(hasPrior ? [{ label: "Bill total", value: formatCurrency(billAmount, currency) }] : []),
								{ label: hasPrior ? "Outstanding" : "Amount", value: formatCurrency(outstanding, currency), strong: true },
							]}
						/>
						<FormField
							label="Payment Amount *"
							htmlFor={fid("amount")}
							error={shown("amount")}
							hint={
								currency !== "MYR" ? (
									<p className="text-xs text-tertiary-foreground">Exchange rate applied at time of recording</p>
								) : null
							}
						>
							<Input
								id={fid("amount")}
								type="text"
								inputMode="decimal"
								autoComplete="off"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								{...invalidProps("amount")}
								required
								className="tabular-nums"
							/>
						</FormField>
						<FormField label="Payment date *" htmlFor={fid("date")} error={shown("date")}>
							<Input
								id={fid("date")}
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								{...invalidProps("date")}
								required
								className="tabular-nums"
							/>
						</FormField>
						<FormField label="Payment method" htmlFor={fid("method")}>
							<Select value={method} onValueChange={(v) => setMethod(isPaymentMethod(v) ? v : null)} items={PAYMENT_METHODS}>
								<SelectTrigger id={fid("method")} className="w-full">
									<SelectValue placeholder="Not specified" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={null}>Not specified</SelectItem>
									{PAYMENT_METHODS.map((m) => (
										<SelectItem key={m.value} value={m.value}>
											{m.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						<FormField
							label="Bank / Cash Account *"
							htmlFor={fid("bank")}
							error={shown("bank")}
							hint={
								bankAccounts.length === 0 ? (
									<p className={cn("text-xs", surfaces.negative)}>No bank/cash accounts found in your Chart of Accounts.</p>
								) : null
							}
						>
							<Select value={bank} onValueChange={setBank} items={bankItems}>
								<SelectTrigger id={fid("bank")} aria-required="true" {...invalidProps("bank")} className="w-full">
									<SelectValue placeholder="Select account..." />
								</SelectTrigger>
								<SelectContent>
									{bankAccounts.map((a) => (
										<SelectItem key={a.id} value={a.id}>
											{a.accountCode && <span className="font-mono text-xs text-tertiary-foreground">{a.accountCode}</span>}
											{a.accountName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						<FormField label="Reference number" htmlFor={fid("ref")}>
							<Input
								id={fid("ref")}
								value={reference}
								onChange={(e) => setReference(e.target.value)}
								placeholder="e.g. TXN-12345, cheque number"
								maxLength={100}
							/>
						</FormField>
						<FormField label="Notes" htmlFor={fid("notes")}>
							<Textarea
								id={fid("notes")}
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Optional payment notes..."
								rows={2}
								maxLength={1000}
								className="min-h-14 resize-none px-2 py-1.5 text-sm"
							/>
						</FormField>
					</div>
					<SheetFooter className="flex-row flex-wrap justify-end border-t border-border">
						<Button variant="secondary" onClick={() => openSheet(false)}>
							Cancel
						</Button>
						{/* Always enabled: pressing it names each problem and focuses the first one. */}
						<ShortcutButton metaShortcut="enter" onClick={submit}>
							Confirm payment
						</ShortcutButton>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	);
}
