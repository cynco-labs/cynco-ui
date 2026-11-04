"use client";

/**
 * Cynco UI — the pay run: pick the approved bills to schedule, choose the date
 * and the account they are paid from.
 */
import { CalendarCheckIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	cn,
	IconButton,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatusChip,
	useControllableState,
} from "../../base";
import { todayISO } from "../../base/lib/utils";
import {
	ActionBar,
	type DataColumn,
	DataList,
	DocStatus,
	FieldError,
	formatCurrency,
	formatDate,
	StatGrid,
	StatTile,
	surfaces,
} from "../../lib/shared";
import { BILL_STATUS, outstandingOf, useSelection } from "../shared";
import type { CyncoBill } from "./bill-card";
import { currencyTotals, RowSelect, SelectAll } from "./shared";

export type CyncoBankAccount = { id: string; accountCode?: string | null; accountName: string };

export type PayRunTableProps = React.ComponentProps<"div"> & {
	/** Pay-run eligible bills (approved / awaiting payment / scheduled / partially paid). */
	bills: CyncoBill[];
	selectedIds?: string[];
	defaultSelectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
	/** YYYY-MM-DD the run is scheduled for (controlled). */
	scheduledDate?: string;
	/** YYYY-MM-DD the run starts on when uncontrolled; defaults to `today`. */
	defaultScheduledDate?: string;
	onScheduledDateChange?: (date: string) => void;
	/** YYYY-MM-DD used to validate the schedule date. */
	today?: string;
	/** Optional "Pay from" bank / cash account picker. */
	bankAccounts?: CyncoBankAccount[];
	onSchedule?: (billIds: string[], date: string, bankAccountId?: string) => void;
	isSubmitting?: boolean;
};

const billOutstanding = (b: CyncoBill) => outstandingOf(b.totalAmount, b.paidAmount);

