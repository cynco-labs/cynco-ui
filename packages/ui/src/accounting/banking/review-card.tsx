"use client";

/**
 * Cynco UI — one line in the review queue, the card a person works through
 * when categorizing a bank feed by hand.
 */
import { EyeSlashIcon, SparkleIcon, TagIcon } from "@phosphor-icons/react";
import { Button, cn } from "../../base";
import { formatDate } from "../../lib/shared";
import { BankCategoryCell } from "./category-cell";
import type { BankFeedTransaction } from "./feed-row";
import { ConfidenceRing, FG, SUGGEST, signedByType, TINY, type With } from "./shared";
import { BankTransactionTimeline, type BankTxEvent } from "./timeline";

/**
 * ReviewCard — one line in the review queue: payee, date · account ·
 * description, the amount, its AI suggestion with a confidence ring, the
 * per-card actions (Change, Exclude, Skip) and, when active, the why-trail.
 */
export function BankReviewCard({
	tx,
	accountName,
	active = false,
	picking = false,
	events,
	onAcceptSuggestion,
	onChooseCategory,
	onChangeCategory,
	onExclude,
	onSkip,
	className,
	...props
}: With<{
	tx: Pick<BankFeedTransaction, "payeeName" | "description" | "date" | "type" | "amount" | "currency" | "suggestion">;
	accountName?: string;
	active?: boolean;
	picking?: boolean;
	events?: BankTxEvent[];
	/** Called when the user accepts the AI-suggested category. */
	onAcceptSuggestion?: () => void;
	/** Called when the user clicks "Choose category". */
	onChooseCategory?: () => void;
	/** Called when the user clicks "Change" to pick a different category; omit to hide the button. */
	onChangeCategory?: () => void;
	/** Called when the user clicks "Exclude"; omit to hide the button. */
	onExclude?: () => void;
	/** Called when the user clicks "Skip"; omit to hide the button. */
	onSkip?: () => void;
	className?: string;
}>) {
	const suggestion = tx.suggestion;
	return (
		<div
			className={cn(
				"@container min-w-0 rounded-xl border px-3.5 py-3 transition-colors",
				active ? "border-primary/45 bg-interactive-secondary shadow-sm" : "border-border bg-card",
				className,
			)}
			{...props}
		>
			<div className="flex items-start gap-3">
				<div className="min-w-0 flex-1">
					<p className={cn(FG, "line-clamp-2 font-semibold break-words @md:truncate")}>{tx.payeeName || tx.description}</p>
					<p className={cn(TINY, "mt-0.5 flex flex-wrap items-center gap-x-1.5")}>
						<span className="tabular-nums">{formatDate(tx.date)}</span>
						{accountName && (
							<>
								<span aria-hidden="true">·</span>
								<span className="truncate">{accountName}</span>
							</>
						)}
						{tx.payeeName && tx.description && (
							<>
								<span aria-hidden="true">·</span>
								<span className="min-w-0 truncate">{tx.description}</span>
							</>
						)}
					</p>
				</div>
				<span className="shrink-0 text-md font-medium whitespace-nowrap tabular-nums text-foreground">
					{signedByType(tx.amount, tx.type, tx.currency)}
				</span>
			</div>
			<div className="mt-2.5 flex flex-wrap items-center gap-1.5">
				{picking ? (
					<BankCategoryCell status="imported" picking />
				) : suggestion ? (
					<Button
						variant="dotted"
						size="sm"
						className={cn(SUGGEST, "max-w-full gap-1.5 px-2")}
						onClick={onAcceptSuggestion}
						disabled={!onAcceptSuggestion}
					>
						<SparkleIcon size={12} className="size-3" weight="fill" aria-hidden="true" />
						<span className="sr-only">Accept AI suggestion: </span>
						{suggestion.accountCode && (
							<span className="font-mono text-2xs font-medium opacity-80">{suggestion.accountCode}</span>
						)}
						<span className="truncate">{suggestion.accountName}</span>
						{suggestion.confidence != null && <ConfidenceRing value={suggestion.confidence} />}
					</Button>
				) : (
					<Button
						variant="secondary"
						size="sm"
						className="gap-1.5 font-normal"
						onClick={onChooseCategory}
						disabled={!onChooseCategory}
					>
						<TagIcon size={12} className="size-3" aria-hidden="true" />
						Choose category
					</Button>
				)}
				{active && !picking && (
					<span className="ml-auto flex items-center gap-0.5">
						{suggestion && onChangeCategory && (
							<Button variant="skeleton" size="sm" className="text-tertiary-foreground" onClick={onChangeCategory}>
								Change
							</Button>
						)}
						{onExclude && (
							<Button
								variant="skeleton"
								size="sm"
								className="gap-1 text-tertiary-foreground hover:text-error-text"
								onClick={onExclude}
							>
								<EyeSlashIcon size={12} className="size-3" aria-hidden="true" />
								Exclude
							</Button>
						)}
						{onSkip && (
							<Button variant="skeleton" size="sm" className="text-tertiary-foreground" onClick={onSkip}>
								Skip
							</Button>
						)}
					</span>
				)}
			</div>
			{active && events && events.length > 0 && (
				<div className="mt-3 border-t border-border pt-3">
					<BankTransactionTimeline events={events} />
				</div>
			)}
		</div>
	);
}
