import {
	type TableLinkComponent,
	useTableContext,
} from "./table-context";
import { Checkbox } from "../ui/checkbox";
import { Skeleton } from "../ui/skeleton";
import {
	TableBody as ShadcnTableBody,
	TableCell,
	TableRow,
} from "../ui/table";
import { cn } from "../../lib/utils";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { type CSSProperties, memo, type MouseEvent, type ReactNode } from "react";

interface TableRowCellsProps<T> {
	row: Row<T>;
	enableSelection?: boolean;
	flexibleTableColumns?: boolean;
	rowHref?: string;
	/** Row has an `onRowClick` (or `onRowDoubleClick`) handler; the first cell gets a button so keyboard users can reach it. */
	isRowClickable?: boolean;
	visibleColumnKey?: string;
	isExpanded?: boolean;
}

/** Columns holding their own controls: never wrapped in the row link or button, never a row title. */
export const CONTROL_COLUMNS = new Set(["actions", "select"]);

/** A keyboard press (click with detail 0) on the row's own button, not on a checkbox or menu inside the row. */
export const isRowButtonKeyPress = (event: MouseEvent) =>
	event.detail === 0 && event.target instanceof Element && event.target.closest("[data-row-button]") !== null;

/** Names the row checkbox after the row's first text value, so each one is distinct. */
function getRowSelectLabel<T>(row: Row<T>): string {
	const titleCell = row
		.getVisibleCells()
		.find((cell) => !CONTROL_COLUMNS.has(cell.column.id));
	const value = titleCell?.getValue();
	if ((typeof value === "string" && value.trim()) || typeof value === "number") {
		return `Select ${value}`;
	}
	return `Select row ${row.index + 1}`;
}

function CellLink({
	href,
	className,
	linkComponent: LinkComponent,
	children,
}: {
	href: string;
	className?: string;
	linkComponent?: TableLinkComponent;
	children: ReactNode;
}) {
	if (LinkComponent) {
		return (
			<LinkComponent className={className} to={href}>
				{children}
			</LinkComponent>
		);
	}
	return (
		<a className={className} href={href}>
			{children}
		</a>
	);
}

function TableRowCellsInner<T>({
	row,
	enableSelection,
	flexibleTableColumns,
	rowHref,
	isRowClickable,
}: TableRowCellsProps<T>) {
	const { linkComponent: LinkComponent } = useTableContext<T>();
	const visibleCells = row.getVisibleCells();

	return (
		<>
			{enableSelection && (
				<TableCell className="w-[50px]">
					<Checkbox
						aria-label={getRowSelectLabel(row)}
						checked={row.getIsSelected()}
						onCheckedChange={(checked) => row.toggleSelected(!!checked)}
					/>
				</TableCell>
			)}
			{visibleCells.map((cell, cellIndex) => {
				const cellContent = flexRender(
					cell.column.columnDef.cell,
					cell.getContext(),
				);
				const cellStyle = getColumnWidthStyle({
					size: cell.column.getSize(),
					flexible: flexibleTableColumns,
					grow: cell.column.columnDef.meta?.grow,
				});
				const isControlCell = CONTROL_COLUMNS.has(cell.column.id);
				const hasLink = Boolean(rowHref) && !isControlCell;
				// The row's onClick does the work; this button gives it a focus stop and a role.
				const hasRowButton = isRowClickable && cellIndex === 0 && !isControlCell;
				const targetClassName = cn(
					"flex items-center h-full w-full px-2",
					cellIndex === 0 && "pl-4",
					// Inset, so the cell's overflow-hidden doesn't clip the ring.
					"focus-ring-inset",
				);

				return (
					<TableCell
						className={cn(
							"px-2 h-4 text-tertiary-foreground",
							cellIndex === 0 && "pl-4 text-muted-foreground font-medium",
							(hasLink || hasRowButton) && "p-0",
						)}
						key={cell.id}
						style={cellStyle}
					>
						{hasLink && rowHref ? (
							<CellLink
								className={targetClassName}
								href={rowHref}
								linkComponent={LinkComponent}
							>
								{cellContent}
							</CellLink>
						) : hasRowButton ? (
							<button
								className={cn(targetClassName, "text-left cursor-pointer")}
								data-row-button=""
								type="button"
							>
								{cellContent}
							</button>
						) : (
							cellContent
						)}
					</TableCell>
				);
			})}
		</>
	);
}