export function PayRunTable({
	bills,
	selectedIds,
	defaultSelectedIds,
	onSelectionChange,
	scheduledDate,
	defaultScheduledDate,
	onScheduledDateChange,
	today,
	bankAccounts,
	onSchedule,
	isSubmitting,
	className,
	...props
}: PayRunTableProps) {
	const { ids: sel, toggle, replace } = useSelection(selectedIds, defaultSelectedIds, onSelectionChange);
	const todayStr = today ?? todayISO();
	const [date = todayStr, setDate] = useControllableState({
		prop: scheduledDate,
		defaultProp: defaultScheduledDate ?? todayStr,
		onChange: onScheduledDateChange,
	});
	const [bank, setBank] = React.useState(bankAccounts?.[0]?.id ?? "");

	// Keyed on the ids alone so typing a date does not re-total the currencies.
	const selectedKey = [...sel].join("\u0000");
	const { selected, totals } = React.useMemo(() => {
		const picked = new Set(selectedKey ? selectedKey.split("\u0000") : []);
		const rows = bills.filter((b) => picked.has(b.id));
		return {
			selected: rows,
			totals: rows.length
				? { compact: currencyTotals(rows, billOutstanding), full: currencyTotals(rows, billOutstanding, false) }
				: { compact: formatCurrency(0), full: formatCurrency(0) },
		};
	}, [bills, selectedKey]);

	const schedulable = selected.filter((b) => b.status === "approved" || b.status === "awaiting_payment");
	const excluded = selected.length - schedulable.length;
	const overdueCount = bills.filter((b) => b.overdue).length;
	const helper =
		selected.length === 0
			? "Select awaiting-payment bills to schedule them."
			: excluded > 0
				? `${excluded} selected ${excluded === 1 ? "bill is" : "bills are"} already scheduled or partially paid.`
				: `${schedulable.length} ready to schedule.`;

	// Errors show only after "Schedule selected" is pressed, then clear on their own as each one is fixed.
	const [attempted, setAttempted] = React.useState(false);
	const uid = React.useId();
	const dateRef = React.useRef<HTMLInputElement>(null);
	const selectAllRef = React.useRef<HTMLButtonElement>(null);
	const dateError = !date ? "Choose a payment date." : date < todayStr ? "Choose today or a later date." : null;
	const billsError =
		schedulable.length > 0
			? null
			: selected.length === 0
				? "Select at least one bill."
				: "Select at least one bill that is awaiting payment.";
	const showDateError = attempted && !!dateError;
	const showBillsError = attempted && !!billsError;
	const schedule = () => {
		if (isSubmitting) return;
		if (dateError || billsError) {
			setAttempted(true);
			(dateError ? dateRef : selectAllRef).current?.focus();
			return;
		}
		setAttempted(false);
		onSchedule?.(
			schedulable.map((b) => b.id),
			date,
			bank || undefined,
		);
	};

	const columns: DataColumn<CyncoBill>[] = [
		{
			key: "vendor",
			header: "Vendor",
			mobile: "title",
			className: "min-w-36",
			cell: (b) => <span className="line-clamp-2 break-words">{b.vendorName ?? "Unknown vendor"}</span>,
		},
		{
			key: "billNumber",
			header: "Bill no.",
			cell: (b) => <span className="font-mono text-2xs font-medium text-tertiary-foreground">{b.billNumber || "—"}</span>,
		},
		{
			key: "due",
			header: "Due",
			cell: (b) => (
				<span
					className={cn(
						"whitespace-nowrap text-xs tabular-nums",
						b.overdue ? surfaces.negative : "text-tertiary-foreground",
					)}
				>
					{b.dueDate ? formatDate(b.dueDate) : "—"}
				</span>
			),
		},
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			cell: (b) => <DocStatus status={b.status} config={BILL_STATUS} />,
		},
		{
			key: "schedule",
			header: "Schedule",
			cell: (b) => (
				<span className="whitespace-nowrap text-xs tabular-nums text-tertiary-foreground">
					{b.scheduledPaymentDate ? formatDate(b.scheduledPaymentDate) : "—"}
				</span>
			),
		},
		{
			key: "outstanding",
			header: "Outstanding",
			align: "right",
			mobile: "value",
			cell: (b) => <span className="font-medium">{formatCurrency(billOutstanding(b), b.currency ?? "MYR")}</span>,
		},
	];

	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<StatGrid min="sm" className="@md:grid-cols-3">
				<StatTile label="Ready" value={bills.length} />
				<StatTile label="Overdue" value={overdueCount} negative={overdueCount > 0} />
				<StatTile label="Selected" value={totals.compact} />
			</StatGrid>

			<div className="flex flex-col gap-2 @2xl:flex-row @2xl:items-center @2xl:justify-between">
				<ActionBar>
					<Input
						ref={dateRef}
						type="date"
						aria-label="Scheduled payment date"
						value={date}
						min={todayStr}
						onChange={(e) => setDate(e.target.value)}
						aria-invalid={showDateError || undefined}
						aria-describedby={showDateError ? `${uid}-date-error` : undefined}
						className="w-auto min-w-36 tabular-nums"
					/>
					{bankAccounts && bankAccounts.length > 0 && (
						<Select
							value={bank}
							onValueChange={(v) => setBank(v ?? "")}
							items={bankAccounts.map((a) => ({
								value: a.id,
								label: `${a.accountCode ? `${a.accountCode} · ` : ""}${a.accountName}`,
							}))}
						>
							<SelectTrigger aria-label="Pay from" className="min-w-0 max-w-full flex-1 @md:max-w-64">
								<SelectValue />
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
					)}
					<IconButton
						variant="primary"
						icon={<CalendarCheckIcon size={14} />}
						// Always enabled: pressing it names each problem and focuses the first one. isLoading keeps focus (aria-disabled).
						isLoading={isSubmitting}
						onClick={schedule}
					>
						Schedule selected
					</IconButton>
				</ActionBar>
				<ActionBar>
					{excluded > 0 && (
						<StatusChip tone="amber" glyph="alert">
							{`${excluded} excluded`}
						</StatusChip>
					)}
					<span className="text-xs tabular-nums text-tertiary-foreground">{helper}</span>
				</ActionBar>
			</div>
			{(showDateError || showBillsError) && (
				<div className="flex flex-col gap-1">
					{showDateError && (
						<FieldError className="text-xs" id={`${uid}-date-error`}>
							{dateError}
						</FieldError>
					)}
					{showBillsError && billsError && (
						<FieldError className="text-xs" id={`${uid}-bills-error`}>
							{billsError}
						</FieldError>
					)}
				</div>
			)}

			<DataList
				caption="Bills ready for payment"
				columns={columns}
				rows={bills}
				getKey={(b) => b.id}
				stackBelow="2xl"
				isRowSelected={(b) => sel.has(b.id)}
				leadingHeader={
					<SelectAll
						ref={selectAllRef}
						total={bills.length}
						selected={selected.length}
						onChange={(all) => replace(all ? bills.map((b) => b.id) : [])}
						label="Select all bills"
						errorId={showBillsError ? `${uid}-bills-error` : undefined}
					/>
				}
				leading={(b) => (
					<RowSelect checked={sel.has(b.id)} onToggle={() => toggle(b.id)} label={`Select ${b.vendorName ?? "bill"}`} />
				)}
				footer={
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span className="text-xs text-tertiary-foreground">
							{selected.length} of {bills.length} selected
						</span>
						<span className="text-xs text-tertiary-foreground">
							Total to pay{" "}
							<span className="ml-2 whitespace-nowrap text-sm font-medium tabular-nums text-foreground">{totals.full}</span>
						</span>
					</div>
				}
			/>
		</div>
	);
}
