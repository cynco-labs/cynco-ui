"use client";

import { LiveStatus } from "../general/live-status";
import { TableColumnVisibility } from "./table-column-visibility";
import {
	useShowMobileCards,
	useTableContext,
} from "./table-context";
import { TableMobileCards } from "./table-mobile-cards";
import { TABLE_TRAY_CLASS } from "./table-tray-classes";
import { Table } from "../ui/table";
import { cn } from "../../lib/utils";
import { useEffect, useState } from "react";

/**
 * Polite live region for loading and result counts. It renders empty on mount and
 * fills in after, so screen readers register the region before its first message.
 */
export function TableStatus() {
	const { table, isLoading, isTransitioning, emptyStateText } =
		useTableContext();
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => setIsMounted(true), []);

	const rowCount = table.getRowModel().rows.length;
	let message: string;
	if (isLoading || isTransitioning) {
		message = "Loading…";
	} else if (rowCount === 0) {
		message = emptyStateText || "No results";
	} else {
		message = `${rowCount} ${rowCount === 1 ? "row" : "rows"}`;
	}

	return (
		<LiveStatus>
			{isMounted ? message : ""}
		</LiveStatus>
	);
}

export function TableContent({
	children,
	className,
	footer,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
}: {
	children: React.ReactNode;
	className?: string;
	/** Sits on the tray below the rows. */
	footer?: React.ReactNode;
	/** Names the table for screen readers ("Invoices"); or point aria-labelledby at a visible heading. */
	"aria-label"?: string;
	"aria-labelledby"?: string;
}) {
	const {
		flexibleTableColumns,
		enableColumnVisibility,
		isLoading,
		isTransitioning,
		table,
	} = useTableContext();
	const rows = table.getRowModel().rows;
	const showMobileCards = useShowMobileCards();
	const showsSkeleton = (isLoading || isTransitioning) && !rows.length;

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
		<div
			className={cn(
				"relative z-50 min-w-0",
				TABLE_TRAY_CLASS,
				className,
				showsSkeleton && "overflow-hidden",
			)}
		>
			<TableStatus />
			{(isLoading || isTransitioning) && (
				<div className="bg-background/40 absolute pointer-events-none rounded-xl -inset-[1px] z-70" />
			)}
			{enableColumnVisibility && (
				<div className="absolute right-2 top-1 z-45 h-fit">
					<TableColumnVisibility />
				</div>
			)}
			<Table
				className={cn(
					"p-0 w-full overflow-auto",
					showsSkeleton && "overflow-hidden",
				)}
				flexibleTableColumns={flexibleTableColumns}
				aria-busy={isLoading || isTransitioning || undefined}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
			>
				{children}
			</Table>
			{footer}
		</div>
	);
}
