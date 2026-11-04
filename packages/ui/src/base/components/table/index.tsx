"use client";

import "./table-meta";
import { TableActions } from "./table-actions";
import { TableBody } from "./table-body";
import { TableBodyVirtualized } from "./table-body-virtualized";
import { TableColumnVisibility } from "./table-column-visibility";
import { TableContainer } from "./table-container";
import { TableContent } from "./table-content";
import { TableContentVirtualized } from "./table-content-virtualized";
import { TableFooter } from "./table-footer";
import { TableHeader } from "./table-header";
import { TableHeading } from "./table-heading";
import { TablePagination } from "./table-pagination";
import { TableProvider } from "./table-provider";
import { TableToolbar } from "./table-toolbar";

/**
 * Cynco's data table, as one namespace. `Table` on its own is the HTML primitive in `ui/table`;
 * this is the kit built on TanStack Table, so it is named for what it is.
 */
export const DataTable = {
	Actions: TableActions,
	Toolbar: TableToolbar,
	Provider: TableProvider,
	Content: TableContent,
	VirtualizedContent: TableContentVirtualized,
	Header: TableHeader,
	Heading: TableHeading,
	/** The pagination bar inside the table's `<tfoot>`. */
	Footer: TableFooter,
	Body: TableBody,
	VirtualizedBody: TableBodyVirtualized,
	Container: TableContainer,
	/** The pagination bar on the tray, below the rows. */
	Pagination: TablePagination,
	ColumnVisibility: TableColumnVisibility,
};

export {
	type TableLinkComponent,
	type TableProps,
	useTableContext,
} from "./table-context";
export { TableDropdownMenuCell } from "./table-dropdown-menu-cell";
export type { TableFooterProps } from "./table-footer";
export type { CursorPageState, TablePaginationProps } from "./table-pagination";
export { TableProvider } from "./table-provider";
export type { ColumnSkeletonMeta } from "./table-row-cells";
export * from "./table-skeleton-presets";
export * from "./table-tray-classes";
export {
	type CursorPaginationState,
	useCursorPagination,
} from "./use-cursor-pagination";
