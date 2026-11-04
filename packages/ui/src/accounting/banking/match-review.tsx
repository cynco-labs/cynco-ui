"use client";

/**
 * Cynco UI — the proposed matches under a bank line: what it pays, why the
 * matcher thinks so, and what accepting will do.
 */
import { CheckIcon, LinkSimpleIcon, XIcon } from "@phosphor-icons/react";
import { Button, cn, StatusChip } from "../../base";
import type { Amount } from "../../lib/money";
import { formatDate } from "../../lib/shared";
import { FG, signedByType, TINY, type With } from "./shared";

export type BankMatch = {
	id: string;
	/** "Invoice TechNova Sdn Bhd", "Bill Tenaga Nasional". */
	targetLabel: string;
	targetReference: string;
	confidence: number;
	status: "proposed" | "confirmed";
	evidence: string[];
	consequence: string;
};

export type BankLineSummary = {
	date: string;
	payee: string;
	description?: string;
	amount: Amount;
	type: "credit" | "debit";
	currency?: string;
};

function MatchCard({
	match,
	pending,
	onAccept,
	onReject,
}: {
	match: BankMatch;
	pending?: boolean;
	onAccept?: (id: string) => void;
	onReject?: (id: string) => void;
}) {
	const confirmed = match.status === "confirmed";
	return (
		<div className="@container rounded-lg border border-border bg-interactive-secondary px-3 py-2.5">
			<div className="flex flex-col gap-2 @md:flex-row @md:items-start">
				<div className="flex min-w-0 flex-1 items-start gap-2">
					<LinkSimpleIcon size={14} className="size-3.5 mt-[3px] shrink-0 text-primary" aria-hidden="true" />
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
							<span className={cn(FG, "min-w-0 break-words font-medium")}>{match.targetLabel}</span>
							<span className="font-mono text-2xs font-medium whitespace-nowrap text-tertiary-foreground">
								{match.targetReference}
							</span>
							{confirmed ? (
								<StatusChip tone="green" glyph="check">
									Confirmed
								</StatusChip>
							) : (
								<StatusChip
									tone="blue"
									glyph="clock"
									className="tabular-nums"
								>{`${Math.round(match.confidence * 100)}% match`}</StatusChip>
							)}
						</div>
						<p className="mt-1 text-2xs text-muted-foreground">{match.evidence.join(" · ")}</p>
						<p className="mt-1 text-2xs leading-relaxed text-tertiary-foreground">{match.consequence}</p>
					</div>
				</div>
				{!confirmed && (
					<div className="flex shrink-0 items-center gap-1 pl-5 @md:pl-0">
						<Button
							size="sm"
							className="gap-1"
							disabled={pending}
							focusableWhenDisabled
							onClick={() => onAccept?.(match.id)}
							aria-label={`${pending ? "Accepting" : "Accept"} match to ${match.targetLabel} ${match.targetReference}`}
						>
							<CheckIcon size={12} className="size-3" aria-hidden="true" />
							{pending ? "Accepting…" : "Accept"}
						</Button>
						<Button
							variant="skeleton"
							size="sm"
							className="gap-1 text-tertiary-foreground hover:text-error-text"
							disabled={pending}
							focusableWhenDisabled
							onClick={() => onReject?.(match.id)}
							aria-label={`Reject match to ${match.targetLabel} ${match.targetReference}`}
						>
							<XIcon size={12} className="size-3" aria-hidden="true" />
							Reject
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * MatchReview — the proposed matches under a bank line: the invoice or bill
 * it pays, the evidence, what accepting will do, and Accept / Reject. With
 * `line`, the bank line it is matched from heads the panel.
 */
export function BankMatchReview({
	matches,
	line,
	pendingId,
	error,
	onAccept,
	onReject,
	className,
	...props
}: With<{
	matches: BankMatch[];
	line?: BankLineSummary;
	pendingId?: string | null;
	error?: string | null;
	onAccept?: (id: string) => void;
	onReject?: (id: string) => void;
	className?: string;
}>) {
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-1.5", className)} {...props}>
			{line && (
				<div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-1 pb-1">
					<span className="text-2xs uppercase tracking-[0.04em] text-tertiary-foreground">Bank line</span>
					<span className={cn(TINY, "tabular-nums")}>{formatDate(line.date)}</span>
					<span className={cn(FG, "min-w-0 flex-1 basis-40 font-medium")}>
						{line.payee}
						{line.description && <span className="ml-1.5 font-normal text-tertiary-foreground">{line.description}</span>}
					</span>
					<span className={cn(FG, "ml-auto shrink-0 font-medium tabular-nums")}>
						{signedByType(line.amount, line.type, line.currency)}
					</span>
				</div>
			)}
			{matches.map((m) => (
				<MatchCard key={m.id} match={m} pending={pendingId === m.id} onAccept={onAccept} onReject={onReject} />
			))}
			{error && (
				<p
					role="alert"
					className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-2xs text-error-text"
				>
					{error}
				</p>
			)}
		</div>
	);
}
