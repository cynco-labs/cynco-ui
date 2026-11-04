"use client";

/**
 * Cynco UI — the month-end proof: the bridge from the statement's closing
 * balance to the ledger balance the bank expects, and what is left over.
 */
import { ArrowSquareOutIcon, FileArrowUpIcon, ScalesIcon } from "@phosphor-icons/react";
import { Button, cn } from "../../base";
import { absAmount, fromSen, subtractAmounts, toSen } from "../../lib/money";
import { formatCurrency } from "../../lib/shared";
import { BankBalanceEquation } from "./balance-equation";
import type { With } from "./shared";

export type BankLedgerLink =
	| { kind: "linked"; code: string; name: string }
	| { kind: "unlinked" }
	| { kind: "foreign_currency"; accountCurrency: string; baseCurrency: string }
	| { kind: "missing_account" };

/**
 * MonthProof — the month-end proof: statement closing, minus bank lines not
 * yet in the ledger and posted lines dated on the other side of the day,
 * equals the ledger balance the bank expects, checked against the linked
 * ledger account. A difference left over is explained in words.
 */
export function BankMonthProof({
	monthName,
	asOf,
	statementClosing,
	unpostedNet,
	inTransit,
	ledger,
	link,
	currency = "MYR",
	state,
	onUploadStatement,
	onLinkLedgerAccount,
	className,
	...props
}: With<
	{
		monthName: string;
		/** "31 Mar" */
		asOf: string;
		/** null = no statement ends in the month. */
		statementClosing: number | null;
		unpostedNet: number;
		inTransit?: { count: number; net: number };
		/** Ledger balance on the day; null when there is nothing to compare with. */
		ledger: number | null;
		link: BankLedgerLink;
		currency?: string;
		state?: "no_statement" | "in_progress" | "covered" | "needs_work" | "ready" | "closed";
		/** Called when the user clicks "Upload statement"; omit to hide the button. */
		onUploadStatement?: () => void;
		/** Called when the user clicks "Link a ledger account"; omit to hide the button. */
		onLinkLedgerAccount?: () => void;
		className?: string;
	},
	"section"
>) {
	const transit = inTransit && inTransit.count > 0 ? inTransit : null;
	const ledgerLabel = link.kind === "linked" ? `${link.code} ${link.name}` : "the ledger";
	const unknown =
		statementClosing === null
			? "No statement to prove"
			: link.kind === "unlinked"
				? "No ledger account linked"
				: link.kind === "foreign_currency"
					? `${link.accountCurrency} against ${link.baseCurrency}`
					: link.kind === "missing_account"
						? "Ledger account missing"
						: "Can't verify";
	const expected =
		statementClosing === null
			? null
			: subtractAmounts(subtractAmounts(statementClosing, unpostedNet), transit?.net ?? "0.00");
	const diffSen = expected !== null && ledger !== null && link.kind === "linked" ? toSen(ledger) - toSen(expected) : 0n;
	const diffAmount = fromSen(diffSen);
	const amount = formatCurrency(absAmount(diffAmount), currency);
	const explanation =
		diffSen === 0n
			? null
			: diffSen > 0n
				? `On ${asOf} the ledger holds ${amount} more than the bank explains. That is usually an entry posted to ${ledgerLabel} with no bank line behind it (a manual journal, or a payment recorded straight to the bank account), or an opening balance set above the bank's.`
				: `On ${asOf} the ledger holds ${amount} less than the bank explains. That is usually a bank line whose ledger entry was reversed or posted to another account, or an opening balance set below the bank's.`;
	const reason =
		link.kind === "unlinked"
			? "This account isn't linked to a ledger account, so there is no ledger balance to prove it against."
			: link.kind === "foreign_currency"
				? `The statement is in ${link.accountCurrency} and the ledger in ${link.baseCurrency}, so the two balances can't be compared.`
				: link.kind === "missing_account"
					? "The ledger account this account is linked to isn't on your active chart of accounts."
					: null;
	const prose = "max-w-prose text-sm leading-5 text-muted-foreground";

	return (
		<section aria-label="Month-end proof" className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			<h3 className="text-sm font-semibold text-muted-foreground">Month-end proof</h3>
			<BankBalanceEquation
				currency={currency}
				terms={[
					{
						label: "Statement closing",
						amount: statementClosing,
						hint: statementClosing === null ? "No statement" : `at ${asOf}`,
					},
					{ label: "Not yet in the ledger", amount: unpostedNet, op: "minus", hint: `lines to ${asOf}` },
					...(transit
						? [
								{
									label: "In the ledger on another day",
									amount: transit.net,
									op: "minus" as const,
									hint: transit.count === 1 ? "1 posted line" : `${transit.count} posted lines`,
								},
							]
						: []),
				]}
				resultLabel="Expected ledger"
				check={{
					label: link.kind === "linked" ? `${link.code} at ${asOf}` : "Ledger",
					amount: link.kind === "linked" ? ledger : null,
				}}
				tiesLabel="Ties to the ledger"
				unknownLabel={unknown}
			/>
			{transit && (
				<p className={prose}>
					{transit.count === 1 ? "1 posted line is" : `${transit.count} posted lines are`} in the bank and the ledger on
					different sides of {asOf}: a transfer is dated the day it lands in the other account, and a matched line takes its
					entry&apos;s date. The bridge counts them, so they are not a difference.
				</p>
			)}
			{explanation && <p className={prose}>{explanation}</p>}
			{state === "in_progress" && statementClosing === null && (
				<p className={prose}>{monthName} is still in progress. Its statement comes once the month ends.</p>
			)}
			{state === "no_statement" && (
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<p className={prose}>No statement ends in {monthName}, so there is no bank balance to prove the month end with.</p>
					{onUploadStatement && (
						<Button variant="secondary" className="gap-1.5" onClick={onUploadStatement}>
							<FileArrowUpIcon size={14} className="size-3.5" aria-hidden="true" />
							Upload {monthName} statement
						</Button>
					)}
				</div>
			)}
			{reason && statementClosing !== null && <p className={prose}>{reason}</p>}
			{(link.kind === "unlinked" || link.kind === "missing_account") && onLinkLedgerAccount && (
				<Button variant="secondary" className="gap-1.5" onClick={onLinkLedgerAccount}>
					<ScalesIcon size={14} className="size-3.5" aria-hidden="true" />
					Link a ledger account
				</Button>
			)}
			{link.kind === "linked" && (
				<a
					href="#ledger"
					className="inline-flex w-fit max-w-full items-center gap-1 rounded-sm text-sm text-primary underline-offset-4 hover:underline focus-ring"
				>
					Open {ledgerLabel} in the ledger
					<ArrowSquareOutIcon size={12} className="size-3 shrink-0" aria-hidden="true" />
				</a>
			)}
		</section>
	);
}
