/**
 * Cynco UI — banking & reconciliation.
 * Hand-written presentational ports of remix/app/components/banking/*:
 * the feed (rows, category cell, match review, review card, posting summary,
 * lifecycle spine, why-timeline), the balance-equation proof (statement and
 * month end), the month-end close (year strip, proof, sign-off), the account
 * rail, categorisation rules and the cash-flow chart.
 *
 * Every component sizes itself by its CONTAINER (`@container` + `@sm:`/`@lg:`
 * variants), takes `className` and spreads native props on its root.
 */
import * as React from "react";
import {
	Button,
	Checkbox,
	GroupedTabButton,
	Input,
	StatusChip,
	StatusChipIcon,
	StatusRing,
	ToolbarButton,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	cn,
	useControllableState,
	type StatusTone,
	type StatusGlyph,
} from "../base";
import {
	ArrowsLeftRightIcon,
	ArrowCounterClockwiseIcon,
	SparkleIcon,
	TagIcon,
	MagnifyingGlassIcon,
	LinkSimpleIcon,
	CheckIcon,
	XIcon,
	EyeSlashIcon,
	ScalesIcon,
	ShieldCheckIcon,
	GearIcon,
	UserIcon,
	WarningIcon,
	SealCheckIcon,
	CircleIcon,
	ArrowRightIcon,
	ArrowSquareOutIcon,
	FileArrowUpIcon,
	LockSimpleIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CaretDownIcon,
	BankIcon,
	CreditCardIcon,
	WalletIcon,
	PlusIcon,
	PlugsIcon,
	LightningIcon,
	type Icon,
} from "@phosphor-icons/react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { formatCurrency, formatCurrencyCompact, formatDate, surfaces, negativeClass, DataList, ActionBar, SectionPanel, type DataColumn } from "../lib/shared";

/* ------------------------------------------------------------------ shared bits */

/** Own props win over the native ones of the root element. */
type With<O, E extends keyof React.JSX.IntrinsicElements = "div"> = O & Omit<React.ComponentProps<E>, keyof O>;

/** 13px copy in the two text steps the banking views use (`text-body` would pin muted-foreground). */
const FG = "text-sm leading-5 text-foreground";
const MUTED = "text-sm leading-5 text-tertiary-foreground";
const TINY = "text-2xs leading-4 text-tertiary-foreground";

function signedByType(amount: number, type: "credit" | "debit", currency = "MYR") {
	return `${type === "credit" ? "+" : "−"}${formatCurrency(Math.abs(amount), currency)}`;
}


