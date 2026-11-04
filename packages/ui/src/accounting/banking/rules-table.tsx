"use client";

/**
 * Cynco UI — the categorisation rules: what each one matches, where it posts,
 * who wrote it, and how often it is overridden.
 */
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	Button,
	cn,
	GroupedTabButton,
	Input,
	StatusChip,
	type StatusGlyph,
	type StatusTone,
	ToolbarButton,
	useControllableState,
} from "../../base";
import { ActionBar, type DataColumn, DataList } from "../../lib/shared";
import { countOf, type With } from "./shared";

export type BankRuleRow = {
	id: string;
	matchType: "payee" | "contains" | "not_contains" | "regex" | string;
	pattern: string;
	account?: { code: string; name: string } | null;
	category?: string | null;
	priority: number;
	source: "user_created" | "ai_learned" | "system_default";
	isActive: boolean;
	timesApplied: number;
	timesOverridden: number;
};
const MATCH_LABEL: Record<string, string> = {
	payee: "Payee",
	contains: "Contains",
	not_contains: "Excludes",
	regex: "Regex",
};
const SOURCE: Record<BankRuleRow["source"], { label: string; tone: StatusTone; glyph: StatusGlyph }> = {
	user_created: { label: "You", tone: "blue", glyph: "user" },
	ai_learned: { label: "Learned", tone: "purple", glyph: "refresh" },
	system_default: { label: "Default", tone: "neutral", glyph: "minus" },
};

/**
 * RulesManager — every categorisation rule (active and deactivated) with its
 * match, target account, source, priority, and how often it fires vs gets
 * overridden. Search, an All/Active/Inactive filter, "Apply to unposted
 * lines" and "New rule" sit above a DataList (stacked rows when narrow).
 */
