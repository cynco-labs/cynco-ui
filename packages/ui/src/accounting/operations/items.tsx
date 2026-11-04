"use client";

/**
 * Cynco UI — the items catalogue: the list people pick from when they write an
 * invoice or quote, and the KPI row above it. Presentational port of
 * cynco-labs/cynco remix/app/components/items; primitives and tokens only.
 */
import { PackageIcon } from "@phosphor-icons/react";
import { Checkbox, cn, StatusChip, StatusChipIcon } from "../../base";
import { subtractAmounts, toSen } from "../../lib/money";
import {
	type DataColumn,
	DataList,
	formatCurrency,
	formatPlain,
	negativeClass,
	StatGrid,
	StatTile,
} from "../../lib/shared";
import { useSelection } from "../shared";
import { amt, type DivProps, DOT, MutedBadge, type Num, OpsEmpty, percentOf, qty4 } from "./shared";

export interface CatalogItem {
	id: string;
	name: string;
	description?: string | null;
	isArchived?: boolean;
	unitPrice: Num;
	unitCost?: Num;
	costingMode?: "none" | "fixed" | "inventory" | null;
	targetMarginPercent?: Num;
	trackInventory?: boolean;
	unitOfMeasure?: string | null;
	reorderPoint?: Num;
	taxRate?: Num;
	discountRate?: Num;
}
export interface ItemInventoryInfo {
	onHandQuantity: Num;
	weightedAvgCost?: Num;
}
export interface ItemRealized {
	marginPercent: number | null;
	belowCostLineCount: number;
}

function itemMargin(item: CatalogItem, inv?: ItemInventoryInfo) {
	if (!item.costingMode || item.costingMode === "none") return null;
	const cost = (item.costingMode === "inventory" ? inv?.weightedAvgCost : item.unitCost) ?? 0;
	if (item.costingMode === "inventory" && toSen(cost) <= 0n) return null;
	const price = item.unitPrice;
	const percent = percentOf(subtractAmounts(price, cost), price);
	const hasTarget = item.targetMarginPercent != null && item.targetMarginPercent !== "";
	const health =
		percent == null
			? "unknown"
			: percent < 0
				? "loss"
				: hasTarget && toSen(percent) < toSen(item.targetMarginPercent)
					? "below"
					: "healthy";
	return { percent, cost, health };
}
/** A stock quantity as people write it: "5", "5.25". */
const fmtQty = (v: Num) =>
	qty4(v)
		.replace(/(\.\d*?)0+$/, "$1")
		.replace(/\.$/, "");