function countOf(n: number, word: string) {
	return `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
}

/* ------------------------------------------------------------------ lifecycle */

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
export function BankLifecycleSpine({ status, className, ...props }: With<{ status: BankFeedStatus; className?: string }, "span">) {
	const stage = STAGE[status];
	const settled = stage === 4;
	return (
		<span role="img" aria-label={LIFECYCLE_LABELS[status]} title={LIFECYCLE_LABELS[status]} className={cn("flex flex-col-reverse gap-0.5", className)} {...props}>
			{[0, 1, 2, 3].map((i) => {
				const filled = stage > 0 && i < stage;
				return <span key={i} className={cn("size-1 rounded-full", filled ? (settled ? "bg-status-green" : "bg-primary") : "bg-foreground/15")} />;
			})}
		</span>
	);
}

/** Per-account horizontal aggregate of the same pipeline (band widths are data-driven). */
function SettledMeter({ counts, className }: { counts: Partial<Record<BankFeedStatus, number>>; className?: string }) {
	const imported = counts.imported ?? 0;
	const categorized = counts.categorized ?? 0;
	const posted = counts.posted ?? 0;
	const reconciled = counts.reconciled ?? 0;
	const total = imported + categorized + posted + reconciled;
	if (total === 0) return null;
	const pct = Math.round((reconciled / total) * 100);
	const bands = [
		{ key: "reconciled", n: reconciled, cls: "bg-status-green" },
		{ key: "posted", n: posted, cls: "bg-primary" },
		{ key: "categorized", n: categorized, cls: "bg-primary/40" },
		{ key: "imported", n: imported, cls: "bg-status-amber/70" },
	].filter((b) => b.n > 0);
	return (
		<span
			role="img"
			aria-label={`${pct}% reconciled: ${imported} to categorize, ${categorized} to post, ${posted} to reconcile`}
			title={`${pct}% reconciled`}
			className={cn("flex h-[3px] w-full gap-px overflow-hidden rounded-full", className) /* 3px hairline, off the spacing scale */}
		>
			{bands.map((b) => (
				<span key={b.key} className={cn("h-full rounded-full", b.cls)} style={{ width: `${(b.n / total) * 100}%` }} />
			))}
		</span>
	);
}

/* ------------------------------------------------------------------ confidence */

type Tier = "high" | "medium" | "low";
function tierOf(c: number): Tier {
	return c >= 0.9 ? "high" : c >= 0.7 ? "medium" : "low";
}
const TIER: Record<Tier, { tone: StatusTone; glyph: StatusGlyph; word: string }> = {
	high: { tone: "green", glyph: "check", word: "High" },
	medium: { tone: "amber", glyph: "alert", word: "Medium" },
	low: { tone: "red", glyph: "x", word: "Low" },
};
const pctOf = (c: number) => `${Math.round(c * 100)}%`;

/** Tiny ring in primary, fill ∝ AI confidence (cynco ReviewCard ConfidenceRing). */
function ConfidenceRing({ value, className, ...props }: With<{ value: number; className?: string }, "span">) {
	return (
		<span className={cn("inline-flex items-center gap-1", className)} title={`${pctOf(value)} confidence`} {...props}>
			<StatusRing tone="purple" fraction={value} className="size-3.5" />
			<span className="text-sm tabular-nums text-primary">{pctOf(value)}</span>
		</span>
	);
}

/**
 * Confidence, rendered. `badge` is the tier chip used where a proposal is
 * listed (≥90 high, 70–89 medium, <70 low); `ring` is the primary ring the
 * review card shows beside a suggestion; `inline` is the bare percent.
 */
export function BankConfidenceMeter({
	confidence,
	variant = "badge",
	showTier = false,
	className,
	...props
}: With<{ confidence: number | null | undefined; variant?: "badge" | "ring" | "inline"; showTier?: boolean; className?: string }, "span">) {
	if (confidence == null || !Number.isFinite(confidence)) return null;
	if (variant === "ring") return <ConfidenceRing value={confidence} className={className} {...props} />;
	if (variant === "inline") return <span className={cn("shrink-0 text-sm tabular-nums text-primary", className)} {...props}>{pctOf(confidence)}</span>;
	const t = TIER[tierOf(confidence)];
	return (
		<StatusChip tone={t.tone} glyph={t.glyph} className={cn("tabular-nums", className)} title={`${t.word} confidence`} {...props}>
			{showTier ? `${pctOf(confidence)} · ${t.word}` : pctOf(confidence)}
		</StatusChip>
	);
}

/* ------------------------------------------------------------------ category cell */

export type BankCoaSuggestion = { accountCode?: string; accountName: string; confidence?: number | null };

/** The dashed primary chip an AI suggestion is drawn as. */
const SUGGEST = "h-6 min-w-0 shrink gap-1 [&>span]:min-w-0 border-dashed border-primary/45 bg-active-primary px-1.5 text-2xs font-normal text-primary hover:border-solid hover:bg-active-primary";

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
		className?: string;
	},
	"span"
>) {
	const locked = status === "posted" || status === "reconciled";
	const excluded = status === "excluded";
	let body: React.ReactNode = null;
	if (picking) {
		body = (
			<Button variant="secondary" size="sm" className="w-44 max-w-full justify-start gap-1.5 font-normal text-tertiary-foreground" aria-label="Account…: search chart of accounts" onClick={onPick}>
				<MagnifyingGlassIcon size={12} className="size-3" aria-hidden="true" />
				Account…
			</Button>
		);
	} else if (category) {
		body =
			locked || excluded ? (
				<span className="inline-flex min-w-0 items-center gap-1 px-1.5 py-0.5 text-2xs text-tertiary-foreground" title={`${category} (locked)`}>
					<TagIcon size={11} className="size-3 shrink-0" aria-hidden="true" />
					<span className="truncate">{category}</span>
				</span>
			) : (
				<Button variant="secondary" size="sm" onClick={onPick} className="h-6 min-w-0 gap-1 px-1.5 text-2xs font-normal text-muted-foreground hover:text-foreground shrink [&>span]:min-w-0" aria-label={`Category ${category}, change`}>
					<TagIcon size={11} className="size-3 shrink-0" aria-hidden="true" />
					<span className="truncate">{category}</span>
				</Button>
			);
	} else if (locked || excluded) {
		return null;
	} else if (suggestion) {
		body = (
			<>
				<Button variant="dotted" size="sm" onClick={onAccept} title={`Accept AI suggestion: ${suggestion.accountName}`} className={SUGGEST}>
					<SparkleIcon size={11} weight="fill" className="size-3 shrink-0" aria-hidden="true" />
					<span className="sr-only">Accept AI suggestion: </span>
					<span className="truncate">{suggestion.accountName}</span>
					{suggestion.confidence != null && <span className="shrink-0 tabular-nums opacity-75">{pctOf(suggestion.confidence)}</span>}
				</Button>
				<Button variant="skeleton" size="sm" onClick={onPick} aria-label="edit: choose a different category" className="h-6 shrink-0 px-1 text-2xs font-normal text-tertiary-foreground">
					edit
				</Button>
			</>
		);
	} else {
		body = (
			<Button variant="skeleton" size="sm" onClick={onPick} className="h-6 px-1 text-2xs font-normal text-tertiary-foreground">
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

/* ------------------------------------------------------------------ match review */

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

export type BankLineSummary = { date: string; payee: string; description?: string; amount: number; type: "credit" | "debit"; currency?: string };

function MatchCard({ match, pending, onAccept, onReject }: { match: BankMatch; pending?: boolean; onAccept?: (id: string) => void; onReject?: (id: string) => void }) {
	const confirmed = match.status === "confirmed";
	return (
		<div className="@container rounded-lg border border-border bg-interactive-secondary px-3 py-2.5">
			<div className="flex flex-col gap-2 @md:flex-row @md:items-start">
				<div className="flex min-w-0 flex-1 items-start gap-2">
					<LinkSimpleIcon size={14} className="size-3.5 mt-[3px] shrink-0 text-primary" aria-hidden="true" />
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
							<span className={cn(FG, "min-w-0 break-words font-medium")}>{match.targetLabel}</span>
							<span className="text-tiny-id whitespace-nowrap text-tertiary-foreground">{match.targetReference}</span>
							{confirmed ? (
								<StatusChip tone="green" glyph="check">Confirmed</StatusChip>
							) : (
								<StatusChip tone="blue" glyph="clock" className="tabular-nums">{`${Math.round(match.confidence * 100)}% match`}</StatusChip>
							)}
						</div>
						<p className="mt-1 text-2xs text-muted-foreground">{match.evidence.join(" · ")}</p>
						<p className="mt-1 text-2xs leading-relaxed text-tertiary-foreground">{match.consequence}</p>
					</div>
				</div>
				{!confirmed && (
					<div className="flex shrink-0 items-center gap-1 pl-5 @md:pl-0">
						<Button size="sm" className="gap-1" disabled={pending} focusableWhenDisabled onClick={() => onAccept?.(match.id)} aria-label={`${pending ? "Accepting" : "Accept"} match to ${match.targetLabel} ${match.targetReference}`}>
							<CheckIcon size={12} className="size-3" aria-hidden="true" />
							{pending ? "Accepting…" : "Accept"}
						</Button>
						<Button variant="skeleton" size="sm" className="gap-1 text-tertiary-foreground hover:!text-error-text" disabled={pending} focusableWhenDisabled onClick={() => onReject?.(match.id)} aria-label={`Reject match to ${match.targetLabel} ${match.targetReference}`}>
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
}: With<{ matches: BankMatch[]; line?: BankLineSummary; pendingId?: string | null; error?: string | null; onAccept?: (id: string) => void; onReject?: (id: string) => void; className?: string }>) {
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
					<span className={cn(FG, "ml-auto shrink-0 font-medium tabular-nums")}>{signedByType(line.amount, line.type, line.currency)}</span>
				</div>
			)}
			{matches.map((m) => (
				<MatchCard key={m.id} match={m} pending={pendingId === m.id} onAccept={onAccept} onReject={onReject} />
			))}
			{error && (
				<p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-2xs text-error-text">
					{error}
				</p>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ feed */

export type BankLineFlag = "government_credit_as_revenue" | "money_in_to_expense" | "unusually_large";
const LINE_FLAG_LABELS: Record<BankLineFlag, { label: string; title: string }> = {
	government_credit_as_revenue: { label: "refund as revenue?", title: "Money from a government payer coded to revenue. Tax refunds and grants are usually not sales." },
	money_in_to_expense: { label: "money in to expense?", title: "Money in coded to an expense account. Check it is a refund of that expense." },
	unusually_large: { label: "unusually large", title: "Over 10× this bank account's median line in the last 12 months." },
};

export type BankFeedTransaction = {
	id: string;
	date: string;
	payeeName?: string | null;
	description?: string | null;
	reference?: string | null;
	type: "credit" | "debit";
	amount: number;
	currency?: string;
	status: BankFeedStatus;
	category?: string | null;
	suggestion?: BankCoaSuggestion | null;
	isTransfer?: boolean;
	flags?: BankLineFlag[];
	excludeReason?: string | null;
	account?: { name: string; color?: string | null };
	matches?: BankMatch[];
};

function FlagChip({ icon, children, title }: { icon: React.ReactNode; children: React.ReactNode; title: string }) {
	return (
		<span title={title} className="inline-flex h-4.5 shrink-0 items-center gap-1 rounded-md border border-foreground/6 bg-foreground/4 px-1 text-2xs whitespace-nowrap text-muted-foreground">
			{icon}
			{children}
			<span className="sr-only">: {title}</span>
		</span>
	);
}

/**
 * FeedRow — [checkbox] [lifecycle spine] [payee + context badges] [category] [amount],
 * with matches beneath. Narrow: the payee wraps to two lines and the category
 * drops under it, the amount stays top right.
 */
export function BankFeedRow({
	tx,
	selected: selectedProp,
	defaultSelected = false,
	onSelectedChange,
	showAccount = false,
	className,
	...props
}: With<{
	tx: BankFeedTransaction;
	/** Whether the row's checkbox is ticked (controlled). */
	selected?: boolean;
	/** Initial tick state when uncontrolled. */
	defaultSelected?: boolean;
	/** Called when the checkbox is toggled by click or Space. */
	onSelectedChange?: (selected: boolean) => void;
	showAccount?: boolean;
	className?: string;
}>) {
	const [selected = false, setSelected] = useControllableState({ prop: selectedProp, defaultProp: defaultSelected, onChange: onSelectedChange });
	const excluded = tx.status === "excluded";
	const primary = tx.payeeName || tx.description || "";
	const secondary = tx.payeeName && tx.description && tx.description !== primary ? tx.description : tx.reference;
	return (
		<div className={cn("@container border-b border-table-row-divider last:border-b-0", className)} {...props}>
			<div className={cn("group/row flex items-start gap-2.5 px-3 py-2 transition-colors @lg:items-center", selected ? "bg-active-primary" : "hover:bg-table-row-hover")}>
				<Checkbox checked={selected} onCheckedChange={setSelected} aria-label={`Select ${primary || "transaction"}, ${formatDate(tx.date)}, ${signedByType(tx.amount, tx.type, tx.currency)}`} className={cn("mt-1 @lg:mt-0", !selected && "opacity-50 group-hover/row:opacity-100")} />
				<BankLifecycleSpine status={tx.status} className="mt-1 shrink-0 @lg:mt-0" />
				<div className="flex min-w-0 flex-1 flex-col gap-1 @lg:flex-row @lg:items-center @lg:gap-3">
					<div className={cn("min-w-0 flex-1", excluded && "text-tertiary-foreground")}>
						<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 @lg:flex-nowrap">
							<span className={cn(FG, "line-clamp-2 min-w-0 font-medium break-words @lg:line-clamp-none @lg:truncate", excluded && "line-through decoration-tertiary-foreground/60")}>{primary}</span>
							{tx.isTransfer && (
								<FlagChip title="Internal transfer, paired with its mirror leg" icon={<ArrowsLeftRightIcon size={10} className="size-2.5" aria-hidden="true" />}>
									transfer
								</FlagChip>
							)}
							{tx.flags?.map((f) => (
								<FlagChip key={f} title={LINE_FLAG_LABELS[f].title} icon={<StatusChipIcon tone="amber" glyph="alert" className="size-3" />}>
									{LINE_FLAG_LABELS[f].label}
								</FlagChip>
							))}
						</div>
						<div className={cn(TINY, "mt-px flex min-w-0 flex-wrap items-center gap-x-1.5 @lg:flex-nowrap")}>
							{showAccount && tx.account && (
								<span className="inline-flex shrink-0 items-center gap-1">
									<span aria-hidden="true" className={cn("size-1.5 rounded-full", !tx.account.color && "bg-tertiary-foreground/60")} style={tx.account.color ? { backgroundColor: tx.account.color } : undefined} />
									{tx.account.name}
								</span>
							)}
							{showAccount && tx.account && (secondary || (excluded && tx.excludeReason)) && <span aria-hidden="true">·</span>}
							{excluded && tx.excludeReason ? <span className="min-w-0 truncate italic">excluded: {tx.excludeReason}</span> : secondary && <span className="min-w-0 truncate">{secondary}</span>}
						</div>
					</div>
					<div className="min-w-0 shrink-0 @lg:max-w-56">
						{excluded ? (
							<Button variant="skeleton" size="sm" className="-ml-1.5 gap-1 text-tertiary-foreground @lg:ml-0">
								<ArrowCounterClockwiseIcon size={12} className="size-3" aria-hidden="true" />
								Restore
							</Button>
						) : (
							<BankCategoryCell status={tx.status} category={tx.category} suggestion={tx.suggestion} />
						)}
					</div>
				</div>
				<span className={cn(FG, "shrink-0 text-right font-medium whitespace-nowrap tabular-nums @lg:min-w-26", excluded && "text-tertiary-foreground line-through")}>{signedByType(tx.amount, tx.type, tx.currency)}</span>
			</div>
			{tx.matches && tx.matches.length > 0 && (
				<div className="border-t border-table-row-divider bg-table-row-hover px-3 py-2 @lg:pl-14">
					<BankMatchReview matches={tx.matches} />
				</div>
			)}
		</div>
	);
}

export type BankFeedDay = { date: string; rows: BankFeedTransaction[]; net?: { amount: number; currency?: string } | null };

/**
 * FeedStream — the day-grouped, cross-account transaction stream: toolbar
 * (search, lifecycle filter, count, Post all), day headers carrying the
 * day's net, and FeedRows on Cynco UI's tray surface.
 */
export function BankFeedList({
	days,
	total,
	statusLabel = "All statuses",
	search,
	showAccount = true,
	selectedIds: selectedIdsProp,
	defaultSelectedIds = [],
	onSelectedChange,
	postAll,
	className,
	...props
}: With<{
	days: BankFeedDay[];
	total: number;
	statusLabel?: string;
	search?: string;
	showAccount?: boolean;
	/** Ids of the ticked rows (controlled). */
	selectedIds?: string[];
	/** Initially ticked row ids when uncontrolled. */
	defaultSelectedIds?: string[];
	/** Called with the new ids when a row is ticked or unticked. */
	onSelectedChange?: (ids: string[]) => void;
	/** "RM 4,210.00 in · RM 1,180.40 out" shown on Post all, when filtered to To post. */
	postAll?: string;
	className?: string;
}>) {
	const [selectedIds = [], setSelectedIds] = useControllableState({ prop: selectedIdsProp, defaultProp: defaultSelectedIds, onChange: onSelectedChange });
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			<ActionBar>
				<div className="relative min-w-40 max-w-xs flex-1 basis-48">
					<MagnifyingGlassIcon size={13} className="size-3 pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-tertiary-foreground" aria-hidden="true" />
					<Input aria-label="Search transactions" placeholder="Search payee, description, reference…" defaultValue={search} className="!pl-7" />
				</div>
				<Button variant="secondary" className="gap-1.5">
					<span className="sr-only">Status filter: </span>
					{statusLabel}
					<CaretDownIcon size={12} className="size-3" aria-hidden="true" />
				</Button>
				<span role="status" className={cn(TINY, "ml-auto tabular-nums")}>{countOf(total, "transaction")}</span>
				{postAll && (
					<Button title={postAll} className="gap-1.5">
						Post all
					</Button>
				)}
			</ActionBar>
			<div className={surfaces.tray}>
				{days.map((day, i) => (
					<section key={day.date} aria-label={formatDate(day.date)} className={cn(i > 0 && "mt-1")}>
						<header className="flex h-7 items-center justify-between gap-3 px-2.5">
							<h3 className="text-2xs font-medium text-tertiary-foreground">{formatDate(day.date)}</h3>
							{day.net && (
								<span className="text-2xs tabular-nums text-tertiary-foreground">
									{day.net.amount >= 0 ? "+" : "−"}
									{formatCurrency(Math.abs(day.net.amount), day.net.currency)}
								</span>
							)}
						</header>
						<div className={surfaces.surface}>
							{day.rows.map((tx) => (
								<BankFeedRow
									key={tx.id}
									tx={tx}
									showAccount={showAccount}
									selected={selectedIds.includes(tx.id)}
									onSelectedChange={(on) => setSelectedIds(on ? [...selectedIds, tx.id] : selectedIds.filter((id) => id !== tx.id))}
								/>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ timeline */

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
	categorize: "Categorized", match: "Matched", match_rejected: "Match rejected", post: "Posted", unpost: "Unposted", reconcile: "Reconciled",
	unreconcile: "Reconciliation undone", unexclude: "Returned to the books", import: "Imported", split: "Split", transfer: "Transfer detected", exclude: "Excluded", auto_post: "Auto-post",
};

/** TransactionTimeline — the glass-box "why" trail for one bank line, newest first. Narrow: dates drop under each event. */
export function BankTransactionTimeline({ events, className, ...props }: With<{ events: BankTxEvent[]; className?: string }, "ul">) {
	if (events.length === 0) return null;
	const ordered = [...events].reverse();
	return (
		<ul className={cn("@container flex flex-col gap-2.5", className)} {...props}>
			{ordered.map((e, i) => {
				const meta = ACTOR[e.actor] ?? ACTOR.system;
				const { Icon } = meta;
				return (
					<li key={`${e.at}-${i}`} className="flex gap-2 text-2xs">
						<Icon size={14} weight={e.actor === "ai" ? "fill" : "regular"} className={cn("mt-px shrink-0", meta.cls)} role="img" aria-label={meta.label} />
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
						{e.at && <time className="hidden shrink-0 tabular-nums text-tertiary-foreground @sm:block">{formatDate(e.at)}</time>}
					</li>
				);
			})}
		</ul>
	);
}

/* ------------------------------------------------------------------ review card */

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
	className,
	...props
}: With<{
	tx: Pick<BankFeedTransaction, "payeeName" | "description" | "date" | "type" | "amount" | "currency" | "suggestion">;
	accountName?: string;
	active?: boolean;
	picking?: boolean;
	events?: BankTxEvent[];
	className?: string;
}>) {
	const suggestion = tx.suggestion;
	return (
		<div className={cn("@container min-w-0 rounded-xl border px-3.5 py-3 transition-colors", active ? "border-primary/45 bg-interactive-secondary shadow-sm" : "border-border bg-card", className)} {...props}>
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
				<span className="shrink-0 text-md font-medium whitespace-nowrap tabular-nums text-foreground">{signedByType(tx.amount, tx.type, tx.currency)}</span>
			</div>
			<div className="mt-2.5 flex flex-wrap items-center gap-1.5">
				{picking ? (
					<BankCategoryCell status="imported" picking />
				) : suggestion ? (
					<Button variant="dotted" size="sm" className={cn(SUGGEST, "max-w-full gap-1.5 px-2")}>
						<SparkleIcon size={12} className="size-3" weight="fill" aria-hidden="true" />
						<span className="sr-only">Accept AI suggestion: </span>
						{suggestion.accountCode && <span className="text-tiny-id opacity-80">{suggestion.accountCode}</span>}
						<span className="truncate">{suggestion.accountName}</span>
						{suggestion.confidence != null && <ConfidenceRing value={suggestion.confidence} />}
					</Button>
				) : (
					<Button variant="secondary" size="sm" className="gap-1.5 font-normal">
						<TagIcon size={12} className="size-3" aria-hidden="true" />
						Choose category
					</Button>
				)}
				{active && !picking && (
					<span className="ml-auto flex items-center gap-0.5">
						{suggestion && (
							<Button variant="skeleton" size="sm" className="text-tertiary-foreground">
								Change
							</Button>
						)}
						<Button variant="skeleton" size="sm" className="gap-1 text-tertiary-foreground hover:!text-error-text">
							<EyeSlashIcon size={12} className="size-3" aria-hidden="true" />
							Exclude
						</Button>
						<Button variant="skeleton" size="sm" className="text-tertiary-foreground">
							Skip
						</Button>
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

/* ------------------------------------------------------------------ posting summary */

export type BankPostingTotal = { accountCode: string | null; accountName: string | null; type: "credit" | "debit"; count: number; total: number; currency?: string };
const postingKey = (t: BankPostingTotal) => `${t.accountCode}|${t.type}`;

/**
 * PostingSummary — what "To post" will put in the ledger, per account and
 * direction, before any of it is posted. Each row narrows the feed to its
 * lines. A DataList: tray table when wide, stacked rows when narrow.
 */
export function BankPostingSummary({
	totals,
	activeKey,
	onSelect,
	className,
	...props
}: With<{ totals: BankPostingTotal[]; activeKey?: string | null; onSelect?: (key: string | null) => void; className?: string }, "section">) {
	if (totals.length === 0) return null;
	const rows = [...totals].sort((a, b) => (a.accountCode ?? "").localeCompare(b.accountCode ?? "") || a.type.localeCompare(b.type));
	const columns: DataColumn<BankPostingTotal>[] = [
		{
			key: "account",
			header: "Account",
			mobile: "title",
			cell: (t) => (
				<span className="flex min-w-0 items-baseline gap-2">
					{/* The selected row filters the feed: a glyph and a word, not the row tint alone. */}
					{postingKey(t) === activeKey && (
						<>
							<CheckIcon size={12} weight="bold" className="size-3 shrink-0 self-center text-primary" aria-hidden="true" />
							<span className="sr-only">Selected, filtering the feed: </span>
						</>
					)}
					{t.accountCode ? (
						<>
							<span className="text-tiny-id shrink-0 text-tertiary-foreground">{t.accountCode}</span>
							<span className="min-w-0 break-words">{t.accountName}</span>
						</>
					) : (
						<span className="font-normal italic text-tertiary-foreground">Account no longer in the chart</span>
					)}
				</span>
			),
		},
		{ key: "direction", header: "Direction", mobile: "badge", cell: (t) => <span className="text-2xs text-tertiary-foreground">{t.type === "credit" ? "money in" : "money out"}</span> },
		{ key: "lines", header: "Lines", mobile: "badge", align: "right", cell: (t) => <span className="text-2xs text-tertiary-foreground">{countOf(t.count, "line")}</span> },
		{ key: "total", header: "To post", mobile: "value", align: "right", cell: (t) => <span className="font-medium">{signedByType(t.total, t.type, t.currency)}</span> },
	];
	return (
		<section aria-label="Waiting to post, by account" className={cn("flex min-w-0 flex-col gap-1.5", className)} {...props}>
			<h3 className="px-1 text-2xs font-medium text-tertiary-foreground">Waiting to post, by account</h3>
			<DataList
				dense
				stackBelow="lg"
				caption="Waiting to post, by account"
				columns={columns}
				rows={rows}
				getKey={(t) => postingKey(t) + (t.currency ?? "")}
				isRowSelected={(t) => postingKey(t) === activeKey}
				onRowClick={(t) => onSelect?.(postingKey(t) === activeKey ? null : postingKey(t))}
			/>
		</section>
	);
}

/* ------------------------------------------------------------------ balance equation */

/** `undefined` = still being worked out (shimmers); `null` = unknown. */
export type BankEquationAmount = number | null | undefined;
export type BankEquationTerm = { label: string; amount: BankEquationAmount; op?: "plus" | "minus"; hint?: string };
export type BankEquationCheck = { label: string; amount: BankEquationAmount };

type Verdict = { kind: "ties" } | { kind: "off"; difference: number } | { kind: "unknown" } | { kind: "pending" } | { kind: "result" };

function solveEquation(terms: readonly BankEquationTerm[], check?: BankEquationCheck): { result: BankEquationAmount; verdict: Verdict } {
	let result: BankEquationAmount = 0;
	for (const t of terms) {
		if (t.amount === undefined) {
			result = undefined;
			break;
		}
		if (t.amount === null) {
			result = null;
			continue;
		}
		if (result !== null) result = (result as number) + (t.op === "minus" ? -t.amount : t.amount);
	}
	if (!check) return { result, verdict: { kind: "result" } };
	if (result === undefined || check.amount === undefined) return { result, verdict: { kind: "pending" } };
	if (result === null || check.amount === null) return { result, verdict: { kind: "unknown" } };
	const diff = Math.round((result - check.amount) * 100) / 100;
	return { result, verdict: Math.abs(diff) < 0.005 ? { kind: "ties" } : { kind: "off", difference: diff } };
}

/** A loading placeholder; `label` is what a screen reader hears in its place. */
function Shimmer({ className, label = "Loading" }: { className?: string; label?: string }) {
	return (
		<span className={cn("inline-block animate-pulse rounded bg-foreground/8", className)}>
			<span className="sr-only">{label}</span>
		</span>
	);
}

function EqCell({ label, amount, hint, currency, size, emphasis }: { label: string; amount: BankEquationAmount; hint?: string; currency?: string; size: "sm" | "md"; emphasis?: boolean }) {
	return (
		<div className="flex min-w-0 flex-col">
			<span className="text-2xs leading-4 text-tertiary-foreground">{label}</span>
			{amount === undefined ? (
				<Shimmer label="Working out" className={cn("my-1 w-24", size === "md" ? "h-4" : "h-3")} />
			) : (
				<span
					className={cn(
						"whitespace-nowrap tabular-nums",
						size === "md" ? "text-md leading-6" : "text-sm leading-5",
						amount === null ? "font-normal text-tertiary-foreground" : emphasis ? "font-semibold text-foreground" : "font-medium text-foreground",
					)}
				>
					{amount === null ? "Unknown" : formatCurrency(amount, currency)}
				</span>
			)}
			{hint && <span className="text-2xs leading-4 text-tertiary-foreground">{hint}</span>}
		</div>
	);
}

function EqOp({ glyph, spoken, size }: { glyph: string; spoken: string; size: "sm" | "md" }) {
	return (
		<span className="flex flex-col">
			<span aria-hidden="true" className="invisible text-2xs leading-4">
				.
			</span>
			<span aria-hidden="true" className={cn("tabular-nums text-tertiary-foreground", size === "md" ? "text-md leading-6" : "text-sm leading-5")}>
				{glyph}
			</span>
			<span className="sr-only">{spoken}</span>
		</span>
	);
}

/** A verdict chip whose label wraps instead of truncating when the column is narrow. */
function VerdictChip({ tone, glyph, children }: { tone: StatusTone; glyph: StatusGlyph; children: string }) {
	return (
		<StatusChip tone={tone} glyph={glyph} title={children} className="h-auto min-h-5.5 py-0.5 whitespace-normal">
			<span className="min-w-0">{children}</span>
		</StatusChip>
	);
}

function EqVerdict({ verdict, currency, tiesLabel, unknownLabel }: { verdict: Verdict; currency?: string; tiesLabel: string; unknownLabel: string }) {
	switch (verdict.kind) {
		case "ties":
			return <VerdictChip tone="green" glyph="check">{tiesLabel}</VerdictChip>;
		case "off":
			return <VerdictChip tone="amber" glyph="alert">{`Off by ${formatCurrency(Math.abs(verdict.difference), currency)}`}</VerdictChip>;
		case "unknown":
			return <VerdictChip tone="neutral" glyph="minus">{unknownLabel}</VerdictChip>;
		case "pending":
			return <Shimmer label="Checking" className="my-0.5 h-5.5 w-20 rounded-md" />;
		default:
			return null;
	}
}

/**
 * BalanceEquation — the banking workspace's one picture of proof: opening +
 * money in − money out = closing, set against what the statement or ledger
 * says. Terms still being worked out shimmer; the verdict chip says Ties,
 * Off by RM x, or why it can't be verified. Terms wrap onto new lines.
 */
export function BankBalanceEquation({
	terms,
	resultLabel,
	check,
	currency = "MYR",
	tiesLabel = "Ties",
	unknownLabel = "Can't verify",
	size = "md",
	className,
	...props
}: With<{
	terms: readonly BankEquationTerm[];
	resultLabel: string;
	check?: BankEquationCheck;
	currency?: string;
	tiesLabel?: string;
	unknownLabel?: string;
	size?: "sm" | "md";
	className?: string;
}>) {
	const { result, verdict } = solveEquation(terms, check);
	return (
		<div role="group" aria-label={`${resultLabel} calculation`} className={cn("flex min-w-0 flex-wrap items-start gap-x-3 gap-y-3", className)} {...props}>
			{terms.map((t, i) => (
				<div key={t.label} className="flex min-w-0 items-start gap-x-3">
					{i > 0 && <EqOp glyph={t.op === "minus" ? "−" : "+"} spoken={t.op === "minus" ? "minus" : "plus"} size={size} />}
					<EqCell label={t.label} amount={t.amount} hint={t.hint} currency={currency} size={size} />
				</div>
			))}
			<div className="flex min-w-0 items-start gap-x-3">
				<EqOp glyph="=" spoken="equals" size={size} />
				<EqCell label={resultLabel} amount={result} currency={currency} size={size} emphasis />
			</div>
			{check && (
				<div className="flex min-w-0 max-w-full flex-wrap items-start gap-x-3 gap-y-1 border-l border-border pl-3">
					<EqCell label={check.label} amount={check.amount} currency={currency} size={size} />
					{/* Mounted with the equation, so a change to Ties / Off by is announced politely. */}
					<div role="status" className="flex min-w-0 max-w-full flex-col">
						<span aria-hidden="true" className="invisible text-2xs leading-4">
							.
						</span>
						<EqVerdict verdict={verdict} currency={currency} tiesLabel={tiesLabel} unknownLabel={unknownLabel} />
					</div>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ statement equation */

export type BankParsedStatement = { openingBalance: number | null; closingBalance: number | null; totalCredits: number; totalDebits: number; creditLines: number; debitLines: number };

function brokenRowsLabel(indices: readonly number[]): string {
	const rows = indices.map((i) => String(i + 1));
	if (rows.length === 1) return `row ${rows[0]}`;
	const shown = rows.slice(0, 5);
	const rest = rows.length - shown.length;
	return rest > 0 ? `rows ${shown.join(", ")} and ${rest} more` : `rows ${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

/**
 * StatementEquation — a statement's own proof: opening + money in − money
 * out against the closing balance it prints. Null `statement` = still being
 * read (shimmers). A broken running balance is called out by row.
 */
export function BankStatementEquation({
	statement,
	chainValid = true,
	brokenRows = [],
	currency = "MYR",
	size = "md",
	className,
	...props
}: With<{ statement: BankParsedStatement | null; chainValid?: boolean; brokenRows?: number[]; currency?: string; size?: "sm" | "md"; className?: string }>) {
	const opening = statement ? statement.openingBalance : undefined;
	const closing = statement ? statement.closingBalance : undefined;
	const lines = (n: number) => `${n} ${n === 1 ? "line" : "lines"}`;
	return (
		<div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			<BankBalanceEquation
				size={size}
				currency={currency}
				terms={[
					{ label: "Opening", amount: opening },
					{ label: "Money in", amount: statement?.totalCredits, op: "plus", hint: statement ? lines(statement.creditLines) : undefined },
					{ label: "Money out", amount: statement?.totalDebits, op: "minus", hint: statement ? lines(statement.debitLines) : undefined },
				]}
				resultLabel="Closing"
				check={{ label: "Statement closing", amount: closing }}
				tiesLabel="Ties to the statement"
				unknownLabel={opening === null ? "Can't verify, no opening balance on the statement" : "Can't verify, no closing balance on the statement"}
			/>
			{!chainValid && (
				<p className="flex items-start gap-1.5 text-2xs text-muted-foreground">
					<StatusChipIcon tone="amber" glyph="alert" className="mt-px size-3" />
					<span>
						{brokenRows.length > 0 ? `The running balance breaks at ${brokenRowsLabel(brokenRows)}.` : "The running balance breaks on some rows."} Those rows may post in the wrong direction.
					</span>
				</p>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ month proof */

export type BankLedgerLink = { kind: "linked"; code: string; name: string } | { kind: "unlinked" } | { kind: "foreign_currency"; accountCurrency: string; baseCurrency: string } | { kind: "missing_account" };

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
	const expected = statementClosing === null ? null : statementClosing - unpostedNet - (transit?.net ?? 0);
	const diff = expected !== null && ledger !== null && link.kind === "linked" ? Math.round((ledger - expected) * 100) / 100 : 0;
	const amount = formatCurrency(Math.abs(diff), currency);
	const explanation =
		Math.abs(diff) < 0.005
			? null
			: diff > 0
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
					{ label: "Statement closing", amount: statementClosing, hint: statementClosing === null ? "No statement" : `at ${asOf}` },
					{ label: "Not yet in the ledger", amount: unpostedNet, op: "minus", hint: `lines to ${asOf}` },
					...(transit ? [{ label: "In the ledger on another day", amount: transit.net, op: "minus" as const, hint: transit.count === 1 ? "1 posted line" : `${transit.count} posted lines` }] : []),
				]}
				resultLabel="Expected ledger"
				check={{ label: link.kind === "linked" ? `${link.code} at ${asOf}` : "Ledger", amount: link.kind === "linked" ? ledger : null }}
				tiesLabel="Ties to the ledger"
				unknownLabel={unknown}
			/>
			{transit && (
				<p className={prose}>
					{transit.count === 1 ? "1 posted line is" : `${transit.count} posted lines are`} in the bank and the ledger on different sides of {asOf}: a transfer is dated the day it lands in the other account, and a matched line takes its entry&apos;s date. The bridge counts them, so they are not a difference.
				</p>
			)}
			{explanation && <p className={prose}>{explanation}</p>}
			{state === "in_progress" && statementClosing === null && <p className={prose}>{monthName} is still in progress. Its statement comes once the month ends.</p>}
			{state === "no_statement" && (
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<p className={prose}>No statement ends in {monthName}, so there is no bank balance to prove the month end with.</p>
					<Button variant="secondary" className="gap-1.5">
						<FileArrowUpIcon size={14} className="size-3.5" aria-hidden="true" />
						Upload {monthName} statement
					</Button>
				</div>
			)}
			{reason && statementClosing !== null && <p className={prose}>{reason}</p>}
			{(link.kind === "unlinked" || link.kind === "missing_account") && (
				<Button variant="secondary" className="gap-1.5">
					<ScalesIcon size={14} className="size-3.5" aria-hidden="true" />
					Link a ledger account
				</Button>
			)}
			{link.kind === "linked" && (
				<a href="#ledger" className="inline-flex w-fit max-w-full items-center gap-1 rounded-sm text-sm text-primary underline-offset-4 hover:underline focus-ring">
					Open {ledgerLabel} in the ledger
					<ArrowSquareOutIcon size={12} className="size-3 shrink-0" aria-hidden="true" />
				</a>
			)}
		</section>
	);
}

/* ------------------------------------------------------------------ month close */

export type BankCloseCheck = { id: string; label: string; status: "pass" | "warn" | "attention" | "fail"; text?: string; figures?: string };

const CHECK_TONE: Record<BankCloseCheck["status"], { tone: StatusTone; glyph: StatusGlyph; word: string }> = {
	pass: { tone: "green", glyph: "check", word: "Passes" },
	warn: { tone: "amber", glyph: "alert", word: "Warning" },
	attention: { tone: "amber", glyph: "alert", word: "Needs attention" },
	fail: { tone: "red", glyph: "x", word: "Fails" },
};
const FISCAL_LABEL = { open: "Open", closing: "Closing", closed: "Closed", locked: "Locked" } as const;

/**
 * MonthClose — closing the month: the bank sign-off (a closed reconciliation
 * session once the bridge ties and nothing is left to reconcile), then the
 * period close — fiscal status, the close checklist's two bank items, and
 * the way to Periods.
 */
export function BankMonthClose({
	monthName,
	state,
	signedOffLabel,
	standing = "none",
	staleNote,
	signing = false,
	fiscalStatus,
	checks,
	className,
	...props
}: With<
	{
		monthName: string;
		state: "ready" | "needs_work" | "in_progress" | "covered" | "no_statement" | "closed";
		/** "Signed off by Aisyah Rahman · 3 Apr 2026" */
		signedOffLabel?: string;
		standing?: "none" | "holds" | "stale";
		staleNote?: string;
		signing?: boolean;
		fiscalStatus?: keyof typeof FISCAL_LABEL | null;
		/** undefined = loading; null = no chart to close against. */
		checks?: BankCloseCheck[] | null;
		className?: string;
	},
	"section"
>) {
	const ready = state === "ready";
	let signOff: React.ReactNode;
	if (signedOffLabel && standing === "holds") {
		signOff = (
			<div className="flex items-start gap-2">
				<SealCheckIcon size={16} weight="fill" className="size-4 mt-0.5 shrink-0 text-status-green-text" aria-hidden="true" />
				<div className="min-w-0">
					<p className={cn(FG, "font-semibold")}>{signedOffLabel}</p>
					<p className={MUTED}>The bank side of {monthName} is proven.</p>
				</div>
			</div>
		);
	} else if (state === "closed") {
		signOff = <p className={MUTED}>{monthName} was closed in Periods without a bank sign-off.</p>;
	} else {
		signOff = (
			<div className="flex flex-col gap-2">
				{standing === "stale" && staleNote && (
					<div className="flex items-start gap-2">
						<StatusChipIcon tone="amber" glyph="alert" className="mt-0.5" />
						<div className="min-w-0">
							{signedOffLabel && <p className={cn(FG, "font-semibold")}>{signedOffLabel}</p>}
							<p className={MUTED}>{staleNote}</p>
						</div>
					</div>
				)}
				<Button variant={ready ? "primary" : "secondary"} disabled={!ready || signing} isLoading={signing} className="w-full justify-center">
					{standing === "stale" ? `Sign off ${monthName} again` : `Sign off ${monthName}`}
				</Button>
				{standing !== "stale" && (
					<p className={MUTED}>
						{ready
							? "Records a closed reconciliation session for the month, with who signed and when."
							: state === "in_progress"
								? `Opens once ${monthName} has ended.`
								: state === "covered"
									? `${monthName} is proven with the month its statement ends in.`
									: `Opens once ${monthName} has a statement, ties to the ledger, and every line is reconciled or excluded.`}
					</p>
				)}
			</div>
		);
	}
	const closedish = fiscalStatus === "closed" || fiscalStatus === "locked";
	return (
		<section aria-label={`Close ${monthName}`} className={cn("flex min-w-0 flex-col gap-4", className)} {...props}>
			<h3 className="text-sm font-semibold text-muted-foreground">Close {monthName}</h3>
			{signOff}
			<div className="flex flex-col gap-2.5 border-t border-border pt-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h4 className={cn(FG, "font-semibold")}>Period close</h4>
					<span className={cn("inline-flex items-center gap-1 text-2xs", closedish ? "text-foreground" : "text-muted-foreground")}>
						<CircleIcon size={8} className="size-2" weight={fiscalStatus === "open" || !fiscalStatus ? "regular" : "fill"} aria-hidden="true" />
						{fiscalStatus ? FISCAL_LABEL[fiscalStatus] : "No period yet"}
					</span>
				</div>
				{checks === undefined && <Shimmer label="Loading checks" className="h-12 w-full rounded-lg" />}
				{checks && (
					<ul className="flex flex-col gap-2.5">
						{checks.map((c) => {
							const t = CHECK_TONE[c.status];
							return (
								<li key={c.id} className="flex items-start gap-2">
									<StatusChipIcon tone={t.tone} glyph={t.glyph} className="mt-[3px]" />
									<div className="min-w-0">
										<p className={FG}>
											{c.label}
											<span className="sr-only">: {t.word}</span>
										</p>
										{c.text && <p className={cn(MUTED, "break-words")}>{c.text}</p>}
										{c.figures && (
											<details className="mt-1 text-2xs text-tertiary-foreground">
												<summary className="cursor-pointer select-none hover:text-foreground">Show the figures</summary>
												<p className="text-tiny-id mt-1 break-words">{c.figures}</p>
											</details>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				)}
				{checks !== undefined && <p className={MUTED}>These checks cover every bank account for {monthName}.</p>}
				<a href="#periods" className="inline-flex w-fit items-center gap-1 rounded-sm text-sm text-primary underline-offset-4 hover:underline focus-ring">
					{state === "closed" ? "Open Periods" : `Close ${monthName} in Periods`}
					<ArrowRightIcon size={12} className="size-3" aria-hidden="true" />
				</a>
			</div>
		</section>
	);
}

/* ------------------------------------------------------------------ year strip */

export type BankCloseMonthState = "closed" | "ready" | "needs_work" | "no_statement" | "covered" | "in_progress" | "future";
export type BankCloseMonth = {
	/** "2026-03" */
	period: string;
	state: BankCloseMonthState;
	/** Lines still to post or reconcile. */
	openLines?: number;
	/** A no-statement month the account moved in (vs. quiet, before history). */
	missing?: boolean;
	/** needs_work because the bridge is off. */
	untied?: boolean;
	signedOff?: "holds" | "stale";
};

const STATE_LABEL: Record<BankCloseMonthState, string> = {
	closed: "Closed", ready: "Ready to close", needs_work: "Needs work", no_statement: "No statement", covered: "Covered", in_progress: "In progress", future: "Not started",
};
const STATE_CHIP: Record<BankCloseMonthState, { tone: StatusTone; glyph: StatusGlyph; dashed?: boolean }> = {
	closed: { tone: "neutral", glyph: "check" },
	ready: { tone: "green", glyph: "check" },
	needs_work: { tone: "amber", glyph: "alert" },
	no_statement: { tone: "neutral", glyph: "dashed", dashed: true },
	covered: { tone: "blue", glyph: "minus" },
	in_progress: { tone: "blue", glyph: "clock" },
	future: { tone: "neutral", glyph: "dashed", dashed: true },
};
type Look = Exclude<BankCloseMonthState, "no_statement"> | "missing" | "quiet";
const lookOf = (m: BankCloseMonth): Look => (m.state !== "no_statement" ? m.state : m.missing ? "missing" : "quiet");
const BAR: Record<Look, string> = {
	closed: "bg-muted-foreground",
	ready: "bg-status-green",
	needs_work: "bg-status-amber",
	missing: "border border-dashed border-status-amber bg-transparent",
	quiet: "bg-foreground/8",
	covered: "border border-tertiary-foreground bg-transparent",
	in_progress: "bg-tertiary-foreground/40",
	future: "bg-foreground/8",
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthIdx = (p: string) => parseInt(p.slice(5, 7), 10) - 1;

/** The month-state chip used on the selected month's heading. */
export function BankCloseStateChip({ state, className, ...props }: With<{ state: BankCloseMonthState; className?: string }, "span">) {
	const c = STATE_CHIP[state];
	return (
		<StatusChip tone={c.tone} glyph={c.glyph} dashed={c.dashed} className={className} {...props}>
			{STATE_LABEL[state]}
		</StatusChip>
	);
}

function CellDetail({ m }: { m: BankCloseMonth }) {
	if (m.state === "closed") return <LockSimpleIcon size={12} className="size-3" aria-hidden="true" />;
	if (m.signedOff === "holds") return <CheckIcon size={12} className="size-3" weight="bold" aria-hidden="true" />;
	const open = m.state === "needs_work" || m.state === "covered" ? (m.openLines ?? 0) : 0;
	if (open > 0) return <>{open}</>;
	if (m.state === "needs_work") return <>{m.untied ? "Off" : "—"}</>;
	if (lookOf(m) === "missing") return <>Missing</>;
	return null;
}

/** CellDetail in words, for the month button's accessible name. */
function cellDetailText(m: BankCloseMonth): string | null {
	if (m.state === "closed") return null;
	if (m.signedOff === "holds") return "signed off";
	const open = m.state === "needs_work" || m.state === "covered" ? (m.openLines ?? 0) : 0;
	if (open > 0) return `${countOf(open, "line")} open`;
	if (m.state === "needs_work" && m.untied) return "off against the ledger";
	return null;
}

/**
 * ReconciliationView's header and YearStrip — one account's fiscal year as
 * twelve month cells (closed, ready, needs work, missing, covered, in
 * progress, not started), and the selected month's heading, state and the
 * one sentence naming its next step. 12 across when wide, 6 or 4 per row
 * when narrow.
 */
export function BankReconciliationYearStrip({
	months,
	selected,
	yearLabel,
	accountName,
	calendarMonths = false,
	selectedSummary,
	className,
	...props
}: With<{
	months: BankCloseMonth[];
	selected: string | null;
	/** "FY 2026" */
	yearLabel: string;
	accountName: string;
	calendarMonths?: boolean;
	/** The next-step sentence for the selected month, and its sign-off line. */
	selectedSummary?: { nextStep: string; signedOffLabel?: string };
	className?: string;
}>) {
	const sel = months.find((m) => m.period === selected);
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<div className="flex items-center gap-2">
				<div className="min-w-0 flex-1">
					<h2 className="text-md font-semibold text-foreground">Month-end close · {yearLabel}</h2>
					{calendarMonths && <p className={MUTED}>No fiscal year end is set, so these are calendar months. Set it in Periods.</p>}
				</div>
				<Button variant="skeleton" size="icon" aria-label="Previous year">
					<CaretLeftIcon size={14} className="size-3.5" aria-hidden="true" />
				</Button>
				<Button variant="skeleton" size="icon" aria-label="Next year">
					<CaretRightIcon size={14} className="size-3.5" aria-hidden="true" />
				</Button>
			</div>
			<div role="group" aria-label={`Months of ${yearLabel} for ${accountName}`} className={cn(surfaces.tray, "grid grid-cols-4 gap-0.5 @sm:grid-cols-6 @2xl:grid-cols-12")}>
				{months.map((m) => {
					const isSel = m.period === selected;
					const look = lookOf(m);
					return (
						<button
							key={m.period}
							type="button"
							aria-current={isSel || undefined}
							aria-label={[`${MONTHS_LONG[monthIdx(m.period)]} ${m.period.slice(0, 4)}`, look === "quiet" ? "no activity" : look === "missing" ? "statement missing" : STATE_LABEL[m.state], cellDetailText(m)].filter(Boolean).join(", ")}
							className={cn(
								"relative flex min-h-14 min-w-0 cursor-pointer flex-col items-stretch gap-1.5 rounded-lg border px-1.5 pt-2 pb-2.5 text-left transition-colors focus-ring",
								isSel ? "border-table-surface-border bg-table-surface shadow-xs" : "border-transparent hover:bg-table-surface/60",
							)}
						>
							<span className={cn("text-2xs leading-4", isSel ? "font-semibold text-foreground" : m.state === "future" ? "text-subtle" : "text-muted-foreground")}>{MONTHS[monthIdx(m.period)]}</span>
							<span aria-hidden="true" className={cn("block h-1.5 w-full rounded-full", BAR[look])} />
							<span aria-hidden="true" className={cn("flex h-3 items-center truncate text-2xs leading-3 tabular-nums", m.state === "needs_work" || look === "missing" ? "font-medium text-foreground" : "text-tertiary-foreground")}>
								<CellDetail m={m} />
							</span>
							{isSel && <span aria-hidden="true" className="absolute inset-x-1.5 bottom-0.5 h-0.5 rounded-full bg-primary" />}
						</button>
					);
				})}
			</div>
			{sel && selectedSummary && (
				<div className="flex flex-col gap-1 border-t border-border pt-3">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">
							{MONTHS_LONG[monthIdx(sel.period)]} {sel.period.slice(0, 4)}
						</h2>
						<BankCloseStateChip state={sel.state} />
						{selectedSummary.signedOffLabel && <span className="text-2xs text-muted-foreground">{selectedSummary.signedOffLabel}</span>}
					</div>
					<p className="text-sm leading-5 text-muted-foreground">{selectedSummary.nextStep}</p>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ account rail */

export type BankRailAccount = {
	id: string;
	accountName: string;
	accountType: "checking" | "savings" | "credit_card" | "loan" | "ewallet" | "payment_provider" | string;
	balance: number;
	currency?: string;
	institution?: { name: string; shortName?: string; primaryColor?: string | null } | null;
	counts?: Partial<Record<BankFeedStatus, number>>;
	hasChainIssue?: boolean;
	/** Provider feed health, when the account is fed by a connection. */
	feed?: { health: "ok" | "partial" | "failed"; summary: string } | null;
};

const TYPE_ICON: Record<string, Icon> = { checking: BankIcon, savings: BankIcon, credit_card: CreditCardIcon, loan: WalletIcon, ewallet: WalletIcon };
const RAIL_GROUP: Record<string, string> = { checking: "Banks", savings: "Banks", credit_card: "Credit cards", payment_provider: "Payment providers" };
const RAIL_ORDER = ["Banks", "Credit cards", "Payment providers", "Other"];

/** Relative luminance (WCAG 2.x) of a #rrggbb colour. */
function luminance(h: string) {
	const [r, g, b] = [0, 2, 4].map((i) => {
		const c = parseInt(h.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The ink (black or white) with the higher WCAG contrast on a brand colour from data; one of them always reaches 4.5:1. */
function inkOn(hex?: string | null) {
	if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return undefined;
	const bg = luminance(hex.replace("#", ""));
	const onWhite = 1.05 / (bg + 0.05);
	const onBlack = (bg + 0.05) / 0.05;
	return onBlack >= onWhite ? "#000" : "#fff";
}

/**
 * AccountAvatar / InstitutionLogo — a circular institution mark: the bank's
 * short code on its brand colour, or the account-type glyph when there is no
 * institution. 24px so rows with and without a logo align. Colour and size
 * styles are data-driven.
 */
export function BankAccountAvatar({ account, size = 24, className, style, ...props }: With<{ account: Pick<BankRailAccount, "accountName" | "accountType" | "institution">; size?: number; className?: string }, "span">) {
	const inst = account.institution;
	if (inst) {
		const label = (inst.shortName || inst.name || account.accountName).slice(0, 4);
		return (
			<span
				role="img"
				aria-label={inst.name}
				className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight", !inst.primaryColor && "bg-muted text-muted-foreground", className)}
				style={{ width: size, height: size, fontSize: Math.round(size * (label.length > 3 ? 0.3 : 0.36)), backgroundColor: inst.primaryColor ?? undefined, color: inkOn(inst.primaryColor), ...style }}
				{...props}
			>
				{label}
			</span>
		);
	}
	const Glyph = TYPE_ICON[account.accountType] ?? WalletIcon;
	return (
		<span className={cn("flex shrink-0 items-center justify-center text-tertiary-foreground", className)} style={{ width: size, height: size, ...style }} {...props}>
			<Glyph size={14} weight="fill" aria-hidden="true" />
		</span>
	);
}

function NetFlowSpark({ data }: { data: { month: string; net: number }[] }) {
	const max = Math.max(1, ...data.map((d) => Math.abs(d.net)));
	const w = 100 / data.length;
	return (
		<svg
			viewBox="0 0 100 32"
			preserveAspectRatio="none"
			className="h-8 w-full"
			role="img"
			aria-label={`Net flow, last 6 months: ${data.map((d) => `${d.month} ${formatCurrency(d.net)}`).join(", ")}`}
		>
			<line x1="0" x2="100" y1="16" y2="16" stroke="var(--chart-grid-stroke)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
			{data.map((d, i) => {
				const hgt = (Math.abs(d.net) / max) * 15;
				return (
					<rect key={d.month} x={i * w + w * 0.18} width={w * 0.64} y={d.net >= 0 ? 16 - hgt : 16} height={Math.max(hgt, 0.6)} rx="0.8" fill={d.net >= 0 ? "var(--primary)" : "var(--destructive)"} opacity={d.net >= 0 ? 0.85 : 0.6}>
						<title>{`${d.month}: ${formatCurrency(d.net)}`}</title>
					</rect>
				);
			})}
		</svg>
	);
}

const RAIL_HIT = "w-full cursor-pointer rounded-lg text-left transition-colors focus-ring";

/**
 * PositionRail — accounts as instruments: the all-accounts net position,
 * account rows grouped Banks / Credit cards / Payment providers (avatar,
 * name, feed glyph, statement-gap warning, compact balance, to-categorize
 * count, settled meter), the 6-month net-flow sparkline and add actions.
 * Currencies are never summed together. Fills its container's width.
 */
export function BankAccountRail({
	accounts,
	selectedId = null,
	net,
	cashFlow = [],
	className,
	...props
}: With<{
	accounts: BankRailAccount[];
	selectedId?: string | null;
	/** One entry per currency; never summed across currencies. */
	net: { amount: number; currency: string }[];
	cashFlow?: { month: string; net: number }[];
	className?: string;
}>) {
	const groups = RAIL_ORDER.map((label) => ({ label, list: accounts.filter((a) => (RAIL_GROUP[a.accountType] ?? "Other") === label) })).filter((g) => g.list.length > 0);
	const multi = net.length > 1;
	const railId = React.useId();
	return (
		<div className={cn("flex w-full min-w-0 flex-col", surfaces.card, className)} {...props}>
			<div className="border-b border-border p-2">
				<button type="button" aria-pressed={selectedId === null} className={cn(RAIL_HIT, "px-2.5 py-2.5", selectedId === null ? "bg-active-primary" : "hover:bg-muted")}>
					<p className="text-2xs font-medium text-tertiary-foreground">All accounts</p>
					{multi ? (
						<div className="mt-1 flex flex-col gap-0.5">
							{net.map((c) => (
								<p key={c.currency} className={cn("text-md font-medium tabular-nums text-foreground", negativeClass(c.amount < 0))}>
									{formatCurrencyCompact(c.amount, c.currency)}
								</p>
							))}
						</div>
					) : (
						<p className="text-giga mt-1 tabular-nums">
							<span className={negativeClass(!!net[0] && net[0].amount < 0)}>{net[0] ? formatCurrencyCompact(net[0].amount, net[0].currency) : "—"}</span>
						</p>
					)}
				</button>
			</div>
			<nav aria-label="Bank accounts" className="flex flex-col gap-3 p-2">
				{groups.map((g) => (
					<div key={g.label} role="group" aria-labelledby={`${railId}-${g.label}`}>
						<p id={`${railId}-${g.label}`} className="mb-1.5 px-2.5 text-2xs font-medium text-tertiary-foreground">
							{g.label}
						</p>
						<div className="flex flex-col gap-0.5">
							{g.list.map((a) => {
								const sel = selectedId === a.id;
								const attention = a.counts?.imported ?? 0;
								return (
									<button key={a.id} type="button" aria-pressed={sel} className={cn(RAIL_HIT, "group px-2.5 py-1.5", sel ? "bg-active-primary" : "hover:bg-muted")}>
										<span className="flex items-center gap-2.5">
											<BankAccountAvatar account={a} />
											<span className="min-w-0 flex-1">
												<span className="flex items-center gap-1">
													<span className={cn("block truncate text-sm font-medium", sel ? "text-foreground" : "text-muted-foreground")}>{a.accountName}</span>
													{a.feed &&
														(a.feed.health === "ok" ? (
															<LightningIcon size={11} className="size-3 shrink-0 text-tertiary-foreground" role="img" aria-label={a.feed.summary} />
														) : (
															<>
																<StatusChipIcon tone={a.feed.health === "failed" ? "red" : "amber"} glyph="alert" className="size-3" />
																<span className="sr-only">{a.feed.summary}</span>
															</>
														))}
													{a.hasChainIssue && <WarningIcon size={12} weight="fill" className="size-3 shrink-0 text-status-amber-text" role="img" aria-label="Statement gap: coverage is broken" />}
												</span>
												<span className="mt-0.5 block text-2xs tabular-nums text-tertiary-foreground">{formatCurrencyCompact(a.balance, a.currency || "MYR")}</span>
											</span>
											{attention > 0 && (
												<StatusChip tone="amber" glyph="alert" className="tabular-nums" title={`${attention} to categorize`}>
													{attention}
													<span className="sr-only"> to categorize</span>
												</StatusChip>
											)}
										</span>
										{a.counts && <SettledMeter counts={a.counts} className="mt-1.5" />}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</nav>
			<div className="mt-auto border-t border-border p-2">
				{cashFlow.some((c) => c.net !== 0) && (
					<div className="mb-1.5 px-2.5">
						<p className="mb-1 text-2xs font-medium text-tertiary-foreground">Net flow · 6 months</p>
						<NetFlowSpark data={cashFlow} />
					</div>
				)}
				<Button variant="skeleton" className="w-full justify-start gap-2 text-primary">
					<PlusIcon size={14} className="size-3.5" aria-hidden="true" />
					Add account
				</Button>
				<Button variant="skeleton" className="w-full justify-start gap-2 text-muted-foreground">
					<PlugsIcon size={14} className="size-3.5" aria-hidden="true" />
					Connect a payment provider
				</Button>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ rules */

export type BankRuleRow = {
	id: string;
	matchType: "payee" | "contains" | "not_contains" | "regex" | string;
	pattern: string;
	account?: { code: string; name: string } | null;
	category?: string | null;
	priority: number;
	source: "user_created" | "ai_learned" | "system_default";
	isActive: boolean;
	timesApplied: number;
	timesOverridden: number;
};
const MATCH_LABEL: Record<string, string> = { payee: "Payee", contains: "Contains", not_contains: "Excludes", regex: "Regex" };
const SOURCE: Record<BankRuleRow["source"], { label: string; tone: StatusTone; glyph: StatusGlyph }> = {
	user_created: { label: "You", tone: "blue", glyph: "user" },
	ai_learned: { label: "Learned", tone: "purple", glyph: "refresh" },
	system_default: { label: "Default", tone: "neutral", glyph: "minus" },
};

/**
 * RulesManager — every categorisation rule (active and deactivated) with its
 * match, target account, source, priority, and how often it fires vs gets
 * overridden. Search, an All/Active/Inactive filter, "Apply to unposted
 * lines" and "New rule" sit above a DataList (stacked rows when narrow).
 */
export function BankRulesTable({ rules, search = "", status = "all", className, ...props }: With<{ rules: BankRuleRow[]; search?: string; status?: "all" | "active" | "inactive"; className?: string }>) {
	const [filter, setFilter] = React.useState(status);
	const shown = rules.filter((r) => (filter === "active" ? r.isActive : filter === "inactive" ? !r.isActive : true));
	// Inactive rules read quieter through colour that still passes 4.5:1; the Status column says "Inactive".
	const dim = (r: BankRuleRow) => (!r.isActive ? "text-tertiary-foreground" : undefined);
	const columns: DataColumn<BankRuleRow>[] = [
		{
			key: "rule",
			header: "Rule",
			mobile: "title",
			cell: (r) => (
				<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
					<span className={cn("flex min-w-0 items-baseline gap-2", dim(r))}>
						<span className="shrink-0 font-normal text-tertiary-foreground">{MATCH_LABEL[r.matchType] ?? r.matchType}</span>
						<span className="min-w-0 font-medium break-words text-foreground @3xl:whitespace-nowrap">{r.pattern}</span>
					</span>
					{!r.isActive && <StatusChip tone="neutral" glyph="pause">Inactive</StatusChip>}
				</span>
			),
		},
		{
			key: "account",
			header: "Categorizes to",
			className: "@3xl:whitespace-nowrap",
			cell: (r) => (
				<span className={dim(r)}>
					{r.account ? (
						<span className="inline-flex min-w-0 items-baseline gap-1.5">
							<span className="text-tiny-id shrink-0 text-tertiary-foreground">{r.account.code}</span>
							<span>{r.account.name}</span>
						</span>
					) : r.category ? (
						r.category
					) : (
						<span className="text-tertiary-foreground">No account</span>
					)}
				</span>
			),
		},
		{
			key: "source",
			header: "Source",
			mobile: "badge",
			cell: (r) => (
				<span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
					<StatusChip tone={SOURCE[r.source].tone} glyph={SOURCE[r.source].glyph} className={dim(r)}>
						{SOURCE[r.source].label}
					</StatusChip>
					{/* Stacked layout only: the three figure columns folded into one line. */}
					<span className={cn("text-2xs tabular-nums text-tertiary-foreground @3xl:hidden", dim(r))}>
						Priority {r.priority} · applied {r.timesApplied.toLocaleString()}× · {r.timesApplied > 0 ? `${Math.round((r.timesOverridden / r.timesApplied) * 100)}% overridden` : "not used yet"}
					</span>
				</span>
			),
		},
		{ key: "priority", header: "Priority", align: "right", mobile: "hidden", cell: (r) => <span className={dim(r)}>{r.priority}</span> },
		{ key: "applied", header: "Applied", align: "right", mobile: "hidden", cell: (r) => <span className={dim(r)}>{r.timesApplied.toLocaleString()}</span> },
		{
			key: "override",
			header: "Overridden",
			align: "right",
			mobile: "hidden",
			cell: (r) => <span className={dim(r)}>{r.timesApplied > 0 ? `${Math.round((r.timesOverridden / r.timesApplied) * 100)}%` : <span className="text-tertiary-foreground">Not used yet</span>}</span>,
		},
	];
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<ActionBar className="justify-between">
				<ActionBar>
					<div className="relative w-full @md:w-52">
						<MagnifyingGlassIcon size={13} className="size-3 pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-tertiary-foreground" aria-hidden="true" />
						<Input aria-label="Search rules" placeholder="Search by match or pattern" defaultValue={search} className="!pl-7" />
					</div>
						<GroupedTabButton aria-label="Filter rules by status"
							className="w-auto"
							value={filter}
							onValueChange={(v) => setFilter(v as typeof filter)}
							options={[
								{ value: "all", label: "All" },
								{ value: "active", label: "Active" },
								{ value: "inactive", label: "Inactive" },
							]}
						/>
				</ActionBar>
				<ActionBar>
					<Button variant="secondary">Apply to unposted lines</Button>
					<Button className="gap-1.5">
						<PlusIcon size={14} className="size-3.5" aria-hidden="true" />
						New rule
					</Button>
				</ActionBar>
			</ActionBar>
			<DataList
				caption="Categorization rules"
				stackBelow="3xl"
				columns={columns}
				rows={shown}
				getKey={(r) => r.id}
				trailing={(r) => <ToolbarButton aria-label={`Actions for rule ${MATCH_LABEL[r.matchType] ?? r.matchType} ${r.pattern}`} />}
				footer={
					<span role="status" className="text-2xs tabular-nums text-tertiary-foreground">
						{countOf(shown.length, "rule")}
					</span>
				}
				empty="No rules yet. Rules auto-categorize matching transactions on import."
			/>
		</div>
	);
}

/* ------------------------------------------------------------------ cash flow chart */

export type BankCashFlowPoint = { label: string; credits: number; debits: number; net: number };

/** CashFlowChart — inflow and outflow bars per month, with net as the line across them. The legend wraps under the title when narrow. */
export function BankCashFlowChart({ data, currency = "MYR", title = "Cash flow", className, ...props }: With<{ data: BankCashFlowPoint[]; currency?: string; title?: string; className?: string }, "section">) {
	const config = {
		credits: { label: "Inflows", color: "var(--chart-series-3)" },
		debits: { label: "Outflows", color: "var(--chart-series-8)" },
		net: { label: "Net", color: "var(--primary)" },
	};
	const totals = data.reduce((s, p) => ({ in: s.in + p.credits, out: s.out + p.debits }), { in: 0, out: 0 });
	const legend = (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
			{(Object.keys(config) as (keyof typeof config)[]).map((k) => (
				<span key={k} className="inline-flex items-center gap-1.5 text-2xs text-muted-foreground">
					{/* chart swatch: fill from the chart token */}
					<span aria-hidden="true" className={cn(k === "net" ? "h-0.5 w-3 rounded-full" : "size-2 rounded-xs", k === "debits" && "opacity-75")} style={{ backgroundColor: config[k].color }} />
					{config[k].label}
					{k !== "net" && <span className="tabular-nums text-foreground">{formatCurrencyCompact(k === "credits" ? totals.in : totals.out, currency)}</span>}
				</span>
			))}
		</div>
	);
	return (
		<SectionPanel title={title} description={`${data[0]?.label ?? ""} – ${data[data.length - 1]?.label ?? ""}`} actions={legend} className={className} {...props}>
			<ChartContainer config={config} className="aspect-auto h-56 w-full">
				<ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
					<CartesianGrid vertical={false} stroke="var(--chart-grid-stroke)" />
					<XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={8} />
					<YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => formatCurrencyCompact(v, currency)} />
					<ChartTooltip
						content={
							<ChartTooltipContent
								formatter={(v, name) => (
									<span className="flex w-full justify-between gap-4">
										<span className="text-muted-foreground">{config[name as keyof typeof config]?.label ?? String(name)}</span>
										<span className="tabular-nums text-foreground">{formatCurrency(Number(v), currency)}</span>
									</span>
								)}
							/>
						}
					/>
					<Bar dataKey="credits" fill="var(--color-credits)" radius={[3, 3, 0, 0]} maxBarSize={18} isAnimationActive={false} />
					<Bar dataKey="debits" fill="var(--color-debits)" fillOpacity={0.75} radius={[3, 3, 0, 0]} maxBarSize={18} isAnimationActive={false} />
					<Line dataKey="net" type="monotone" stroke="var(--color-net)" strokeWidth={2} dot={{ r: 2.5, fill: "var(--color-net)" }} isAnimationActive={false} />
				</ComposedChart>
			</ChartContainer>
			{/* The chart's figures for screen readers: the SVG and its hover tooltip expose none of them. */}
			<table className="sr-only">
				<caption>{`${title}, ${currency}`}</caption>
				<thead>
					<tr>
						<th scope="col">Month</th>
						<th scope="col">{config.credits.label}</th>
						<th scope="col">{config.debits.label}</th>
						<th scope="col">{config.net.label}</th>
					</tr>
				</thead>
				<tbody>
					{data.map((p) => (
						<tr key={p.label}>
							<th scope="row">{p.label}</th>
							<td>{formatCurrency(p.credits, currency)}</td>
							<td>{formatCurrency(p.debits, currency)}</td>
							<td>{formatCurrency(p.net, currency)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</SectionPanel>
	);
}
