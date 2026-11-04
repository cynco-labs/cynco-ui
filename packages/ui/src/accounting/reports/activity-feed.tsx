"use client";

import { ArrowDownLeftIcon, ArrowRightIcon, ArrowUpRightIcon, InvoiceIcon, ReceiptIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn, StatusChip, type StatusGlyph, type StatusTone } from "../../base";
import { type Amount, absAmount } from "../../lib/money";
import { formatCurrency, formatRelativeTime, SectionPanel } from "../../lib/shared";
import { RowLink } from "./shared";

export interface ActivityItem {
	id: string;
	kind: "invoice" | "payment" | "bill";
	direction: "in" | "out" | "neutral";
	/** Counterparty. */
	title: string;
	/** Reference number or note. */
	subtitle?: string | null;
	amount: Amount | null;
	currency?: string;
	status: string;
	/** ISO timestamp. */
	date: string;
	href?: string;
}

/** Kind tiles: a soft tint of a chart-series token with a same-hue glyph. Literal strings for Tailwind. */
const KIND_TILE = {
	invoice:
		"bg-[color-mix(in_oklab,var(--chart-series-1)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-1)_82%,var(--foreground))]",
	bill:
		"bg-[color-mix(in_oklab,var(--chart-series-4)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-4)_82%,var(--foreground))]",
	out: "bg-[color-mix(in_oklab,var(--chart-series-5)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-5)_82%,var(--foreground))]",
	in: "bg-[color-mix(in_oklab,var(--chart-series-3)_14%,var(--card))] text-[color-mix(in_oklab,var(--chart-series-3)_82%,var(--foreground))]",
} as const;

/** What the kind tile's glyph says, for screen readers. */
const KIND_NAME = { invoice: "Invoice", bill: "Bill", out: "Payment out", in: "Payment in" } as const;

function activityVisual(item: ActivityItem) {
	if (item.kind === "invoice") return { Icon: InvoiceIcon, tile: KIND_TILE.invoice };
	if (item.kind === "bill") return { Icon: ReceiptIcon, tile: KIND_TILE.bill };
	return item.direction === "out"
		? { Icon: ArrowUpRightIcon, tile: KIND_TILE.out }
		: { Icon: ArrowDownLeftIcon, tile: KIND_TILE.in };
}

function activityStatus(status: string): { tone: StatusTone; glyph: StatusGlyph } {
	const s = status.toLowerCase();
	if (["paid", "succeeded", "completed", "reconciled"].includes(s)) return { tone: "green", glyph: "check" };
	if (["overdue", "failed", "void", "voided"].includes(s)) return { tone: "red", glyph: "x" };
	if (["pending", "processing", "partially_paid"].includes(s)) return { tone: "amber", glyph: "clock" };
	return { tone: "neutral", glyph: "minus" };
}

/**
 * The unified business feed (cynco dashboard/overview/RecentActivityPanel):
 * invoices raised, payments moved and bills entered, newest first. The status
 * chip moves under the counterparty below 28rem of container width.
 */
export function RecentActivityFeed({
	items,
	now,
	viewAllHref,
	className,
	...props
}: React.ComponentProps<"section"> & { items: ActivityItem[] | null; now?: string | number; viewAllHref?: string }) {
	const clock = now != null ? new Date(now).getTime() : Date.now();
	return (
		<SectionPanel
			flush
			aria-label="Recent activity"
			className={className}
			{...props}
			title="Recent activity"
			actions={
				viewAllHref && (
					<a
						href={viewAllHref}
						className="inline-flex items-center gap-1 rounded-md text-2xs font-medium text-tertiary-foreground outline-none hover:text-foreground focus-ring"
					>
						View all
						<ArrowRightIcon size={12} aria-hidden="true" />
					</a>
				)
			}
		>
			<div className="border-t p-1.5">
				{items === null ? (
					<p className="px-3 py-8 text-center text-2xs text-tertiary-foreground">Couldn&apos;t load activity right now</p>
				) : items.length === 0 ? (
					<div className="px-3 py-8 text-center">
						<p className="text-sm font-semibold text-foreground">Nothing yet</p>
						<p className="mt-0.5 text-2xs text-tertiary-foreground">Raise an invoice or record a payment to get going</p>
					</div>
				) : (
					items.map((item) => {
						const { Icon, tile } = activityVisual(item);
						const st = activityStatus(item.status);
						const label = item.status.replace(/_/g, " ");
						const sign = item.direction === "out" ? "−" : "+";
						const chip = (
							<StatusChip tone={st.tone} glyph={st.glyph}>
								{label.charAt(0).toUpperCase() + label.slice(1)}
							</StatusChip>
						);
						return (
							<RowLink key={item.id} href={item.href} className="items-start rounded-lg px-2.5 py-2 @md:items-center">
								<span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tile)}>
									<Icon size={16} weight="bold" aria-hidden="true" />
								</span>
								<span className="sr-only">
									{KIND_NAME[item.kind === "payment" ? (item.direction === "out" ? "out" : "in") : item.kind]}:
								</span>
								<span className="min-w-0 flex-1">
									<span className="block text-sm text-foreground @md:truncate">{item.title}</span>
									{item.subtitle && (
										<span className="block font-mono text-2xs font-medium text-tertiary-foreground [overflow-wrap:anywhere] @md:truncate">
											{item.subtitle}
										</span>
									)}
									<span className="mt-1 flex @md:hidden">{chip}</span>
								</span>
								<span className="hidden shrink-0 justify-end @md:flex">{chip}</span>
								<span className="shrink-0 text-right @md:min-w-32">
									<span
										className={cn(
											"block text-sm font-semibold tabular-nums whitespace-nowrap",
											item.amount ? "text-foreground" : "text-tertiary-foreground",
										)}
									>
										{item.amount ? `${sign}${formatCurrency(absAmount(item.amount), item.currency ?? "MYR")}` : "—"}
									</span>
									<span className="block text-2xs text-tertiary-foreground">
										{formatRelativeTime(item.date, { now: clock, maxUnit: "day" })}
									</span>
								</span>
							</RowLink>
						);
					})
				)}
			</div>
		</SectionPanel>
	);
}
