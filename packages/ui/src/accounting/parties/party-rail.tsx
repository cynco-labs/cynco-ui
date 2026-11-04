"use client";

/**
 * Cynco UI — the facts rail of a party page: credit, position, aging, the
 * 12-month trend and the contacts list.
 */
import { EnvelopeIcon, PencilSimpleIcon, PhoneIcon, PlusIcon, StarIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Bar, BarChart, XAxis } from "recharts";
import { Button, ChartContainer, ChartTooltip, ChartTooltipContent, cn, IconButton, StatusChip } from "../../base";
import { parseDate } from "../../base/lib/utils";
import { type Amount, absAmount, subtractAmounts, sumAmounts, toSen } from "../../lib/money";
import { formatCurrency, KeyValueList, surfaces } from "../../lib/shared";
import type { PartyRole } from "./party-overview";
import { monthYear } from "./shared";

/** Aging buckets; tones are status colours (a chart, so var() fills). */
const AGING_BUCKETS = [
	{ key: "current", label: "Not yet due", tone: "var(--status-neutral)" },
	{ key: "days1to30", label: "1–30 days late", tone: "var(--status-amber)" },
	{ key: "days31to60", label: "31–60 days late", tone: "var(--status-orange)" },
	{ key: "days61plus", label: "61+ days late", tone: "var(--status-red)" },
] as const;

const CONTACT_LINK = "min-h-6 rounded-sm outline-none hover:text-foreground hover:underline focus-ring";
const RAIL_ACTION = "inline-flex min-h-6 items-center rounded-sm outline-none hover:underline focus-ring";

/** Rail card (cynco PartyRail RailCard): small muted title, optional trailing chip. */
function RailCard({
	title,
	trailing,
	children,
}: {
	title: string;
	trailing?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className={cn("min-w-0 p-3.5 shadow-sm", surfaces.card)}>
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
				<h3 className="text-xs font-medium text-tertiary-foreground">{title}</h3>
				{trailing}
			</div>
			{children}
		</section>
	);
}

export type PartyAging = { current: Amount; days1to30: Amount; days31to60: Amount; days61plus: Amount };
export type PartyContact = {
	id: string;
	name: string;
	role?: string | null;
	jobTitle?: string | null;
	email?: string | null;
	phone?: string | null;
	isPrimary?: boolean;
};

export type PartyRailProps = React.ComponentProps<"aside"> & {
	party: PartyRole;
	currency?: string;
	/** Subledger balance (ground truth). */
	ledgerBalance: Amount;
	/** Sum of open bills / invoices — ties out against the ledger. */
	openItemsTotal: Amount;
	aging: PartyAging;
	/** Last 12 months: { month: "2026-10", total }. */
	trend?: Array<{ month: string; total: Amount }>;
	/** Unused credit notes per currency (customers only). */
	credits?: Array<{ currency: string; amount: Amount; count: number }>;
	/** Where "View credit notes" goes; renders it as a real link. */
	creditNotesHref?: string;
	/** In-app handler for "View credit notes" when there is no URL; renders it as a button. Without either, the action is hidden. */
	onViewCreditNotes?: () => void;
	contacts?: PartyContact[];
	/** Called from a contact's star button; omit to hide it. */
	onSetPrimaryContact?: (contact: PartyContact) => void;
	/** Called from a contact's edit button; omit to hide it. */
	onEditContact?: (contact: PartyContact) => void;
	/** Called from "Add contact"; omit to hide it. */
	onAddContact?: () => void;
};

