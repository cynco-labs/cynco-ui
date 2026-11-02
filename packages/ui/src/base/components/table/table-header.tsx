import { useTableContext } from "./table-context";
import { getColumnWidthStyle } from "./table-row-cells";
import { Checkbox } from "../ui/checkbox";
import {
	TableHeader as ShadcnTableHeader,
	TableHead,
	TableRow,
} from "../ui/table";
import { cn } from "../../lib/utils";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function SortIcon({ sortDirection }: { sortDirection: string | false }) {
	if (sortDirection === "asc") {
		return (
			<ChevronUpIcon
				aria-hidden="true"
				className="shrink-0 text-foreground"
				size={12}
			/>
		);
	}

	return (
		<ChevronDownIcon
			aria-hidden="true"
			className={cn(
				"shrink-0",
				sortDirection ? "text-foreground" : "opacity-30",
			)}
			size={12}
		/>
	);
}

function HeaderContent<T>({
	header,
}: {
	header: HeaderGroup<T>["headers"][number];
}) {
	const { enableSorting } = useTableContext();
	if (header.isPlaceholder) {
		return null;
	}

	// Without table-level sorting there is nothing to activate, so no button.
	if (!(enableSorting && header.column.getCanSort())) {
		return (
			<span className="truncate w-full">
				{flexRender(header.column.columnDef.header, header.getContext())}
			</span>
		);
	}

	return (
		<button
			className="flex min-w-0 select-none items-center gap-1 cursor-pointer"
			onClick={header.column.getToggleSortingHandler()}
			type="button"
		>
			<span className="truncate">
				{flexRender(header.column.columnDef.header, header.getContext())}
			</span>
			<SortIcon sortDirection={header.column.getIsSorted()} />
		</button>
	);
}

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

/** Partly selected: the box shows a bar instead of the check its indicator would draw. */
const INDETERMINATE_CLASS =
	"data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:[&_svg]:hidden data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-primary-foreground";

export function TableHeader({ className }: { className?: string }) {
	const {
		table,
		enableSelection,
		enableColumnVisibility,
		enableSorting,
		flexibleTableColumns,
	} = useTableContext();
	const headerGroups = table.getHeaderGroups();
	const rows = table.getRowModel().rows;

	return (
		<ShadcnTableHeader className={cn("sticky top-0 z-20 bg-card", className)}>
			{headerGroups.map((headerGroup, headerGroupIndex) => (
				<TableRow
					// Virtualized bodies number their rows after the header rows.
					aria-rowindex={headerGroupIndex + 1}
					className={cn(
						"bg-card text-subtle border-b",
						!rows.length && "border-dashed",
					)}
					key={headerGroup.id}
				>
					{enableSelection && table && (
						<TableHead className="w-[50px]">
							<Checkbox
								aria-label="Select all rows"
								checked={table.getIsAllPageRowsSelected()}
								indeterminate={table.getIsSomePageRowsSelected()}
								className={INDETERMINATE_CLASS}
								onCheckedChange={(checked) =>
									table.toggleAllPageRowsSelected(!!checked)
								}
							/>
						</TableHead>
					)}
					{headerGroup.headers.map((header, index, arr) => {
						const isLast = index === arr.length - 1;
						const sortDirection = header.column.getIsSorted();
						const ariaSort =
							enableSorting &&
							header.column.getCanSort() &&
							!header.isPlaceholder
								? sortDirection
									? ARIA_SORT[sortDirection]
									: "none"
								: undefined;
						const headerStyle = getColumnWidthStyle({
							size: header.getSize(),
							flexible: flexibleTableColumns,
							grow: header.column.columnDef.meta?.grow,
						});
						return (
							<TableHead
								className={cn(
									"px-2",
									index === 0 && "pl-4",
									isLast && enableColumnVisibility && "pr-8",
								)}
								key={header.id}
								aria-sort={ariaSort}
								style={headerStyle}
							>
								<div className="flex items-center justify-between w-full">
									<HeaderContent header={header} />
								</div>
							</TableHead>
						);
					})}
				</TableRow>
			))}
		</ShadcnTableHeader>
	);
}
