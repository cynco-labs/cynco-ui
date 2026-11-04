"use client";

/**
 * Cynco UI — the party subledger, newest first.
 */
import type * as React from "react";
import type { Amount } from "../../lib/money";
import { type DataColumn, DataList, formatBracketed, formatCurrency, formatDate } from "../../lib/shared";
import { sentenceCase } from "./shared";

export type PartyLedgerRow = {
	id: string;
	entryDate: string;
	event: string;
	documentNumber?: string | null;
	documentType?: string;
	amount: Amount;
	runningBalance: Amount;
};

export type PartyLedgerTableProps = { rows: PartyLedgerRow[]; currency?: string; className?: string } & Omit<
	React.ComponentProps<"div">,
	"children"
>;

export function PartyLedgerTable({ rows, currency = "MYR", className, ...props }: PartyLedgerTableProps) {
	// Statement arrives oldest-first (running balance order); show newest first.
	const list = [...rows].reverse();
	const columns: DataColumn<PartyLedgerRow>[] = [
		{
			key: "date",
			header: "Date",
			cell: (r) => (
				<span className="whitespace-nowrap text-xs tabular-nums text-tertiary-foreground">{formatDate(r.entryDate)}</span>
			),
		},
		{ key: "event", header: "Event", mobile: "title", cell: (r) => sentenceCase(r.event) },
		{
			key: "document",
			header: "Document",
			cell: (r) => (
				<span className="font-mono text-2xs font-medium text-tertiary-foreground">
					{r.documentNumber ?? sentenceCase(r.documentType ?? "")}
				</span>
			),
		},
		{
			key: "amount",
			header: `Amount (${currency})`,
			align: "right",
			cell: (r) => <span className="text-muted-foreground">{formatBracketed(r.amount)}</span>,
		},
		{
			key: "balance",
			header: "Balance",
			align: "right",
			mobile: "value",
			cell: (r) => <span className="font-medium">{formatCurrency(r.runningBalance, currency)}</span>,
		},
	];
	return (
		<DataList
			className={className}
			{...props}
			caption="Ledger"
			columns={columns}
			rows={list}
			getKey={(r) => r.id}
			dense
			empty="No ledger entries yet · Entries appear when documents post to the books."
		/>
	);
}
