"use client";

/**
 * Cynco UI — purchase orders: the list KPI row, the line-items editor and the
 * bills raised against a PO. Presentational port of cynco-labs/cynco
 * remix/app/components/purchase-orders; primitives and tokens only.
 */
import { PlusIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button, cn, Input, useControllableState } from "../../base";
import { fixed, mul, roundToSen } from "../../lib/decimal";
import { type Amount, fromSen, sumAmounts } from "../../lib/money";
import {
	type DataColumn,
	DataList,
	DocStatus,
	formatCurrency,
	formatDate,
	formatPlain,
	KeyValueList,
	StatGrid,
	StatTile,
	surfaces,
} from "../../lib/shared";
import { BILL_STATUS } from "../shared";
import { type DivProps, DOT, type Num, OpsEmpty, RowIconButton } from "./shared";

/** PO list KPI row: total POs, drafts, approved total. */
export function PurchaseOrderStats({
	stats,
	currency = "MYR",
	className,
	...props
}: DivProps<{ stats: { status: string; count: number; total: Num }[]; currency?: string }>) {
	const total = stats.reduce((s, x) => s + x.count, 0);
	const drafts = stats.find((s) => s.status === "draft")?.count ?? 0;
	const approved = stats.find((s) => s.status === "approved")?.total ?? 0;
	return (
		<StatGrid min="sm" aria-label="Purchase order statistics" className={className} {...props}>
			<StatTile className="shadow-sm" label="Total POs" value={String(total)} />
			<StatTile className="shadow-sm" label="Drafts" value={String(drafts)} dot={DOT.warning} />
			<StatTile
				className="shadow-sm"
				label="Approved total"
				value={formatCurrency(approved, currency)}
				dot={DOT.success}
			/>
		</StatGrid>
	);
}

export interface POLine {
	id: string;
	description: string;
	/** Units ordered. It multiplies into money, so the editor keeps it exactly as typed. */
	quantity: Amount;
	unitPrice: Amount | null;
	amount: Amount | null;
}
const fmt2 = (v: Amount | null) => (v != null ? formatPlain(v) : "");

/** Wide: one grid row per line. Narrow: each line becomes a card with labelled fields. */
const PO_GRID = "@xl:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_7.5rem_1.75rem]";

