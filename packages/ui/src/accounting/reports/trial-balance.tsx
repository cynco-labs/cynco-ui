"use client";

import { WarningIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Alert, AlertDescription, cn } from "../../base";
import { type Amount, absAmount, subtractAmounts, sumAmounts, toSen } from "../../lib/money";
import {
	BracketedFigure,
	type DataColumn,
	DataList,
	formatBracketed,
	negativeClass,
	SectionPanel,
} from "../../lib/shared";
import { AccountLabel, CheckChip, DOUBLE_RULE } from "./shared";

/** Blank in the table (accounting convention), an em dash once DataList stacks (below 36rem). */
const STACKED_DASH = (
	<span aria-hidden="true" className="text-tertiary-foreground @xl:hidden">
		—
	</span>
);

export interface TrialBalanceAccount {
	accountId: string;
	accountCode: string;
	accountName: string;
	accountType?: string;
	debit?: Amount;
	credit?: Amount;
	[key: string]: unknown;
}

/** One Dr/Cr column pair: a balance, a prior period, a variance, adjustments… */
export interface TrialBalanceColumnGroup {
	/** Header over the pair; omit for a single, unlabelled pair. */
	label?: string;
	/** Secondary figures (prior period, unadjusted) read quieter. */
	muted?: boolean;
	/** Variances: shown signed and sign-coloured, zero left blank. */
	signed?: boolean;
	debit: (row: TrialBalanceAccount) => Amount;
	credit: (row: TrialBalanceAccount) => Amount;
	/** The posted debit total. Omit it and the report adds the rows, which only a complete trial balance may do. */
	totalDebit?: Amount;
	/** The posted credit total, on the same terms as `totalDebit`. */
	totalCredit?: Amount;
}

type TbRow = TrialBalanceAccount & { __total?: boolean };

/**
 * The trial balance (cynco TrialBalanceSection): account code + name, Dr/Cr
 * pairs per column group, totals that must tie, and a balance chip. Tray table
 * on wide containers; one card per account below 36rem.
 */
export function TrialBalanceReport({
	title = "Trial balance",
	description,
	period,
	rows,
	groups,
	showType = false,
	balanced,
	badgeLabel,
	currency = "MYR",
	className,
	...props
}: Omit<React.ComponentProps<"div">, "title"> & {
	title?: string;
	description?: React.ReactNode;
	/** Period label for the heading, e.g. "October 2026". */
	period?: string;
	rows: TrialBalanceAccount[];
	/** Column groups; defaults to one pair read from `row.debit` / `row.credit`. */
	groups?: TrialBalanceColumnGroup[];
	showType?: boolean;
	/** Override the computed balanced state (totals of every unsigned group tie). */
	balanced?: boolean;
	/** Which figures the chip speaks for, when there is more than one set. */
	badgeLabel?: string;
	currency?: string;
}) {
	const cols: TrialBalanceColumnGroup[] = (groups ?? [{ debit: (r) => r.debit ?? 0, credit: (r) => r.credit ?? 0 }]).map(
		(g) => ({
			...g,
			totalDebit: g.totalDebit ?? sumAmounts(rows.map((r) => g.debit(r))),
			totalCredit: g.totalCredit ?? sumAmounts(rows.map((r) => g.credit(r))),
		}),
	);
	const main = cols.find((g) => !g.signed && !g.muted) ?? cols[0]!;
	const ties = cols.filter((g) => !g.signed).every((g) => toSen(g.totalDebit) === toSen(g.totalCredit));
	const ok = balanced ?? ties;
	const status = ok ? "balanced" : "unbalanced";
	const diff = absAmount(subtractAmounts(main.totalDebit, main.totalCredit));

	const amountCol = (g: TrialBalanceColumnGroup, i: number, side: "debit" | "credit"): DataColumn<TbRow> => ({
		key: `${i}-${side}`,
		align: "right",
		mobile: "meta",
		header: (
			<>
				{g.label && <span className="block text-2xs text-subtle">{g.label}</span>}
				{side === "debit" ? "Debit" : "Credit"} ({currency})
			</>
		),
		cell: (r) => {
			if (r.__total) {
				const v = side === "debit" ? g.totalDebit! : g.totalCredit!;
				return (
					<span
						className={cn("font-semibold", g.muted && "text-tertiary-foreground", g.signed && negativeClass(toSen(v) < 0n))}
					>
						<span className={cn(!g.signed && DOUBLE_RULE)}>
							<BracketedFigure value={v} />
						</span>
					</span>
				);
			}
			const v = side === "debit" ? g.debit(r) : g.credit(r);
			const shown = g.signed ? toSen(v) !== 0n : toSen(v) > 0n;
			if (!shown) return STACKED_DASH;
			return (
				<span className={cn(g.muted && "text-tertiary-foreground", g.signed && negativeClass(toSen(v) < 0n))}>
					<BracketedFigure value={v} />
				</span>
			);
		},
	});

	const columns: DataColumn<TbRow>[] = [
		{
			key: "account",
			header: "Account",
			mobile: "title",
			className: "w-full",
			cell: (r) =>
				r.__total ? (
					<span className="font-semibold text-foreground">Total</span>
				) : (
					<AccountLabel code={r.accountCode} label={r.accountName} />
				),
		},
		...(showType
			? [
					{
						key: "type",
						header: "Type",
						mobile: "badge" as const,
						className: "whitespace-nowrap",
						cell: (r: TbRow) => (
							<span className="text-xs capitalize text-tertiary-foreground">{(r.accountType ?? "").replace(/_/g, " ")}</span>
						),
					},
				]
			: []),
		...cols.flatMap((g, i) => [amountCol(g, i, "debit"), amountCol(g, i, "credit")]),
	];
	const data: TbRow[] = [...rows, { accountId: "__total", accountCode: "", accountName: "Total", __total: true }];

	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			{!ok && (
				<Alert variant="destructive">
					<WarningIcon size={16} weight="fill" aria-hidden="true" />
					<AlertDescription>
						Debits ({formatBracketed(main.totalDebit!)}) do not equal credits ({formatBracketed(main.totalCredit!)}), a
						difference of {currency} {formatBracketed(diff)}.
					</AlertDescription>
				</Alert>
			)}
			<SectionPanel
				flush
				title={period ? `${title} · ${period}` : title}
				description={description ?? `${rows.length} accounts with balances`}
				actions={
					<CheckChip ok={ok}>
						{badgeLabel ? `${badgeLabel} ${status}` : status.charAt(0).toUpperCase() + status.slice(1)}
					</CheckChip>
				}
			>
				<DataList
					className="px-1.5 pb-1.5"
					dense
					caption={period ? `${title}, ${period}` : title}
					columns={columns}
					rows={data}
					getKey={(r) => r.accountId}
				/>
			</SectionPanel>
		</div>
	);
}
