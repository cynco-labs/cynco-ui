"use client";

/**
 * Cynco UI — the top of a bill page: the header (breadcrumb, title, actions,
 * fact strip, archived banner) and the stack of alerts that sits under it.
 */
import {
	ArchiveIcon,
	ArrowCounterClockwiseIcon,
	ArrowsClockwiseIcon,
	CaretRightIcon,
	DotsThreeVerticalIcon,
	ReceiptIcon,
	TrashIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	IconButton,
	StatusChip,
} from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { ActionBar, DocStatus, formatCurrency, formatDate, negativeClass } from "../../lib/shared";
import { BILL_STATUS } from "../shared";
import type { CyncoBill } from "./bill-card";
import { FactStrip } from "./shared";

/** Alert with its action under the text on narrow containers, at the right when wide. */
function BillAlert({
	variant,
	icon,
	title,
	description,
	action,
}: {
	variant: "warning" | "destructive" | "note";
	icon: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<Alert variant={variant} className="@container">
			{icon}
			<div className="col-start-2 flex min-w-0 flex-col gap-2 @md:flex-row @md:items-center @md:justify-between @md:gap-3">
				<div className="min-w-0">
					<AlertTitle className="text-sm">{title}</AlertTitle>
					{description && <AlertDescription className="text-xs text-tertiary-foreground">{description}</AlertDescription>}
				</div>
				{action && <div className="shrink-0">{action}</div>}
			</div>
		</Alert>
	);
}

export type BillDetailHeaderProps = React.ComponentProps<"div"> & {
	bill: CyncoBill & { isArchived?: boolean };
	/** Where the bill came from, when it arrived by email. */
	receivedVia?: string;
	hasDocument?: boolean;
	isReExtracting?: boolean;
	isExtracting?: boolean;
	onReExtract?: () => void;
	onArchive?: () => void;
	onRestore?: () => void;
};

export function BillDetailHeader({
	bill,
	receivedVia,
	hasDocument = true,
	isReExtracting,
	isExtracting,
	onReExtract,
	onArchive,
	onRestore,
	className,
	...props
}: BillDetailHeaderProps) {
	const [confirmArchive, setConfirmArchive] = React.useState(false);
	const archived = !!bill.isArchived;
	// The confirm swaps out the control that had focus; move focus to its replacement (Cancel, then back to the menu).
	const moreRef = React.useRef<HTMLButtonElement>(null);
	const cancelRef = React.useRef<HTMLButtonElement>(null);
	const swapped = React.useRef(false);
	React.useEffect(() => {
		if (!swapped.current) return;
		(confirmArchive ? cancelRef : moreRef).current?.focus();
	}, [confirmArchive]);
	const askArchive = (next: boolean) => {
		swapped.current = true;
		setConfirmArchive(next);
	};
	const currency = bill.currency ?? "MYR";
	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			{archived && (
				<BillAlert
					variant="warning"
					icon={<ArchiveIcon weight="fill" aria-hidden="true" />}
					title="This bill is archived"
					description="Archived bills are read-only. Restore to make changes."
					action={
						onRestore && (
							<IconButton variant="secondary" icon={<ArrowCounterClockwiseIcon size={14} />} onClick={onRestore}>
								Restore bill
							</IconButton>
						)
					}
				/>
			)}
			<div className="min-w-0">
				<nav aria-label="Breadcrumb" className="mb-1 flex min-w-0 items-center gap-1 text-xs text-tertiary-foreground">
					<span>Bills</span>
					<CaretRightIcon size={10} aria-hidden="true" />
					<span className="truncate text-muted-foreground">{bill.billNumber ?? "Bill"}</span>
				</nav>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex min-w-0 flex-wrap items-center gap-2">
						<h1 className="min-w-0 truncate text-lg font-semibold text-foreground">{bill.vendorName || "Untitled Bill"}</h1>
						{archived ? (
							<StatusChip tone="neutral" glyph="minus">
								Archived
							</StatusChip>
						) : (
							<DocStatus status={bill.status} config={BILL_STATUS} />
						)}
						{bill.overdue && !archived && (
							<StatusChip tone="red" glyph="alert">
								Overdue
							</StatusChip>
						)}
					</div>
					{!archived && (
						<ActionBar>
							{confirmArchive ? (
								<>
									<Button ref={cancelRef} variant="secondary" onClick={() => askArchive(false)}>
										Cancel
									</Button>
									<Button
										variant="destructive"
										onClick={() => {
											onArchive?.();
											askArchive(false);
										}}
									>
										Confirm archive
									</Button>
								</>
							) : (
								<>
									<DropdownMenu modal={false}>
										<DropdownMenuTrigger
											render={<Button ref={moreRef} variant="secondary" aria-label="More bill actions" className="w-7" />}
										>
											<DotsThreeVerticalIcon size={14} weight="bold" aria-hidden="true" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-44">
											<DropdownMenuItem variant="destructive" onClick={() => askArchive(true)}>
												<TrashIcon size={14} aria-hidden="true" />
												Archive
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									{hasDocument && (
										<IconButton
											variant="secondary"
											icon={<ArrowsClockwiseIcon size={14} />}
											onClick={onReExtract}
											isLoading={isReExtracting}
											disabled={isExtracting}
										>
											Re-extract
										</IconButton>
									)}
								</>
							)}
						</ActionBar>
					)}
				</div>
				<FactStrip
					className="mt-2"
					facts={[
						// biome-ignore-start lint/correctness/useJsxKeyInIterable: label/value pairs, not a rendered list — FactStrip keys each pair by its label.
						["Bill no.", bill.billNumber ? <span className="font-mono text-xs">{bill.billNumber}</span> : null],
						["Issued", bill.issueDate ? formatDate(bill.issueDate) : null],
						["Due", bill.dueDate ? <span className={negativeClass(!!bill.overdue)}>{formatDate(bill.dueDate)}</span> : null],
						["Total", <span className="tabular-nums">{formatCurrency(bill.totalAmount, currency)}</span>],
						["Received", receivedVia ? <span className="whitespace-normal break-all">{receivedVia}</span> : null],
						// biome-ignore-end lint/correctness/useJsxKeyInIterable: end of the fact list.
					]}
				/>
			</div>
		</div>
	);
}