export function BankRulesTable({
	rules,
	query: queryProp,
	defaultQuery,
	onQueryChange,
	status: statusProp,
	defaultStatus,
	onStatusChange,
	onApplyToUnposted,
	onNewRule,
	onRowAction,
	className,
	...props
}: With<{
	rules: BankRuleRow[];
	/** Controlled search query. */
	query?: string;
	/** Initial search query for uncontrolled use. */
	defaultQuery?: string;
	/** Called when the user types in the search box. */
	onQueryChange?: (query: string) => void;
	/** Controlled status filter. */
	status?: "all" | "active" | "inactive";
	/** Initial status filter for uncontrolled use. */
	defaultStatus?: "all" | "active" | "inactive";
	/** Called when the user changes the status filter. */
	onStatusChange?: (status: "all" | "active" | "inactive") => void;
	/** Called when the user clicks "Apply to unposted lines". */
	onApplyToUnposted?: () => void;
	/** Called when the user clicks "New rule". */
	onNewRule?: () => void;
	/** Called when the user triggers the action menu on a rule row. */
	onRowAction?: (rule: BankRuleRow) => void;
	className?: string;
}>) {
	const [query = "", setQuery] = useControllableState({
		prop: queryProp,
		defaultProp: defaultQuery,
		onChange: onQueryChange,
	});
	const [filter = "all", setFilter] = useControllableState({
		prop: statusProp,
		defaultProp: defaultStatus,
		onChange: onStatusChange,
	});
	const q = query.toLowerCase();
	// Every keystroke rerenders; the rows it searches do not change with it.
	const shown = React.useMemo(
		() =>
			rules.filter((r) => {
				if (filter === "active" && !r.isActive) return false;
				if (filter === "inactive" && r.isActive) return false;
				if (q)
					return (
						r.pattern.toLowerCase().includes(q) ||
						(r.account?.name ?? "").toLowerCase().includes(q) ||
						(r.category ?? "").toLowerCase().includes(q)
					);
				return true;
			}),
		[rules, filter, q],
	);
	// Inactive rules read quieter through colour that still passes 4.5:1; the Status column says "Inactive".
	const dim = (r: BankRuleRow) => (!r.isActive ? "text-tertiary-foreground" : undefined);
	const columns: DataColumn<BankRuleRow>[] = [
		{
			key: "rule",
			header: "Rule",
			mobile: "title",
			cell: (r) => (
				<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
					<span className={cn("flex min-w-0 items-baseline gap-2", dim(r))}>
						<span className="shrink-0 font-normal text-tertiary-foreground">{MATCH_LABEL[r.matchType] ?? r.matchType}</span>
						<span className="min-w-0 font-medium break-words text-foreground @3xl:whitespace-nowrap">{r.pattern}</span>
					</span>
					{!r.isActive && (
						<StatusChip tone="neutral" glyph="pause">
							Inactive
						</StatusChip>
					)}
				</span>
			),
		},
		{
			key: "account",
			header: "Categorizes to",
			className: "@3xl:whitespace-nowrap",
			cell: (r) => (
				<span className={dim(r)}>
					{r.account ? (
						<span className="inline-flex min-w-0 items-baseline gap-1.5">
							<span className="font-mono text-2xs font-medium shrink-0 text-tertiary-foreground">{r.account.code}</span>
							<span>{r.account.name}</span>
						</span>
					) : r.category ? (
						r.category
					) : (
						<span className="text-tertiary-foreground">No account</span>
					)}
				</span>
			),
		},
		{
			key: "source",
			header: "Source",
			mobile: "badge",
			cell: (r) => (
				<span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
					<StatusChip tone={SOURCE[r.source].tone} glyph={SOURCE[r.source].glyph} className={dim(r)}>
						{SOURCE[r.source].label}
					</StatusChip>
					{/* Stacked layout only: the three figure columns folded into one line. */}
					<span className={cn("text-2xs tabular-nums text-tertiary-foreground @3xl:hidden", dim(r))}>
						Priority {r.priority} · applied {r.timesApplied.toLocaleString()}× ·{" "}
						{r.timesApplied > 0 ? `${Math.round((r.timesOverridden / r.timesApplied) * 100)}% overridden` : "not used yet"}
					</span>
				</span>
			),
		},
		{
			key: "priority",
			header: "Priority",
			align: "right",
			mobile: "hidden",
			cell: (r) => <span className={dim(r)}>{r.priority}</span>,
		},
		{
			key: "applied",
			header: "Applied",
			align: "right",
			mobile: "hidden",
			cell: (r) => <span className={dim(r)}>{r.timesApplied.toLocaleString()}</span>,
		},
		{
			key: "override",
			header: "Overridden",
			align: "right",
			mobile: "hidden",
			cell: (r) => (
				<span className={dim(r)}>
					{r.timesApplied > 0 ? (
						`${Math.round((r.timesOverridden / r.timesApplied) * 100)}%`
					) : (
						<span className="text-tertiary-foreground">Not used yet</span>
					)}
				</span>
			),
		},
	];
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<ActionBar className="justify-between">
				<ActionBar>
					<div className="relative w-full @md:w-52">
						<MagnifyingGlassIcon
							size={13}
							className="size-3 pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-tertiary-foreground"
							aria-hidden="true"
						/>
						<Input
							aria-label="Search rules"
							placeholder="Search by match or pattern"
							value={query}
							onChange={(e) => setQuery(e.currentTarget.value)}
							className="pl-7"
						/>
					</div>
					<GroupedTabButton
						aria-label="Filter rules by status"
						className="w-auto"
						value={filter}
						onValueChange={(v) => setFilter(v as "all" | "active" | "inactive")}
						options={[
							{ value: "all", label: "All" },
							{ value: "active", label: "Active" },
							{ value: "inactive", label: "Inactive" },
						]}
					/>
				</ActionBar>
				<ActionBar>
					{onApplyToUnposted && (
						<Button variant="secondary" onClick={onApplyToUnposted}>
							Apply to unposted lines
						</Button>
					)}
					{onNewRule && (
						<Button className="gap-1.5" onClick={onNewRule}>
							<PlusIcon size={14} className="size-3.5" aria-hidden="true" />
							New rule
						</Button>
					)}
				</ActionBar>
			</ActionBar>
			<DataList
				caption="Categorization rules"
				stackBelow="3xl"
				columns={columns}
				rows={shown}
				getKey={(r) => r.id}
				trailing={
					onRowAction
						? (r) => (
								<ToolbarButton
									aria-label={`Actions for rule ${MATCH_LABEL[r.matchType] ?? r.matchType} ${r.pattern}`}
									onClick={() => onRowAction(r)}
								/>
							)
						: undefined
				}
				footer={
					<span role="status" className="text-2xs tabular-nums text-tertiary-foreground">
						{countOf(shown.length, "rule")}
					</span>
				}
				empty="No rules yet. Rules auto-categorize matching transactions on import."
			/>
		</div>
	);
}
