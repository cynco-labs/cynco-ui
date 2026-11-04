"use client";

/**
 * Cynco UI — the bill a board column shows: the bill shape the expenses views
 * display (cynco components/expenses/types.ts BillDisplay) and the card itself.
 */
import {
	BookOpenIcon,
	CalendarBlankIcon,
	DotsThreeVerticalIcon,
	SparkleIcon,
	TagIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import type * as React from "react";
import {
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	StatusChip,
	StatusChipIcon,
	useControllableState,
} from "../../base";
import type { Amount } from "../../lib/money";
import { toSen } from "../../lib/money";
import { DocStatus, formatCurrency, surfaces } from "../../lib/shared";
import { BILL_STATUS, type BillAction, type CyncoBillStatus, outstandingOf } from "../shared";
import { confidenceLabel, dayMonth, PartyInitials, RowSelect } from "./shared";

export type { BillAction, CyncoBillStatus };

/** Bill as the expenses views display it (cynco components/expenses/types.ts BillDisplay). */
export type CyncoBill = {
	id: string;
	vendorName: string | null;
	billNumber?: string | null;
	referenceNumber?: string | null;
	totalAmount: Amount;
	paidAmount?: Amount;
	currency?: string;
	issueDate?: string | null;
	dueDate?: string | null;
	scheduledPaymentDate?: string | null;
	status: CyncoBillStatus;
	category?: string | null;
	/** Past due and still owing (cynco isBillOverdue). */
	overdue?: boolean;
	isDuplicate?: boolean;
	/** Approval JE posted to the GL (journalEntryId set). */
	postedToGl?: boolean;
	/** Document-level extraction confidence 0–100 when Cynco AI read the bill. */
	aiConfidence?: number | null;
};

const POSTED_STATUSES = new Set(["approved", "awaiting_payment", "partially_paid", "scheduled", "paid"]);

/** Board quick actions per status (cynco BillCard getQuickActions). */
function quickActions(status: CyncoBillStatus): Array<{ action: BillAction; label: string; destructive?: boolean }> {
	switch (status) {
		case "draft":
			return [{ action: "submit_for_review", label: "Submit for Review" }];
		case "in_review":
			return [
				{ action: "approve", label: "Approve" },
				{ action: "send_for_approval", label: "Send for Approval" },
			];
		case "pending_approval":
			return [
				{ action: "approve", label: "Approve" },
				{ action: "reject", label: "Reject", destructive: true },
			];
		case "approved":
			return [{ action: "mark_awaiting_payment", label: "Mark Awaiting Payment" }];
		case "rejected":
			return [{ action: "resubmit_for_review", label: "Re-submit for Review" }];
		default:
			return [];
	}
}

export type BillCardProps = React.ComponentProps<"div"> & {
	bill: CyncoBill;
	/** Status chip on the card, for bills shown outside a board column. */
	showStatus?: boolean;
	/** Whether the card's checkbox is ticked (controlled). */
	selected?: boolean;
	/** Initial tick state when uncontrolled. */
	defaultSelected?: boolean;
	/** Called when the checkbox is toggled. Passing any of the three selection props shows the checkbox. */
	onSelectedChange?: (selected: boolean) => void;
	/** Any card on the board selected: keep checkboxes visible. */
	someSelected?: boolean;
	onAction?: (bill: CyncoBill, action: BillAction) => void;
};

export function BillCard({
	bill,
	showStatus = false,
	selected: selectedProp,
	defaultSelected,
	onSelectedChange,
	someSelected,
	onAction,
	className,
	...props
}: BillCardProps) {
	const [selected = false, setSelected] = useControllableState({
		prop: selectedProp,
		defaultProp: defaultSelected ?? false,
		onChange: onSelectedChange,
	});
	// A card nobody can tick shows its vendor initials instead of a checkbox.
	const selectable = selectedProp !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined;
	const currency = bill.currency ?? "MYR";
	const totalSen = toSen(bill.totalAmount);
	const paidSen = toSen(bill.paidAmount ?? "0");
	const partial = bill.status === "partially_paid" && paidSen > 0n && totalSen > 0n;
	const paidPct = partial ? `${(paidSen * 100n) / totalSen}` : null;
	const actions = quickActions(bill.status);
	const showCheckbox = selectable && (selected || someSelected);
	const posted = POSTED_STATUSES.has(bill.status);

	return (
		<div
			className={cn(
				"group relative w-full min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:border-input-border-hover",
				selected && "border-primary bg-active-primary",
				className,
			)}
			{...props}
		>
			<div className="flex items-start gap-2.5">
				<div className="relative size-8 shrink-0">
					<PartyInitials
						name={bill.vendorName}
						className={cn(
							selectable &&
								(showCheckbox ? "opacity-0" : "group-hover:opacity-0 group-focus-within:opacity-0 no-hover:opacity-0"),
						)}
					/>
					{selectable && (
						<div
							className={cn(
								"absolute inset-0 flex items-center justify-center",
								showCheckbox
									? "opacity-100"
									: "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 no-hover:opacity-100",
							)}
						>
							<RowSelect
								checked={selected}
								onToggle={() => setSelected(!selected)}
								label={`Select ${bill.vendorName ?? "bill"}`}
							/>
						</div>
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className={cn("flex flex-wrap items-center gap-1.5", actions.length > 0 && "pr-6")}>
						<span className="max-w-full truncate text-sm font-medium text-foreground" title={bill.vendorName ?? undefined}>
							{bill.vendorName || "Unknown Vendor"}
						</span>
						{showStatus && <DocStatus status={bill.status} config={BILL_STATUS} />}
						{paidPct !== null && <span className="text-2xs tabular-nums text-primary">{paidPct}% paid</span>}
						{bill.overdue && (
							<StatusChip tone="red" glyph="alert">
								Overdue
							</StatusChip>
						)}
						{bill.isDuplicate && (
							<StatusChip tone="amber" glyph="alert">
								Duplicate
							</StatusChip>
						)}
					</div>
					{/* Too narrow for both: the amount wraps, neither is clipped. */}
					<div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
						<span
							className="min-w-0 max-w-full truncate font-mono text-2xs font-medium text-tertiary-foreground"
							title={bill.billNumber ?? undefined}
						>
							{bill.billNumber ? `#${bill.billNumber}` : "No bill number"}
						</span>
						<span className="ml-auto shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
							{formatCurrency(bill.totalAmount, currency)}
						</span>
					</div>
					{partial && (
						<p className="mt-0.5 text-right text-xs tabular-nums text-tertiary-foreground">
							Outstanding:{" "}
							<span className="whitespace-nowrap text-foreground">
								{formatCurrency(outstandingOf(bill.totalAmount, bill.paidAmount), currency)}
							</span>
						</p>
					)}
				</div>
			</div>

			<div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-table-row-divider pt-2 text-xs">
				{bill.dueDate ? (
					<span
						className={cn(
							"flex shrink-0 items-center gap-1.5 whitespace-nowrap",
							bill.overdue ? cn("font-medium", surfaces.negative) : "text-tertiary-foreground",
						)}
					>
						<CalendarBlankIcon size={12} aria-hidden="true" />
						Due {dayMonth(bill.dueDate)}
					</span>
				) : (
					<span className="text-subtle">No due date</span>
				)}
				{bill.aiConfidence != null && (
					<span
						className="flex shrink-0 items-center gap-1 text-tertiary-foreground"
						title={`Read by Cynco AI, ${bill.aiConfidence}% ${confidenceLabel(bill.aiConfidence)} confidence`}
					>
						<SparkleIcon size={12} weight="fill" className="text-primary" aria-hidden="true" />
						<span className="tabular-nums">AI {bill.aiConfidence}%</span>
					</span>
				)}
				<span className="ml-auto flex min-w-0 items-center gap-2">
					{bill.category && (
						<span className="flex min-w-0 items-center gap-1 text-tertiary-foreground">
							<TagIcon size={12} className="shrink-0" aria-hidden="true" />
							<span className="max-w-32 truncate" title={bill.category}>
								{bill.category}
							</span>
						</span>
					)}
					{posted &&
						(bill.postedToGl ? (
							<span title="Posted to GL" className="flex shrink-0 text-tertiary-foreground">
								<BookOpenIcon size={13} weight="fill" aria-hidden="true" />
								<span className="sr-only">Posted to GL</span>
							</span>
						) : (
							<span title="No GL entry" className="flex shrink-0">
								<StatusChipIcon tone="amber" glyph="alert" />
								<span className="sr-only">No GL entry</span>
							</span>
						))}
				</span>
			</div>

			{actions.length > 0 && (
				<div className="absolute top-2 right-2">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger
							render={
								<Button
									variant="skeleton"
									size="icon"
									aria-label={`Quick actions for ${bill.vendorName || "Unknown Vendor"}`}
									className="text-tertiary-foreground"
								/>
							}
						>
							<DotsThreeVerticalIcon size={14} weight="bold" aria-hidden="true" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							{actions.map((a) => (
								<DropdownMenuItem
									key={a.action}
									variant={a.destructive ? "destructive" : undefined}
									onClick={() => onAction?.(bill, a.action)}
								>
									{a.label}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onClick={() => onAction?.(bill, "archive")}>
								<TrashIcon size={14} aria-hidden="true" />
								Archive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</div>
	);
}