/** Items catalogue: name, unit price, profit (margin vs cost), inventory, tax and discount. */
export function ItemsListTable({
	items,
	inventoryByItem = {},
	realizedByItem = {},
	selectedIds,
	defaultSelectedIds,
	onSelectionChange,
	className,
	...props
}: DivProps<{
	items: CatalogItem[];
	inventoryByItem?: Record<string, ItemInventoryInfo>;
	realizedByItem?: Record<string, ItemRealized>;
	/** Controlled ticked rows. */
	selectedIds?: string[];
	/** Ticked rows on first render when uncontrolled. */
	defaultSelectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
}>) {
	const sel = useSelection(selectedIds, defaultSelectedIds, onSelectionChange);
	const all = items.length > 0 && items.every((i) => sel.isSelected(i.id));
	const columns: DataColumn<CatalogItem>[] = [
		{
			key: "name",
			header: "Name",
			mobile: "title",
			cell: (item) => (
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-medium text-foreground">{item.name || "Untitled"}</span>
						{item.isArchived && <MutedBadge>Archived</MutedBadge>}
					</div>
					{item.description && (
						<div className="line-clamp-1 text-2xs font-normal text-tertiary-foreground">{item.description}</div>
					)}
				</div>
			),
		},
		{
			key: "price",
			header: "Unit price",
			align: "right",
			mobile: "value",
			cell: (item) => <span className="font-medium">{amt(item.unitPrice)}</span>,
		},
		{
			key: "profit",
			header: "Profit",
			cell: (item) => {
				const m = itemMargin(item, inventoryByItem[item.id]);
				if (!m) return <span className="text-tertiary-foreground">—</span>;
				const realized = realizedByItem[item.id];
				return (
					<div className="flex flex-col leading-tight">
						<span
							className={cn(
								"inline-flex items-center gap-1 text-xs font-medium tabular-nums text-foreground",
								negativeClass(m.health === "loss" || m.health === "below"),
							)}
						>
							{(m.health === "loss" || m.health === "below") && <StatusChipIcon tone="red" glyph="alert" className="size-3" />}
							{m.percent != null ? `${m.percent.toFixed(1)}%` : "—"}
							{m.health === "loss" && <span className="sr-only">, selling at a loss</span>}
							{m.health === "below" && <span className="sr-only">, below target margin</span>}
						</span>
						{realized && realized.marginPercent != null ? (
							<span
								className={cn("text-2xs tabular-nums text-tertiary-foreground", negativeClass(realized.belowCostLineCount > 0))}
							>
								Est. {realized.marginPercent.toFixed(1)}% on sales{realized.belowCostLineCount > 0 && " · below cost"}
							</span>
						) : (
							<span className="text-2xs tabular-nums text-tertiary-foreground">Cost {amt(m.cost)}</span>
						)}
					</div>
				);
			},
		},
		{
			key: "inventory",
			header: "Inventory",
			cell: (item) => {
				const tracked = item.trackInventory === true;
				const onHand = inventoryByItem[item.id]?.onHandQuantity ?? 0;
				const rp = item.reorderPoint ?? 0;
				const low = tracked && toSen(rp) > 0n && toSen(onHand) <= toSen(rp);
				return (
					<div className="flex flex-col leading-tight">
						<span
							className={cn("text-xs font-medium tabular-nums", tracked ? "text-foreground" : "text-tertiary-foreground")}
						>
							{tracked ? `${fmtQty(onHand)} ${item.unitOfMeasure || "unit"}` : "Service"}
						</span>
						{tracked && (
							<span className="inline-flex items-center gap-1 text-2xs tabular-nums text-tertiary-foreground">
								{low && <StatusChipIcon tone="amber" glyph="alert" className="size-3" />}
								{low ? "At reorder point" : toSen(rp) > 0n ? `Reorder ${fmtQty(rp)}` : "Tracked stock"}
							</span>
						)}
					</div>
				);
			},
		},
		{
			key: "tax",
			header: "Tax rate",
			align: "right",
			cell: (item) => <span className="text-tertiary-foreground">{formatPlain(item.taxRate ?? 0)}%</span>,
		},
		{
			key: "disc",
			header: "Discount",
			align: "right",
			cell: (item) => <span className="text-tertiary-foreground">{formatPlain(item.discountRate ?? 0)}%</span>,
		},
	];
	if (items.length === 0) {
		return (
			<div className={cn("min-w-0", className)} {...props}>
				<OpsEmpty
					icon={<PackageIcon size={20} weight="fill" aria-hidden="true" />}
					title="Invoice faster with saved items"
					description="Save the products and services you sell with their price and tax. Pick them when you write an invoice or quote instead of typing them again."
				/>
			</div>
		);
	}
	return (
		<div className={cn("min-w-0", className)} {...props}>
			<DataList
				columns={columns}
				rows={items}
				getKey={(i) => i.id}
				caption="Items"
				stackBelow="2xl"
				isRowSelected={(i) => sel.isSelected(i.id)}
				leadingHeader={
					<Checkbox
						aria-label="Select all items"
						checked={all}
						onCheckedChange={(c) => sel.replace(c ? items.map((i) => i.id) : [])}
					/>
				}
				leading={(item) => (
					<Checkbox
						aria-label={`Select ${item.name}`}
						checked={sel.isSelected(item.id)}
						onCheckedChange={() => sel.toggle(item.id)}
					/>
				)}
			/>
		</div>
	);
}

/** Items page KPI row: margin, average revenue per item, top earner, most sold (trailing window). */
export function ItemStatsRow({
	stats,
	realizedMargins,
	currency = "MYR",
	windowDays = 30,
	className,
	...props
}: DivProps<{
	stats: {
		avgProfitMargin: number | null;
		avgRevenuePerItem: Num;
		highestEarningItem: { name: string; revenue: Num } | null;
		mostSoldItem: { name: string; quantity: number } | null;
	};
	realizedMargins?: { marginPercent: number | null; lineCount: number; belowCostItemCount: number };
	currency?: string;
	windowDays?: number;
}>) {
	const win = `Last ${windowDays} days`;
	const r = realizedMargins;
	const useRealized = r && r.lineCount > 0 && r.marginPercent != null;
	return (
		<StatGrid min="md" aria-label="Item statistics" className={className} {...props}>
			{useRealized ? (
				<StatTile
					className="shadow-sm"
					label="Estimated margin on sales"
					value={`${r!.marginPercent!.toFixed(2)}%`}
					dot={DOT.success}
					sub={
						r!.belowCostItemCount > 0 ? (
							<StatusChip
								tone="red"
								glyph="alert"
								className="whitespace-normal"
							>{`${win} · ${r!.belowCostItemCount} below cost`}</StatusChip>
						) : (
							win
						)
					}
				/>
			) : (
				<StatTile
					className="shadow-sm"
					label="Avg. profit margin"
					value={stats.avgProfitMargin != null ? `${stats.avgProfitMargin.toFixed(2)}%` : "—"}
					dot={DOT.success}
					sub={stats.avgProfitMargin == null ? "add costs to items" : win}
				/>
			)}
			<StatTile
				className="shadow-sm"
				label="Avg. revenue per item"
				value={stats.avgRevenuePerItem != null ? formatCurrency(stats.avgRevenuePerItem, currency) : "N/A"}
			/>
			<StatTile
				className="shadow-sm"
				label="Highest earning item"
				value={stats.highestEarningItem?.name ?? "N/A"}
				dot={DOT.warning}
				sub={win}
			/>
			<StatTile
				className="shadow-sm"
				label="Most sold item"
				value={stats.mostSoldItem?.name ?? "N/A"}
				dot={DOT.violet}
				sub={win}
			/>
		</StatGrid>
	);
}