/** PO line items editor (description, qty, unit price, amount auto-calculated) with totals. */
export function PurchaseOrderLines({
	lineItems,
	defaultLineItems = [],
	onLineItemsChange,
	readOnly = false,
	currency = "MYR",
	taxAmount,
	className,
	...props
}: DivProps<{
	/** Controlled lines. */
	lineItems?: POLine[];
	/** Initial lines for uncontrolled use. */
	defaultLineItems?: POLine[];
	onLineItemsChange?: (items: POLine[]) => void;
	readOnly?: boolean;
	currency?: string;
	taxAmount?: Amount;
}>) {
	const [lines = defaultLineItems, set] = useControllableState({
		prop: lineItems,
		defaultProp: defaultLineItems,
		onChange: onLineItemsChange,
	});
	const update = (i: number, field: keyof POLine, raw: string) => {
		const next = [...lines];
		const it = { ...next[i]! };
		if (field === "description") it.description = raw;
		// The field keeps what was typed, so a half-finished "12." survives the keystroke; the decimal
		// helpers read it the same way the totals below do.
		else if (field === "quantity") it.quantity = raw;
		else if (field === "unitPrice") it.unitPrice = raw === "" ? null : raw;
		else if (field === "amount") it.amount = raw === "" ? null : raw;
		if ((field === "quantity" || field === "unitPrice") && it.unitPrice != null)
			it.amount = fromSen(roundToSen(mul(fixed(it.quantity), fixed(it.unitPrice))));
		next[i] = it;
		set(next);
	};
	const subtotal = sumAmounts(lines.map((l) => l.amount));
	const tax = taxAmount ?? "0.00";
	const input =
		"min-w-24 text-sm @xl:border-transparent @xl:bg-transparent @xl:shadow-none @xl:hover:border-[var(--color-input)] @xl:focus:border-[var(--color-input)]";
	const fieldLabel = "text-2xs text-tertiary-foreground @xl:sr-only";
	const listRef = React.useRef<HTMLUListElement>(null);
	/** Index of a removed line: its Remove button unmounts, so focus moves to the line that takes its place. */
	const refocus = React.useRef<number | null>(null);
	React.useEffect(() => {
		const i = refocus.current;
		if (i === null) return;
		refocus.current = null;
		// Two Remove buttons per line (narrow / wide); only the displayed one is focusable.
		const items = listRef.current?.querySelectorAll<HTMLElement>("li");
		const item = items?.[Math.min(i, (items?.length ?? 0) - 1)];
		const target = [...(item?.querySelectorAll<HTMLElement>("[data-line-remove]") ?? [])].find(
			(b) => b.offsetParent !== null,
		);
		(target ?? item?.querySelector<HTMLElement>("input"))?.focus();
	}, [lines]);
	const remove = (i: number) => (
		<RowIconButton
			label={`Remove line ${i + 1}`}
			data-line-remove=""
			onClick={() => {
				refocus.current = i;
				set(lines.filter((_, j) => j !== i));
			}}
		/>
	);
	const line = (i: number) => <span className="sr-only">, line {i + 1}</span>;
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			<div className={surfaces.tray}>
				<div
					className={cn(
						"hidden gap-2 px-3 py-2 text-xs font-medium text-tertiary-foreground @xl:grid",
						PO_GRID,
						readOnly && "@xl:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_7.5rem]",
					)}
				>
					<span>Description</span>
					<span className="text-right">Qty</span>
					<span className="text-right">Unit price ({currency})</span>
					<span className="text-right">Amount ({currency})</span>
					{!readOnly && <span className="sr-only">Actions</span>}
				</div>
				<ul
					ref={listRef}
					className={cn(surfaces.surface, "flex flex-col gap-2 p-2 @xl:gap-0 @xl:p-0")}
					aria-label="Purchase order lines"
				>
					{lines.map((it, i) => (
						<li
							key={it.id}
							className={cn(
								"grid grid-cols-2 items-end gap-2 rounded-lg border border-table-row-divider p-2.5 @sm:grid-cols-3",
								"@xl:items-center @xl:rounded-none @xl:border-0 @xl:border-b @xl:px-3 @xl:py-1.5 @xl:last:border-b-0",
								PO_GRID,
								readOnly && "@xl:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_7.5rem] @xl:py-2",
							)}
						>
							<div className="col-span-full flex items-end gap-2 @xl:col-span-1">
								{readOnly ? (
									<div className="flex min-w-0 flex-1 flex-col gap-1">
										<span className={fieldLabel}>Description{line(i)}</span>
										<span className="text-sm text-foreground">{it.description || "—"}</span>
									</div>
								) : (
									<label className="flex min-w-0 flex-1 flex-col gap-1">
										<span className={fieldLabel}>Description{line(i)}</span>
										<Input
											value={it.description}
											placeholder="Line item description"
											onChange={(e) => update(i, "description", e.target.value)}
											className={input}
										/>
									</label>
								)}
								{!readOnly && <div className="@xl:hidden">{remove(i)}</div>}
							</div>
							{readOnly ? (
								<div className="flex min-w-0 flex-col gap-1">
									<span className={fieldLabel}>Qty{line(i)}</span>
									<span className="text-sm tabular-nums text-muted-foreground @xl:text-right">{it.quantity}</span>
								</div>
							) : (
								<label className="flex min-w-0 flex-col gap-1">
									<span className={fieldLabel}>Qty{line(i)}</span>
									<Input
										type="number"
										min={0}
										step="any"
										value={it.quantity}
										onChange={(e) => update(i, "quantity", e.target.value)}
										className={cn(input, "text-right tabular-nums")}
									/>
								</label>
							)}
							{readOnly ? (
								<div className="flex min-w-0 flex-col gap-1">
									<span className={fieldLabel}>
										Unit price ({currency}){line(i)}
									</span>
									<span className="text-sm tabular-nums text-muted-foreground @xl:text-right">{fmt2(it.unitPrice)}</span>
								</div>
							) : (
								<label className="flex min-w-0 flex-col gap-1">
									<span className={fieldLabel}>
										Unit price ({currency}){line(i)}
									</span>
									<Input
										type="number"
										min={0}
										step="any"
										placeholder="0.00"
										value={it.unitPrice ?? ""}
										onChange={(e) => update(i, "unitPrice", e.target.value)}
										className={cn(input, "text-right tabular-nums")}
									/>
								</label>
							)}
							{readOnly ? (
								<div className="flex min-w-0 flex-col gap-1">
									<span className={fieldLabel}>
										Amount ({currency}){line(i)}
									</span>
									<span className="text-sm font-medium tabular-nums text-foreground @xl:text-right">{fmt2(it.amount)}</span>
								</div>
							) : (
								<label className="flex min-w-0 flex-col gap-1">
									<span className={fieldLabel}>
										Amount ({currency}){line(i)}
									</span>
									<Input
										type="number"
										min={0}
										step="any"
										placeholder="0.00"
										value={it.amount ?? ""}
										onChange={(e) => update(i, "amount", e.target.value)}
										className={cn(input, "text-right tabular-nums text-foreground")}
									/>
								</label>
							)}
							{!readOnly && <div className="hidden justify-end @xl:flex">{remove(i)}</div>}
						</li>
					))}
				</ul>
			</div>
			<div className="flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
				{!readOnly ? (
					<Button
						variant="dotted"
						onClick={() =>
							set([
								...lines,
								{ id: `new-${lines.length + 1}-${Date.now()}`, description: "", quantity: 1, unitPrice: null, amount: null },
							])
						}
					>
						<PlusIcon size={14} aria-hidden="true" />
						Add line item
					</Button>
				) : (
					<span />
				)}
				<KeyValueList
					className="w-full @md:w-64"
					items={[
						{ label: "Subtotal", value: formatCurrency(subtotal, currency) },
						{ label: "Tax (SST)", value: formatCurrency(tax, currency) },
						{ label: "Total", value: formatCurrency(sumAmounts([subtotal, tax]), currency), strong: true },
					]}
				/>
			</div>
		</div>
	);
}