/** One column as a rail; two (then three) columns when its container is wide. */
export function PartyRail({
	party,
	currency = "MYR",
	ledgerBalance,
	openItemsTotal,
	aging,
	trend,
	credits,
	creditNotesHref,
	onViewCreditNotes,
	contacts,
	onSetPrimaryContact,
	onEditContact,
	onAddContact,
	className,
	...props
}: PartyRailProps) {
	const isVendor = party === "vendor";
	const tiesOut = toSen(ledgerBalance) === toSen(openItemsTotal);
	const agingTotalSen = AGING_BUCKETS.reduce((s, b) => s + toSen(aging[b.key]), 0n);
	const trendTotal = sumAmounts((trend ?? []).map((m) => m.total));
	const trendLabel = isVendor ? "Spend, 12 months" : "Billed, 12 months";
	const chartData = (trend ?? []).map((m) => ({
		m: parseDate(m.month).toLocaleDateString("en-GB", { month: "short" }),
		v: Number(m.total),
	}));

	return (
		<aside className={cn("@container min-w-0", className)} {...props}>
			<div className="grid items-start gap-3 @xl:grid-cols-2 @5xl:grid-cols-3">
				{!isVendor && credits && (
					<RailCard title="Available credit">
						{credits.length === 0 ? (
							<p className="text-sm text-muted-foreground">No unused credit.</p>
						) : (
							<KeyValueList
								className="divide-y-0"
								items={credits.map((c) => ({
									label: `${c.count} credit ${c.count === 1 ? "note" : "notes"}`,
									value: formatCurrency(c.amount, c.currency),
									strong: false,
								}))}
							/>
						)}
						{creditNotesHref ? (
							<a href={creditNotesHref} className={cn("mt-1 w-fit text-xs text-primary", RAIL_ACTION)}>
								View credit notes
							</a>
						) : onViewCreditNotes ? (
							<button
								type="button"
								onClick={onViewCreditNotes}
								className={cn("mt-1 w-fit cursor-pointer text-xs text-primary", RAIL_ACTION)}
							>
								View credit notes
							</button>
						) : null}
					</RailCard>
				)}

				<RailCard
					title="Position"
					trailing={
						tiesOut ? (
							<StatusChip tone="green" glyph="check">
								Books tie
							</StatusChip>
						) : (
							<StatusChip tone="amber" glyph="alert">
								Needs review
							</StatusChip>
						)
					}
				>
					<KeyValueList
						className="divide-y-0"
						items={[
							{ label: "Ledger balance", value: formatCurrency(ledgerBalance, currency) },
							{ label: isVendor ? "Open bills" : "Open invoices", value: formatCurrency(openItemsTotal, currency) },
						]}
					/>
					{!tiesOut && (
						<p className={cn("mt-1 text-xs", surfaces.negative)}>
							Ledger and documents differ by{" "}
							{formatCurrency(absAmount(subtractAmounts(ledgerBalance, openItemsTotal)), currency)}.
						</p>
					)}
				</RailCard>

				<RailCard title="Aging">
					{agingTotalSen <= 0n ? (
						<p className="py-1 text-sm text-muted-foreground">Nothing open.</p>
					) : (
						<>
							<div aria-hidden="true" className="mb-1.5 flex h-1.5 gap-px overflow-hidden rounded-full bg-muted">
								{AGING_BUCKETS.map((b) =>
									toSen(aging[b.key]) > 0n ? (
										<span key={b.key} style={{ width: `${(toSen(aging[b.key]) * 100n) / agingTotalSen}%`, background: b.tone }} />
									) : null,
								)}
							</div>
							<KeyValueList
								className="divide-y-0"
								items={AGING_BUCKETS.map((b) => ({
									label: (
										<span className="inline-flex items-center gap-2">
											<span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: b.tone }} />
											{b.label}
										</span>
									),
									value: (
										<span className={cn(toSen(aging[b.key]) > 0n ? "font-medium" : "text-tertiary-foreground")}>
											{formatCurrency(aging[b.key], currency)}
										</span>
									),
								}))}
							/>
						</>
					)}
				</RailCard>

				{trend && (
					<RailCard
						title={trendLabel}
						trailing={
							<span className="text-xs tabular-nums text-muted-foreground">{formatCurrency(trendTotal, currency)}</span>
						}
					>
						{toSen(trendTotal) > 0n ? (
							<>
								<ChartContainer
									config={{ v: { label: trendLabel, color: "var(--chart-series-1)" } }}
									className="aspect-auto h-16 w-full"
								>
									<BarChart
										data={chartData}
										margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
										title={`${trendLabel} by month`}
										desc="Use the arrow keys to step through months. The same figures follow as a table."
									>
										<XAxis dataKey="m" hide />
										<ChartTooltip
											cursor={false}
											content={
												<ChartTooltipContent
													hideIndicator
													formatter={(v) => formatCurrency(typeof v === "number" || typeof v === "string" ? v : 0, currency)}
												/>
											}
										/>
										<Bar dataKey="v" fill="var(--color-v)" radius={2} />
									</BarChart>
								</ChartContainer>
								<table className="sr-only">
									<caption>{trendLabel} by month</caption>
									<tbody>
										{(trend ?? []).map((m) => (
											<tr key={m.month}>
												<th scope="row">{monthYear(`${m.month}-01`)}</th>
												<td>{formatCurrency(m.total, currency)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</>
						) : (
							<p className="py-1 text-sm text-muted-foreground">
								{isVendor ? "No bills in the last 12 months." : "No invoices in the last 12 months."}
							</p>
						)}
					</RailCard>
				)}

				{contacts && (
					<RailCard
						title="Contacts"
						trailing={
							onAddContact && (
								<IconButton
									variant="skeleton"
									size="sm"
									icon={<PlusIcon size={12} weight="bold" />}
									className="-my-1 text-tertiary-foreground"
									onClick={onAddContact}
								>
									Add contact
								</IconButton>
							)
						}
					>
						{contacts.length === 0 ? (
							<p className="py-1 text-sm text-muted-foreground">No contacts</p>
						) : (
							<ul className="-mx-1 flex flex-col">
								{contacts.map((c) => (
									<li
										key={c.id}
										className="group flex items-start justify-between gap-2 rounded-lg px-1 py-1.5 hover:bg-table-row-hover"
									>
										<div className="min-w-0 flex-1">
											<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
												<span className="min-w-0 truncate text-sm font-medium text-foreground">{c.name}</span>
												{c.isPrimary && (
													<StatusChip tone="blue" glyph="user" className="shrink-0">
														Primary
													</StatusChip>
												)}
												{c.role && <span className="shrink-0 text-2xs capitalize text-tertiary-foreground">{c.role}</span>}
											</div>
											<div className="mt-0.5 flex min-w-0 flex-col gap-0.5 text-xs text-tertiary-foreground">
												{c.email && (
													<a href={`mailto:${c.email}`} className={cn("flex min-w-0 items-center gap-1", CONTACT_LINK)}>
														<EnvelopeIcon size={12} className="shrink-0" aria-hidden="true" />
														<span className="truncate">{c.email}</span>
													</a>
												)}
												{c.phone && (
													<a
														href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
														className={cn("flex w-fit items-center gap-1 tabular-nums", CONTACT_LINK)}
													>
														<PhoneIcon size={12} className="shrink-0" aria-hidden="true" />
														{c.phone}
													</a>
												)}
											</div>
										</div>
										<div className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 no-hover:opacity-100">
											{!c.isPrimary && onSetPrimaryContact && (
												<Button
													variant="skeleton"
													size="icon"
													aria-label={`Set ${c.name} as primary`}
													onClick={() => onSetPrimaryContact(c)}
												>
													<StarIcon size={13} aria-hidden="true" />
												</Button>
											)}
											{onEditContact && (
												<Button
													variant="skeleton"
													size="icon"
													aria-label={`Edit contact ${c.name}`}
													onClick={() => onEditContact(c)}
												>
													<PencilSimpleIcon size={13} aria-hidden="true" />
												</Button>
											)}
										</div>
									</li>
								))}
							</ul>
						)}
					</RailCard>
				)}
			</div>
		</aside>
	);
}
