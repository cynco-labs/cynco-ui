"use client";

/**
 * Cynco UI — inventory: the stock lifecycle explainer and the stock balances
 * report with its GL reconciliation strip. Presentational port of
 * cynco-labs/cynco remix/app/components/inventory; primitives and tokens only.
 */
import { PackageIcon, ReceiptIcon, ScalesIcon, ShoppingCartIcon, TruckIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn, StatusChip } from "../../base";
import { toSen } from "../../lib/money";
import { ActionBar, type DataColumn, DataList, formatCurrency, negativeClass } from "../../lib/shared";
import { MutedBadge, type Num, OpsEmpty, qty4 } from "./shared";

/** Stock lifecycle: items → PO/GRN → bill → delivery order → GL reconcile. */
export function InventoryFlowPanel({
	trackedItems,
	isReconciled,
	className,
	...props
}: Omit<React.ComponentProps<"section">, "children"> & { trackedItems: number; isReconciled: boolean }) {
	const steps = [
		{
			label: "Set up items",
			detail: `${trackedItems} tracked SKU${trackedItems === 1 ? "" : "s"}`,
			icon: PackageIcon,
			badge: "Stock tracked",
		},
		{ label: "Order and receive", detail: "Accepted GRNs receive stock", icon: ShoppingCartIcon, badge: "Inventory in" },
		{ label: "Record bill", detail: "Linked bills clear received-not-billed", icon: ReceiptIcon, badge: "GRNI clears" },
		{ label: "Dispatch goods", detail: "Delivery orders move stock out", icon: TruckIcon, badge: "COGS posts" },
		{
			label: "Reconcile",
			detail: isReconciled ? "Subledger matches GL" : "Inventory and GL need review",
			icon: ScalesIcon,
			badge: isReconciled ? "Balanced" : "Mismatch",
		},
	];
	return (
		<section className={cn("@container min-w-0 rounded-xl border bg-card p-4 shadow-sm", className)} {...props}>
			<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
				<div className="min-w-0 flex-1 basis-64">
					<h2 className="text-md font-semibold text-foreground">Stock lifecycle</h2>
					<p className="mt-1 max-w-xl text-sm font-normal text-tertiary-foreground">
						Normal purchasing flows through purchase orders and goods receiving. Sales stock leaves through delivery orders,
						so invoices stay focused on revenue.
					</p>
				</div>
				{isReconciled ? (
					<StatusChip tone="green" glyph="check" className="shrink-0">
						GL reconciled
					</StatusChip>
				) : (
					<StatusChip tone="amber" glyph="alert" className="shrink-0">
						Review GL
					</StatusChip>
				)}
			</div>
			<ol className="mt-4 grid gap-2 @md:grid-cols-2 @xl:grid-cols-3 @[40rem]:grid-cols-5">
				{steps.map((s, i) => {
					const Icon = s.icon;
					return (
						<li
							key={s.label}
							className="group flex min-w-0 flex-col rounded-lg border bg-background p-3 transition-colors hover:border-primary/40"
						>
							<div className="flex items-start justify-between gap-2">
								<span className="rounded-md bg-muted p-1.5 text-tertiary-foreground group-hover:text-foreground">
									<Icon size={16} weight="duotone" aria-hidden="true" />
								</span>
								<span className="text-2xs font-medium tabular-nums text-subtle">{String(i + 1).padStart(2, "0")}</span>
							</div>
							<div className="mt-2.5 text-sm font-medium text-foreground">{s.label}</div>
							<p className="mt-0.5 min-h-8 text-2xs text-tertiary-foreground">{s.detail}</p>
							<div className="mt-2.5">
								{s.badge === "Mismatch" ? (
									<StatusChip tone="amber" glyph="alert">
										{s.badge}
									</StatusChip>
								) : (
									<MutedBadge>{s.badge}</MutedBadge>
								)}
							</div>
						</li>
					);
				})}
			</ol>
		</section>
	);
}

