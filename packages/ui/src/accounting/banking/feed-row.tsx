"use client";

/**
 * Cynco UI — one bank line as a feed row: what it is, where it stands in the
 * pipeline, what it will be categorized as, and what it is matched to.
 */
import { ArrowCounterClockwiseIcon, ArrowsLeftRightIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Button, Checkbox, cn, StatusChipIcon, useControllableState } from "../../base";
import { formatDate } from "../../lib/shared";
import { BankCategoryCell, type BankCoaSuggestion } from "./category-cell";
import { type BankFeedStatus, BankLifecycleSpine } from "./lifecycle";
import { type BankMatch, BankMatchReview } from "./match-review";
import { FG, signedByType, TINY, type With } from "./shared";

export type BankLineFlag = "government_credit_as_revenue" | "money_in_to_expense" | "unusually_large";
const LINE_FLAG_LABELS: Record<BankLineFlag, { label: string; title: string }> = {
	government_credit_as_revenue: {
		label: "refund as revenue?",
		title: "Money from a government payer coded to revenue. Tax refunds and grants are usually not sales.",
	},
	money_in_to_expense: {
		label: "money in to expense?",
		title: "Money in coded to an expense account. Check it is a refund of that expense.",
	},
	unusually_large: {
		label: "unusually large",
		title: "Over 10× this bank account's median line in the last 12 months.",
	},
};

export type BankFeedTransaction = {
	id: string;
	date: string;
	payeeName?: string | null;
	description?: string | null;
	reference?: string | null;
	type: "credit" | "debit";
	amount: number;
	currency?: string;
	status: BankFeedStatus;
	category?: string | null;
	suggestion?: BankCoaSuggestion | null;
	isTransfer?: boolean;
	flags?: BankLineFlag[];
	excludeReason?: string | null;
	account?: { name: string; color?: string | null };
	matches?: BankMatch[];
};

/** The cells of a feed row, left to right, that the arrow keys move between inside `BankFeedList`. */
export const BANK_FEED_CELLS = ["select", "detail", "category", "amount"] as const;
export type BankFeedCell = (typeof BANK_FEED_CELLS)[number];

function FlagChip({ icon, children, title }: { icon: React.ReactNode; children: React.ReactNode; title: string }) {
	return (
		<span
			title={title}
			className="inline-flex h-4.5 shrink-0 items-center gap-1 rounded-md border border-foreground/6 bg-foreground/4 px-1 text-2xs whitespace-nowrap text-muted-foreground"
		>
			{icon}
			{children}
			<span className="sr-only">: {title}</span>
		</span>
	);
}

/**
 * FeedRow — [checkbox] [lifecycle spine] [payee + context badges] [category] [amount],
 * with matches beneath. Narrow: the payee wraps to two lines and the category
 * drops under it, the amount stays top right.
 */
