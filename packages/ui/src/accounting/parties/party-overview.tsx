"use client";

/**
 * Cynco UI — the top of a customer or vendor page: who they are, what they owe
 * and the tabs under it.
 */
import { CaretRightIcon, FileTextIcon, PlusIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn, IconButton, StatusChip, Tabs, TabsList, TabsTrigger, useControllableState } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { ActionBar, formatCurrency, ScrollRow, StatGrid, StatTile } from "../../lib/shared";
import { FactStrip, monthYear, PartyInitials } from "./shared";

export type PartyRole = "customer" | "vendor";

export type PartyTab = "activity" | "ledger" | "details";

export type PartyOverviewHeaderProps = React.ComponentProps<"div"> & {
	party: PartyRole;
	name: string;
	isActive?: boolean;
	/** Subledger balance: positive = they owe you (customer) / you owe them (vendor). */
	balance: Amount;
	overdue: Amount;
	/** YYYY-MM-DD of the oldest overdue item. */
	overdueSince?: string | null;
	openCount: number;
	/** Billed (customer) or spend (vendor), trailing 12 months. */
	trendTotal: Amount;
	paymentTerms?: string | null;
	category?: string | null;
	/** YYYY-MM-DD the party was created. */
	since?: string | null;
	currency?: string;
	/** Controlled tab. */
	tab?: PartyTab;
	/** Initial tab for uncontrolled use. */
	defaultTab?: PartyTab;
	onTabChange?: (tab: PartyTab) => void;
	/** Called from the Statement button; omit to hide it. */
	onStatement?: () => void;
	/** Called from New invoice (customer) or New bill (vendor); omit to hide it. */
	onCreate?: () => void;
};

export function PartyOverviewHeader({
	party,
	name,
	isActive = true,
	balance,
	overdue,
	overdueSince,
	openCount,
	trendTotal,
	paymentTerms,
	category,
	since,
	currency = "MYR",
	tab: tabProp,
	defaultTab = "activity",
	onTabChange,
	onStatement,
	onCreate,
	className,
	...props
}: PartyOverviewHeaderProps) {
	const isVendor = party === "vendor";
	const [tab = defaultTab, setTab] = useControllableState({
		prop: tabProp,
		defaultProp: defaultTab,
		onChange: onTabChange,
	});
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-4", className)} {...props}>
			<div className="min-w-0">
				<nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1 text-xs text-tertiary-foreground">
					<span>{isVendor ? "Vendors" : "Customers"}</span>
					<CaretRightIcon size={10} aria-hidden="true" />
				</nav>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2.5">
						<PartyInitials name={name} size="sm" />
						<h1 className="min-w-0 truncate text-lg font-semibold text-foreground">{name}</h1>
						{!isActive && (
							<StatusChip tone="neutral" glyph="minus" className="shrink-0">
								Inactive
							</StatusChip>
						)}
					</div>
					<ActionBar>
						{onStatement && (
							<IconButton variant="secondary" icon={<FileTextIcon size={14} />} onClick={onStatement}>
								Statement
							</IconButton>
						)}
						{onCreate && (
							<IconButton variant="primary" icon={<PlusIcon size={14} weight="bold" />} onClick={onCreate}>
								{isVendor ? "New bill" : "New invoice"}
							</IconButton>
						)}
					</ActionBar>
				</div>
			</div>
			<StatGrid aria-label={isVendor ? "Vendor position" : "Customer position"} className="@3xl:grid-cols-4">
				<StatTile label={isVendor ? "You owe them" : "They owe you"} value={formatCurrency(balance, currency)} />
				<StatTile
					label="Overdue"
					value={formatCurrency(overdue, currency)}
					negative={toSen(overdue) > 0n}
					sub={
						toSen(overdue) > 0n && overdueSince ? (
							<StatusChip tone="red" glyph="clock">
								{`since ${monthYear(overdueSince)}`}
							</StatusChip>
						) : undefined
					}
				/>
				<StatTile label={isVendor ? "Open bills" : "Open invoices"} value={openCount} />
				<StatTile
					label={isVendor ? "Spend, 12 months" : "Billed, 12 months"}
					value={formatCurrency(trendTotal, currency)}
				/>
			</StatGrid>
			<div className="flex flex-col gap-x-6 gap-y-2 border-b border-border @2xl:flex-row @2xl:items-center @2xl:justify-between">
				<ScrollRow>
					<Tabs
						value={tab}
						onValueChange={(v: unknown) => {
							if (v === "activity" || v === "ledger" || v === "details") setTab(v);
						}}
					>
						<TabsList variant="underline" className="border-b-0">
							<TabsTrigger variant="underline" value="activity">
								Activity
							</TabsTrigger>
							<TabsTrigger variant="underline" value="ledger">
								Ledger
							</TabsTrigger>
							<TabsTrigger variant="underline" value="details">
								Details
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</ScrollRow>
				<FactStrip
					className="pb-2 text-xs"
					facts={[
						["Terms", paymentTerms],
						["Category", category],
						[isVendor ? "Vendor since" : "Customer since", since ? monthYear(since) : null],
					]}
				/>
			</div>
		</div>
	);
}
