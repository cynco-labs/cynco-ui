"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { useContext } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "../../lib/utils";
import { IconButton } from "../general/icon-button";
import { Pagination, PaginationContent, PaginationItem } from "../ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TableContext } from "./table-context";
import { TABLE_TRAY_FOOTER_CLASS } from "./table-tray-classes";

const numberFormat = new Intl.NumberFormat("en-US");

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100] as const;

/** Where a cursor-paged result stands. The backend knows; the table instance does not. */
export interface CursorPageState {
	currentPage: number;
	/** `null` until the backend says how many pages there are. */
	totalPages: number | null;
	canGoPrev: boolean;
	canGoNext: boolean;
	onPrev: () => void;
	onNext: () => void;
	pageSize: number;
	/** Rows in the whole result, when the backend counts them. */
	totalCount?: number;
	isTotalCountApproximate?: boolean;
	onPageSizeChange?: (size: number) => void;
}

/** The facts the bar draws, however the paging is done. */
interface PageState {
	page: number;
	pageCount: number | null;
	pageSize: number;
	totalRows?: number;
	totalIsApproximate: boolean;
	canGoPrev: boolean;
	canGoNext: boolean;
	onPrev: () => void;
	onNext: () => void;
	onPageSizeChange?: (size: number) => void;
}

export interface TablePaginationProps<TData = unknown> extends Omit<React.ComponentProps<"div">, "children"> {
	/**
	 * Cursor paging: the bar reports what you pass and calls back for the next page. Without it the
	 * bar pages a TanStack table, taken from `table` or from the surrounding `DataTable.Provider`.
	 */
	cursor?: CursorPageState;
	table?: TanstackTable<TData>;
	/** Page sizes offered in the rows-per-page menu. `null` hides the menu. */
	pageSizeOptions?: readonly number[] | null;
	/** Left and right arrow keys page through the rows. */
	enableHotkeys?: boolean;
	disabled?: boolean;
}

function offsetPageState<TData>(table: TanstackTable<TData>): PageState {
	const { pageIndex, pageSize } = table.getState().pagination;
	return {
		page: pageIndex + 1,
		pageCount: Math.max(table.getPageCount(), 1),
		pageSize,
		totalRows: table.getRowCount(),
		totalIsApproximate: false,
		canGoPrev: table.getCanPreviousPage(),
		canGoNext: table.getCanNextPage(),
		onPrev: () => table.previousPage(),
		onNext: () => table.nextPage(),
		onPageSizeChange: (size) => table.setPageSize(size),
	};
}

function cursorPageState(cursor: CursorPageState): PageState {
	return {
		page: cursor.currentPage,
		pageCount: cursor.totalPages,
		pageSize: cursor.pageSize,
		totalRows: cursor.totalCount,
		totalIsApproximate: cursor.isTotalCountApproximate ?? false,
		canGoPrev: cursor.canGoPrev,
		canGoNext: cursor.canGoNext,
		onPrev: cursor.onPrev,
		onNext: cursor.onNext,
		onPageSizeChange: cursor.onPageSizeChange,
	};
}

/** Rows shown, as "1–25 of 312", or null when nothing has counted them. */
function rowRange(state: PageState) {
	if (typeof state.totalRows !== "number") return null;
	const first = state.totalRows === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
	const last = Math.min(state.page * state.pageSize, state.totalRows);
	const total = `${state.totalIsApproximate ? "~" : ""}${numberFormat.format(state.totalRows)}`;
	return `${numberFormat.format(first)}–${numberFormat.format(last)} of ${total}`;
}

/**
 * The one pagination bar: rows per page, the range in words, and the page stepper. It pages a
 * TanStack table by default and a cursor-paged result when you pass `cursor`. `DataTable.Footer`
 * puts the same bar inside the table's own `<tfoot>`.
 */
