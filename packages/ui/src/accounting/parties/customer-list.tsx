"use client";

/**
 * Cynco UI — the customers list.
 */
import { PencilSimpleIcon, TrashIcon, UserCheckIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn, StatusChip, type StatusGlyph, type StatusTone } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { type DataColumn, DataList, formatCurrency, formatCurrencyCompact, surfaces } from "../../lib/shared";
import { type CustomerAction, useSelection } from "../shared";
import { CellNull, NameCell, type RowAction, RowActions, RowSelect, SelectAll } from "./shared";

export type { CustomerAction };

const ROW_ACTIONS: Array<RowAction<CustomerAction>> = [
	{ action: "edit", label: "Edit", icon: <PencilSimpleIcon size={14} /> },
	{ action: "manage_contacts", label: "Manage contacts", icon: <UserCheckIcon size={14} /> },
	{ action: "delete", label: "Delete", icon: <TrashIcon size={14} />, destructive: true },
];

export type CyncoCustomerRow = {
	id: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	location?: string | null;
	isActive?: boolean;
	currency?: string;
	creditLimit?: Amount | null;
	receivables?: {
		outstanding: Amount;
		overdue: Amount;
		openInvoiceCount: number;
		extraCurrencies?: number;
		nextAction?: { label: string; tone?: "critical" | "warning" | "neutral" } | null;
	} | null;
	/** Estimated margin over the sales window. */
	margin?: { percent: number; revenue: Amount; belowCostLines?: number } | null;
};

function creditLimitChip(c: CyncoCustomerRow): { label: string; tone: StatusTone; glyph: StatusGlyph } | null {
	const r = c.receivables;
	if (!r || c.creditLimit == null || toSen(c.creditLimit) <= 0n || r.extraCurrencies) return null;
	if (toSen(r.outstanding) > toSen(c.creditLimit)) return { label: "Over limit", tone: "red", glyph: "x" };
	if (toSen(r.outstanding) * 100n >= toSen(c.creditLimit) * 85n)
		return { label: "Near limit", tone: "amber", glyph: "alert" };
	return { label: "Within limit", tone: "green", glyph: "check" };
}

export type CustomerListTableProps = {
	customers: CyncoCustomerRow[];
	selectedIds?: string[];
	defaultSelectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
	marginWindowDays?: number;
	onRowClick?: (row: CyncoCustomerRow) => void;
	/** Called when a row menu item is chosen. The id is the contract, not the wording on it. */
	onAction?: (row: CyncoCustomerRow, action: CustomerAction) => void;
	className?: string;
} & Omit<React.ComponentProps<"div">, "children">;

export function CustomerListTable({
	customers,
	selectedIds,
	defaultSelectedIds,
	onSelectionChange,
	marginWindowDays = 90,
	onRowClick,
	onAction,
	className,
	...props
}: CustomerListTableProps) {
	const { ids, toggle, replace } = useSelection(selectedIds, defaultSelectedIds, onSelectionChange);
	const columns: DataColumn<CyncoCustomerRow>[] = [
		{
			key: "name",
			header: "Customer",
			mobile: "title",
			className: "max-w-64",
			cell: (c) => (
				<NameCell
					name={c.name}
					subtitle={[c.email || c.phone, c.location].filter(Boolean).join(" · ")}
					inactive={c.isActive === false}
					inactiveLabel="Archived"
				/>
			),
		},
		{
			key: "receivables",
			header: "Owes you",
			align: "right",
			mobile: "value",
			cell: (c) => {
				const r = c.receivables;
				if (!r || r.openInvoiceCount === 0) return <CellNull />;
				const cur = c.currency ?? "MYR";
				const chip = creditLimitChip(c);
				return (
					<div className="flex flex-col items-end gap-0.5">
						<span className="whitespace-nowrap text-foreground">
							{formatCurrency(r.outstanding, cur)}
							{!!r.extraCurrencies && (
								<span className="ml-1 text-xs font-normal text-tertiary-foreground">+{r.extraCurrencies} currencies</span>
							)}
						</span>
						<span
							className={cn(
								"whitespace-nowrap text-xs font-normal",
								toSen(r.overdue) > 0n ? surfaces.negative : "text-tertiary-foreground",
							)}
						>
							{toSen(r.overdue) > 0n
								? `${formatCurrency(r.overdue, cur)} overdue`
								: `${r.openInvoiceCount === 1 ? "1 invoice" : `${r.openInvoiceCount} invoices`} open`}
						</span>
						{chip && (
							<StatusChip tone={chip.tone} glyph={chip.glyph} className="mt-0.5">
								{chip.label}
							</StatusChip>
						)}
					</div>
				);
			},
		},
		{
			key: "margin",
			header: `Est. margin (${marginWindowDays}d)`,
			cell: (c) => {
				const m = c.margin;
				if (!m) return <CellNull />;
				return (
					<span className="inline-flex flex-col">
						<span className={cn("tabular-nums", m.percent < 0 || m.belowCostLines ? surfaces.negative : "text-foreground")}>
							{m.percent.toFixed(1)}%
						</span>
						<span className="whitespace-nowrap text-xs font-normal tabular-nums text-tertiary-foreground">
							{m.belowCostLines ? "sold below cost" : `on ${formatCurrencyCompact(m.revenue, c.currency ?? "MYR")}`}
						</span>
					</span>
				);
			},
		},
		{
			key: "nextAction",
			header: "Next action",
			mobile: "badge",
			cell: (c) => {
				const a = c.receivables?.nextAction;
				if (!a) return <span className="hidden text-subtle @2xl:inline">—</span>;
				return (
					<StatusChip
						tone={a.tone === "critical" ? "red" : a.tone === "warning" ? "amber" : "neutral"}
						glyph={a.tone === "critical" ? "alert" : a.tone === "warning" ? "clock" : undefined}
					>
						{a.label}
					</StatusChip>
				);
			},
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="Customers"
			columns={columns}
			rows={customers}
			getKey={(c) => c.id}
			stackBelow="2xl"
			onRowClick={onRowClick}
			isRowSelected={(c) => ids.has(c.id)}
			leadingHeader={
				<SelectAll
					total={customers.length}
					selected={customers.filter((c) => ids.has(c.id)).length}
					onChange={(all) => replace(all ? customers.map((c) => c.id) : [])}
					label="Select all customers"
				/>
			}
			leading={(c) => <RowSelect checked={ids.has(c.id)} onToggle={() => toggle(c.id)} label={`Select ${c.name}`} />}
			trailing={(c) => (
				<RowActions label={`Actions for ${c.name}`} items={ROW_ACTIONS} onAction={(action) => onAction?.(c, action)} />
			)}
			empty="No matching customers"
		/>
	);
}
