"use client";

import { ArrowRightIcon, ArrowSquareOutIcon, CaretDownIcon, LockIcon, LockOpenIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — closing a fiscal period: the period's own row, the pre-close
 * checklist, and the card for a check Cynco could not verify.
 *
 * Every component sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import * as React from "react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	cn,
	IconButton,
	StatusChip,
	StatusChipIcon,
	Textarea,
	useControllableState,
} from "../../base";
import type { Amount } from "../../lib/money";
import { ActionBar, formatCurrency, surfaces } from "../../lib/shared";
import { CHECK_SEVERITY, type CheckSeverity } from "../shared";
import { periodLabel } from "./shared";

export type LedgerPeriod = {
	period: string;
	fiscalStatus: "open" | "closed" | "locked";
	accountCount: number;
	transactionCount: number;
	totalDebit: Amount;
	totalCredit: Amount;
};

export type PeriodCloseRowProps = React.ComponentProps<"div"> & {
	period: LedgerPeriod;
	isYearEnd?: boolean;
	baseCurrency?: string;
	onClose?: () => void;
	onReopen?: () => void;
	onLock?: () => void;
	onUnlock?: () => void;
};

/** periods/PeriodRow.tsx — one fiscal period: status, totals and its lifecycle actions. */
export function PeriodCloseRow({
	period: p,
	isYearEnd,
	baseCurrency = "MYR",
	onClose,
	onReopen,
	onLock,
	onUnlock,
	className,
	...props
}: PeriodCloseRowProps) {
	const closed = p.fiscalStatus !== "open";
	return (
		<div
			className={cn("flex min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-3", surfaces.card, className)}
			{...props}
		>
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-interactive-secondary text-tertiary-foreground">
					{closed ? <LockIcon size={16} aria-hidden="true" /> : <LockOpenIcon size={16} aria-hidden="true" />}
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm font-semibold text-foreground">{periodLabel(p.period)}</span>
						{isYearEnd && (
							<Badge variant="muted" size="sm">
								Year-End
							</Badge>
						)}
						{closed ? (
							<StatusChip tone="neutral">
								<LockIcon size={12} className="text-tertiary-foreground" aria-hidden="true" />
								{p.fiscalStatus === "locked" ? "Locked" : "Closed"}
							</StatusChip>
						) : (
							<StatusChip tone="green" glyph="play">
								Open
							</StatusChip>
						)}
					</div>
					<div className="mt-0.5 text-2xs text-tertiary-foreground">
						{p.accountCount} account{p.accountCount !== 1 ? "s" : ""} · {p.transactionCount} transaction
						{p.transactionCount !== 1 ? "s" : ""}
					</div>
				</div>
			</div>
			<div className="ml-auto flex flex-wrap items-center justify-end gap-3">
				<div className="text-right text-2xs tabular-nums text-tertiary-foreground">
					<div>Dr {formatCurrency(p.totalDebit, baseCurrency)}</div>
					<div>Cr {formatCurrency(p.totalCredit, baseCurrency)}</div>
				</div>
				<ActionBar>
					{p.fiscalStatus === "locked" ? (
						<IconButton variant="secondary" icon={<LockOpenIcon />} onClick={onUnlock}>
							Unlock
						</IconButton>
					) : closed ? (
						<>
							<IconButton variant="secondary" icon={<LockIcon />} onClick={onLock}>
								Lock
							</IconButton>
							<IconButton variant="secondary" icon={<LockOpenIcon />} onClick={onReopen}>
								Reopen
							</IconButton>
						</>
					) : (
						<IconButton variant="secondary" icon={<LockIcon />} onClick={onClose}>
							Close period
						</IconButton>
					)}
				</ActionBar>
			</div>
		</div>
	);
}

export type CloseCheckStatus = "fail" | "attention" | "warn" | "pass";
export type CloseAttentionCard = {
	key: string;
	title: string;
	accounts?: { code: string; name: string }[];
	why: string;
	risk: string;
	/** Ways to fix it; each with an `href` opens in a new tab, one without is plain text. */
	fixes?: { label: string; href?: string }[];
	fallback?: string;
};
export type CloseCheckItem = {
	id: string;
	status: CloseCheckStatus;
	label: string;
	detail: string;
	task?: "depreciation" | "recognition" | "fxRevaluation";
	unclosedPeriod?: string;
	failure?: string | null;
	attention?: CloseAttentionCard[];
};

/** The close's own statuses on the library's severity scale, so a failing check looks the same here as anywhere else. */
const CHECK_SEVERITY_OF: Record<CloseCheckStatus, CheckSeverity> = {
	fail: "fail",
	attention: "attention",
	warn: "advisory",
	pass: "pass",
};

