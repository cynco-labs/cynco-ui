"use client";

import {
	ArrowLeftIcon,
	BookmarkSimpleIcon,
	CaretDownIcon,
	ClockCounterClockwiseIcon,
	FloppyDiskIcon,
	InfoIcon,
	PaperPlaneTiltIcon,
	XIcon,
} from "@phosphor-icons/react";
/**
 * Cynco UI — the chrome around one journal entry: its top bar, the account
 * picker its lines are built from, the DR = CR footer, the draft-recovery
 * banner and the details rail beside it.
 *
 * Every component sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import * as React from "react";
import {
	Alert,
	Button,
	cn,
	IconButton,
	LiveStatus,
	Popover,
	PopoverContent,
	PopoverTrigger,
	StatusChip,
	type StatusTone,
	useControllableState,
} from "../../base";
import { STATUS_TONES } from "../../base/components/general/status-chip";
import { type Amount, fromSen, toSen } from "../../lib/money";
import {
	ActionBar,
	DocStatus,
	formatDate,
	formatPlain,
	SectionLabel,
	type StatusEntry,
	surfaces,
	ToneDot,
} from "../../lib/shared";
import { AccountPickerList, isPositive, type LedgerPickerAccount, PICKER_POPUP, PickerTriggerLabel } from "./shared";

export type { LedgerPickerAccount };

/** "29 Oct 2026, 14:32" */
function formatDateTime(d: string) {
	const date = new Date(d);
	return `${formatDate(date)}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

/** cynco JOURNAL_STATUS_BADGE_CONFIG (journal/types.ts) as DocStatus entries. */
export const JOURNAL_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral", glyph: "pencil" },
	pending_approval: { label: "Pending Approval", variant: "warning", glyph: "hourglass" },
	approved: { label: "Approved", variant: "info", glyph: "check" },
	posted: { label: "Posted", variant: "success" },
	reversed: { label: "Reversed", variant: "error", glyph: "refresh" },
	cancelled: { label: "Cancelled", variant: "neutral", strike: true },
};

export type JournalEntryHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
	title: string;
	entryNumber?: string | null;
	status?: string;
	isCreate?: boolean;
	approvalRequired?: boolean;
	isSaving?: boolean;
	isPosting?: boolean;
	onBack?: () => void;
	onFromTemplate?: () => void;
	onSave?: () => void;
	onPost?: () => void;
};

/** journal/JournalEntryTopBar.tsx */
export function JournalEntryHeader({
	title,
	entryNumber,
	status,
	isCreate,
	approvalRequired,
	isSaving,
	isPosting,
	onBack,
	onFromTemplate,
	onSave,
	onPost,
	className,
	...props
}: JournalEntryHeaderProps) {
	return (
		<div
			className={cn(
				"flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b bg-background px-4 py-3",
				className,
			)}
			{...props}
		>
			<div className="flex min-w-0 items-center gap-3">
				<IconButton variant="skeleton" icon={<ArrowLeftIcon />} onClick={onBack}>
					Back
				</IconButton>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<h1 className="min-w-0 break-words text-lg font-semibold text-foreground">{title}</h1>
						{status && <DocStatus status={status} config={JOURNAL_STATUS} />}
					</div>
					{entryNumber && <div className="font-mono text-2xs font-medium text-tertiary-foreground">{entryNumber}</div>}
				</div>
			</div>
			<ActionBar>
				{isCreate && (
					<IconButton variant="secondary" icon={<BookmarkSimpleIcon />} onClick={onFromTemplate}>
						From template
					</IconButton>
				)}
				<IconButton
					variant="secondary"
					icon={<FloppyDiskIcon />}
					isLoading={isSaving}
					disabled={isPosting}
					onClick={onSave}
				>
					{isCreate ? "Save Draft" : "Save"}
				</IconButton>
				<IconButton
					variant="primary"
					icon={<PaperPlaneTiltIcon />}
					isLoading={isPosting}
					disabled={isSaving}
					onClick={onPost}
				>
					{approvalRequired ? "Save & Submit for Approval" : "Save & Post"}
				</IconButton>
			</ActionBar>
		</div>
	);
}

export type AccountPickerFieldProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
	accounts: LedgerPickerAccount[];
	recentIds?: string[];
	/** Controlled selection. */
	selectedId?: string;
	/** Initial selection for uncontrolled use. */
	defaultSelectedId?: string;
	/** Controlled popup state. */
	open?: boolean;
	/** Whether the popup starts open, for uncontrolled use. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	label?: string;
	onSelect?: (a: LedgerPickerAccount) => void;
	onCreate?: (query: string) => void;
};

/** journal/AccountPicker.tsx — combobox over the chart of accounts, grouped by type. */
export function AccountPickerField({
	accounts,
	recentIds,
	selectedId,
	defaultSelectedId,
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	label,
	onSelect,
	onCreate,
	className,
	...props
}: AccountPickerFieldProps) {
	const [open = false, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen,
		onChange: onOpenChange,
	});
	const [value, setValue] = useControllableState({ prop: selectedId, defaultProp: defaultSelectedId });
	const selected = accounts.find((a) => a.id === value) ?? null;
	const id = React.useId();
	return (
		<div className={cn("flex w-full max-w-md min-w-0 flex-col gap-1", className)} {...props}>
			{label && (
				<span id={`${id}-label`} className="text-sm font-medium text-muted-foreground">
					{label}
				</span>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						<Button
							variant="secondary"
							aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
							className="w-full min-w-0 font-normal [&>span]:w-full [&>span]:min-w-0 [&>span]:justify-between"
						>
							<PickerTriggerLabel account={selected} id={`${id}-value`} />
							<CaretDownIcon size={12} className="shrink-0 text-tertiary-foreground" aria-hidden="true" />
						</Button>
					}
				/>
				<PopoverContent align="start" aria-label="Choose account" className={PICKER_POPUP}>
					<AccountPickerList
						accounts={accounts}
						recentIds={recentIds}
						selectedId={value}
						onSelect={(a) => {
							setValue(a.id);
							setOpen(false);
							onSelect?.(a);
						}}
						onCreate={onCreate}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export type JournalBalanceBarProps = React.ComponentProps<"div"> & {
	totalDebit: Amount;
	totalCredit: Amount;
	currency?: string;
	hasAmounts?: boolean;
	showError?: boolean;
	/** The auto-save line above the bar. */
	autoSave?: "saving" | "saved" | null;
};

/** journal/BalanceBar.tsx + JournalDraftStatus AutoSaveIndicator — DR = CR footer of the journal form. */
export function JournalBalanceBar({
	totalDebit,
	totalCredit,
	currency = "MYR",
	hasAmounts,
	showError,
	autoSave,
	className,
	...props
}: JournalBalanceBarProps) {
	const differenceSen = toSen(totalDebit) - toSen(totalCredit);
	const difference = fromSen(differenceSen < 0n ? -differenceSen : differenceSen);
	const isBalanced = differenceSen === 0n;
	const hasFigures = hasAmounts ?? (isPositive(totalDebit) || isPositive(totalCredit));
	return (
		<div className={cn("flex min-w-0 flex-col overflow-hidden", surfaces.card, className)} {...props}>
			{/* Live regions stay mounted, so "Draft saved" and the balance state are announced when they change. */}
			<div role="status">
				{autoSave && (
					<div className="flex items-center gap-1.5 border-b px-4 py-1 text-2xs text-tertiary-foreground">
						<ToneDot
							tone={autoSave === "saving" ? "amber" : "green"}
							className={autoSave === "saving" ? "animate-pulse" : undefined}
						/>
						{autoSave === "saving" ? "Saving draft…" : "Draft saved"}
					</div>
				)}
			</div>
			<LiveStatus>
				{hasFigures ? (isBalanced ? "Balanced" : `Off by ${currency} ${formatPlain(difference)}`) : ""}
			</LiveStatus>
			{!hasFigures ? (
				<div className="m-1 flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm text-tertiary-foreground">
					<InfoIcon size={16} aria-hidden="true" />
					Enter amounts to see balance
				</div>
			) : (
				<div className="px-4 py-3">
					<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm tabular-nums">
							<span className="text-tertiary-foreground">DR</span>
							<span className="text-foreground">
								{currency} {formatPlain(totalDebit)}
							</span>
							<span className="mx-1 text-tertiary-foreground">
								<span aria-hidden="true">{isBalanced ? "=" : "≠"}</span>
								<span className="sr-only">{isBalanced ? "equals" : "does not equal"}</span>
							</span>
							<span className="text-tertiary-foreground">CR</span>
							<span className="text-foreground">
								{currency} {formatPlain(totalCredit)}
							</span>
						</div>
						{isBalanced ? (
							<StatusChip tone="green" glyph="check">
								Balanced
							</StatusChip>
						) : (
							<StatusChip tone="red" glyph="alert">
								<span className="tabular-nums">
									Off by {currency} {formatPlain(difference)}
								</span>
							</StatusChip>
						)}
					</div>
					{showError && !isBalanced && (
						<p role="alert" className={cn("mt-1 text-2xs", surfaces.negative)}>
							Entry must be balanced before posting
						</p>
					)}
				</div>
			)}
		</div>
	);
}

export type JournalDraftRecoveryBannerProps = React.ComponentProps<"div"> & {
	savedAgo: string;
	onRecover?: () => void;
	onDismiss?: () => void;
};

/** journal/JournalDraftStatus.tsx DraftRecoveryBanner — offer to restore an unsaved local draft. */
export function JournalDraftRecoveryBanner({
	savedAgo,
	onRecover,
	onDismiss,
	className,
	...props
}: JournalDraftRecoveryBannerProps) {
	return (
		<Alert
			variant="warning"
			role="status"
			className={cn("flex flex-wrap items-center justify-between gap-2 py-2", className)}
			{...props}
		>
			<span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
				<ClockCounterClockwiseIcon size={16} className={cn("shrink-0", STATUS_TONES.amber)} aria-hidden="true" />
				You have an unsaved draft from {savedAgo}.
			</span>
			<ActionBar>
				<Button variant="secondary" onClick={onRecover}>
					Recover
				</Button>
				<IconButton variant="skeleton" icon={<XIcon />} onClick={onDismiss}>
					Discard
				</IconButton>
			</ActionBar>
		</Alert>
	);
}

export type JournalStatusEvent = {
	id: string;
	fromStatus: string | null;
	toStatus: string;
	changedBy?: string;
	changedAt: string;
	notes?: string | null;
};

const ACTIVITY_TONE: Record<string, StatusTone> = {
	posted: "green",
	reversed: "red",
	cancelled: "neutral",
	approved: "blue",
	pending_approval: "amber",
	draft: "neutral",
};

function RailField({
	label,
	value,
	mono,
	wrap,
}: {
	label: string;
	value: React.ReactNode;
	mono?: boolean;
	wrap?: boolean;
}) {
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-x-3">
			<dt className="shrink-0 text-2xs text-tertiary-foreground">{label}</dt>
			<dd
				className={cn(
					"min-w-0 text-right text-sm text-foreground",
					wrap ? "break-words" : "truncate",
					mono && "tabular-nums",
				)}
			>
				{value}
			</dd>
		</div>
	);
}

export type JournalEntryDetailsRailProps = React.ComponentProps<"div"> & {
	entry: {
		entryDate: string;
		period: string;
		currency: string;
		documentNumber?: string | null;
		manualReason?: string | null;
		vendorName?: string | null;
		customerName?: string | null;
		approvedBy?: string | null;
		approvedAt?: string | null;
		postedAt?: string | null;
		memo?: string | null;
	};
	statusHistory?: JournalStatusEvent[];
	createdAt?: string;
	updatedAt?: string;
};

/** journal/EntryDetailsRail.tsx — Details · Memo · Activity panel beside a journal entry. */
export function JournalEntryDetailsRail({
	entry,
	statusHistory = [],
	createdAt,
	updatedAt,
	className,
	...props
}: JournalEntryDetailsRailProps) {
	return (
		<div className={cn("w-full min-w-0 divide-y overflow-hidden", surfaces.card, className)} {...props}>
			<section className="p-4">
				<SectionLabel className="mb-2.5">Details</SectionLabel>
				<dl className="flex flex-col gap-1.5">
					<RailField label="Entry date" value={formatDate(entry.entryDate)} mono />
					<RailField label="Period" value={<span className="font-mono text-2xs font-medium">{entry.period}</span>} />
					<RailField label="Currency" value={entry.currency} />
					{entry.manualReason?.trim() && <RailField label="Reason" value={entry.manualReason.trim()} wrap />}
					{entry.documentNumber?.trim() && (
						<RailField
							label="Reference"
							value={<span className="font-mono text-2xs font-medium">{entry.documentNumber}</span>}
						/>
					)}
					{entry.vendorName && <RailField label="Vendor" value={entry.vendorName} wrap />}
					{entry.customerName && <RailField label="Customer" value={entry.customerName} wrap />}
					{entry.approvedBy && <RailField label="Approved by" value={entry.approvedBy} wrap />}
					{entry.approvedAt && <RailField label="Approved" value={formatDateTime(entry.approvedAt)} mono />}
					{entry.postedAt && <RailField label="Posted" value={formatDateTime(entry.postedAt)} mono />}
				</dl>
			</section>
			{entry.memo && (
				<section className="p-4">
					<SectionLabel className="mb-2.5">Memo</SectionLabel>
					<p className="break-words text-sm leading-relaxed text-foreground">{entry.memo}</p>
				</section>
			)}
			<section className="p-4">
				<SectionLabel className="mb-2.5">Activity</SectionLabel>
				{statusHistory.length > 0 ? (
					<ol>
						{statusHistory.map((item, i) => {
							const last = i === statusHistory.length - 1;
							return (
								<li key={item.id} className="flex gap-2.5">
									<div className="flex flex-col items-center">
										<ToneDot tone={ACTIVITY_TONE[item.toStatus] ?? "neutral"} className="mt-1.5 size-2" />
										{!last && <span className="my-0.5 w-px flex-1 bg-border" />}
									</div>
									<div className={cn("min-w-0", !last && "pb-3")}>
										<div className="flex flex-wrap items-center gap-1.5">
											<DocStatus status={item.toStatus} config={JOURNAL_STATUS} />
											{item.fromStatus && (
												<span className="text-2xs text-tertiary-foreground">
													from {JOURNAL_STATUS[item.fromStatus]?.label ?? item.fromStatus}
												</span>
											)}
										</div>
										<p className="mt-0.5 text-2xs tabular-nums text-tertiary-foreground">
											{formatDateTime(item.changedAt)}
											{item.changedBy && ` · ${item.changedBy}`}
										</p>
										{item.notes && <p className="mt-1 break-words text-2xs italic text-muted-foreground">{item.notes}</p>}
									</div>
								</li>
							);
						})}
					</ol>
				) : (
					<div className="flex flex-col gap-1 text-2xs tabular-nums text-tertiary-foreground">
						{createdAt && <p>Created {formatDateTime(createdAt)}</p>}
						{updatedAt && <p>Updated {formatDateTime(updatedAt)}</p>}
					</div>
				)}
			</section>
		</div>
	);
}
