"use client";

/**
 * Cynco UI — the day-grouped, cross-account transaction stream: the toolbar
 * above it, one grid of rows per day, and the keyboard that runs the whole feed.
 */
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	Button,
	cn,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	useControllableState,
} from "../../base";
import { type Amount, absAmount, toSen } from "../../lib/money";
import { ActionBar, formatCurrency, formatDate, surfaces } from "../../lib/shared";
import { useSelection } from "../shared";
import { BANK_FEED_CELLS, type BankFeedCell, BankFeedRow, type BankFeedTransaction } from "./feed-row";
import type { BankFeedStatus } from "./lifecycle";
import { countOf, TINY, type With } from "./shared";

const FEED_FILTERS: Record<BankFeedStatus | "all", string> = {
	all: "All statuses",
	imported: "To categorize",
	categorized: "To post",
	posted: "To reconcile",
	reconciled: "Reconciled",
	excluded: "Excluded",
};
const isFeedFilter = (v: unknown): v is BankFeedStatus | "all" =>
	typeof v === "string" && Object.hasOwn(FEED_FILTERS, v);

export type BankFeedDay = {
	date: string;
	rows: BankFeedTransaction[];
	net?: { amount: Amount; currency?: string } | null;
};

/**
 * FeedStream — the day-grouped, cross-account transaction stream: toolbar
 * (search, lifecycle filter, count, Post all), day headers carrying the
 * day's net, and FeedRows on Cynco UI's tray surface. Each day's rows are a
 * grid: one tab stop, arrow keys between a row's cells and down the feed
 * across day boundaries, and Enter or Space on a cell works its control.
 */