const CHECK_SECTION: Record<CloseCheckStatus, { title: string; hint?: string }> = {
	fail: { title: "Blocking", hint: "These stop the close. Fix them, or override with a reason." },
	attention: {
		title: "Needs attention",
		hint: "Cynco could not verify these. Fix them, or note why it is fine to close.",
	},
	warn: { title: "Advisories", hint: "For your information. They do not stop the close." },
	pass: { title: "Passed" },
};

const TASK_LABEL = {
	depreciation: "Post depreciation",
	recognition: "Post recognition",
	fxRevaluation: "Run revaluation",
} as const;

function CountChip({ status, count }: { status: CloseCheckStatus; count: number }) {
	const severity = CHECK_SEVERITY[CHECK_SEVERITY_OF[status]];
	return (
		<StatusChip tone={severity.tone} glyph={severity.glyph} className="h-5">
			<span className="tabular-nums">{count}</span>
			<span className="sr-only">{count === 1 ? " check" : " checks"}</span>
		</StatusChip>
	);
}

/** The attention card body shared by the checklist and the standalone card. */
function CloseAttention({
	card,
	note,
	onNote,
	className,
	...props
}: { card: CloseAttentionCard; note: string; onNote: (n: string) => void } & Omit<
	React.ComponentProps<"div">,
	"children"
>) {
	const acknowledged = note.trim().length > 0;
	return (
		<Alert
			variant="warning"
			className={cn("flex min-w-0 flex-col gap-2 p-3", className)}
			role="group"
			aria-label={card.title}
			{...props}
		>
			<AlertTitle className="text-sm font-semibold text-foreground">{card.title}</AlertTitle>
			<AlertDescription className="flex flex-col gap-2 text-wrap @md:text-wrap [&_p:not(:last-child)]:mb-0">
				{card.accounts && card.accounts.length > 0 && (
					<p className="text-2xs text-tertiary-foreground">
						On{" "}
						{card.accounts.map((a, i) => (
							<span key={a.code}>
								{i > 0 && ", "}
								<span className="font-mono text-2xs font-medium">{a.code}</span> {a.name}
							</span>
						))}
					</p>
				)}
				<p className="text-sm text-muted-foreground">{card.why}</p>
				<p className="text-sm text-muted-foreground">{card.risk}</p>
				{card.fixes && card.fixes.length > 0 ? (
					<ul className="flex flex-wrap gap-x-4 gap-y-1">
						{card.fixes.map((f) => (
							<li key={f.label}>
								{f.href ? (
									<a
										href={f.href}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-1 text-sm text-primary hover:underline focus-visible:rounded-sm focus-ring"
									>
										{f.label}
										<ArrowSquareOutIcon size={12} aria-hidden="true" />
										<span className="sr-only">(opens in a new tab)</span>
									</a>
								) : (
									<span className="text-sm text-foreground">{f.label}</span>
								)}
							</li>
						))}
					</ul>
				) : (
					card.fallback && <p className="text-sm text-muted-foreground">{card.fallback}</p>
				)}
				<label className="flex flex-col gap-1">
					<span className="text-sm font-medium text-muted-foreground">
						{acknowledged ? "Acknowledged. Note for the close record" : "Closing anyway? Add a note for the close record"}
					</span>
					<Textarea
						value={note}
						maxLength={500}
						rows={2}
						onChange={(e) => onNote(e.target.value)}
						placeholder="What you checked, and why it is fine to close"
						className="min-h-14"
					/>
				</label>
			</AlertDescription>
		</Alert>
	);
}

export type PeriodCloseAttentionCardProps = Omit<React.ComponentProps<"div">, "children"> & {
	card: CloseAttentionCard;
	/** Controlled note. */
	note?: string;
	/** Initial note for uncontrolled use. */
	defaultNote?: string;
	onNoteChange?: (n: string) => void;
};

/** periods/AttentionCardView.tsx — a check Cynco could not verify, with fixes and the closer's note. */
export function PeriodCloseAttentionCard({
	card,
	note: noteProp,
	defaultNote = "",
	onNoteChange,
	...props
}: PeriodCloseAttentionCardProps) {
	const [note = defaultNote, setNote] = useControllableState({
		prop: noteProp,
		defaultProp: defaultNote,
		onChange: onNoteChange,
	});
	return <CloseAttention card={card} note={note} onNote={setNote} {...props} />;
}

export type PeriodCloseChecklistProps = React.ComponentProps<"div"> & {
	items: CloseCheckItem[];
	/** Controlled attention-card notes, keyed by `CloseAttentionCard.key`. */
	notes?: Record<string, string>;
	/** Initial notes for uncontrolled use. */
	defaultNotes?: Record<string, string>;
	onNotesChange?: (notes: Record<string, string>) => void;
	runningTask?: CloseCheckItem["task"] | null;
	busy?: boolean;
	onRunTask?: (task: NonNullable<CloseCheckItem["task"]>) => void;
	onClosePeriodFirst?: (period: string) => void;
};

