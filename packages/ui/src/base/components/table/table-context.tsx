"use client";

import type { ColumnGroup } from "../../hooks/use-column-visibility";
import { useIsMobile } from "../../hooks/use-is-mobile";
import type { Table as TanstackTable } from "@tanstack/react-table";
import {
	type ComponentType,
	createContext,
	type ReactNode,
	useContext,
} from "react";

export type TableLinkComponent = ComponentType<{
	to: string;
	className?: string;
	children: ReactNode;
}>;

export interface VirtualizationConfig {
	/** Height of the scroll container, e.g., "calc(100vh - 240px)". Omit to let the table grow with its rows. */
	containerHeight?: string;
	/** Height of each row in pixels (default: 40) */
	rowHeight?: number;
	/** Number of rows to render outside visible area (default: 30) - higher values improve fast scrolling smoothness */
	overscan?: number;
	/** Skeleton rows shown on first load (default: fill container). */
	skeletonRowCount?: number;
}

export interface TableProps<T> {
	table: TanstackTable<T>;
	numberOfColumns: number;
	isLoading: boolean;
	isTransitioning?: boolean;
	/** Skeleton rows shown while loading (default: last known row count). */
	skeletonRowCount?: number;
	enableSelection?: boolean;
	enableSorting?: boolean;
	enableColumnVisibility?: boolean;
	columnVisibilityStorageKey?: string;
	/** Column groups for UI organization (renders as submenus in visibility dropdown) */
	columnGroups?: ColumnGroup[];
	/** Whether the user has unsaved column visibility changes */
	columnVisibilityIsDirty?: boolean;
	/** Save current column visibility to localStorage */
	onColumnVisibilitySave?: () => void;
	/** Render column visibility in the toolbar instead of inside table content */
	columnVisibilityInToolbar?: boolean;
	/** Custom className for the column visibility button container (for positioning overrides) */
	columnVisibilityClassName?: string;
	/** For navigation - returns href string, enables cmd+click to open in new tab */
	getRowHref?: (row: T) => string;
	/** Router Link component injected by the consumer; keeps the table router-agnostic */
	linkComponent?: TableLinkComponent;
	/** For non-navigation actions like opening sheets/modals */
	onRowClick?: (row: T) => void;
	/**
	 * For double-click actions (e.g. opening external links). Without `onRowClick`, keyboard users run this with Enter/Space on the row. With both, Enter runs
	 * `onRowClick`, so also offer this action in the row menu.
	 */
	onRowDoubleClick?: (row: T) => void;
	rowClassName?: string;
	/** Per-row className (e.g. to style nested/variant rows differently) */
	getRowClassName?: (row: T) => string | undefined;
	emptyStateChildren?: ReactNode;
	emptyStateText?: string;
	flexibleTableColumns?: boolean;
	mobileCards?: boolean;
	selectedItemId?: string | null;
	/** Virtualization config - only needed when using VirtualizedContent/VirtualizedBody */
	virtualization?: VirtualizationConfig;
	/** Scroll container element - set internally by VirtualizedContent, used by VirtualizedBody */
	scrollContainer?: HTMLDivElement | null;
}

/**
 * One context serves tables of every row type. TypeScript can't express "TableProps<T> for some T"
 * (no existential types), so the row type is erased when stored and restored when read. These two
 * assertions are the only places that happens; each table reads back the T its provider stored.
 */
export const TableContext = createContext<TableProps<unknown> | null>(null);

export function toTableContextValue<T>(props: TableProps<T>): TableProps<unknown> {
	return props as TableProps<unknown>;
}

export function useTableContext<T>(): TableProps<T> {
	const context = useContext(TableContext);

	if (!context) {
		throw new Error("Table context is not available");
	}

	return context as TableProps<T>;
}

export function useShowMobileCards(): boolean {
	const { mobileCards } = useTableContext();
	const isMobile = useIsMobile();
	return Boolean(mobileCards) && isMobile;
}