export function BankFeedList({
	days,
	total,
	query: queryProp,
	defaultQuery,
	onQueryChange,
	status: statusProp,
	defaultStatus,
	onStatusChange,
	showAccount = true,
	selectedIds,
	defaultSelectedIds,
	onSelectionChange,
	postAll,
	onPostAll,
	onRestore,
	className,
	...props
}: With<{
	days: BankFeedDay[];
	total: number;
	/** Controlled search query: the list shows the rows you pass, so filter them (or refetch) in `onQueryChange`. Uncontrolled, the list filters by payee, description and reference itself. */
	query?: string;
	/** Initial search query for uncontrolled use. */
	defaultQuery?: string;
	/** Called when the user types in the search box. */
	onQueryChange?: (query: string) => void;
	/** Controlled status filter: the list shows the rows you pass, so filter them (or refetch) in `onStatusChange`. Uncontrolled, the list filters itself. */
	status?: BankFeedStatus | "all";
	/** Initial status filter for uncontrolled use. */
	defaultStatus?: BankFeedStatus | "all";
	/** Called when the user changes the status filter. */
	onStatusChange?: (status: BankFeedStatus | "all") => void;
	showAccount?: boolean;
	/** Ids of the ticked rows (controlled). */
	selectedIds?: string[];
	/** Initially ticked row ids when uncontrolled. */
	defaultSelectedIds?: string[];
	/** Called with the new ids when a row is ticked or unticked. */
	onSelectionChange?: (ids: string[]) => void;
	/** "RM 4,210.00 in · RM 1,180.40 out" shown on Post all; omit to hide the button. */
	postAll?: string;
	/** Called when the user clicks "Post all". */
	onPostAll?: () => void;
	/** Called from an excluded line's Restore button; omit to hide it. */
	onRestore?: (tx: BankFeedTransaction) => void;
	className?: string;
}>) {
	const selection = useSelection(selectedIds, defaultSelectedIds, onSelectionChange);
	const [query = "", setQuery] = useControllableState({
		prop: queryProp,
		defaultProp: defaultQuery,
		onChange: onQueryChange,
	});
	const [status = "all", setStatus] = useControllableState({
		prop: statusProp,
		defaultProp: defaultStatus,
		onChange: onStatusChange,
	});
	const [focus, setFocus] = React.useState<{ id: string; cell: BankFeedCell } | null>(null);
	const gridRef = React.useRef<HTMLDivElement>(null);
	// Controlled filters belong to the caller, who passes the matching rows; uncontrolled ones filter here.
	const q = queryProp === undefined ? query.trim().toLowerCase() : "";
	const only = statusProp === undefined ? status : "all";
	const filtering = q !== "" || only !== "all";
	const shownDays = filtering
		? days
				.map((day) => ({
					...day,
					rows: day.rows.filter(
						(tx) =>
							(only === "all" || tx.status === only) &&
							(!q || [tx.payeeName, tx.description, tx.reference].some((f) => f?.toLowerCase().includes(q))),
					),
				}))
				.filter((day) => day.rows.length > 0)
		: days;

	/** The rows the arrow keys walk, in the order they are drawn, across every day. */
	const rowIds = shownDays.flatMap((day) => day.rows.map((tx) => tx.id));
	// Exactly one cell is tabbable: the last one focused, else the first ticked row, else the first row.
	const tabStop =
		focus && rowIds.includes(focus.id)
			? focus
			: { id: rowIds.find((id) => selection.isSelected(id)) ?? rowIds[0], cell: "select" as BankFeedCell };
	const focusCell = (id: string, cell: BankFeedCell) => {
		setFocus({ id, cell });
		gridRef.current?.querySelector<HTMLElement>(`[data-feed-cell="${CSS.escape(`${id}|${cell}`)}"]`)?.focus();
	};
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		const at = target.dataset.feedCell;
		if (!at) return;
		const split = at.lastIndexOf("|");
		const id = at.slice(0, split);
		const row = rowIds.indexOf(id);
		const col = BANK_FEED_CELLS.indexOf(at.slice(split + 1) as BankFeedCell);
		if (row < 0 || col < 0) return;
		const to = (r: number, c: number) => {
			const nextId = rowIds[r];
			const nextCell = BANK_FEED_CELLS[c];
			return nextId !== undefined && nextCell !== undefined ? { id: nextId, cell: nextCell } : undefined;
		};
		let next: { id: string; cell: BankFeedCell } | undefined;
		switch (e.key) {
			case "ArrowDown":
				next = to(row + 1, col);
				break;
			case "ArrowUp":
				next = to(row - 1, col);
				break;
			case "ArrowRight":
				next = to(row, col + 1);
				break;
			case "ArrowLeft":
				next = to(row, col - 1);
				break;
			case "Home":
				next = to(0, col);
				break;
			case "End":
				next = to(rowIds.length - 1, col);
				break;
			case "Enter":
			case " ":
				target.querySelector<HTMLElement>("button, input, a[href]")?.click();
				break;
			default:
				return;
		}
		e.preventDefault();
		if (next) focusCell(next.id, next.cell);
	};

	return (
		<div className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			<ActionBar>
				<div className="relative min-w-40 max-w-xs flex-1 basis-48">
					<MagnifyingGlassIcon
						size={13}
						className="size-3 pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-tertiary-foreground"
						aria-hidden="true"
					/>
					<Input
						aria-label="Search transactions"
						placeholder="Search payee, description, reference…"
						value={query}
						onChange={(e) => setQuery(e.currentTarget.value)}
						className="pl-7"
					/>
				</div>
				<Select value={status} items={FEED_FILTERS} onValueChange={(v) => isFeedFilter(v) && setStatus(v)}>
					<SelectTrigger className="h-7 w-44 max-w-full" aria-label="Status filter">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(FEED_FILTERS).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span role="status" className={cn(TINY, "ml-auto tabular-nums")}>
					{countOf(filtering ? rowIds.length : total, "transaction")}
				</span>
				{postAll && (
					<Button title={postAll} className="gap-1.5" onClick={onPostAll}>
						Post all
					</Button>
				)}
			</ActionBar>
			{/* Each day is its own grid, so a day heading stays a heading; the arrow keys still run the whole feed. */}
			<div ref={gridRef} className={surfaces.tray}>
				{filtering && shownDays.length === 0 && (
					<p className="px-3 py-6 text-center text-2xs text-tertiary-foreground">No transactions match</p>
				)}
				{shownDays.map((day, i) => (
					<section key={day.date} aria-label={formatDate(day.date)} className={cn(i > 0 && "mt-1")}>
						<header className="flex h-7 items-center justify-between gap-3 px-2.5">
							<h3 className="text-2xs font-medium text-tertiary-foreground">{formatDate(day.date)}</h3>
							{/* The day's net covers all its rows, so it's hidden while some are filtered out. */}
							{day.net && !filtering && (
								<span className="text-2xs tabular-nums text-tertiary-foreground">
									{toSen(day.net.amount) >= 0n ? "+" : "−"}
									{formatCurrency(absAmount(day.net.amount), day.net.currency)}
								</span>
							)}
						</header>
						{/* biome-ignore lint/a11y/useSemanticElements: a <table> cannot stack its cells by container width, which AGENTS.md rule 3 requires of every row. */}
						<div
							role="grid"
							aria-label={`Transactions on ${formatDate(day.date)}`}
							onKeyDown={onKeyDown}
							className={surfaces.surface}
						>
							{day.rows.map((tx) => (
								<BankFeedRow
									key={tx.id}
									tx={tx}
									showAccount={showAccount}
									onRestore={onRestore}
									selected={selection.isSelected(tx.id)}
									onSelectedChange={() => selection.toggle(tx.id)}
									tabCell={tabStop.id === tx.id ? tabStop.cell : null}
									onCellFocus={(cell) => setFocus({ id: tx.id, cell })}
								/>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
