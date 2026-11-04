"use client";

import { useRef } from "react";
import { cn } from "../../lib/utils";
import { TableCell, TableRow } from "../ui/table";
import { useTableContext } from "./table-context";
import { MotionTbody, useTableFadeIn } from "./table-motion";
import { isRowButtonKeyPress, TableRowCells, TableSkeletonRows } from "./table-row-cells";

const DEFAULT_SKELETON_ROWS = 5;

export type TableBodyProps = Omit<React.ComponentProps<typeof MotionTbody>, "children">;

export function TableBody({ className, ...props }: TableBodyProps) {
	const {
		table,
		numberOfColumns,
		enableSelection,
		isLoading,
		isTransitioning,
		getRowHref,
		onRowClick,
		onRowDoubleClick,
		rowClassName,
		emptyStateChildren,
		emptyStateText,
		selectedItemId,
		flexibleTableColumns,
		getRowClassName,
		skeletonRowCount,
	} = useTableContext();
	const rows = table.getRowModel().rows;
	const fadeIn = useTableFadeIn();
	const lastRowCountRef = useRef(DEFAULT_SKELETON_ROWS);
	const hasLoadedRef = useRef(false);

	if (rows.length > 0) lastRowCountRef.current = rows.length;
	if (!isLoading) hasLoadedRef.current = true;

	const hasRows = rows.length > 0;
	const showSkeleton = isLoading || !!isTransitioning || (!hasRows && !hasLoadedRef.current);

	const columns = table.getVisibleLeafColumns().map((col) => ({
		id: col.id,
		size: col.getSize(),
		grow: col.columnDef.meta?.grow,
		skeleton: col.columnDef.meta?.skeleton,
	}));

	if (showSkeleton) {
		return (
			<MotionTbody
				data-slot="table-body"
				key="skeleton"
				{...fadeIn}
				className={cn("divide-y bg-interactive-secondary", className)}
				{...props}
			>
				<TableSkeletonRows
					columns={columns}
					rowCount={skeletonRowCount ?? lastRowCountRef.current}
					rowClassName={rowClassName}
					flexibleTableColumns={flexibleTableColumns}
					asFragment
				/>
			</MotionTbody>
		);
	}

	if (!hasRows) {
		return (
			<MotionTbody data-slot="table-body" key="empty" {...fadeIn} className={className} {...props}>
				<TableRow className="hover:bg-transparent dark:hover:bg-transparent">
					<TableCell className="h-10 text-center py-0" colSpan={numberOfColumns}>
						<div className="text-subtle text-xs text-center w-full h-full items-center justify-center flex">
							{emptyStateChildren || emptyStateText}
						</div>
					</TableCell>
				</TableRow>
			</MotionTbody>
		);
	}

	const visibleColumnKey = table
		.getVisibleLeafColumns()
		.map((col) => col.id)
		.join(",");

	return (
		<MotionTbody
			data-slot="table-body"
			key="content"
			{...fadeIn}
			className={cn("divide-y bg-interactive-secondary", className)}
			{...props}
		>
			{rows.map((row) => {
				const isSelected = selectedItemId === (row.original as { id?: string }).id;
				const rowHref = getRowHref?.(row.original);

				return (
					<TableRow
						className={cn(
							"text-tertiary-foreground transition-none h-12 py-4 relative",
							rowClassName,
							getRowClassName?.(row.original),
							isSelected ? "z-sticky" : "hover:bg-interactive-secondary-hover",
							(onRowClick || rowHref) && "cursor-pointer",
						)}
						aria-current={isSelected || undefined}
						data-state={row.getIsSelected() && "selected"}
						key={row.id}
						onClick={
							!rowHref
								? (event) => {
										// Keyboard activation of the row button (detail 0) runs the double-click action when
										// there is no single-click one, so it has a keyboard path (WCAG 2.1.1).
										if (onRowClick) onRowClick(row.original);
										else if (isRowButtonKeyPress(event)) onRowDoubleClick?.(row.original);
									}
								: undefined
						}
						onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row.original) : undefined}
					>
						<TableRowCells
							row={row}
							enableSelection={enableSelection}
							flexibleTableColumns={flexibleTableColumns}
							rowHref={rowHref}
							isRowClickable={!rowHref && (!!onRowClick || !!onRowDoubleClick)}
							visibleColumnKey={visibleColumnKey}
							isExpanded={row.getIsExpanded()}
						/>
					</TableRow>
				);
			})}
		</MotionTbody>
	);
}
