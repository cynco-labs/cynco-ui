"use client";

import { CheckCircleIcon, NotePencilIcon, PaperPlaneTiltIcon, XCircleIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — the quotations board: one card, one column of them, and the KPI row above.
 */
import * as React from "react";
import { cn } from "../../base";
import { parseDate } from "../../base/lib/utils";
import { type Amount, sumAmounts } from "../../lib/money";
import { DocStatus, formatCurrency, formatRelativeTime, StatGrid, StatTile, type StatusEntry } from "../../lib/shared";
import type { BoardColumnDef } from "../shared";

/** cynco QUOTATION_STATUS (components/quotations/quotationStatusConfig.ts). */
const QUOTATION_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral" },
	sent: { label: "Sent", variant: "info" },
	viewed: { label: "Viewed", variant: "neutral" },
	accepted: { label: "Accepted", variant: "success" },
	rejected: { label: "Rejected", variant: "error" },
	expired: { label: "Expired", variant: "warning" },
	converted: { label: "Converted", variant: "info", glyph: "refresh" },
};

export type SalesQuotation = {
	id: string;
	quotationNumber?: string | null;
	customerName: string;
	totalAmount: Amount;
	currency?: string;
	status: string;
	createdAt: string;
};

/** One quotation on the Kanban board (cynco QuotationBoardCard). */
export function QuotationBoardCard({
	quotation,
	now,
	onRowClick,
	className,
	...props
}: Omit<React.ComponentProps<"button">, "type"> & {
	quotation: SalesQuotation;
	now?: string;
	onRowClick?: (quotation: SalesQuotation) => void;
}) {
	return (
		// Raw button: the whole card is the click target; it keeps a focus ring and its text is the name.
		<button
			type="button"
			onClick={() => onRowClick?.(quotation)}
			className={cn(
				"@container w-full min-w-0 cursor-pointer rounded-xl border bg-card p-3 text-left shadow-sm outline-none transition-colors hover:bg-interactive-secondary-hover focus-ring",
				className,
			)}
			{...props}
		>
			<div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
				<div className="min-w-0 flex-[1_1_5rem]">
					<p className="truncate text-sm text-foreground" title={quotation.customerName}>
						{quotation.customerName || "—"}
					</p>
					<p className="mt-0.5 font-mono text-2xs font-medium text-tertiary-foreground">
						{quotation.quotationNumber || "—"}
					</p>
				</div>
				<DocStatus status={quotation.status} config={QUOTATION_STATUS} />
			</div>
			<div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2">
				<span className="whitespace-nowrap text-sm tabular-nums text-foreground">
					{formatCurrency(quotation.totalAmount ?? 0, quotation.currency || "MYR")}
				</span>
				<span className="text-2xs text-subtle">
					{formatRelativeTime(quotation.createdAt, { now: now ? parseDate(now) : undefined })}
				</span>
			</div>
		</button>
	);
}

export type QuotationBoardColumnKey = "draft" | "active" | "accepted" | "terminal";

const QUOTATION_BOARD_COLUMNS = [
	{ key: "draft", label: "Draft", Icon: NotePencilIcon, empty: "No drafts" },
	{ key: "active", label: "Sent / Viewed", Icon: PaperPlaneTiltIcon, empty: "No active quotations" },
	{ key: "accepted", label: "Accepted", Icon: CheckCircleIcon, empty: "No accepted quotations" },
	{ key: "terminal", label: "Rejected / Expired", Icon: XCircleIcon, empty: "No rejected or expired quotations" },
] as const satisfies readonly BoardColumnDef<QuotationBoardColumnKey>[];

