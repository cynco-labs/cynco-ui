"use client";

/**
 * Cynco UI — what "To post" will put in the ledger, per account and
 * direction, before any of it is posted.
 */
import { CheckIcon } from "@phosphor-icons/react";
import { cn, useControllableState } from "../../base";
import type { Amount } from "../../lib/money";
import { type DataColumn, DataList } from "../../lib/shared";
import { countOf, signedByType, type With } from "./shared";

export type BankPostingTotal = {
	accountCode: string | null;
	accountName: string | null;
	type: "credit" | "debit";
	count: number;
	total: Amount;
	currency?: string;
};
const postingKey = (t: BankPostingTotal) => `${t.accountCode}|${t.type}`;

/**
 * PostingSummary — what "To post" will put in the ledger, per account and
 * direction, before any of it is posted. Each row narrows the feed to its
 * lines. A DataList: tray table when wide, stacked rows when narrow.
 */
export function BankPostingSummary({
	totals,
	activeKey: activeKeyProp,
	defaultActiveKey = null,
	onActiveKeyChange,
	className,
	...props
}: With<
	{
		totals: BankPostingTotal[];
		/** The row the feed is filtered to, as `accountCode|type` (controlled); `null` for none. */
		activeKey?: string | null;
		/** The row filtered to on first render, when uncontrolled. */
		defaultActiveKey?: string | null;
		/** Called with the new active row, or `null` when the active one is clicked again. */
		onActiveKeyChange?: (key: string | null) => void;
		className?: string;
	},
	"section"
>) {
	const [activeKey = null, setActiveKey] = useControllableState<string | null>({
		prop: activeKeyProp,
		defaultProp: defaultActiveKey,
		onChange: onActiveKeyChange,
	});
	if (totals.length === 0) return null;
	const rows = [...totals].sort(
		(a, b) => (a.accountCode ?? "").localeCompare(b.accountCode ?? "") || a.type.localeCompare(b.type),
	);
	const columns: DataColumn<BankPostingTotal>[] = [
		{
			key: "account",
			header: "Account",
			mobile: "title",
			cell: (t) => (
				<span className="flex min-w-0 items-baseline gap-2">
					{/* The selected row filters the feed: a glyph and a word, not the row tint alone. */}
					{postingKey(t) === activeKey && (
						<>
							<CheckIcon size={12} weight="bold" className="size-3 shrink-0 self-center text-primary" aria-hidden="true" />
							<span className="sr-only">Selected, filtering the feed: </span>
						</>
					)}
					{t.accountCode ? (
						<>
							<span className="font-mono text-2xs font-medium shrink-0 text-tertiary-foreground">{t.accountCode}</span>
							<span className="min-w-0 break-words">{t.accountName}</span>
						</>
					) : (
						<span className="font-normal italic text-tertiary-foreground">Account no longer in the chart</span>
					)}
				</span>
			),
		},
		{
			key: "direction",
			header: "Direction",
			mobile: "badge",
			cell: (t) => (
				<span className="text-2xs text-tertiary-foreground">{t.type === "credit" ? "money in" : "money out"}</span>
			),
		},
		{
			key: "lines",
			header: "Lines",
			mobile: "badge",
			align: "right",
			cell: (t) => <span className="text-2xs text-tertiary-foreground">{countOf(t.count, "line")}</span>,
		},
		{
			key: "total",
			header: "To post",
			mobile: "value",
			align: "right",
			cell: (t) => <span className="font-medium">{signedByType(t.total, t.type, t.currency)}</span>,
		},
	];
	return (
		<section
			aria-label="Waiting to post, by account"
			className={cn("flex min-w-0 flex-col gap-1.5", className)}
			{...props}
		>
			<h3 className="px-1 text-2xs font-medium text-tertiary-foreground">Waiting to post, by account</h3>
			<DataList
				dense
				stackBelow="lg"
				caption="Waiting to post, by account"
				columns={columns}
				rows={rows}
				getKey={(t) => postingKey(t) + (t.currency ?? "")}
				isRowSelected={(t) => postingKey(t) === activeKey}
				onRowClick={(t) => setActiveKey(postingKey(t) === activeKey ? null : postingKey(t))}
			/>
		</section>
	);
}
