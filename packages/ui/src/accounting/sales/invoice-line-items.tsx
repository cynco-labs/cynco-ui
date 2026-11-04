"use client";

import { MagnifyingGlassIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — the editable line items of an invoice or quotation, with their running total.
 */
import * as React from "react";
import {
	Button,
	cn,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatusChipIcon,
} from "../../base";
import { currencySymbol } from "../../documents/format";
import { type Amount, sumAmounts, toSen } from "../../lib/money";
import { FieldError, formatCurrency, surfaces } from "../../lib/shared";
import { DEFAULT_SALES_TAX_CODES, type SalesLineItem, type SalesTaxCode, salesLineAmount } from "../sales-math";

const MARGIN_TONE = { healthy: "green", below_target: "amber", below_cost: "red" } as const;
const MARGIN_GLYPH = { healthy: "check", below_target: "alert", below_cost: "x" } as const;

/** Wide-container (48rem+) grid: description | qty | unit price | disc. | tax | amount | remove. */
const LINE_GRID = "@3xl:grid-cols-[minmax(0,1fr)_4.5rem_6.5rem_5rem_7rem_7.5rem_1.75rem]";
const LINE_GRID_RO = "@3xl:grid-cols-[minmax(0,1fr)_4.5rem_6.5rem_5rem_7rem_7.5rem]";
const NUM =
	"h-7 w-full text-right tabular-nums px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/** A per-field label that shows only in the stacked (narrow) layout. */
function LineLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
	return (
		<label htmlFor={htmlFor} className="text-2xs text-tertiary-foreground @3xl:sr-only">
			{children}
		</label>
	);
}

