"use client";

/**
 * Cynco UI — the bills Kanban. Columns side by side on a wide container; stacked
 * sections (cynco's phone layout) when narrow.
 */
import { CalendarCheckIcon, CheckCircleIcon, ClipboardTextIcon, ClockIcon, UserCheckIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button, cn } from "../../base";
import { type BoardColumnDef, useSelection } from "../shared";
import { BillCard, type CyncoBill } from "./bill-card";
import { currencyTotals } from "./shared";

export type BillsBoardColumn = "in_review" | "pending_approval" | "awaiting_payment" | "scheduled" | "paid";

/** A board column plus the bill statuses it collects. */
type BillBoardColumnDef = BoardColumnDef<BillsBoardColumn> & { readonly statuses: readonly string[] };

const BILL_BOARD_COLUMNS = [
	{
		key: "in_review",
		label: "In Review",
		Icon: ClipboardTextIcon,
		empty: "No bills to review",
		statuses: ["in_review"],
	},
	{
		key: "pending_approval",
		label: "Pending Approval",
		Icon: UserCheckIcon,
		empty: "No bills awaiting approval",
		statuses: ["pending_approval"],
	},
	{
		key: "awaiting_payment",
		label: "Awaiting Payment",
		Icon: ClockIcon,
		empty: "No bills awaiting payment",
		statuses: ["approved", "awaiting_payment", "partially_paid"],
	},
	{
		key: "scheduled",
		label: "Scheduled",
		Icon: CalendarCheckIcon,
		empty: "No scheduled payments",
		statuses: ["scheduled"],
	},
	{ key: "paid", label: "Paid", Icon: CheckCircleIcon, empty: "No paid bills in this period", statuses: ["paid"] },
] as const satisfies readonly BillBoardColumnDef[];

export type BillsBoardProps = React.ComponentProps<"div"> & {
	bills: CyncoBill[];
	/** Columns to show, in board order (default: all five). */
	columns?: BillsBoardColumn[];
	selectedIds?: string[];
	defaultSelectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
	paidFilterLabel?: string;
	/** Called from the paid column's filter button (e.g. to change the period); without it the label is plain text. */
	onPaidFilterClick?: () => void;
};

/**
 * One column's cards, with roving focus so arrow keys walk it. A grid rather than
 * a listbox because each card holds its own controls, which an `option` may not.
 */
function BoardColumnCards({
	label,
	bills,
	isSelected,
	onToggle,
	someSelected,
}: {
	label: string;
	bills: CyncoBill[];
	isSelected: (id: string) => boolean;
	onToggle: (id: string) => void;
	someSelected: boolean;
}) {
	const [focusId, setFocusId] = React.useState<string | undefined>(undefined);
	const listRef = React.useRef<HTMLDivElement>(null);
	const ids = bills.map((b) => b.id);
	// Exactly one card is tabbable: the last one focused, else the first selected, else the first.
	const tabId = focusId && ids.includes(focusId) ? focusId : (ids.find(isSelected) ?? ids[0]);
	const focusCard = (id: string) => {
		setFocusId(id);
		listRef.current?.querySelector<HTMLElement>(`[data-bill-id="${CSS.escape(id)}"]`)?.focus();
	};
	/** Up/Down/Home/End move between cards, Space ticks the focused one. */
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const id = (e.target as HTMLElement).dataset.billId;
		const i = id ? ids.indexOf(id) : -1;
		if (!id || i < 0) return;
		let next: string | undefined;
		switch (e.key) {
			case "ArrowDown":
				next = ids[i + 1];
				break;
			case "ArrowUp":
				next = ids[i - 1];
				break;
			case "Home":
				next = ids[0];
				break;
			case "End":
				next = ids[ids.length - 1];
				break;
			case " ":
				onToggle(id);
				break;
			default:
				return;
		}
		e.preventDefault();
		if (next) focusCard(next);
	};
	// biome-ignore-start lint/a11y/useSemanticElements: a column of cards is not tabular data — <table>/<tr> would impose table layout and semantics on a Kanban board.
	return (
		<div
			ref={listRef}
			role="grid"
			aria-multiselectable="true"
			aria-label={`${label} bills`}
			onKeyDown={onKeyDown}
			className="grid gap-2 p-2 @xl:grid-cols-2 @3xl:flex @3xl:flex-col"
		>
			{bills.map((b) => (
				<div
					key={b.id}
					role="row"
					aria-selected={isSelected(b.id)}
					tabIndex={tabId === b.id ? 0 : -1}
					data-bill-id={b.id}
					onFocus={() => setFocusId(b.id)}
					className="min-w-0 rounded-lg outline-none focus-ring"
				>
					<BillCard
						role="gridcell"
						bill={b}
						selected={isSelected(b.id)}
						onSelectedChange={() => onToggle(b.id)}
						someSelected={someSelected}
					/>
				</div>
			))}
		</div>
	);
	// biome-ignore-end lint/a11y/useSemanticElements: end of the column's grid.
}