/** periods/CloseChecklist.tsx — pre-close checks grouped worst first; passed checks fold away. */
export function PeriodCloseChecklist({
	items,
	notes: notesProp,
	defaultNotes,
	onNotesChange,
	runningTask,
	busy,
	onRunTask,
	onClosePeriodFirst,
	className,
	...props
}: PeriodCloseChecklistProps) {
	const order: CloseCheckStatus[] = ["fail", "attention", "warn", "pass"];
	const groups = order
		.map((s) => ({ status: s, items: items.filter((i) => i.status === s) }))
		.filter((g) => g.items.length);
	const onlyPassed = groups.length === 1 && groups[0]!.status === "pass";
	const [notes = {}, setNotes] = useControllableState<Record<string, string>>({
		prop: notesProp,
		defaultProp: defaultNotes ?? {},
		onChange: onNotesChange,
	});
	const [passedOpen, setPassedOpen] = React.useState<boolean | null>(null);
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			{groups.map(({ status, items: group }) => {
				const section = CHECK_SECTION[status];
				const severity = CHECK_SEVERITY[CHECK_SEVERITY_OF[status]];
				if (status === "pass") {
					const open = passedOpen ?? onlyPassed;
					return (
						<Collapsible
							key={status}
							open={open}
							onOpenChange={setPassedOpen}
							className="overflow-hidden rounded-xl border bg-table-tray"
						>
							<h3>
								<CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-foreground outline-none focus-ring-inset">
									<span className="flex items-center gap-2">
										{section.title}
										<CountChip status="pass" count={group.length} />
									</span>
									<span aria-hidden="true" className="flex items-center gap-1 text-2xs font-normal text-tertiary-foreground">
										{open ? "Hide" : "Show"}
										<CaretDownIcon size={12} className={cn("transition-transform", open && "rotate-180")} />
									</span>
								</CollapsibleTrigger>
							</h3>
							<CollapsibleContent>
								<ul className="grid gap-x-6 gap-y-3 border-t bg-card p-4 @xl:grid-cols-2">
									{group.map((item) => (
										<li key={item.id} className="flex min-w-0 gap-2.5">
											<StatusChipIcon tone={severity.tone} glyph={severity.glyph} className="mt-0.5" />
											<div className="flex min-w-0 flex-col">
												<span className="text-sm text-foreground">{item.label}</span>
												<span className="text-2xs text-tertiary-foreground">{item.detail}</span>
											</div>
										</li>
									))}
								</ul>
							</CollapsibleContent>
						</Collapsible>
					);
				}
				return (
					<section key={status} className="overflow-hidden rounded-xl border bg-table-tray">
						<div className="flex flex-col gap-0.5 px-4 py-3">
							<h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
								{section.title}
								<CountChip status={status} count={group.length} />
							</h3>
							{section.hint && <p className="text-2xs text-tertiary-foreground">{section.hint}</p>}
						</div>
						<ul className="divide-y border-t bg-card">
							{group.map((item) => (
								<li key={item.id} className="flex gap-3 px-4 py-3.5">
									<StatusChipIcon tone={severity.tone} glyph={severity.glyph} className="mt-0.5" />
									<div className="flex min-w-0 flex-1 flex-col gap-0.5">
										<span className="text-sm font-semibold text-foreground">{item.label}</span>
										<span className="text-sm text-muted-foreground">{item.detail}</span>
										{item.failure && (
											<p role="alert" className={cn("mt-1 text-2xs", surfaces.negative)}>
												{item.failure}
											</p>
										)}
										{item.attention?.map((card) => (
											<CloseAttention
												key={card.key}
												className="mt-3"
												card={card}
												note={notes[card.key] ?? ""}
												onNote={(n) => setNotes({ ...notes, [card.key]: n })}
											/>
										))}
										{(item.task || item.unclosedPeriod) && (
											<ActionBar className="mt-2.5">
												{item.task && (
													<Button
														variant="secondary"
														isLoading={runningTask === item.task}
														disabled={busy}
														onClick={() => onRunTask?.(item.task!)}
													>
														{TASK_LABEL[item.task]}
													</Button>
												)}
												{item.unclosedPeriod && (
													<IconButton
														variant="secondary"
														iconOrientation="right"
														icon={<ArrowRightIcon />}
														disabled={busy}
														onClick={() => onClosePeriodFirst?.(item.unclosedPeriod!)}
													>
														{`Close ${periodLabel(item.unclosedPeriod)} first`}
													</IconButton>
												)}
											</ActionBar>
										)}
									</div>
								</li>
							))}
						</ul>
					</section>
				);
			})}
		</div>
	);
}
