"use client";

import { CaretLeftIcon, CaretRightIcon, DownloadSimpleIcon, WarningIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — the header over a bank account's register: who the account is,
 * whether it ties to the statement, and which month you are looking at.
 *
 * It sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import type * as React from "react";
import { Badge, cn, IconButton, StatusChip } from "../../base";
import { STATUS_TONES } from "../../base/components/general/status-chip";
import { type Amount, absAmount, fromSen, toSen } from "../../lib/money";
import { formatCurrency, formatDate, surfaces } from "../../lib/shared";
import { periodLabel } from "./shared";

export type BankLedgerHeaderProps = React.ComponentProps<"div"> & {
	account: { name: string; number?: string; glCode?: string; institutionName?: string; currency: string };
	/** "2026-10" */
	month: string;
	tieOut:
		| { status: "tied"; statementClosing: Amount }
		| { status: "off"; difference: Amount }
		| { status: "none"; basis: "statement" | "unverified" };
	bookBalance: Amount;
	statement?: { date: string; balance: Amount; unreconciledDifference: Amount } | null;
	notCounted?: { label: string; title?: string }[];
	transactionCount: number;
	credits: Amount;
	debits: Amount;
	canPrev?: boolean;
	canNext?: boolean;
	onMonthChange?: (dir: -1 | 1) => void;
	onDownload?: () => void;
};

/** banking/ledger/LedgerHeader.tsx — account, statement tie-out, balances and month stepper over the register. */
export function BankLedgerHeader({
	account,
	month,
	tieOut,
	bookBalance,
	statement,
	notCounted = [],
	transactionCount,
	credits,
	debits,
	canPrev = true,
	canNext = true,
	onMonthChange,
	onDownload,
	className,
	...props
}: BankLedgerHeaderProps) {
	const c = account.currency;
	const diffSen = toSen(statement?.unreconciledDifference);
	return (
		<div className={cn("flex min-w-0 flex-col gap-3 px-4 py-3", surfaces.card, className)} {...props}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<h2 className="min-w-0 break-words text-sm font-semibold text-foreground">{account.name}</h2>
						{account.number && <span className="text-2xs text-tertiary-foreground">{account.number}</span>}
						{account.glCode && (
							<span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-2xs font-medium text-muted-foreground">
								{account.glCode}
							</span>
						)}
					</div>
					{account.institutionName && (
						<p className="mt-0.5 truncate text-2xs text-tertiary-foreground">{account.institutionName}</p>
					)}
				</div>
				{tieOut.status === "tied" ? (
					<StatusChip tone="green" glyph="check" className="h-auto min-h-5.5 py-0.5 whitespace-normal">
						<span className="tabular-nums">Ties to statement · {formatCurrency(tieOut.statementClosing, c)}</span>
					</StatusChip>
				) : tieOut.status === "off" ? (
					<StatusChip tone="red" glyph="alert" className="h-auto min-h-5.5 py-0.5 whitespace-normal">
						<span className="tabular-nums">Off by {formatCurrency(absAmount(tieOut.difference), c)} vs statement</span>
					</StatusChip>
				) : (
					<StatusChip tone="neutral" glyph="minus">
						{tieOut.basis === "statement" ? "No statement for this month" : "Balance unverified: no statement"}
					</StatusChip>
				)}
			</div>
			<dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-2xs tabular-nums">
				<div className="flex flex-wrap items-baseline gap-x-1.5">
					<dt className="text-tertiary-foreground">Book balance</dt>
					<dd className="text-sm text-foreground">{formatCurrency(bookBalance, c)}</dd>
				</div>
				{statement && (
					<div className="flex flex-wrap items-baseline gap-x-1.5">
						<dt className="text-tertiary-foreground">Statement balance · {formatDate(statement.date)}</dt>
						<dd className="text-sm text-foreground">{formatCurrency(statement.balance, c)}</dd>
					</div>
				)}
				{statement && diffSen !== 0n && (
					<div className="flex flex-wrap items-baseline gap-x-1.5">
						<dt className="text-tertiary-foreground">Unreconciled on {formatDate(statement.date)}</dt>
						<dd className="flex items-center gap-1 text-sm text-foreground">
							<WarningIcon weight="fill" size={12} className={STATUS_TONES.amber} aria-hidden="true" />
							{diffSen > 0n ? "+" : "−"}
							{formatCurrency(fromSen(diffSen < 0n ? -diffSen : diffSen), c)}
						</dd>
					</div>
				)}
				{notCounted.map((n) => (
					<div key={n.label}>
						<dt className="sr-only">Not counted</dt>
						<dd>
							<Badge variant="muted" size="sm" title={n.title}>
								{n.label}
							</Badge>
						</dd>
					</div>
				))}
			</dl>
			<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
				<div className="flex items-center gap-1">
					<IconButton
						variant="secondary"
						size="icon"
						aria-label="Previous month"
						disabled={!canPrev}
						focusableWhenDisabled
						icon={<CaretLeftIcon weight="bold" />}
						onClick={() => onMonthChange?.(-1)}
					/>
					<span role="status" className="min-w-28 text-center text-sm text-foreground">
						{periodLabel(month)}
					</span>
					<IconButton
						variant="secondary"
						size="icon"
						aria-label="Next month"
						disabled={!canNext}
						focusableWhenDisabled
						icon={<CaretRightIcon weight="bold" />}
						onClick={() => onMonthChange?.(1)}
					/>
				</div>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs tabular-nums">
					<span className="text-tertiary-foreground">
						{transactionCount} {transactionCount === 1 ? "transaction" : "transactions"}
					</span>
					<span className="text-foreground">+{formatCurrency(credits, c)}</span>
					<span className="text-tertiary-foreground">−{formatCurrency(debits, c)}</span>
					<IconButton
						variant="skeleton"
						size="icon"
						aria-label="Download month as CSV"
						disabled={transactionCount === 0}
						icon={<DownloadSimpleIcon />}
						onClick={onDownload}
					/>
				</div>
			</div>
		</div>
	);
}
