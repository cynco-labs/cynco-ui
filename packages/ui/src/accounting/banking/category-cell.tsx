"use client";

/**
 * Cynco UI — the categorization affordance a bank line carries, from an
 * unassigned line through an AI suggestion to a posted, locked one.
 */
import { MagnifyingGlassIcon, SparkleIcon, TagIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Button, cn } from "../../base";
import type { BankFeedStatus } from "./lifecycle";
import { pctOf, SUGGEST, type With } from "./shared";

export type BankCoaSuggestion = { accountCode?: string; accountName: string; confidence?: number | null };

/**
 * CategoryCell — the categorization affordance on a feed row. Four states:
 * confirmed (quiet chip, click to change), suggested (dashed primary chip
 * with AI confidence; click accepts), unassigned ("+ Assign"), locked
 * (posted/reconciled, not clickable). `picking` shows the chart-of-accounts
 * search trigger.
 */
export function BankCategoryCell({
	status,
	category,
	suggestion,
	picking = false,
	onAccept,
	onPick,
	controlTabIndex,
	className,
	...props
}: With<
	{
		status: BankFeedStatus;
		category?: string | null;
		suggestion?: BankCoaSuggestion | null;
		picking?: boolean;
		onAccept?: () => void;
		onPick?: () => void;
		/** `tabIndex` for the cell's own buttons, not its root. `BankFeedList` sets -1 so its grid stays one tab stop. */
		controlTabIndex?: number;
		className?: string;
	},
	"span"
>) {
	const locked = status === "posted" || status === "reconciled";
	const excluded = status === "excluded";
	let body: React.ReactNode = null;
	if (picking) {
		body = (
			<Button
				variant="secondary"
				size="sm"
				tabIndex={controlTabIndex}
				className="w-44 max-w-full justify-start gap-1.5 font-normal text-tertiary-foreground"
				aria-label="Account…: search chart of accounts"
				onClick={onPick}
			>
				<MagnifyingGlassIcon size={12} className="size-3" aria-hidden="true" />
				Account…
			</Button>
		);
	} else if (category) {
		body =
			locked || excluded ? (
				<span
					className="inline-flex min-w-0 items-center gap-1 px-1.5 py-0.5 text-2xs text-tertiary-foreground"
					title={`${category} (locked)`}
				>
					<TagIcon size={11} className="size-3 shrink-0" aria-hidden="true" />
					<span className="truncate">{category}</span>
				</span>
			) : (
				<Button
					variant="secondary"
					size="sm"
					tabIndex={controlTabIndex}
					onClick={onPick}
					className="h-6 min-w-0 gap-1 px-1.5 text-2xs font-normal text-muted-foreground hover:text-foreground shrink [&>span]:min-w-0"
					aria-label={`Category ${category}, change`}
				>
					<TagIcon size={11} className="size-3 shrink-0" aria-hidden="true" />
					<span className="truncate">{category}</span>
				</Button>
			);
	} else if (locked || excluded) {
		return null;
	} else if (suggestion) {
		body = (
			<>
				<Button
					variant="dotted"
					size="sm"
					tabIndex={controlTabIndex}
					onClick={onAccept}
					title={`Accept AI suggestion: ${suggestion.accountName}`}
					className={SUGGEST}
				>
					<SparkleIcon size={11} weight="fill" className="size-3 shrink-0" aria-hidden="true" />
					<span className="sr-only">Accept AI suggestion: </span>
					<span className="truncate">{suggestion.accountName}</span>
					{suggestion.confidence != null && (
						<span className="shrink-0 tabular-nums opacity-75">{pctOf(suggestion.confidence)}</span>
					)}
				</Button>
				<Button
					variant="skeleton"
					size="sm"
					tabIndex={controlTabIndex}
					onClick={onPick}
					aria-label="edit: choose a different category"
					className="h-6 shrink-0 px-1 text-2xs font-normal text-tertiary-foreground"
				>
					edit
				</Button>
			</>
		);
	} else {
		body = (
			<Button
				variant="skeleton"
				size="sm"
				tabIndex={controlTabIndex}
				onClick={onPick}
				className="h-6 px-1 text-2xs font-normal text-tertiary-foreground"
			>
				+ Assign
			</Button>
		);
	}
	return (
		<span className={cn("inline-flex min-w-0 max-w-full items-center gap-1", className)} {...props}>
			{body}
		</span>
	);
}