export function TablePagination<TData = unknown>({
	cursor,
	table,
	pageSizeOptions = DEFAULT_PAGE_SIZES,
	enableHotkeys = false,
	disabled = false,
	className,
	...props
}: TablePaginationProps<TData>) {
	const context = useContext(TableContext);
	const offsetTable = table ?? (context?.table as TanstackTable<TData> | undefined);

	const state = cursor ? cursorPageState(cursor) : offsetTable ? offsetPageState(offsetTable) : null;
	const prevDisabled = disabled || !state?.canGoPrev;
	const nextDisabled = disabled || !state?.canGoNext;

	useHotkeys(
		"left",
		(e) => {
			e.preventDefault();
			state?.onPrev();
		},
		{ enabled: enableHotkeys && !prevDisabled },
	);
	useHotkeys(
		"right",
		(e) => {
			e.preventDefault();
			state?.onNext();
		},
		{ enabled: enableHotkeys && !nextDisabled },
	);

	if (!state) {
		throw new Error("TablePagination needs a `cursor` state, a `table`, or a surrounding DataTable.Provider");
	}

	const range = rowRange(state);
	const showPageSize = pageSizeOptions !== null && !!state.onPageSizeChange;

	return (
		<div data-slot="table-pagination" className={cn("@container", TABLE_TRAY_FOOTER_CLASS, className)} {...props}>
			{range && (
				// Announces the new range when the page or the page size changes.
				<span className="min-w-0 truncate text-xs text-tertiary-foreground tabular-nums" role="status">
					<span className="hidden @md:inline">Showing </span>
					{range}
				</span>
			)}
			<div className="ml-auto flex items-center gap-3">
				{showPageSize && state.onPageSizeChange && (
					<div className="flex items-center gap-1.5 text-xs text-tertiary-foreground">
						<span className="hidden @md:inline">Rows</span>
						<PageSizeSelect
							pageSize={state.pageSize}
							options={pageSizeOptions ?? DEFAULT_PAGE_SIZES}
							onChange={state.onPageSizeChange}
							disabled={disabled}
						/>
					</div>
				)}
				<Pagination className="w-fit shrink-0 select-none">
					<PaginationContent className="flex items-center gap-1 rounded-lg bg-foreground/4 p-px">
						<PaginationItem>
							<IconButton
								variant="muted"
								size="md"
								aria-label="Previous page"
								icon={<CaretLeftIcon size={12} weight="bold" />}
								onClick={() => state.onPrev()}
								disabled={prevDisabled}
								className={cn("size-7 rounded-md bg-transparent", prevDisabled && "pointer-events-none opacity-50")}
							/>
						</PaginationItem>
						<PaginationItem className="min-w-[9ch] px-1.5 text-center text-xs text-tertiary-foreground tabular-nums whitespace-nowrap">
							<span aria-hidden="true">
								{state.pageCount === null
									? "..."
									: `${numberFormat.format(state.page)} / ${numberFormat.format(state.pageCount)}`}
							</span>
							<span className="sr-only">
								{state.pageCount === null
									? `Page ${numberFormat.format(state.page)}`
									: `Page ${numberFormat.format(state.page)} of ${numberFormat.format(state.pageCount)}`}
							</span>
						</PaginationItem>
						<PaginationItem>
							<IconButton
								variant="muted"
								size="md"
								aria-label="Next page"
								icon={<CaretRightIcon size={12} weight="bold" />}
								onClick={() => state.onNext()}
								disabled={nextDisabled}
								className={cn(
									"size-7 rounded-md bg-foreground/4",
									nextDisabled && "pointer-events-none bg-transparent opacity-50",
								)}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}

function PageSizeSelect({
	pageSize,
	options,
	onChange,
	disabled,
}: {
	pageSize: number;
	options: readonly number[];
	onChange: (size: number) => void;
	disabled: boolean;
}) {
	const widestOptionLength = Math.max(...options.map((size) => numberFormat.format(size).length));

	return (
		<Select
			value={pageSize.toString()}
			onValueChange={(value) => onChange(Number(value))}
			disabled={disabled}
			items={Object.fromEntries(options.map((size) => [size.toString(), numberFormat.format(size)]))}
		>
			<SelectTrigger
				aria-label="Rows per page"
				className="h-7 w-fit justify-between rounded-lg border-transparent bg-foreground/4 px-2 text-xs tabular-nums shadow-none"
				style={{ minWidth: `calc(${widestOptionLength}ch + 1.75rem)` }}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options.map((size) => (
					<SelectItem key={size} value={size.toString()}>
						{numberFormat.format(size)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
