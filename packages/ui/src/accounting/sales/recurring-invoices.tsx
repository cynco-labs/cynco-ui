"use client";

/**
 * Cynco UI — the templates that generate invoices on a schedule.
 */
import type * as React from "react";
import type { Amount } from "../../lib/money";
import { type DataColumn, DataList, DocStatus, formatCurrency, formatDate, type StatusEntry } from "../../lib/shared";

/** cynco StatusBadge "lifecycle" preset, used by recurring templates. */
const LIFECYCLE_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral" },
	active: { label: "Active", variant: "success" },
	paused: { label: "Paused", variant: "warning", glyph: "pause" },
	expired: { label: "Expired", variant: "neutral" },
	cancelled: { label: "Cancelled", variant: "error" },
	archived: { label: "Archived", variant: "neutral" },
};

const FREQUENCY_LABELS: Record<string, string> = {
	weekly: "Weekly",
	biweekly: "Bi-weekly",
	monthly: "Monthly",
	quarterly: "Quarterly",
	semiannually: "Semi-annually",
	annually: "Annually",
};

export type SalesRecurringTemplate = {
	id: string;
	customerName: string;
	customerEmail?: string;
	frequency: string;
	nextGenerationDate?: string | null;
	totalAmount?: Amount | null;
	currency?: string;
	totalGenerated: number;
	status: string;
};

/** Recurring invoice templates list (cynco RECURRING_TEMPLATE_COLUMNS). */
export function RecurringTemplateTable({
	templates,
	className,
	...props
}: { templates: SalesRecurringTemplate[] } & Omit<React.ComponentProps<"div">, "children">) {
	const columns: DataColumn<SalesRecurringTemplate>[] = [
		{
			key: "customer",
			header: "Customer",
			mobile: "title",
			cell: (t) => (
				<div className="flex min-w-0 flex-col leading-tight">
					<span className="break-words text-sm text-foreground">{t.customerName}</span>
					{t.customerEmail && (
						<span className="break-all text-2xs font-normal text-tertiary-foreground">{t.customerEmail}</span>
					)}
				</div>
			),
		},
		{
			key: "frequency",
			header: "Frequency",
			mobile: "meta",
			className: "whitespace-nowrap",
			cell: (t) => FREQUENCY_LABELS[t.frequency] ?? t.frequency,
		},
		{
			key: "next",
			header: "Next generation",
			mobile: "meta",
			className: "whitespace-nowrap",
			cell: (t) => (
				<span className="tabular-nums text-tertiary-foreground">
					{t.nextGenerationDate ? formatDate(t.nextGenerationDate) : "—"}
				</span>
			),
		},
		{
			key: "amount",
			header: "Amount",
			align: "right",
			mobile: "value",
			cell: (t) =>
				t.totalAmount != null ? (
					formatCurrency(t.totalAmount, t.currency || "MYR")
				) : (
					<span className="text-tertiary-foreground">—</span>
				),
		},
		{
			key: "generated",
			header: "Generated",
			align: "right",
			mobile: "meta",
			cell: (t) => <span className="tabular-nums text-tertiary-foreground">{t.totalGenerated}</span>,
		},
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			className: "whitespace-nowrap",
			cell: (t) => <DocStatus status={t.status} config={LIFECYCLE_STATUS} />,
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="Recurring invoice templates"
			columns={columns}
			rows={templates}
			getKey={(t) => t.id}
			stackBelow="xl"
		/>
	);
}
