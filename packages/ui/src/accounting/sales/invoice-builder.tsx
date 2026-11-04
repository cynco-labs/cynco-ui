"use client";

import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — the invoice builder's own furniture: the step rail on the left, the totals block
 * under the line items, and the summary rail pinned beneath both.
 */
import type * as React from "react";
import { cn, useControllableState } from "../../base";
import { type Amount, fromSen, sumAmounts, toSen } from "../../lib/money";
import { formatCurrency, SectionLabel } from "../../lib/shared";
import type { SalesTotalRow } from "../sales-math";

/** Signed money in a totals list: "−RM 120.00" for a deduction. */
function signedTotal(value: Amount, currency: string, negative?: boolean) {
	const sen = toSen(value);
	return `${negative !== (sen < 0n) ? "−" : ""}${formatCurrency(fromSen(sen < 0n ? -sen : sen), currency)}`;
}

/* ------------------------------------------------------- InvoiceTotalsPanel */

/** The document totals block under the line items (cynco InvoiceTotalsBreakdown). */
export function InvoiceTotalsPanel({
	rows,
	currency = "MYR",
	className,
	...props
}: React.ComponentProps<"dl"> & { rows: SalesTotalRow[]; currency?: string }) {
	if (rows.length === 0) return null;
	return (
		<dl className={cn("flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card px-3 py-2.5", className)} {...props}>
			{rows.map((r) => (
				<div
					key={r.label}
					className={cn(
						"flex flex-wrap items-baseline justify-between gap-x-3 text-sm tabular-nums",
						r.bold ? "text-foreground" : "text-tertiary-foreground",
						r.kind === "total" && "mt-0.5 border-t border-table-row-divider pt-1.5 font-semibold",
						r.accent && "font-semibold text-primary",
					)}
				>
					<dt className="min-w-0">{r.label}</dt>
					<dd className="ml-auto whitespace-nowrap">{signedTotal(r.value, currency, r.negative)}</dd>
				</div>
			))}
		</dl>
	);
}

/* ------------------------------------------------------- InvoiceCreateSteps */

const STEP_META = [
	{ title: "Customer Information", description: "Who is this invoice for?" },
	{ title: "Line Items", description: "Products or services to bill" },
	{ title: "Invoice Summary", description: "Terms, tax & final details" },
];