export const TableRowCells = memo(
	TableRowCellsInner,
	(prevProps, nextProps) => {
		return (
			prevProps.row.id === nextProps.row.id &&
			prevProps.row.original === nextProps.row.original &&
			prevProps.row.getIsSelected() === nextProps.row.getIsSelected() &&
			prevProps.isExpanded === nextProps.isExpanded &&
			prevProps.rowHref === nextProps.rowHref &&
			prevProps.isRowClickable === nextProps.isRowClickable &&
			prevProps.enableSelection === nextProps.enableSelection &&
			prevProps.flexibleTableColumns === nextProps.flexibleTableColumns &&
			prevProps.visibleColumnKey === nextProps.visibleColumnKey
		);
	},
) as typeof TableRowCellsInner;

const SKELETON_WIDTHS = ["w-3/5", "w-1/2", "w-2/3", "w-2/5", "w-3/4", "w-1/2"];

export function getColumnWidthStyle({
	size,
	flexible,
	grow,
}: {
	size: number;
	flexible?: boolean;
	grow?: boolean;
}): CSSProperties {
	if (grow) return { minWidth: `${size}px` };
	if (flexible) return { width: `${size}px`, maxWidth: `${size}px` };
	return { width: `${size}px` };
}

export type ColumnSkeletonMeta = {
	skeleton?: ReactNode | ((rowIndex: number) => ReactNode);
	hidden?: boolean;
};

export function TableSkeletonRows({
	columns,
	rowCount = 12,
	rowClassName,
	flexibleTableColumns,
	asFragment = false,
}: {
	columns: {
		id: string;
		size: number;
		grow?: boolean;
		skeleton?: ColumnSkeletonMeta;
	}[];
	rowCount?: number;
	rowClassName?: string;
	flexibleTableColumns?: boolean;
	asFragment?: boolean;
}) {
	// Placeholder rows carry no data; TableContent announces the loading state instead.
	const skeletonRows = Array.from({ length: rowCount }).map((_, rowIndex) => (
		<TableRow
			aria-hidden="true"
			key={`skeleton-${rowIndex}`}
			className={cn(
				"h-10 hover:bg-transparent dark:hover:bg-transparent",
				rowClassName,
			)}
		>
			{columns.map((col, colIndex) => {
				const meta = col.skeleton;
				const cellStyle = getColumnWidthStyle({
					size: col.size,
					flexible: flexibleTableColumns,
					grow: col.grow,
				});

				if (meta?.hidden) {
					return (
						<TableCell
							key={`skeleton-${col.id}-${rowIndex}`}
							style={cellStyle}
						/>
					);
				}

				const widthClass =
					SKELETON_WIDTHS[(colIndex * 3 + rowIndex) % SKELETON_WIDTHS.length];

				const skeletonContent =
					typeof meta?.skeleton === "function"
						? meta.skeleton(rowIndex)
						: meta?.skeleton;

				return (
					<TableCell
						key={`skeleton-${col.id}-${rowIndex}`}
						className={cn("px-2", colIndex === 0 && "pl-4")}
						style={cellStyle}
					>
						{skeletonContent ?? (
							<Skeleton className={cn("h-3.5 rounded-sm", widthClass)} />
						)}
					</TableCell>
				);
			})}
		</TableRow>
	));

	if (asFragment) return <>{skeletonRows}</>;

	return (
		<ShadcnTableBody className="divide-y bg-interactive-secondary">
			{skeletonRows}
		</ShadcnTableBody>
	);
}