/** Editable line-item rows (cynco LineItemsTable): a grid on wide containers, one card per line on narrow ones. */
export function InvoiceLineItems({
	items,
	onChange,
	currency = "MYR",
	taxCodes = DEFAULT_SALES_TAX_CODES,
	readOnly = false,
	estimatedProfit,
	onAddItem,
	onBrowseLibrary,
	className,
	...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
	items: SalesLineItem[];
	onChange?: (items: SalesLineItem[]) => void;
	currency?: string;
	taxCodes?: readonly SalesTaxCode[];
	readOnly?: boolean;
	/** Document-level estimated profit line under the total. */
	estimatedProfit?: { amount: Amount; percent: number; health: NonNullable<SalesLineItem["margin"]> };
	onAddItem?: () => void;
	onBrowseLibrary?: () => void;
}) {
	const uid = React.useId();
	/** What was typed, kept exactly as typed and never below zero, so the sen arithmetic reads the true figure. */
	const nonNegative = (raw: string): Amount => (raw === "" || toSen(raw) < 0n ? "0" : raw);
	const update = (i: number, patch: Partial<SalesLineItem>) => {
		const next = items.slice();
		next[i] = { ...next[i]!, ...patch };
		onChange?.(next);
	};
	// The Qty field being edited holds its raw text, so it can be cleared and retyped freely. Whole numbers of 1 or
	// more are applied as typed; anything else is flagged inline and reverts to the last valid quantity on blur.
	const [qtyDraft, setQtyDraft] = React.useState<{ i: number; text: string } | null>(null);
	const remove = (i: number) => {
		// The draft is keyed by row index, so it follows its row when an earlier one goes and dies with its own.
		setQtyDraft((d) => (d === null || d.i < i ? d : d.i === i ? null : { ...d, i: d.i - 1 }));
		onChange?.(items.filter((_, j) => j !== i));
	};
	const parseQty = (text: string) => {
		const t = text.trim();
		const n = Number(t);
		return t !== "" && Number.isInteger(n) && n >= 1 ? n : null;
	};
	const total = sumAmounts(items.map((it) => salesLineAmount(it, taxCodes)));
	const grid = readOnly ? LINE_GRID_RO : LINE_GRID;
	const ro = "flex h-7 items-center justify-end tabular-nums text-sm @3xl:justify-end";

	return (
		<div className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			{!readOnly && items.length > 0 && (
				<div
					role="toolbar"
					aria-label="Line item actions"
					className="flex w-fit max-w-full flex-wrap items-center rounded-lg border bg-interactive-secondary p-px"
				>
					<Button variant="skeleton" size="sm" className="h-6 gap-1.5" onClick={onAddItem}>
						<PlusIcon size={12} weight="bold" aria-hidden="true" />
						Add item
					</Button>
					<span className="h-4 w-px bg-border" aria-hidden="true" />
					<Button variant="skeleton" size="sm" className="h-6 gap-1.5" onClick={onBrowseLibrary}>
						<MagnifyingGlassIcon size={12} aria-hidden="true" />
						Browse library
					</Button>
				</div>
			)}
			<div className={surfaces.tray}>
				{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
				<div role="table" aria-label="Line items" className={surfaces.surface}>
					{/* biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells */}
					{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
					<div
						role="row"
						className={cn(
							"hidden gap-2 border-b border-table-row-divider px-3 py-2 text-xs font-medium text-tertiary-foreground @3xl:grid",
							grid,
						)}
					>
						{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells */}
						<span role="columnheader">Description</span>
						{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells */}
						<span role="columnheader" className="text-right">
							Qty
						</span>
						{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells */}
						<span role="columnheader" className="text-right">
							Unit Price
						</span>
						{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells */}
						<span role="columnheader" className="text-right">
							Disc.
						</span>
						{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells */}
						<span role="columnheader">Tax</span>
						{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells */}
						<span role="columnheader" className="text-right">
							Amount
						</span>
						{!readOnly && (
							// biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics
							// biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells
							<span role="columnheader">
								<span className="sr-only">Actions</span>
							</span>
						)}
					</div>
					{items.map((it, i) => {
						const id = `${uid}-${i}`;
						const label = it.name || `line ${i + 1}`;
						const nameMissing = !it.name;
						const qtyText = qtyDraft?.i === i ? qtyDraft.text : String(it.quantity);
						const qtyInvalid = qtyDraft?.i === i && parseQty(qtyDraft.text) === null;
						return (
							// biome-ignore lint/a11y/useFocusableInteractive: role=table is a static table; only role=grid takes focusable cells
							// biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics
							<div
								role="row"
								// biome-ignore lint/suspicious/noArrayIndexKey: line items carry no id and the row's own draft state is already index-keyed
								key={i}
								className={cn(
									"grid grid-cols-2 gap-x-2 gap-y-2 border-b border-table-row-divider px-3 py-2.5 last:border-b-0 @md:grid-cols-4 @3xl:items-start @3xl:py-2",
									grid,
								)}
							>
								{/* Description */}
								{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
								<div role="cell" className="col-span-2 min-w-0 @md:col-span-4 @3xl:col-span-1">
									{readOnly ? (
										<div className="flex flex-col @3xl:pt-1">
											<span className="line-clamp-2 text-sm text-foreground">{it.name || "Unnamed item"}</span>
											{it.description && <span className="line-clamp-2 text-2xs text-tertiary-foreground">{it.description}</span>}
										</div>
									) : (
										<div className="flex flex-col gap-0.5">
											<Input
												aria-label={`Item name, line ${i + 1}`}
												aria-invalid={nameMissing || undefined}
												aria-describedby={nameMissing ? `${id}-name-error` : undefined}
												value={it.name}
												placeholder="Item name"
												onChange={(e) => update(i, { name: e.target.value })}
												variant={nameMissing ? "destructive" : "default"}
											/>
											{nameMissing && (
												<FieldError id={`${id}-name-error`} className="px-2">
													Enter an item name
												</FieldError>
											)}
											<Input
												aria-label={`Description, line ${i + 1}`}
												value={it.description ?? ""}
												placeholder="Description (optional)"
												onChange={(e) => update(i, { description: e.target.value })}
												variant="headless"
												className="h-5 px-2 text-2xs text-tertiary-foreground"
											/>
										</div>
									)}
								</div>
								{/* Qty */}
								{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel htmlFor={`${id}-q`}>Qty</LineLabel>
									{readOnly ? (
										<div className={ro}>{it.quantity}</div>
									) : (
										<>
											<Input
												id={`${id}-q`}
												aria-label={`Qty for ${label}`}
												type="number"
												inputMode="numeric"
												min={1}
												step={1}
												value={qtyText}
												aria-invalid={qtyInvalid || undefined}
												aria-describedby={qtyInvalid ? `${id}-q-error` : undefined}
												variant={qtyInvalid ? "destructive" : "default"}
												onChange={(e) => {
													const text = e.target.value;
													setQtyDraft({ i, text });
													const n = parseQty(text);
													if (n !== null && n !== it.quantity) update(i, { quantity: n });
												}}
												onBlur={() => setQtyDraft(null)}
												className={NUM}
											/>
											{qtyInvalid && (
												<FieldError id={`${id}-q-error`}>
													{Number(qtyDraft?.text) >= 1 ? "Enter a whole number." : "Enter 1 or more."}
												</FieldError>
											)}
										</>
									)}
								</div>
								{/* Unit price */}
								{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel htmlFor={`${id}-p`}>Unit price</LineLabel>
									{readOnly ? (
										<div className={ro}>{formatCurrency(it.price, currency)}</div>
									) : (
										<Input
											id={`${id}-p`}
											aria-label={`Unit price for ${label}`}
											type="number"
											min={0}
											step={0.01}
											value={it.price}
											onChange={(e) => update(i, { price: nonNegative(e.target.value) })}
											className={NUM}
										/>
									)}
								</div>
								{/* Discount */}
								{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel htmlFor={`${id}-d`}>Discount</LineLabel>
									{readOnly ? (
										<div className={ro}>
											{it.discount
												? it.discountType === "fixed"
													? formatCurrency(it.discount, currency)
													: `${it.discount}%`
												: "—"}
										</div>
									) : (
										<div className="relative">
											<Input
												id={`${id}-d`}
												aria-label={`Discount for ${label}`}
												aria-describedby={`${id}-du`}
												type="number"
												min={0}
												value={it.discount ?? 0}
												onChange={(e) => update(i, { discount: nonNegative(e.target.value) })}
												className={cn(NUM, "pr-6")}
											/>
											<span
												id={`${id}-du`}
												className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-subtle"
											>
												{it.discountType === "fixed" ? currencySymbol(currency) : "%"}
											</span>
										</div>
									)}
								</div>
								{/* Tax */}
								{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
								<div role="cell" className="flex min-w-0 flex-col gap-1">
									<LineLabel>Tax</LineLabel>
									{readOnly ? (
										<div className="flex h-7 items-center text-sm text-tertiary-foreground">
											{taxCodes.find((t) => t.value === it.taxCode)?.label ?? "No tax"}
										</div>
									) : (
										<Select
											value={it.taxCode ?? "none"}
											onValueChange={(v) => update(i, { taxCode: v ?? undefined })}
											items={taxCodes.map((t) => ({ value: t.value, label: t.label }))}
										>
											<SelectTrigger className="h-7 w-full px-2 text-sm" aria-label={`Tax code for ${label}`}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{taxCodes.map((t) => (
													<SelectItem key={t.value} value={t.value}>
														{t.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</div>
								{/* Amount + remove: one line on the stacked card */}
								{/* biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics */}
								<div
									role="cell"
									className="col-span-2 flex items-center justify-between gap-2 border-t border-dashed border-table-row-divider pt-2 @md:col-span-4 @3xl:col-span-1 @3xl:h-7 @3xl:justify-end @3xl:border-0 @3xl:pt-0"
								>
									<span className="text-2xs text-tertiary-foreground @3xl:hidden">Amount</span>
									<span className="flex items-center gap-1.5 whitespace-nowrap text-sm tabular-nums text-foreground">
										{it.margin && (
											<span
												role="img"
												aria-label={`Estimated profit: ${it.margin.replace("_", " ")}`}
												title={`Estimated profit: ${it.margin.replace("_", " ")}`}
												className="inline-flex"
											>
												<StatusChipIcon tone={MARGIN_TONE[it.margin]} glyph={MARGIN_GLYPH[it.margin]} />
											</span>
										)}
										{formatCurrency(salesLineAmount(it, taxCodes), currency)}
										{!readOnly && (
											<Button
												variant="skeleton"
												size="icon"
												aria-label={`Remove ${label}`}
												onClick={() => remove(i)}
												className="size-6 text-tertiary-foreground hover:text-error-text @3xl:hidden"
											>
												<TrashIcon size={14} aria-hidden="true" />
											</Button>
										)}
									</span>
								</div>
								{!readOnly && (
									// biome-ignore lint/a11y/useSemanticElements: a container-responsive grid that restacks into cards below @3xl cannot be a <table>; the ARIA roles carry the same semantics
									<div role="cell" className="hidden h-7 items-center justify-end @3xl:flex">
										<Button
											variant="skeleton"
											size="icon"
											aria-label={`Remove ${label}`}
											onClick={() => remove(i)}
											className="size-6 text-tertiary-foreground hover:text-error-text"
										>
											<TrashIcon size={14} aria-hidden="true" />
										</Button>
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className="flex flex-col gap-1 px-3 pt-2.5 pb-2">
					<div className="flex flex-wrap items-center justify-between gap-x-3">
						<span className="text-2xs text-tertiary-foreground">
							Total ({items.length} item{items.length !== 1 ? "s" : ""})
						</span>
						<span className={cn("text-sm tabular-nums text-foreground", !readOnly && "@3xl:pr-9")}>
							{formatCurrency(total, currency)}
						</span>
					</div>
					{estimatedProfit && (
						<div className="flex flex-wrap items-center justify-between gap-x-3">
							<span className="text-2xs text-subtle">Estimated profit</span>
							<span
								className={cn(
									"text-2xs tabular-nums",
									!readOnly && "@3xl:pr-9",
									estimatedProfit.health === "healthy" ? "text-muted-foreground" : "text-error-text",
								)}
							>
								{formatCurrency(estimatedProfit.amount, currency)} ({estimatedProfit.percent}%)
								{estimatedProfit.health === "below_target"
									? " · below profit goal"
									: estimatedProfit.health === "below_cost"
										? " · selling below cost"
										: ""}
							</span>
						</div>
					)}
				</div>
			</div>
			{!readOnly && (
				<Button variant="dotted" className="w-full gap-1.5" onClick={onAddItem}>
					<PlusIcon size={14} aria-hidden="true" />
					Add line
				</Button>
			)}
		</div>
	);
}
