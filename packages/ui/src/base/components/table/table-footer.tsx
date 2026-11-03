"use client";

import { CaretLeftIcon, CaretLineLeftIcon, CaretLineRightIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import type { Table as TanstackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";

const navBtnBase =
	"inline-flex items-center justify-center size-5 rounded-md text-subtle transition-colors hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-30";

export const TableFooter = <TData,>({
	table,
	pageSizeOptions = [5, 10, 25, 50],
	className,
	colSpan,
	leftSlot,
	rightSlot,
}: {
	table: TanstackTable<TData>;
	pageSizeOptions?: number[];
	className?: string;
	colSpan?: number;
	leftSlot?: ReactNode;
	rightSlot?: ReactNode;
}) => {
	const rowCount = table.getRowCount();
	const pageIndex = table.getState().pagination.pageIndex;
	const pageSize = table.getState().pagination.pageSize;
	const pageCount = Math.max(table.getPageCount(), 1);
	const start = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
	const end = Math.min((pageIndex + 1) * pageSize, rowCount);
	const resolvedColSpan = colSpan ?? table.getVisibleLeafColumns().length + 1;

	return (
		<tfoot className={cn("bg-card", className)}>
			<tr className="border-t text-subtle">
				<td colSpan={resolvedColSpan} className="h-8 px-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 text-tiny font-medium text-subtle">
							<label className="flex items-center gap-1.5">
								<span>Rows</span>
								<select
									value={pageSize}
									onChange={(e) => table.setPageSize(Number(e.target.value))}
									className="h-5 cursor-pointer appearance-none rounded-md bg-transparent px-1 text-tiny font-medium text-tertiary-foreground outline-none hover:text-muted-foreground focus-ring"
								>
									{pageSizeOptions.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
							</label>
							{/* Announces the new range when the page or page size changes. */}
							<span className="text-subtle" role="status">
								{start}–{end} of {rowCount}
							</span>
							{leftSlot}
						</div>
						{/* gap-1 keeps 20px buttons 24px apart, the WCAG 2.5.8 spacing minimum. */}
						<div className="flex items-center gap-1">
							{rightSlot}
							<button
								type="button"
								aria-label="First page"
								className={navBtnBase}
								disabled={!table.getCanPreviousPage()}
								onClick={() => table.firstPage()}
							>
								<CaretLineLeftIcon size={14} />
							</button>
							<button
								type="button"
								aria-label="Previous page"
								className={navBtnBase}
								disabled={!table.getCanPreviousPage()}
								onClick={() => table.previousPage()}
							>
								<CaretLeftIcon size={14} />
							</button>
							<span className="min-w-10 text-center text-tiny font-medium text-tertiary-foreground">
								<span aria-hidden="true">
									{pageIndex + 1} / {pageCount}
								</span>
								<span className="sr-only">
									Page {pageIndex + 1} of {pageCount}
								</span>
							</span>
							<button
								type="button"
								aria-label="Next page"
								className={navBtnBase}
								disabled={!table.getCanNextPage()}
								onClick={() => table.nextPage()}
							>
								<CaretRightIcon size={14} />
							</button>
							<button
								type="button"
								aria-label="Last page"
								className={navBtnBase}
								disabled={!table.getCanNextPage()}
								onClick={() => table.lastPage()}
							>
								<CaretLineRightIcon size={14} />
							</button>
						</div>
					</div>
				</td>
			</tr>
		</tfoot>
	);
};
