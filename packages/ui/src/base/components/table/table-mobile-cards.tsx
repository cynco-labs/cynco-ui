import {
	type TableLinkComponent,
	useTableContext,
} from "./table-context";
import { CONTROL_COLUMNS } from "./table-row-cells";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import type { Cell, Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

const SKELETON_CARD_COUNT = 3;

const NON_TITLE_COLUMNS = new Set(["actions", "select", "scope"]);

export function TableMobileCards() {
	const {
		table,
		isLoading,
		isTransitioning,
		getRowHref,
		onRowClick,
		emptyStateChildren,
		emptyStateText,
		selectedItemId,
		linkComponent,
	} = useTableContext();

	const rows = table.getRowModel().rows;
	const showSkeleton = isLoading || isTransitioning;

	if (showSkeleton && !rows.length) {
		return (
			// Placeholder cards carry no data; TableContent announces the loading state.
			<div aria-hidden="true" className="flex flex-col gap-2.5">
				{Array.from({ length: SKELETON_CARD_COUNT }).map((_, cardIndex) => (
					<div
						key={`skeleton-card-${cardIndex}`}
						className="rounded-xl border bg-interactive-secondary p-4 flex flex-col gap-3"
					>
						<Skeleton className="h-4 w-28 rounded-sm" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-3 w-40 rounded-sm" />
							<Skeleton className="h-3 w-32 rounded-sm" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!rows.length) {
		return (
			<div className="rounded-xl border border-dashed bg-interactive-secondary dark:bg-transparent p-6 text-center text-subtle text-xs">
				{emptyStateChildren || emptyStateText}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2.5">
			{rows.map((row) => (
				<MobileCard
					key={row.id}
					isSelected={
						selectedItemId != null &&
						selectedItemId === (row.original as { id?: string }).id
					}
					linkComponent={linkComponent}
					onRowClick={onRowClick}
					row={row}
					rowHref={getRowHref?.(row.original)}
				/>
			))}
		</div>
	);
}

function MobileCard<T>({
	row,
	rowHref,
	isSelected,
	onRowClick,
	linkComponent: LinkComponent,
}: {
	row: Row<T>;
	rowHref?: string;
	isSelected: boolean;
	onRowClick?: (row: T) => void;
	linkComponent?: TableLinkComponent;
}) {
	const cells = row.getVisibleCells();
	const titleCell = cells.find(
		(cell) => !NON_TITLE_COLUMNS.has(cell.column.id),
	);
	const actionsCell = cells.find((cell) => cell.column.id === "actions");
	const detailCells = cells.filter(
		(cell) =>
			cell.column.id !== titleCell?.column.id &&
			!CONTROL_COLUMNS.has(cell.column.id) &&
			cell.column.columnDef.meta?.mobileCard !== "hidden",
	);

	const interactive = Boolean(rowHref || onRowClick);
	const cardClassName = cn(
		"relative rounded-xl border bg-interactive-secondary p-4 flex flex-col gap-3 transition-colors",
		isSelected ? "border-primary" : "active:bg-interactive-secondary-hover",
		interactive && "cursor-pointer",
	);

	const title =
		titleCell &&
		flexRender(titleCell.column.columnDef.cell, titleCell.getContext());

	// The title is the card's one link or button; its ::after stretches over the card so
	// the whole card stays clickable without nesting the actions control inside it.
	const targetClassName =
		"after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-focus-ring";
	const ariaCurrent = isSelected || undefined;

	let titleTarget = title;
	if (rowHref && LinkComponent) {
		titleTarget = (
			<LinkComponent className={targetClassName} to={rowHref}>
				{title}
			</LinkComponent>
		);
	} else if (rowHref) {
		titleTarget = (
			<a aria-current={ariaCurrent} className={targetClassName} href={rowHref}>
				{title}
			</a>
		);
	} else if (onRowClick) {
		titleTarget = (
			<button
				aria-current={ariaCurrent}
				className={cn(targetClassName, "max-w-full truncate text-left")}
				onClick={() => onRowClick(row.original)}
				type="button"
			>
				{title}
			</button>
		);
	}

	return (
		<div className={cardClassName}>
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0 flex-1 text-foreground font-medium text-[15px] truncate">
					{titleTarget}
				</div>
				{actionsCell && (
					<div className="relative z-10 shrink-0 -mr-1.5 -my-1">
						{flexRender(
							actionsCell.column.columnDef.cell,
							actionsCell.getContext(),
						)}
					</div>
				)}
			</div>

			{detailCells.length > 0 && (
				<dl className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
					{detailCells.map((cell) => (
						<CardDetailRow cell={cell} key={cell.id} />
					))}
				</dl>
			)}
		</div>
	);
}

function CardDetailRow<T>({ cell }: { cell: Cell<T, unknown> }) {
	const { header, meta } = cell.column.columnDef;
	const cellContent = meta?.mobileCardCell
		? meta.mobileCardCell(cell.row)
		: flexRender(cell.column.columnDef.cell, cell.getContext());

	if (meta?.mobileCard === "full") {
		return (
			<div className="text-sm text-foreground">
				{typeof header === "string" && <dt className="sr-only">{header}</dt>}
				<dd>{cellContent}</dd>
			</div>
		);
	}

	return (
		<div className="flex items-baseline justify-between gap-4 text-sm">
			<dt className="text-tertiary-foreground shrink-0">
				{typeof header === "string" ? header : null}
			</dt>
			<dd className="text-foreground text-right min-w-0 truncate">
				{cellContent}
			</dd>
		</div>
	);
}