export function BillsBoard({
	bills,
	columns,
	selectedIds,
	defaultSelectedIds,
	onSelectionChange,
	paidFilterLabel = "Past 30 Days",
	onPaidFilterClick,
	className,
	...props
}: BillsBoardProps) {
	const { ids, isSelected, toggle } = useSelection(selectedIds, defaultSelectedIds, onSelectionChange);
	const cols = BILL_BOARD_COLUMNS.filter((c) => !columns || columns.includes(c.key));
	return (
		<div className={cn("@container min-w-0", className)} {...props}>
			<div className="relative flex flex-col gap-4 @3xl:flex-row @3xl:gap-3 @3xl:overflow-x-auto @3xl:pb-1">
				{cols.map((col) => {
					const statuses = new Set<string>(col.statuses);
					const list = bills.filter((b) => statuses.has(b.status));
					return (
						<section
							key={col.key}
							aria-label={col.label}
							className="flex min-w-0 flex-col @3xl:min-w-52 @3xl:max-w-md @3xl:flex-1"
						>
							<div className="mb-2 flex h-6 items-center justify-between gap-2 px-1">
								<div className="flex min-w-0 items-center gap-2">
									<col.Icon size={14} weight="fill" className="shrink-0 text-subtle" aria-hidden="true" />
									<h3 className="truncate text-sm font-medium text-foreground">{col.label}</h3>
									{list.length > 0 && (
										<span className="rounded-full bg-muted px-1.5 py-0.5 text-2xs leading-none tabular-nums text-tertiary-foreground">
											{list.length}
										</span>
									)}
								</div>
								{col.key === "paid" &&
									(onPaidFilterClick ? (
										<Button variant="skeleton" size="sm" className="text-tertiary-foreground" onClick={onPaidFilterClick}>
											{paidFilterLabel}
										</Button>
									) : (
										<span className="text-xs text-tertiary-foreground">{paidFilterLabel}</span>
									))}
							</div>
							<div className="flex flex-1 flex-col rounded-xl border border-table-tray-border bg-table-tray">
								{list.length === 0 ? (
									<div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center @3xl:py-10">
										<col.Icon size={28} weight="duotone" className="mb-2 text-subtle opacity-60" aria-hidden="true" />
										<p className="text-xs text-tertiary-foreground">{col.empty}</p>
									</div>
								) : (
									<>
										<BoardColumnCards
											label={col.label}
											bills={list}
											isSelected={isSelected}
											onToggle={toggle}
											someSelected={ids.size > 0}
										/>
										<div className="mt-auto flex items-center justify-between gap-2 border-t border-table-tray-border px-3 py-2">
											<span className="text-xs font-medium text-tertiary-foreground">Total</span>
											<span
												className="min-w-0 truncate text-xs font-medium tabular-nums text-muted-foreground"
												title={currencyTotals(list, (b) => b.totalAmount, false)}
											>
												{currencyTotals(list, (b) => b.totalAmount)}
											</span>
										</div>
									</>
								)}
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}