export function BankFeedRow({
	tx,
	selected: selectedProp,
	defaultSelected = false,
	onSelectedChange,
	onRestore,
	showAccount = false,
	tabCell,
	onCellFocus,
	className,
	...props
}: With<{
	tx: BankFeedTransaction;
	/** Whether the row's checkbox is ticked (controlled). */
	selected?: boolean;
	/** Initial tick state when uncontrolled. */
	defaultSelected?: boolean;
	/** Called when the checkbox is toggled by click or Space. */
	onSelectedChange?: (selected: boolean) => void;
	/** Called from an excluded line's Restore button; omit to hide it. */
	onRestore?: (tx: BankFeedTransaction) => void;
	showAccount?: boolean;
	/**
	 * Set by `BankFeedList`: the row becomes a `role="row"` whose cells take roving focus, and this
	 * is the one cell of this row that is tabbable (`null` when the tab stop is on another row).
	 * Omit it for a row outside a grid, which then carries no grid markup.
	 */
	tabCell?: BankFeedCell | null;
	/** Called when focus lands anywhere in one of the row's cells. */
	onCellFocus?: (cell: BankFeedCell) => void;
	className?: string;
}>) {
	const [selected = false, setSelected] = useControllableState({
		prop: selectedProp,
		defaultProp: defaultSelected,
		onChange: onSelectedChange,
	});
	const inGrid = tabCell !== undefined;
	const excluded = tx.status === "excluded";
	const primary = tx.payeeName || tx.description || "";
	const secondary = tx.payeeName && tx.description && tx.description !== primary ? tx.description : tx.reference;
	const cell = (name: BankFeedCell, classes?: string) =>
		inGrid
			? ({
					role: "gridcell",
					"data-feed-cell": `${tx.id}|${name}`,
					tabIndex: tabCell === name ? 0 : -1,
					onFocus: () => onCellFocus?.(name),
					className: cn("rounded-sm focus-ring-inset", classes),
				} as const)
			: ({ className: classes } as const);
	// ARIA 1.2 lists aria-selected among role=row's supported properties, so the row carries what is ticked.
	const rowAria = inGrid ? ({ role: "row", "aria-selected": selected } as const) : {};
	// The wrappers between the row and its cells carry layout only, so the grid owns the cells directly.
	const layout = inGrid ? ("presentation" as const) : undefined;
	return (
		<div
			{...rowAria}
			className={cn("@container border-b border-table-row-divider last:border-b-0", className)}
			{...props}
		>
			<div
				role={layout}
				className={cn(
					"group/row flex items-start gap-2.5 px-3 py-2 transition-colors @lg:items-center",
					selected ? "bg-active-primary" : "hover:bg-table-row-hover",
				)}
			>
				<div {...cell("select", "flex shrink-0 items-start gap-2.5 @lg:items-center")}>
					<Checkbox
						checked={selected}
						onCheckedChange={setSelected}
						tabIndex={inGrid ? -1 : undefined}
						aria-label={`Select ${primary || "transaction"}, ${formatDate(tx.date)}, ${signedByType(tx.amount, tx.type, tx.currency)}`}
						className={cn(
							"mt-1 @lg:mt-0",
							!selected && "opacity-50 no-hover:opacity-100 group-hover/row:opacity-100 group-focus-within/row:opacity-100",
						)}
					/>
					<BankLifecycleSpine status={tx.status} className="mt-1 shrink-0 @lg:mt-0" />
				</div>
				<div role={layout} className="flex min-w-0 flex-1 flex-col gap-1 @lg:flex-row @lg:items-center @lg:gap-3">
					<div {...cell("detail", cn("min-w-0 flex-1", excluded && "text-tertiary-foreground"))}>
						<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 @lg:flex-nowrap">
							<span
								className={cn(
									FG,
									"line-clamp-2 min-w-0 font-medium break-words @lg:line-clamp-none @lg:truncate",
									excluded && "line-through decoration-tertiary-foreground/60",
								)}
							>
								{primary}
							</span>
							{tx.isTransfer && (
								<FlagChip
									title="Internal transfer, paired with its mirror leg"
									icon={<ArrowsLeftRightIcon size={10} className="size-2.5" aria-hidden="true" />}
								>
									transfer
								</FlagChip>
							)}
							{tx.flags?.map((f) => (
								<FlagChip
									key={f}
									title={LINE_FLAG_LABELS[f].title}
									icon={<StatusChipIcon tone="amber" glyph="alert" className="size-3" />}
								>
									{LINE_FLAG_LABELS[f].label}
								</FlagChip>
							))}
						</div>
						<div className={cn(TINY, "mt-px flex min-w-0 flex-wrap items-center gap-x-1.5 @lg:flex-nowrap")}>
							{showAccount && tx.account && (
								<span className="inline-flex shrink-0 items-center gap-1">
									<span
										aria-hidden="true"
										className={cn("size-1.5 rounded-full", !tx.account.color && "bg-tertiary-foreground/60")}
										style={tx.account.color ? { backgroundColor: tx.account.color } : undefined}
									/>
									{tx.account.name}
								</span>
							)}
							{showAccount && tx.account && (secondary || (excluded && tx.excludeReason)) && <span aria-hidden="true">·</span>}
							{excluded && tx.excludeReason ? (
								<span className="min-w-0 truncate italic">excluded: {tx.excludeReason}</span>
							) : (
								secondary && <span className="min-w-0 truncate">{secondary}</span>
							)}
						</div>
					</div>
					<div {...cell("category", "min-w-0 shrink-0 @lg:max-w-56")}>
						{excluded ? (
							onRestore && (
								<Button
									variant="skeleton"
									size="sm"
									tabIndex={inGrid ? -1 : undefined}
									className="-ml-1.5 gap-1 text-tertiary-foreground @lg:ml-0"
									onClick={() => onRestore(tx)}
								>
									<ArrowCounterClockwiseIcon size={12} className="size-3" aria-hidden="true" />
									Restore
								</Button>
							)
						) : (
							<BankCategoryCell
								status={tx.status}
								category={tx.category}
								suggestion={tx.suggestion}
								controlTabIndex={inGrid ? -1 : undefined}
							/>
						)}
					</div>
				</div>
				<span
					{...cell(
						"amount",
						cn(
							FG,
							"shrink-0 text-right font-medium whitespace-nowrap tabular-nums @lg:min-w-26",
							excluded && "text-tertiary-foreground line-through",
						),
					)}
				>
					{signedByType(tx.amount, tx.type, tx.currency)}
				</span>
			</div>
			{tx.matches && tx.matches.length > 0 && (
				<div
					role={inGrid ? "gridcell" : undefined}
					className="border-t border-table-row-divider bg-table-row-hover px-3 py-2 @lg:pl-14"
				>
					<BankMatchReview matches={tx.matches} />
				</div>
			)}
		</div>
	);
}
