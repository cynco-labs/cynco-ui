"use client";

/**
 * Cynco UI — the general ledger register: every posting against an account,
 * with its running balance.
 *
 * It sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import type * as React from "react";
import { cn, StatusChipIcon } from "../../base";
import { type Amount, sumAmounts, toSen } from "../../lib/money";
import { type DataColumn, DataList, formatCurrency, formatDate, negativeClass } from "../../lib/shared";

export type GlRegisterRow = {
	id: string;
	date: string;
	entryNumber: string;
	accountCode?: string;
	accountName?: string;
	description: string;
	counterparty?: string | null;
	debit: Amount;
	credit: Amount;
	/** Base-currency equivalents of a foreign line. */
	baseDebit?: Amount;
	baseCredit?: Amount;
	currency?: string;
	runningBalance: Amount;
	isReconciled?: boolean;
};

/** A GL amount in its own currency; a foreign line shows the ISO code and the base figure (cynco AmountCell). */
function GlAmount({
	amount,
	base,
	currency,
	baseCurrency,
}: {
	amount: Amount;
	base?: Amount;
	currency: string;
	baseCurrency: string;
}) {
	if (toSen(amount) === 0n) return <span className="text-tertiary-foreground">-</span>;
	if (currency === baseCurrency) return <span className="tabular-nums">{formatCurrency(amount, currency)}</span>;
	return (
		<span
			className="inline-flex flex-col items-end leading-tight tabular-nums"
			title={`${currency} line · ${formatCurrency(base ?? 0, baseCurrency)} in ${baseCurrency}`}
		>
			<span className="whitespace-nowrap">
				<span className="mr-1 text-2xs text-tertiary-foreground">{currency}</span>
				{formatCurrency(amount, currency)}
			</span>
			<span className="whitespace-nowrap text-2xs text-tertiary-foreground">
				≈ {formatCurrency(base ?? 0, baseCurrency)}
			</span>
		</span>
	);
}

function GlBalance({ value, currency }: { value: Amount; currency: string }) {
	return (
		<span className={cn("tabular-nums text-foreground", negativeClass(toSen(value) < 0n))}>
			{formatCurrency(value, currency)}
		</span>
	);
}

/** A register row, or the synthetic opening-balance row that heads the register. */
type GlListRow =
	| (GlRegisterRow & { kind: "line" })
	| { kind: "opening"; id: string; date?: string; runningBalance: Amount };

export type GeneralLedgerTableProps = {
	className?: string;
	rows: GlRegisterRow[];
	baseCurrency?: string;
	/** No account selected → show the account column instead of a meaningful running balance. */
	showAccount?: boolean;
	openingBalance?: Amount;
	/**
	 * The account's posted closing balance. Omit it and the footer shows the last row's running
	 * balance, which is right for a full register and wrong for one page of a paged one.
	 */
	closingBalance?: Amount;
	openingDate?: string;
	closingDate?: string;
} & Omit<React.ComponentProps<"div">, "children">;

