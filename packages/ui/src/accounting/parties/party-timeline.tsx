"use client";

/**
 * Cynco UI — the party Activity story, month by month.
 */
import { ClockIcon } from "@phosphor-icons/react";
import * as React from "react";
import { cn, StatusChip } from "../../base";
import { parseDate } from "../../base/lib/utils";
import { type Amount, absAmount, toSen } from "../../lib/money";
import { formatPlain, surfaces } from "../../lib/shared";
import { BILL_STATUS, isBillStatus } from "../shared";
import type { PartyRole } from "./party-overview";
import { dayMonth, sentenceCase } from "./shared";

export type PartyEvent = {
	id: string;
	kind: "document" | "payment" | "bank";
	/** YYYY-MM-DD */
	date: string;
	title?: string | null;
	reference?: string | null;
	status?: string | null;
	dueDate?: string | null;
	overdue?: boolean;
	/** Positive raises the balance; payments are negative. */
	amount: Amount;
	currency?: string;
	/** Base-currency equivalent for a foreign event. */
	baseAmount?: Amount | null;
};

const EVENT_DOT: Record<PartyEvent["kind"], string> = {
	document: "var(--primary)",
	payment: "var(--status-green)",
	bank: "var(--status-neutral)",
};

/** cynco partyFormat formatMoney: "RM 1,234.00", foreign as "SGD 1,234.00", negatives with a minus. */
function partyMoney(amount: Amount, currency = "MYR"): string {
	const abs = formatPlain(absAmount(amount));
	const prefix = currency === "MYR" ? "RM" : currency;
	return `${toSen(amount) < 0n ? "−" : ""}${prefix} ${abs}`;
}

export type PartyTimelineProps = React.ComponentProps<"div"> & {
	events: PartyEvent[];
	party: PartyRole;
	currency?: string;
};

/** Day column on wide containers; on narrow ones the day joins the detail line. */
export function PartyTimeline({ events, party, currency = "MYR", className, ...props }: PartyTimelineProps) {
	const uid = React.useId();
	if (events.length === 0) {
		return (
			<div
				className={cn(
					"flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center",
					className,
				)}
				{...props}
			>
				<ClockIcon size={20} className="mb-2 text-subtle" aria-hidden="true" />
				<p className="text-sm font-medium text-foreground">No activity yet</p>
				<p className="mt-0.5 text-xs text-tertiary-foreground">
					{party === "vendor"
						? "Bills and payments for this vendor will appear here."
						: "Invoices and payments for this customer will appear here."}
				</p>
			</div>
		);
	}
	const byMonth = new Map<string, PartyEvent[]>();
	for (const e of events) {
		const k = e.date.slice(0, 7);
		byMonth.set(k, [...(byMonth.get(k) ?? []), e]);
	}
	const kindLabel = (e: PartyEvent) =>
		e.kind === "document"
			? party === "vendor"
				? "Bill"
				: "Invoice"
			: e.kind === "payment"
				? party === "vendor"
					? "Payment sent"
					: "Payment received"
				: "Bank line";
	const sectionId = (month: string) => `${uid}-${month}`;
	const statusText = (e: PartyEvent) =>
		!e.status || e.kind === "bank"
			? null
			: e.kind === "document" && party === "vendor"
				? isBillStatus(e.status)
					? BILL_STATUS[e.status].label
					: e.status
				: sentenceCase(e.status);

	return (
		<div className={cn("@container flex min-w-0 flex-col gap-5", className)} {...props}>
			{[...byMonth].map(([month, list]) => (
				<section key={month} aria-labelledby={sectionId(month)}>
					<h3 id={sectionId(month)} className="mb-2 text-xs font-medium text-tertiary-foreground">
						{parseDate(month).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
					</h3>
					<ul className={surfaces.surface}>
						{list.map((e) => {
							const kind = kindLabel(e);
							const detail = [
								e.reference,
								e.dueDate && e.kind === "document" && e.status !== "paid" ? `Due ${dayMonth(e.dueDate)}` : null,
								e.overdue ? null : statusText(e),
							]
								.filter(Boolean)
								.join(" · ");
							const cur = e.currency ?? currency;
							return (
								<li
									key={e.id}
									className="flex items-start gap-3 border-b border-table-row-divider px-3 py-2.5 last:border-b-0 hover:bg-table-row-hover @md:items-center"
								>
									<span className="hidden w-12 shrink-0 text-xs tabular-nums text-tertiary-foreground @md:block">
										{dayMonth(e.date)}
									</span>
									<span
										aria-hidden="true"
										className="mt-1.5 size-1.5 shrink-0 rounded-full @md:mt-0"
										style={{ background: EVENT_DOT[e.kind] }}
									/>
									<span className="min-w-0 flex-1">
										<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<span className="line-clamp-2 min-w-0 break-words text-sm text-foreground @md:line-clamp-1">
												<span className="font-medium">{kind}</span>
												{e.title && !e.title.startsWith(kind) && <span className="text-muted-foreground"> · {e.title}</span>}
											</span>
											{e.overdue && (
												<StatusChip tone="red" glyph="alert" className="shrink-0">
													Overdue
												</StatusChip>
											)}
										</span>
										<span className="block truncate text-xs text-tertiary-foreground">
											<span className="tabular-nums @md:hidden">
												{dayMonth(e.date)}
												{detail && " · "}
											</span>
											{detail}
										</span>
									</span>
									<span className="shrink-0 text-right tabular-nums">
										<span
											className={cn(
												"block whitespace-nowrap text-sm font-medium",
												toSen(e.amount) < 0n ? "text-muted-foreground" : "text-foreground",
											)}
										>
											{partyMoney(e.amount, cur)}
										</span>
										{cur !== currency && (
											<span className="block whitespace-nowrap text-2xs text-tertiary-foreground">
												{e.baseAmount == null ? "No rate" : `≈ ${partyMoney(e.baseAmount, currency)}`}
											</span>
										)}
									</span>
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}
