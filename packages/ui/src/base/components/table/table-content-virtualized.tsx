import { TableColumnVisibility } from "./table-column-visibility";
import {
	TableContext,
	useShowMobileCards,
	useTableContext,
} from "./table-context";
import { TableHeader } from "./table-header";
import { TableStatus } from "./table-content";
import { TableMobileCards } from "./table-mobile-cards";
import { TABLE_TRAY_CLASS } from "./table-tray-classes";
import { Table } from "../ui/table";
import { cn } from "../../lib/utils";
import React, { useMemo, useState } from "react";

export function TableContentVirtualized({
	children,
	className,
	footer,
}: {
	children: React.ReactNode;
	className?: string;
	/** Sits on the tray below the scroll area, so it never scrolls away. */
	footer?: React.ReactNode;
}) {
	const context = useTableContext();
	const isFlexFill = context.virtualization?.containerHeight === "100%";
	const {
		enableColumnVisibility,
		columnVisibilityInToolbar,
		columnVisibilityClassName,
		table,
		virtualization,
	} = context;
	const { isLoading, isTransitioning } = context;
	const rows = table.getRowModel().rows;
	const headerRowCount = table.getHeaderGroups().length;
	const showsSkeleton = (isLoading || isTransitioning) && !rows.length;
	const showMobileCards = useShowMobileCards();

	// State, not a ref, so the virtualizer re-renders once the container mounts.
	const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
		null,
	);

	const rowHeight = virtualization?.rowHeight ?? 40;
	const contentHeight = rows.length * rowHeight;

	// Small tables stay as short as their content; taller ones get a usable floor.
	const MIN_TABLE_HEIGHT = 400;
	const containerHeight = virtualization?.containerHeight;
	const containerHeightPx =
		containerHeight && !containerHeight.startsWith("calc")
			? Number.parseInt(containerHeight, 10)
			: undefined;
	const isShortContainer =
		containerHeightPx !== undefined && containerHeightPx < MIN_TABLE_HEIGHT;
	const minHeight =
		isShortContainer || isFlexFill
			? undefined
			: contentHeight > MIN_TABLE_HEIGHT || showsSkeleton
				? MIN_TABLE_HEIGHT
				: undefined;

	// Declared column widths are the floor before horizontal scrolling kicks in.
	const visibleColumns = table.getVisibleLeafColumns();
	const totalWidth = useMemo(() => {
		return visibleColumns.reduce((sum, col) => sum + col.getSize(), 0);
	}, [visibleColumns]);

	// Remounts the body whenever the visible column set changes.
	const visibleColumnKey = visibleColumns.map((col) => col.id).join(",");

	const contextWithRef = {
		...context,
		scrollContainer,
	};

	if (showMobileCards) {
		return (
			<>
				<TableStatus />
				<TableMobileCards />
				{footer}
			</>
		);
	}

	return (
		<TableContext.Provider value={contextWithRef}>
			<div
				className={cn(
					"relative z-50 min-w-0 overflow-hidden",
					TABLE_TRAY_CLASS,
					isFlexFill && "h-full flex flex-col",
					className,
				)}
			>
				<TableStatus />
				{(isLoading || isTransitioning) && (
					<div className="bg-background/40 absolute pointer-events-none rounded-xl -inset-[1px] z-70" />
				)}

				{enableColumnVisibility && !columnVisibilityInToolbar && (
					<div
						className={cn(
							"absolute right-7 top-1 z-45",
							columnVisibilityClassName,
						)}
					>
						<TableColumnVisibility />
					</div>
				)}

				<div
					key={visibleColumnKey}
					ref={setScrollContainer}
					className={cn(
						"w-full overflow-auto transition-[max-height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
						isFlexFill && "flex-1 min-h-0",
						showsSkeleton && "overflow-hidden",
					)}
					style={{
						minHeight: isFlexFill ? undefined : minHeight,
						maxHeight: isFlexFill ? undefined : containerHeight,
						height:
							!isFlexFill && showsSkeleton && containerHeight
								? containerHeight
								: undefined,
						willChange: "scroll-position",
					}}
				>
					{/* One table with a sticky thead: separate header/body tables size their
					    columns independently. Fixed layout pins them to the header row. */}
					{/* Only a window of rows is in the DOM; the count tells assistive tech the real size. */}
					<Table
						className="p-0 w-full h-auto"
						style={{ minWidth: `${totalWidth}px` }}
						aria-rowcount={headerRowCount + rows.length}
						aria-busy={isLoading || isTransitioning || undefined}
					>
						{/* Mirrors the bottom edge below: rows only round off at the true first row. */}
						<TableHeader
							className={cn(
								rows.length > 0 &&
									"after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-2 after:rounded-t-lg after:border-x after:border-t after:border-table-surface-border after:shadow-[0_0_0_8px_var(--color-table-tray)] after:[clip-path:inset(0)]",
							)}
						/>
						{React.Children.map(children, (child) =>
							React.isValidElement(child)
								? React.cloneElement(child, { key: visibleColumnKey })
								: child,
						)}
					</Table>
					{rows.length > 0 && (
						// Rows only round off at the true last row, so this pins that edge to the viewport.
						// Its sticky range ends where the table wrapper does, hence the wrapper's h-auto.
						<div
							aria-hidden
							className="pointer-events-none sticky bottom-0 z-10 -mt-2 h-2 overflow-hidden"
							style={{ minWidth: `${totalWidth}px` }}
						>
							<div className="absolute inset-x-0 -top-2 bottom-0 rounded-b-lg border-x border-b border-table-surface-border shadow-[0_0_0_8px_var(--color-table-tray)]" />
						</div>
					)}
				</div>
				{footer}
			</div>
		</TableContext.Provider>
	);
}