export type BillAlertsProps = React.ComponentProps<"div"> & {
	isDuplicate?: boolean;
	duplicateBill?: {
		vendorName: string | null;
		billNumber?: string | null;
		totalAmount?: Amount;
		currency?: string;
	} | null;
	status?: string;
	rejectionNotes?: string | null;
	vendorLoadError?: boolean;
	lineItemsCorrupted?: boolean;
	/** Vendor credits in the bill's currency (cynco ApplyVendorCreditPanel). */
	unusedCredit?: { amount: Amount; currency?: string } | null;
	onDismissDuplicate?: () => void;
	onApplyCredit?: () => void;
};

export function BillAlerts({
	isDuplicate,
	duplicateBill,
	status,
	rejectionNotes,
	vendorLoadError,
	lineItemsCorrupted,
	unusedCredit,
	onDismissDuplicate,
	onApplyCredit,
	className,
	...props
}: BillAlertsProps) {
	return (
		<div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			{isDuplicate && (
				<BillAlert
					variant="warning"
					icon={<WarningCircleIcon weight="fill" aria-hidden="true" />}
					title={
						<>
							Possible duplicate
							{duplicateBill && (
								<span className="font-normal">
									{" — "}
									{duplicateBill.vendorName ?? "Unknown"}
									{duplicateBill.billNumber ? ` #${duplicateBill.billNumber}` : ""}
									{duplicateBill.totalAmount != null ? (
										<span className="whitespace-nowrap">{` (${formatCurrency(duplicateBill.totalAmount, duplicateBill.currency ?? "MYR")})`}</span>
									) : (
										""
									)}
								</span>
							)}
						</>
					}
					action={
						<Button variant="secondary" size="sm" onClick={onDismissDuplicate}>
							Dismiss
						</Button>
					}
				/>
			)}
			{rejectionNotes && status === "rejected" && (
				<BillAlert
					variant="destructive"
					icon={<XCircleIcon weight="fill" aria-hidden="true" />}
					title="Rejected"
					description={rejectionNotes}
				/>
			)}
			{unusedCredit && toSen(unusedCredit.amount) > 0n && (
				<BillAlert
					variant="note"
					icon={<ReceiptIcon aria-hidden="true" />}
					title={
						<span className="font-normal">
							This vendor has{" "}
							<span className="whitespace-nowrap font-medium tabular-nums">
								{formatCurrency(unusedCredit.amount, unusedCredit.currency ?? "MYR")}
							</span>{" "}
							in unused credits.
						</span>
					}
					action={
						<Button variant="secondary" size="sm" onClick={onApplyCredit}>
							Apply vendor credit
						</Button>
					}
				/>
			)}
			{vendorLoadError && (
				<BillAlert
					variant="warning"
					icon={<WarningCircleIcon weight="fill" aria-hidden="true" />}
					title={<span className="font-normal">Could not load vendor list: vendor linking unavailable</span>}
				/>
			)}
			{lineItemsCorrupted && (
				<BillAlert
					variant="warning"
					icon={<WarningCircleIcon weight="fill" aria-hidden="true" />}
					title={<span className="font-normal">Some line item data could not be loaded; please verify amounts</span>}
				/>
			)}
		</div>
	);
}
