"use client";

/**
 * Cynco UI — the glass-box "why" trail for one bank line: who did what, on
 * whose authority, and how sure they were.
 */
import { GearIcon, type Icon, ScalesIcon, ShieldCheckIcon, SparkleIcon, UserIcon } from "@phosphor-icons/react";
import { cn } from "../../base";
import { formatDate } from "../../lib/shared";
import { pctOf, type With } from "./shared";

export type BankTxEvent = {
	actor: "rule" | "ai" | "policy" | "system" | "user";
	action: string;
	at?: string;
	reasoning?: string | null;
	confidence?: number | null;
	ruleStats?: { applied: number; overridden: number } | null;
	policy?: string | null;
};

const ACTOR: Record<BankTxEvent["actor"], { label: string; Icon: Icon; cls: string }> = {
	rule: { label: "Rule", Icon: ScalesIcon, cls: "text-muted-foreground" },
	ai: { label: "AI", Icon: SparkleIcon, cls: "text-primary" },
	policy: { label: "Policy", Icon: ShieldCheckIcon, cls: "text-muted-foreground" },
	system: { label: "System", Icon: GearIcon, cls: "text-tertiary-foreground" },
	user: { label: "You", Icon: UserIcon, cls: "text-foreground" },
};
const ACTION_LABEL: Record<string, string> = {
	categorize: "Categorized",
	match: "Matched",
	match_rejected: "Match rejected",
	post: "Posted",
	unpost: "Unposted",
	reconcile: "Reconciled",
	unreconcile: "Reconciliation undone",
	unexclude: "Returned to the books",
	import: "Imported",
	split: "Split",
	transfer: "Transfer detected",
	exclude: "Excluded",
	auto_post: "Auto-post",
};

/** TransactionTimeline — the glass-box "why" trail for one bank line, newest first. Narrow: dates drop under each event. */
export function BankTransactionTimeline({
	events,
	className,
	...props
}: With<{ events: BankTxEvent[]; className?: string }, "ul">) {
	if (events.length === 0) return null;
	const ordered = [...events].reverse();
	return (
		<ul className={cn("@container flex flex-col gap-2.5", className)} {...props}>
			{ordered.map((e, i) => {
				const meta = ACTOR[e.actor] ?? ACTOR.system;
				const { Icon } = meta;
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: events carry no id in the public type and the sorted list is replaced wholesale
					<li key={`${e.at}-${i}`} className="flex gap-2 text-2xs">
						<Icon
							size={14}
							weight={e.actor === "ai" ? "fill" : "regular"}
							className={cn("mt-px shrink-0", meta.cls)}
							role="img"
							aria-label={meta.label}
						/>
						<div className="min-w-0 flex-1">
							<p className="flex flex-wrap items-baseline gap-x-1.5 text-foreground">
								<span className="font-medium">{e.reasoning ?? ACTION_LABEL[e.action] ?? e.action}</span>
								{e.confidence != null && <span className="tabular-nums text-tertiary-foreground">{pctOf(e.confidence)}</span>}
							</p>
							{e.ruleStats && (
								<p className="text-tertiary-foreground">
									applied {e.ruleStats.applied}× · overridden {e.ruleStats.overridden}×
								</p>
							)}
							{e.policy && <p className="text-muted-foreground">{e.policy}</p>}
							{e.at && <time className="tabular-nums text-tertiary-foreground @sm:hidden">{formatDate(e.at)}</time>}
						</div>
						{e.at && (
							<time className="hidden shrink-0 tabular-nums text-tertiary-foreground @sm:block">{formatDate(e.at)}</time>
						)}
					</li>
				);
			})}
		</ul>
	);
}
