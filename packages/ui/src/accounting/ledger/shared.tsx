"use client";

import { PlusIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — helpers two or more ledger files need. Internal to this folder:
 * nothing here is re-exported from the barrel.
 */
import * as React from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	cn,
	type StatusTone,
} from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { ToneDot } from "../../lib/shared";

/** cynco coa-helpers getTypeColor / getCategoryDotColor → a status tone. */
export const ACCOUNT_TYPE_TONE: Record<string, StatusTone> = {
	asset: "blue",
	contra_asset: "blue",
	liability: "amber",
	contra_liability: "amber",
	equity: "purple",
	contra_equity: "purple",
	revenue: "green",
	contra_revenue: "green",
	other_income: "green",
	expense: "red",
	contra_expense: "red",
	cost_of_sales: "red",
	operating_expense: "red",
	other_expense: "red",
};

export function typeLabel(type: string) {
	const s = type.replaceAll("_", " ");
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The account type's category dot. */
export function TypeDot({ type, className }: { type: string; className?: string }) {
	return <ToneDot tone={ACCOUNT_TYPE_TONE[type] ?? "neutral"} title={typeLabel(type)} className={className} />;
}

export const isPositive = (v: Amount | null | undefined) => toSen(v) > 0n;

/** "October 2026" from "2026-10" (periods/format formatPeriodLabel). */
export function periodLabel(period: string) {
	const [y, m] = period.split("-").map(Number);
	return new Date(y ?? 2026, (m ?? 1) - 1, 1).toLocaleDateString("en-MY", { month: "long", year: "numeric" });
}

export type LedgerPickerAccount = {
	id: string;
	accountCode: string;
	accountName: string;
	accountType: string;
	normalBalance: "debit" | "credit";
};

const PICKER_GROUPS: { label: string; types: string[] }[] = [
	{ label: "Assets", types: ["asset", "contra_asset"] },
	{ label: "Liabilities", types: ["liability", "contra_liability"] },
	{ label: "Equity", types: ["equity", "contra_equity"] },
	{ label: "Revenue", types: ["revenue", "contra_revenue", "other_income"] },
	{ label: "Expenses", types: ["expense", "contra_expense", "cost_of_sales", "operating_expense", "other_expense"] },
];

/** The popup follows the trigger's width, never narrower than 18rem nor wider than the viewport, and never taller than the room left on screen. */
export const PICKER_POPUP =
	"flex max-h-(--available-height) w-(--anchor-width) min-w-72 max-w-[calc(100vw-2rem)] flex-col p-0";

function AccountOption({ a, selected }: { a: LedgerPickerAccount; selected?: boolean }) {
	return (
		<span className="flex w-full min-w-0 items-center gap-2">
			<span className="w-14 shrink-0 font-mono text-2xs font-medium text-tertiary-foreground">{a.accountCode}</span>
			<span className={cn("min-w-0 flex-1 truncate text-sm", selected ? "text-foreground" : "text-muted-foreground")}>
				{a.accountName}
			</span>
			{a.accountType.startsWith("contra") && <span className="shrink-0 text-2xs text-tertiary-foreground">Contra</span>}
			<span className="w-5 shrink-0 text-right text-2xs text-tertiary-foreground">
				{a.normalBalance === "debit" ? "DR" : "CR"}
			</span>
		</span>
	);
}

/** The searchable list inside the picker: recent first, then one group per account type. */
export function AccountPickerList({
	accounts,
	recentIds = [],
	selectedId,
	onSelect,
	onCreate,
}: {
	accounts: LedgerPickerAccount[];
	recentIds?: string[];
	selectedId?: string;
	onSelect: (a: LedgerPickerAccount) => void;
	onCreate?: (query: string) => void;
}) {
	const [query, setQuery] = React.useState("");
	const recent = recentIds.map((id) => accounts.find((a) => a.id === id)).filter((a): a is LedgerPickerAccount => !!a);
	return (
		<Command className="min-h-0 rounded-lg">
			<CommandInput placeholder="Search by code or name..." value={query} onValueChange={setQuery} />
			<CommandList className="max-h-64 min-h-0">
				<CommandEmpty>No accounts found.</CommandEmpty>
				{recent.length > 0 && !query && (
					<CommandGroup heading="Recent">
						{recent.map((a) => (
							<CommandItem key={`r-${a.id}`} value={`recent ${a.accountCode} ${a.accountName}`} onSelect={() => onSelect(a)}>
								<AccountOption a={a} selected={a.id === selectedId} />
							</CommandItem>
						))}
					</CommandGroup>
				)}
				{PICKER_GROUPS.map((g) => {
					const items = accounts.filter((a) => g.types.includes(a.accountType));
					if (!items.length) return null;
					return (
						<CommandGroup
							key={g.label}
							heading={
								<span className="flex items-center gap-1.5">
									<TypeDot type={g.types[0]!} />
									{g.label}
								</span>
							}
						>
							{items.map((a) => (
								<CommandItem key={a.id} value={`${a.accountCode} ${a.accountName}`} onSelect={() => onSelect(a)}>
									<AccountOption a={a} selected={a.id === selectedId} />
								</CommandItem>
							))}
						</CommandGroup>
					);
				})}
			</CommandList>
			<CommandSeparator />
			{/* Pinned below the scrolling list, so it needs its own listbox for the option role to be valid. */}
			<div className="p-1" role="listbox" aria-label="Account actions">
				<CommandItem value="__create_new__" forceMount onSelect={() => onCreate?.(query.trim())}>
					<PlusIcon size={14} className="text-tertiary-foreground" aria-hidden="true" />
					<span className="text-sm">{query.trim() ? `Create “${query.trim()}”` : "Create new account"}</span>
				</CommandItem>
			</div>
		</Command>
	);
}

export function PickerTriggerLabel({
	account,
	placeholder = "Select account...",
	id,
}: {
	account?: LedgerPickerAccount | null;
	placeholder?: string;
	id?: string;
}) {
	if (!account)
		return (
			<span id={id} className="truncate text-tertiary-foreground">
				{placeholder}
			</span>
		);
	return (
		<span id={id} className="flex min-w-0 items-center gap-1.5 overflow-hidden">
			<span className="shrink-0 font-mono text-2xs font-medium text-tertiary-foreground">{account.accountCode}</span>
			<span className="min-w-0 truncate text-foreground">{account.accountName}</span>
		</span>
	);
}
