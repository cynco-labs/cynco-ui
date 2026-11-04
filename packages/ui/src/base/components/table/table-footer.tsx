"use client";

import { useContext } from "react";
import { cn } from "../../lib/utils";
import { TableContext } from "./table-context";
import { TablePagination, type TablePaginationProps } from "./table-pagination";

export interface TableFooterProps<TData = unknown> extends TablePaginationProps<TData> {
	/** Columns the footer row spans; defaults to every visible column plus the control column. */
	colSpan?: number;
}

/**
 * The pagination bar inside the table's own `<tfoot>`, so it scrolls and prints with the rows.
 * Outside a `<table>`, render `DataTable.Pagination` on the tray instead.
 */
export function TableFooter<TData = unknown>({ className, colSpan, ...props }: TableFooterProps<TData>) {
	const context = useContext(TableContext);
	const table = props.table ?? context?.table;
	const resolvedColSpan = colSpan ?? (table ? table.getVisibleLeafColumns().length + 1 : 1);

	return (
		<tfoot data-slot="table-footer" className={cn("bg-card", className)}>
			<tr className="border-t">
				<td colSpan={resolvedColSpan} className="p-0">
					<TablePagination {...props} />
				</td>
			</tr>
		</tfoot>
	);
}