export interface StockBalanceRow {
	itemId: string;
	itemName: string;
	locationName: string;
	quantity: Num;
	unitOfMeasure?: string | null;
	weightedAvgCost: Num;
	value: Num;
	reorderPoint?: Num;
}

function BalanceStatus({ row }: { row: StockBalanceRow }) {
	const q = toSen(row.quantity);
	const rp = toSen(row.reorderPoint);
	if (q < 0n)
		return (
			<StatusChip tone="red" glyph="x">
				Negative
			</StatusChip>
		);
	if (rp > 0n && q <= rp)
		return (
			<StatusChip tone="amber" glyph="alert">
				Low
			</StatusChip>
		);
	return (
		<StatusChip tone="neutral" glyph="check">
			Healthy
		</StatusChip>
	);
}

/** Stock balances (on hand, WAC, value, status) with the GL reconciliation strip under them. */
export function StockBalancesReport({
	balances,
	reconciliation,
	period,
	className,
	...props
}: Omit<React.ComponentProps<"section">, "children"> & {
	balances: StockBalanceRow[];
	reconciliation: { glBalance: Num; subledgerBalance: Num; difference: Num; isReconciled: boolean };
	period?: string;
}) {
	const r = reconciliation;
	const columns: DataColumn<StockBalanceRow>[] = [
		{ key: "item", header: "Item", mobile: "title", cell: (b) => <span className="font-medium">{b.itemName}</span> },
		{ key: "loc", header: "Location", cell: (b) => <span className="text-muted-foreground">{b.locationName}</span> },
		{
			key: "onhand",
			header: "On hand",
			align: "right",
			cell: (b) => (
				<span className="text-muted-foreground">
					{qty4(b.quantity)} <span className="text-tertiary-foreground">{b.unitOfMeasure ?? "unit"}</span>
				</span>
			),
		},
		{
			key: "wac",
			header: "WAC",
			align: "right",
			cell: (b) => <span className="text-muted-foreground">{qty4(b.weightedAvgCost)}</span>,
		},
		{ key: "value", header: "Value", align: "right", mobile: "value", cell: (b) => formatCurrency(b.value ?? 0) },
		{ key: "status", header: "Status", mobile: "badge", className: "w-28", cell: (b) => <BalanceStatus row={b} /> },
	];
	return (
		<section className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			<ActionBar className="justify-between">
				<h2 className="text-md font-semibold text-foreground">Stock balances</h2>
				{period && <span className="text-2xs text-tertiary-foreground">{period}</span>}
			</ActionBar>
			{balances.length === 0 ? (
				<OpsEmpty title="Stock on hand shows here once you receive a stock-tracked item." />
			) : (
				<DataList
					columns={columns}
					rows={balances}
					getKey={(b) => b.itemId + b.locationName}
					caption="Stock balances"
					dense
				/>
			)}
			<div className="flex flex-col gap-2 rounded-xl border bg-card px-3.5 py-2.5 shadow-sm">
				<ActionBar className="justify-between">
					<div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
						<ScalesIcon size={14} className="text-tertiary-foreground" aria-hidden="true" />
						GL reconciliation
					</div>
					{r.isReconciled ? (
						<StatusChip tone="green" glyph="check">
							Reconciled
						</StatusChip>
					) : (
						<StatusChip tone="red" glyph="x">
							Mismatch
						</StatusChip>
					)}
				</ActionBar>
				<ActionBar className="gap-x-6 gap-y-1">
					{(
						[
							["GL inventory", r.glBalance],
							["Stock ledger", r.subledgerBalance],
							["Difference", r.difference],
						] as [string, Num][]
					).map(([l, v]) => (
						<div key={l} className="flex items-baseline gap-1.5 text-sm">
							<span className="text-tertiary-foreground">{l}</span>
							<span className={cn("tabular-nums text-foreground", l === "Difference" && negativeClass(toSen(v) !== 0n))}>
								{formatCurrency(v ?? 0)}
							</span>
						</div>
					))}
				</ActionBar>
			</div>
		</section>
	);
}
