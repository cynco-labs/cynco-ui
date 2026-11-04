"use client";

/**
 * Cynco UI — where a bank line stands in the pipeline, as the stacked dots a
 * feed row carries.
 */
import { cn } from "../../base";
import type { With } from "./shared";

export type BankFeedStatus = "imported" | "categorized" | "posted" | "reconciled" | "excluded";

const LIFECYCLE_LABELS: Record<BankFeedStatus, string> = {
	imported: "Imported: needs a category",
	categorized: "Categorized: ready to post",
	posted: "Posted to GL: ready to reconcile",
	reconciled: "Reconciled",
	excluded: "Excluded",
};
const STAGE: Record<BankFeedStatus, number> = { imported: 1, categorized: 2, posted: 3, reconciled: 4, excluded: -1 };

/**
 * LifecycleSpine — four stacked dots for imported → categorized → posted →
 * reconciled. Filled dots are primary; a fully settled line reads green; an
 * excluded line is hollow.
 */
export function BankLifecycleSpine({
	status,
	className,
	...props
}: With<{ status: BankFeedStatus; className?: string }, "span">) {
	const stage = STAGE[status];
	const settled = stage === 4;
	return (
		<span
			role="img"
			aria-label={LIFECYCLE_LABELS[status]}
			title={LIFECYCLE_LABELS[status]}
			className={cn("flex flex-col-reverse gap-0.5", className)}
			{...props}
		>
			{[0, 1, 2, 3].map((i) => {
				const filled = stage > 0 && i < stage;
				return (
					<span
						key={i}
						className={cn("size-1 rounded-full", filled ? (settled ? "bg-status-green" : "bg-primary") : "bg-foreground/15")}
					/>
				);
			})}
		</span>
	);
}
