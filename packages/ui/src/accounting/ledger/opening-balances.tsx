"use client";

/**
 * Cynco UI — the last line of the opening-balance trial balance: totals,
 * whether they balance, and what posting them will do.
 *
 * It sizes itself by its CONTAINER (`@container` + `@3xl:` variants), so it
 * works in a full page, a side sheet or a 360px phone.
 */
import type * as React from "react";
import { Button, cn, StatusChipIcon } from "../../base";
import { type Amount, absAmount, subtractAmounts, toSen } from "../../lib/money";
import { formatCurrency, formatPlain, surfaces, ToneDot } from "../../lib/shared";

export type OpeningBalanceTotalsBarProps = React.ComponentProps<"div"> & {
	debit: Amount;
	credit: Amount;
	currency?: string;
	/** Rows with a typed amount. */
	filled: number;
	invalidCount?: number;
	overLimit?: boolean;
	maxAmount?: Amount;
	suspenseLabel?: string;
	onlySubledger?: boolean;
	entryStatus?: "draft" | "posted" | null;
	isDirty?: boolean;
	isPosting?: boolean;
	canPost?: boolean;
	onDiscard?: () => void;
	onPost?: () => void;
};

/** opening-balances/TotalsBar.tsx — the trial balance's last line: totals, balance state, Discard / Post. */
export function OpeningBalanceTotalsBar({
	debit,
	credit,
	currency = "MYR",
	filled,
	invalidCount = 0,
	overLimit,
	maxAmount,
	suspenseLabel = "3900-000 Opening Balance Suspense",
	onlySubledger,
	entryStatus = null,
	isDirty,
	isPosting,
	canPost = true,
	onDiscard,
	onPost,
	className,
	...props
}: OpeningBalanceTotalsBarProps) {
	const differenceSen = toSen(debit) - toSen(credit);
	const limit = maxAmount != null ? `, up to ${formatPlain(maxAmount)}` : "";
	let tone: "neutral" | "success" | "warning" | "danger" = "neutral";
	let text = "Enter balances to check them";
	let detail: string | null = null;
	if (invalidCount > 0) {
		tone = "danger";
		text = `${invalidCount} ${invalidCount === 1 ? "amount" : "amounts"} to fix`;
		detail = `Use numbers like 1,234.56 or (500)${limit}.`;
	} else if (overLimit) {
		tone = "danger";
		text = "Totals too large for one entry";
		detail = `Debits and credits must each stay within ${maxAmount != null ? formatPlain(maxAmount) : "the ledger limit"}.`;
	} else if (filled > 0 && differenceSen === 0n) {
		tone = "success";
		text = "Balanced";
	} else if (filled > 0) {
		tone = "warning";
		text = `Out by ${formatCurrency(absAmount(subtractAmounts(debit, credit)), currency)}`;
		detail = `${differenceSen > 0n ? "More debits" : "More credits"}: the gap goes to ${suspenseLabel}.`;
	}
	const postLabel = isPosting
		? "Posting…"
		: entryStatus === "posted"
			? isDirty
				? "Post changes"
				: "Posted"
			: entryStatus === "draft"
				? "Post draft"
				: "Post opening balances";
	return (
		<div className={cn("@container min-w-0", surfaces.card, className)} {...props}>
			<div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 @3xl:flex-nowrap">
				{(
					[
						["Debit", debit],
						["Credit", credit],
					] as const
				).map(([l, v]) => (
					<div key={l} className="flex flex-col">
						<span className="text-2xs text-tertiary-foreground">{l}</span>
						<span className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(v, currency)}</span>
					</div>
				))}
				<div
					role="status"
					aria-live="polite"
					className="flex min-w-0 flex-1 basis-56 items-center gap-2 rounded-lg border bg-interactive-secondary px-2.5 py-1.5 @3xl:max-w-sm"
				>
					{tone === "neutral" ? (
						<ToneDot tone="neutral" className="mx-1" />
					) : (
						<StatusChipIcon
							tone={tone === "success" ? "green" : tone === "warning" ? "amber" : "red"}
							glyph={tone === "success" ? "check" : tone === "warning" ? "alert" : "x"}
						/>
					)}
					<span className="min-w-0">
						<span className="block text-2xs font-medium text-foreground tabular-nums">{text}</span>
						{detail && <span className="block text-2xs text-tertiary-foreground">{detail}</span>}
					</span>
				</div>
				<div className="ml-auto flex flex-wrap items-center justify-end gap-2">
					{onlySubledger && !isDirty && (
						<span className="max-w-56 text-right text-2xs text-tertiary-foreground">
							Nothing typed to post. Customer and vendor openings are already in the ledger.
						</span>
					)}
					{isDirty && (
						<Button variant="skeleton" disabled={isPosting} onClick={onDiscard}>
							Discard
						</Button>
					)}
					<Button
						variant="primary"
						disabled={!canPost || (entryStatus === "posted" && !isDirty)}
						isLoading={isPosting}
						onClick={onPost}
					>
						{postLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