/** routes/dashboard.accounting.ledger.tsx + ledger-explorer/LedgerRegister — the GL register with running balance. */
export function GeneralLedgerTable({
	rows,
	baseCurrency = "MYR",
	showAccount,
	openingBalance,
	closingBalance,
	openingDate,
	closingDate,
	className,
	...props
}: GeneralLedgerTableProps) {
	// A foreign line's base-currency equivalent is what the page total is in, so it wins where it is given.
	const dr = sumAmounts(rows.map((r) => r.baseDebit ?? r.debit));
	const cr = sumAmounts(rows.map((r) => r.baseCredit ?? r.credit));
	const closing = closingBalance ?? (rows.length ? rows[rows.length - 1]!.runningBalance : (openingBalance ?? "0.00"));
	const list: GlListRow[] = [
		...(openingBalance != null
			? [{ kind: "opening" as const, id: "__opening__", date: openingDate, runningBalance: openingBalance }]
			: []),
		...rows.map((r) => ({ ...r, kind: "line" as const })),
	];
	const line = (r: GlListRow, render: (l: GlRegisterRow & { kind: "line" }) => React.ReactNode) =>
		r.kind === "line" ? render(r) : null;
	const columns: DataColumn<GlListRow>[] = [
		{
			key: "date",
			header: "Date · Entry #",
			className: "w-32",
			mobile: "meta",
			cell: (r) => (
				<span className="flex flex-col">
					<span className="tabular-nums whitespace-nowrap text-muted-foreground">{r.date ? formatDate(r.date) : ""}</span>
					{r.kind === "line" && (
						<span className="whitespace-nowrap font-mono text-2xs font-medium text-tertiary-foreground">{r.entryNumber}</span>
					)}
				</span>
			),
		},
		...(showAccount
			? [
					{
						key: "account",
						header: "Account",
						cell: (r: GlListRow) =>
							line(r, (l) => (
								<span className="flex flex-col">
									<span className="font-mono text-2xs font-medium text-tertiary-foreground">{l.accountCode}</span>
									<span>{l.accountName}</span>
								</span>
							)),
					} satisfies DataColumn<GlListRow>,
				]
			: []),
		{
			key: "description",
			header: "Description",
			// Table layout: the description takes the spare width and truncates (title carries the full text).
			className: "w-full max-w-0",
			mobile: "title",
			cell: (r) =>
				r.kind === "opening" ? (
					<span className="font-semibold text-muted-foreground">Opening balance</span>
				) : (
					<span className="flex min-w-0 flex-col" title={r.description}>
						<span className="break-words @2xl:truncate">{r.description}</span>
						<span className="text-2xs text-tertiary-foreground @2xl:truncate">{r.counterparty ?? "-"}</span>
					</span>
				),
		},
		{
			key: "debit",
			header: "Debit",
			align: "right",
			mobile: "hidden",
			cell: (r) =>
				line(r, (l) => (
					<GlAmount amount={l.debit} base={l.baseDebit} currency={l.currency ?? baseCurrency} baseCurrency={baseCurrency} />
				)),
		},
		{
			key: "credit",
			header: "Credit",
			align: "right",
			mobile: "hidden",
			cell: (r) =>
				line(r, (l) => (
					<GlAmount
						amount={l.credit}
						base={l.baseCredit}
						currency={l.currency ?? baseCurrency}
						baseCurrency={baseCurrency}
					/>
				)),
		},
		// Stacked layout only: the posting's amount, marked by side (LedgerRegister's phone "Amount" column).
		{
			key: "amount",
			header: "Amount",
			className: "hidden",
			mobile: "value",
			cell: (r) =>
				line(r, (l) => {
					const isCredit = toSen(l.credit) !== 0n;
					return (
						<span className="inline-flex items-baseline gap-1">
							<GlAmount
								amount={isCredit ? l.credit : l.debit}
								base={isCredit ? l.baseCredit : l.baseDebit}
								currency={l.currency ?? baseCurrency}
								baseCurrency={baseCurrency}
							/>
							<span className="text-2xs font-normal text-tertiary-foreground">{isCredit ? "Cr" : "Dr"}</span>
						</span>
					);
				}),
		},
		{
			key: "balance",
			header: "Balance",
			align: "right",
			cell: (r) => (
				<span className={r.kind === "opening" ? "font-semibold" : undefined}>
					<GlBalance value={r.runningBalance} currency={baseCurrency} />
				</span>
			),
		},
		{
			key: "rec",
			header: (
				<>
					<span aria-hidden="true">Rec.</span>
					<span className="sr-only">Reconciled</span>
				</>
			),
			align: "center",
			className: "w-12",
			cell: (r) =>
				line(r, (l) =>
					l.isReconciled ? (
						<span className="inline-flex align-middle" title="Reconciled">
							<StatusChipIcon tone="green" glyph="check" />
							<span className="sr-only">Yes</span>
						</span>
					) : (
						<span className="text-2xs text-tertiary-foreground">No</span>
					),
				),
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="General ledger"
			columns={columns}
			rows={list}
			getKey={(r) => r.id}
			dense
			stackBelow="2xl"
			empty="No postings for this account in the selected period."
			footer={
				<div className="flex flex-col gap-1 tabular-nums">
					<div className="flex flex-wrap items-baseline justify-between gap-x-4">
						<span className="font-medium text-tertiary-foreground">Page total ({baseCurrency})</span>
						<span className="flex flex-wrap justify-end gap-x-4 font-semibold text-foreground">
							<span className="whitespace-nowrap">
								<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Dr</span>
								{formatCurrency(dr, baseCurrency)}
							</span>
							<span className="whitespace-nowrap">
								<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Cr</span>
								{formatCurrency(cr, baseCurrency)}
							</span>
						</span>
					</div>
					<div className="flex flex-wrap items-baseline justify-between gap-x-4">
						<span className="font-medium text-tertiary-foreground">
							Closing balance{closingDate ? ` · ${formatDate(closingDate)}` : ""}
						</span>
						<span className="ml-auto font-semibold">
							<GlBalance value={closing} currency={baseCurrency} />
						</span>
					</div>
				</div>
			}
		/>
	);
}
