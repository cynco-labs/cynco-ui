"use client";

/**
 * Cynco UI — the customer statement of account: its KPIs and its lines.
 */
import { InfoIcon, ReceiptIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn, StatusChip } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import {
	type DataColumn,
	DataList,
	formatBracketed,
	formatCurrency,
	formatDate,
	ReportAmount,
	StatGrid,
	StatTile,
} from "../../lib/shared";

export type StatementMetrics = {
	totalTransactions: number;
	invoicedAmount: Amount;
	collectionRate: number;
	amountReceived: Amount;
	creditedAmount: Amount;
	debitedAmount: Amount;
	balanceDue: Amount;
};

export type CustomerStatementMetricsProps = React.ComponentProps<"div"> & {
	metrics: StatementMetrics;
	currency?: string;
	availableCurrencies?: string[];
	isSingleCurrency?: boolean;
};

export function CustomerStatementMetrics({
	metrics,
	currency = "MYR",
	availableCurrencies,
	isSingleCurrency = true,
	className,
	...props
}: CustomerStatementMetricsProps) {
	const amt = (v: Amount) => formatCurrency(isSingleCurrency ? v : "0", currency);
	const collected = metrics.collectionRate >= 50;
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<StatGrid aria-label="Statement statistics" className="@3xl:grid-cols-4">
				<StatTile label="Total transactions" value={metrics.totalTransactions} />
				<StatTile
					label="Invoiced amount"
					value={amt(metrics.invoicedAmount)}
					sub={
						isSingleCurrency && toSen(metrics.invoicedAmount) > 0n ? (
							<StatusChip tone={collected ? "green" : "red"} glyph={collected ? "check" : "alert"}>
								{`${metrics.collectionRate.toFixed(1)}% collected`}
							</StatusChip>
						) : undefined
					}
				/>
				<StatTile label="Amount received" value={amt(metrics.amountReceived)} />
				<StatTile
					label="Balance due"
					value={amt(metrics.balanceDue)}
					negative={isSingleCurrency && toSen(metrics.balanceDue) > 0n}
				/>
			</StatGrid>
			{!isSingleCurrency && (
				<div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3">
					<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
						<InfoIcon size={16} weight="duotone" className="text-muted-foreground" aria-hidden="true" />
					</span>
					<div className="min-w-0">
						<p className="text-sm font-medium text-foreground">Multiple currencies detected</p>
						<p className="text-xs text-tertiary-foreground">
							Select a currency ({(availableCurrencies ?? []).join(", ")}) to view detailed financial metrics
						</p>
					</div>
				</div>
			)}
			{isSingleCurrency && (toSen(metrics.creditedAmount) > 0n || toSen(metrics.debitedAmount) > 0n) && (
				<StatGrid min="lg" aria-label="Credit and debit note totals" className="@xl:grid-cols-2">
					{toSen(metrics.creditedAmount) > 0n && (
						<StatTile label="Credits applied" value={`-${formatCurrency(metrics.creditedAmount, currency)}`} />
					)}
					{toSen(metrics.debitedAmount) > 0n && (
						<StatTile label="Debits added" value={`+${formatCurrency(metrics.debitedAmount, currency)}`} />
					)}
				</StatGrid>
			)}
		</div>
	);
}

export type StatementTransaction = {
	date: string;
	transactionType: "Invoice" | "Payment" | "Credit Note" | "Debit Note" | "Opening Balance" | string;
	/** Document number and description. */
	details?: string | null;
	currency?: string;
	/** Debit: invoiced / debit-noted. */
	amount: Amount;
	/** Credit: received / credited. */
	payment: Amount;
	balance: Amount;
};

export type CustomerStatementTableProps = {
	transactions: StatementTransaction[];
	currency?: string;
	isSingleCurrency?: boolean;
	/** Shown on the last page in single-currency mode. */
	balanceDue?: Amount;
	page?: number;
	totalPages?: number;
	className?: string;
} & Omit<React.ComponentProps<"div">, "children">;

export function CustomerStatementTable({
	transactions,
	currency = "MYR",
	isSingleCurrency = true,
	balanceDue,
	page,
	totalPages,
	className,
	...props
}: CustomerStatementTableProps) {
	const lastPage = !totalPages || page === totalPages;
	const showBalance = lastPage && isSingleCurrency && balanceDue != null;
	const columns: DataColumn<StatementTransaction>[] = [
		{
			key: "date",
			header: "Date",
			cell: (t) => (
				<span className="whitespace-nowrap text-xs tabular-nums text-tertiary-foreground">{formatDate(t.date)}</span>
			),
		},
		{
			key: "type",
			header: "Transactions",
			mobile: "title",
			cell: (t) => <span className="whitespace-nowrap">{t.transactionType}</span>,
		},
		{
			key: "details",
			header: "Details",
			className: "min-w-40",
			cell: (t) => <span className="text-xs font-normal text-muted-foreground">{t.details || "—"}</span>,
		},
		{
			key: "currency",
			header: "Currency",
			cell: (t) => <span className="font-mono text-2xs font-medium text-tertiary-foreground">{t.currency || "—"}</span>,
		},
		{
			key: "amount",
			header: "Amount",
			align: "right",
			cell: (t) => <ReportAmount amount={toSen(t.amount) > 0n ? t.amount : "0"} />,
		},
		{
			key: "payment",
			header: "Payment",
			align: "right",
			cell: (t) => <ReportAmount amount={toSen(t.payment) > 0n ? t.payment : "0"} />,
		},
		{
			key: "balance",
			header: "Balance",
			align: "right",
			mobile: "value",
			cell: (t) => (
				<span className="font-medium">
					{isSingleCurrency ? formatBracketed(t.balance) : `${t.currency} ${formatBracketed(t.balance)}`}
				</span>
			),
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="Statement of account"
			columns={columns}
			rows={transactions}
			getKey={(t, i) => `${t.date}-${i}`}
			stackBelow="2xl"
			empty={
				<>
					<ReceiptIcon size={18} weight="fill" className="mx-auto mb-1 text-subtle" aria-hidden="true" />
					<span className="block text-sm text-foreground">No transactions found</span>
					<span className="block text-xs">No transactions found for the selected date range.</span>
				</>
			}
			footer={
				showBalance || (totalPages ?? 0) > 1 ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span className="text-xs text-tertiary-foreground">
							{(totalPages ?? 0) > 1 ? `Page ${page} of ${totalPages}` : `${transactions.length} transactions`}
						</span>
						{showBalance && (
							<span className="flex items-baseline gap-6">
								<span className="text-xs font-medium text-tertiary-foreground">Balance Due</span>
								<span className="whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
									{formatCurrency(balanceDue, currency)}
								</span>
							</span>
						)}
					</div>
				) : undefined
			}
		/>
	);
}