/** A Kanban column of the quotations board (cynco QuotationsBoardView column): header count, cards, column total. */
export function QuotationBoardColumn({
	column,
	quotations,
	currency = "MYR",
	now,
	onRowClick,
	className,
	...props
}: React.ComponentProps<"section"> & {
	column: QuotationBoardColumnKey;
	quotations: SalesQuotation[];
	currency?: string;
	now?: string;
	onRowClick?: (quotation: SalesQuotation) => void;
}) {
	const [focusId, setFocusId] = React.useState<string | undefined>(undefined);
	const listRef = React.useRef<HTMLDivElement>(null);
	const def = QUOTATION_BOARD_COLUMNS.find((c) => c.key === column);
	const ids = quotations.map((q) => q.id);
	// Exactly one card is tabbable: the last one focused, else the first.
	const tabId = focusId !== undefined && ids.includes(focusId) ? focusId : ids[0];
	const focusCard = (id: string) => {
		setFocusId(id);
		listRef.current?.querySelector<HTMLElement>(`[data-quotation-id="${CSS.escape(id)}"]`)?.focus();
	};
	/** APG listbox keys: Up/Down/Home/End move; the card itself is a button, so Enter and Space open it. */
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const id = (e.target as HTMLElement).dataset.quotationId;
		const i = id === undefined ? -1 : ids.indexOf(id);
		if (i < 0) return;
		let next: string | undefined;
		switch (e.key) {
			case "ArrowDown":
				next = ids[i + 1];
				break;
			case "ArrowUp":
				next = ids[i - 1];
				break;
			case "Home":
				next = ids[0];
				break;
			case "End":
				next = ids[ids.length - 1];
				break;
			default:
				return;
		}
		e.preventDefault();
		if (next) focusCard(next);
	};
	if (!def) return null;
	const total = sumAmounts(quotations.map((q) => q.totalAmount));
	return (
		<section aria-label={def.label} className={cn("flex min-w-0 flex-1 flex-col", className)} {...props}>
			<div className="mb-2 flex items-center gap-2 px-1">
				<def.Icon size={15} aria-hidden="true" className="shrink-0 text-tertiary-foreground" />
				<span className="truncate text-sm text-foreground">{def.label}</span>
				<span className="rounded-md bg-muted px-1.5 text-2xs tabular-nums text-tertiary-foreground">
					{quotations.length}
				</span>
			</div>
			<div className="flex flex-1 flex-col rounded-xl border border-table-tray-border bg-table-tray">
				{quotations.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
						<def.Icon size={28} aria-hidden="true" className="mb-2 text-subtle opacity-50" />
						<p className="text-2xs text-tertiary-foreground">{def.empty}</p>
					</div>
				) : (
					<>
						<div
							ref={listRef}
							role="listbox"
							aria-label={def.label}
							onKeyDown={onKeyDown}
							className="flex flex-col gap-1.5 p-1.5"
						>
							{quotations.map((q) => (
								<QuotationBoardCard
									key={q.id}
									quotation={q}
									now={now}
									onRowClick={onRowClick}
									role="option"
									aria-selected={false}
									data-quotation-id={q.id}
									tabIndex={tabId === q.id ? 0 : -1}
									onFocus={() => setFocusId(q.id)}
								/>
							))}
						</div>
						<div className="flex flex-wrap items-center justify-between gap-x-2 px-3 py-2">
							<span className="text-2xs text-tertiary-foreground">Total</span>
							<span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
								{formatCurrency(total, currency)}
							</span>
						</div>
					</>
				)}
			</div>
		</section>
	);
}

/* ----------------------------------------------------------- QuotationStats */

/** Quotation KPI row (cynco QuotationStats): Total quoted, Sent, Accepted, Conversion rate. */
export function QuotationStats({
	stats,
	className,
	...props
}: React.ComponentProps<"div"> & {
	stats: {
		totalQuotedAmount: Amount;
		currency?: string;
		sentCount: number;
		acceptedCount: number;
		conversionRate: number;
	};
}) {
	return (
		<StatGrid aria-label="Quotation statistics" min="sm" className={className} {...props}>
			<StatTile
				label="Total quoted"
				value={formatCurrency(stats.totalQuotedAmount || 0, stats.currency || "MYR")}
				className="shadow-sm"
			/>
			<StatTile label="Sent" value={String(stats.sentCount || 0)} dot="var(--chart-series-4)" className="shadow-sm" />
			<StatTile
				label="Accepted"
				value={String(stats.acceptedCount || 0)}
				dot="var(--chart-series-3)"
				className="shadow-sm"
			/>
			<StatTile
				label="Conversion rate"
				value={`${(stats.conversionRate || 0).toFixed(1)}%`}
				dot="var(--primary)"
				className="shadow-sm"
			/>
		</StatGrid>
	);
}
