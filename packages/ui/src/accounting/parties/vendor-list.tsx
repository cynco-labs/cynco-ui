"use client";

/**
 * Cynco UI — the vendors list.
 */
import { ArchiveIcon, CurrencyCircleDollarIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { type DataColumn, DataList, formatCurrency, formatDate, surfaces } from "../../lib/shared";
import { useSelection, type VendorAction } from "../shared";
import { CellNull, NameCell, type RowAction, RowActions, RowSelect, SelectAll } from "./shared";

export type { VendorAction };

const rowActions = (v: CyncoVendorRow): Array<RowAction<VendorAction>> => [
	{ action: "record_payment", label: "Record payment", icon: <CurrencyCircleDollarIcon size={14} /> },
	{ action: "edit", label: "Edit", icon: <PencilSimpleIcon size={14} /> },
	v.isActive === false
		? { action: "activate", label: "Activate", icon: <ArchiveIcon size={14} /> }
		: { action: "deactivate", label: "Deactivate", icon: <ArchiveIcon size={14} /> },
	{ action: "delete", label: "Delete", icon: <TrashIcon size={14} />, destructive: true },
];

export type CyncoVendorRow = {
	id: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	category?: string | null;
	city?: string | null;
	country?: string | null;
	isActive?: boolean;
	/** MYR figures (the page formats them in the display currency). */
	outstanding?: Amount;
	overdue?: Amount;
	totalPaid?: Amount;
	lastPaymentDate?: string | null;
};

export type VendorListTableProps = {
	vendors: CyncoVendorRow[];
	selectedIds?: string[];
	defaultSelectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
	currency?: string;
	onRowClick?: (row: CyncoVendorRow) => void;
	/** Called when a row menu item is chosen. The id is the contract, not the wording on it. */
	onAction?: (row: CyncoVendorRow, action: VendorAction) => void;
	className?: string;
} & Omit<React.ComponentProps<"div">, "children">;

export function VendorListTable({
	vendors,
	selectedIds,
	defaultSelectedIds,
	onSelectionChange,
	currency = "MYR",
	onRowClick,
	onAction,
	className,
	...props
}: VendorListTableProps) {
	const { ids, toggle, replace } = useSelection(selectedIds, defaultSelectedIds, onSelectionChange);
	const columns: DataColumn<CyncoVendorRow>[] = [
		{
			key: "name",
			header: "Vendor",
			mobile: "title",
			className: "max-w-72",
			cell: (v) => {
				const place = [v.city, v.country].filter(Boolean).join(", ");
				return (
					<NameCell
						name={v.name}
						subtitle={[v.email || v.phone, v.category, place].filter(Boolean).join(" · ")}
						inactive={v.isActive === false}
						inactiveLabel="Inactive"
					/>
				);
			},
		},
		{
			key: "outstanding",
			header: "You owe",
			align: "right",
			mobile: "value",
			cell: (v) => {
				const owed = v.outstanding ?? "0";
				const overdue = v.overdue ?? "0";
				if (toSen(owed) <= 0n) return <CellNull />;
				return (
					<div className="leading-tight">
						<div className="text-foreground">{formatCurrency(owed, currency)}</div>
						{toSen(overdue) > 0n && (
							<div className={cn("text-xs font-normal", surfaces.negative)}>
								{toSen(overdue) >= toSen(owed) ? "All overdue" : `${formatCurrency(overdue, currency)} overdue`}
							</div>
						)}
					</div>
				);
			},
		},
		{
			key: "paid",
			header: "Paid to date",
			align: "right",
			cell: (v) =>
				v.totalPaid != null && toSen(v.totalPaid) > 0n ? (
					<span className="text-muted-foreground">{formatCurrency(v.totalPaid, currency)}</span>
				) : (
					<CellNull />
				),
		},
		{
			key: "lastPaid",
			header: "Last paid",
			align: "right",
			cell: (v) =>
				v.lastPaymentDate ? (
					<span className="text-xs text-tertiary-foreground">{formatDate(v.lastPaymentDate)}</span>
				) : (
					<CellNull />
				),
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="Vendors"
			columns={columns}
			rows={vendors}
			getKey={(v) => v.id}
			stackBelow="2xl"
			onRowClick={onRowClick}
			isRowSelected={(v) => ids.has(v.id)}
			leadingHeader={
				<SelectAll
					total={vendors.length}
					selected={vendors.filter((v) => ids.has(v.id)).length}
					onChange={(all) => replace(all ? vendors.map((v) => v.id) : [])}
					label="Select all vendors"
				/>
			}
			leading={(v) => <RowSelect checked={ids.has(v.id)} onToggle={() => toggle(v.id)} label={`Select ${v.name}`} />}
			trailing={(v) => (
				<RowActions label={`Actions for ${v.name}`} items={rowActions(v)} onAction={(action) => onAction?.(v, action)} />
			)}
			empty="No matching vendors"
		/>
	);
}