/** A bill raised against a purchase order. */
type LinkedBill = {
	id: string;
	billNumber: string | null;
	status: string | null;
	totalAmount: Num;
	currency?: string | null;
	issueDate: string | null;
};

/** Bills linked to a purchase order: number, issue date, amount, status. */
export function PurchaseOrderLinkedBills({
	bills,
	currency = "MYR",
	onRowClick,
	className,
	...props
}: DivProps<{ bills: LinkedBill[]; currency?: string; onRowClick?: (bill: LinkedBill) => void }>) {
	if (bills.length === 0)
		return (
			<div className={cn("min-w-0", className)} {...props}>
				<OpsEmpty title="No bills linked to this purchase order" />
			</div>
		);
	const columns: DataColumn<LinkedBill>[] = [
		{
			key: "bill",
			header: "Bill",
			mobile: "title",
			cell: (b) => (
				<span className={cn("font-mono text-2xs font-medium", onRowClick ? "text-primary" : "text-foreground")}>
					{b.billNumber || b.id.slice(0, 12)}
				</span>
			),
		},
		{
			key: "issued",
			header: "Issued",
			nowrap: true,
			cell: (b) => (
				<span className="text-2xs text-tertiary-foreground">{b.issueDate ? formatDate(b.issueDate) : "—"}</span>
			),
		},
		{
			key: "amount",
			header: "Amount",
			align: "right",
			mobile: "value",
			cell: (b) => (
				<span className="font-medium">
					{b.totalAmount == null || b.totalAmount === "" ? "—" : formatCurrency(b.totalAmount, b.currency ?? currency)}
				</span>
			),
		},
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			cell: (b) => <DocStatus status={b.status ?? "draft"} config={BILL_STATUS} />,
		},
	];
	return (
		<div className={cn("min-w-0", className)} {...props}>
			<DataList
				columns={columns}
				rows={bills}
				getKey={(b) => b.id}
				caption="Bills linked to this purchase order"
				dense
				onRowClick={onRowClick}
			/>
		</div>
	);
}