/** The invoice-builder's vertical step rail (cynco InvoiceProgressBar): Customer → Line items → Details. */
export function InvoiceCreateSteps({
	currentStep,
	completed = [],
	children,
	className,
	...props
}: Omit<React.ComponentProps<"ol">, "children"> & {
	currentStep: 1 | 2 | 3;
	completed?: number[];
	children?: Partial<Record<1 | 2 | 3, React.ReactNode>>;
}) {
	return (
		<ol className={cn("flex min-w-0 flex-col", className)} {...props}>
			{STEP_META.map((m, idx) => {
				const n = (idx + 1) as 1 | 2 | 3;
				const done = completed.includes(n) || n < currentStep;
				const active = n === currentStep;
				const last = idx === STEP_META.length - 1;
				return (
					<li key={n} aria-current={active ? "step" : undefined} className="relative flex gap-3.5">
						<div className="flex flex-col items-center">
							<div
								className={cn(
									"z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-2xs tabular-nums",
									done
										? "bg-active-primary text-primary ring-1 ring-primary/25"
										: active
											? "bg-primary text-primary-foreground ring-[3px] ring-primary/15"
											: "bg-muted text-subtle ring-1 ring-border",
								)}
							>
								{done ? (
									<>
										<CheckIcon size={12} weight="bold" aria-hidden="true" />
										<span className="sr-only">Completed:</span>
									</>
								) : (
									n
								)}
							</div>
							{!last && <div className={cn("mt-2 w-px flex-1 rounded-full", done ? "bg-primary/30" : "bg-border")} />}
						</div>
						<div className={cn("min-w-0 flex-1", !last && "pb-6")}>
							<div className="pt-0.5">
								<div
									className={cn(
										"text-sm leading-5",
										active ? "text-foreground" : done ? "text-muted-foreground" : "text-subtle",
									)}
								>
									{m.title}
								</div>
								<div className={cn("text-2xs", active ? "text-tertiary-foreground" : "text-subtle")}>{m.description}</div>
							</div>
							{children?.[n] && <div className="mt-3 min-w-0">{children[n]}</div>}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

/* ------------------------------------------------------- InvoiceSummaryRail */

/** The always-visible total bar under the builder (cynco InvoiceSummaryRail); the breakdown expands upward. */
export function InvoiceSummaryRail({
	rows,
	currency = "MYR",
	actions,
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	className,
	...props
}: React.ComponentProps<"div"> & {
	/** Totals rows; empty means no line items yet. */
	rows: SalesTotalRow[];
	currency?: string;
	actions?: React.ReactNode;
	/** Whether the breakdown is expanded. Pass it to control the rail. */
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [open = false, setOpen] = useControllableState<boolean>({
		prop: openProp,
		defaultProp: defaultOpen,
		onChange: onOpenChange,
	});
	const sum = (kind: SalesTotalRow["kind"]) => sumAmounts(rows.filter((r) => r.kind === kind).map((r) => r.value));
	const subtotal = sum("subtotal");
	const discount = sum("discount");
	const tax = sum("tax");
	const totalRow = rows.find((r) => r.kind === "total");
	const hasItems = rows.length > 0;
	return (
		<div className={cn("@container min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm", className)} {...props}>
			{open && hasItems && (
				<dl className="flex flex-col gap-1.5 border-b border-table-row-divider px-4 py-3">
					{rows.map((r) => (
						<div
							key={r.label}
							className={cn(
								"flex items-baseline justify-between gap-3 text-2xs tabular-nums",
								r.bold ? "text-foreground" : "text-tertiary-foreground",
								r.accent && "text-primary",
							)}
						>
							<dt className="min-w-0">{r.label}</dt>
							<dd className="shrink-0 whitespace-nowrap">{signedTotal(r.value, currency, r.negative)}</dd>
						</div>
					))}
				</dl>
			)}
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
				{hasItems ? (
					// Raw button: the trigger carries the whole figures row; it keeps a focus ring and its visible text is the name.
					<button
						type="button"
						aria-expanded={open}
						onClick={() => setOpen(!open)}
						className="group/rail -mx-2 flex min-w-0 flex-[1_1_14rem] cursor-pointer items-center gap-4 rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-interactive-secondary-hover focus-ring"
					>
						<span className="hidden min-w-0 items-center gap-3 whitespace-nowrap text-2xs tabular-nums text-tertiary-foreground @xl:flex">
							<span>
								Subtotal <span className="text-foreground">{formatCurrency(subtotal, currency)}</span>
							</span>
							{toSen(discount) > 0n && (
								<span>
									Discount <span className="text-foreground">−{formatCurrency(discount, currency)}</span>
								</span>
							)}
							{toSen(tax) > 0n && (
								<span>
									Tax <span className="text-foreground">{formatCurrency(tax, currency)}</span>
								</span>
							)}
						</span>
						<span className="ml-auto flex shrink-0 items-baseline gap-2">
							<SectionLabel>Total</SectionLabel>
							<span className="text-md font-semibold tabular-nums text-foreground">
								{totalRow ? signedTotal(totalRow.value, currency, totalRow.negative) : formatCurrency("0", currency)}
							</span>
							<CaretDownIcon
								size={14}
								aria-hidden="true"
								className={cn("self-center text-tertiary-foreground transition-transform", open && "rotate-180")}
							/>
						</span>
						<span className="sr-only">{open ? ", hide amount breakdown" : ", show amount breakdown"}</span>
					</button>
				) : (
					<span className="ml-auto text-2xs text-tertiary-foreground">Add a line item to see the total</span>
				)}
				{actions && <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
			</div>
		</div>
	);
}
