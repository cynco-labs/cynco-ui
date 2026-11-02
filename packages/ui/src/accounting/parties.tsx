/**
 * Cynco UI — Expenses & parties.
 * Hand-written presentational ports of cynco remix/app/components/{expenses,vendors,
 * customers,party,statement,contacts}: bills (card, board, header, alerts, pay run,
 * record payment), party pages (overview, rail, timeline, ledger), list tables and
 * the customer statement. Structure, labels and statuses follow cynco; the look is Cynco UI.
 * Every component responds to its own container width (container queries), not the viewport.
 */
import * as React from "react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	IconButton,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	ShortcutButton,
	SmallSpinner,
	StatusChip,
	StatusChipIcon,
	Tabs,
	TabsList,
	TabsTrigger,
	Textarea,
	cn,
	type StatusTone,
	type StatusGlyph,
	LiveStatus,
} from "../base";
import {
	ArchiveIcon,
	ArrowClockwiseIcon,
	ArrowCounterClockwiseIcon,
	ArrowsClockwiseIcon,
	BookOpenIcon,
	CalendarBlankIcon,
	CalendarCheckIcon,
	CaretRightIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	DotsThreeVerticalIcon,
	EnvelopeIcon,
	FileTextIcon,
	InfoIcon,
	PencilSimpleIcon,
	PhoneIcon,
	PlusIcon,
	ReceiptIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TagIcon,
	TrashIcon,
	UserCheckIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { Bar, BarChart, XAxis } from "recharts";
import {
	FieldError,
	fieldErrorProps,
	ActionBar,
	DataList,
	DocStatus,
	KeyValueList,
	ScrollRow,
	StatGrid,
	StatTile,
	formatBracketed,
	formatCurrency,
	formatCurrencyCompact,
	formatDate,
	negativeClass,
	ReportAmount,
	surfaces,
	type DataColumn,
	type StatusEntry,
} from "../lib/shared";

/* ------------------------------------------------------------------ helpers */

/** cynco domain/bill/status.ts BILL_STATUS_CONFIG, with glyphs. */
const BILL_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral", glyph: "pencil" },
	in_review: { label: "In Review", variant: "info", glyph: "clock" },
	pending_approval: { label: "Pending Approval", variant: "warning", glyph: "hourglass" },
	approved: { label: "Approved", variant: "success" },
	awaiting_payment: { label: "Awaiting Payment", variant: "warning", glyph: "clock" },
	partially_paid: { label: "Partially Paid", variant: "warning", glyph: "spinner" },
	scheduled: { label: "Scheduled", variant: "info", glyph: "calendar" },
	paid: { label: "Paid", variant: "success" },
	rejected: { label: "Rejected", variant: "error" },
	void: { label: "Void", variant: "neutral", glyph: "ban", strike: true },
};

export type CyncoBillStatus = keyof typeof BILL_STATUS;

/** Bill as the expenses views display it (cynco components/expenses/types.ts BillDisplay). */
export type CyncoBill = {
	id: string;
	vendorName: string | null;
	billNumber?: string | null;
	referenceNumber?: string | null;
	totalAmount: number;
	paidAmount?: number;
	currency?: string;
	issueDate?: string | null;
	dueDate?: string | null;
	scheduledPaymentDate?: string | null;
	status: CyncoBillStatus | string;
	category?: string | null;
	/** Past due and still owing (cynco isBillOverdue). */
	overdue?: boolean;
	isDuplicate?: boolean;
	/** Approval JE posted to the GL (journalEntryId set). */
	postedToGl?: boolean;
	/** Document-level extraction confidence 0–100 when Cynco AI read the bill. */
	aiConfidence?: number | null;
};

const POSTED_STATUSES = new Set(["approved", "awaiting_payment", "partially_paid", "scheduled", "paid"]);

function outstandingOf(b: Pick<CyncoBill, "totalAmount" | "paidAmount">): number {
	return Math.max(Math.round((b.totalAmount - (b.paidAmount ?? 0)) * 100), 0) / 100;
}

function initialsOf(name: string | null | undefined): string {
	if (!name) return "?";
	const words = name.replace(/\b(sdn|bhd|berhad|plt|enterprise)\b\.?/gi, "").trim().split(/\s+/).filter(Boolean);
	return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || name[0].toUpperCase();
}

function dayMonth(d: string): string {
	return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function monthYear(d: string): string {
	return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function confidenceLabel(p: number): "High" | "Medium" | "Low" {
	return p >= 80 ? "High" : p >= 50 ? "Medium" : "Low";
}

function sentenceCase(v: string): string {
	const w = v.replace(/_/g, " ");
	return w.charAt(0).toUpperCase() + w.slice(1);
}

/** cynco partyFormat formatMoney: "RM 1,234.00", foreign as "SGD 1,234.00", negatives with a minus. */
function partyMoney(amount: number, currency = "MYR"): string {
	const abs = Math.abs(amount).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	const prefix = currency === "MYR" ? "RM" : currency;
	return `${amount < 0 ? "−" : ""}${prefix} ${abs}`;
}

/** Neutral initials tile — neutral instead of hashed vendor colours. */
function PartyInitials({ name, size = "md", className }: { name: string | null | undefined; size?: "sm" | "md"; className?: string }) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-muted text-2xs font-medium text-muted-foreground",
				size === "sm" ? "size-7" : "size-8",
				className,
			)}
		>
			{initialsOf(name)}
		</span>
	);
}

/** cynco ui-v2 FactStrip: inline label/value facts that wrap under a page title. */
function FactStrip({ facts, className }: { facts: Array<[string, React.ReactNode]>; className?: string }) {
	return (
		<div className={cn("flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm", className)}>
			{facts
				.filter(([, v]) => v != null && v !== "")
				.map(([l, v]) => (
					<span key={l} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
						<span className="text-tertiary-foreground">{l}</span>
						<span className="text-foreground">{v}</span>
					</span>
				))}
		</div>
	);
}

/** Rail card (cynco PartyRail RailCard): small muted title, optional trailing chip. */
function RailCard({ title, trailing, children }: { title: string; trailing?: React.ReactNode; children: React.ReactNode }) {
	return (
		<section className={cn("min-w-0 p-3.5 shadow-sm", surfaces.card)}>
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
				<h3 className="text-xs font-medium text-tertiary-foreground">{title}</h3>
				{trailing}
			</div>
			{children}
		</section>
	);
}

function RowSelect({ checked, onToggle, label }: { checked: boolean; onToggle?: () => void; label: string }) {
	return <Checkbox checked={checked} onCheckedChange={() => onToggle?.()} aria-label={label} />;
}

function SelectAll({ total, selected, onChange, label, ref, errorId }: { total: number; selected: number; onChange: (all: boolean) => void; label: string; ref?: React.Ref<HTMLButtonElement>; /** Id of an inline error about the selection; marks the checkbox invalid. */ errorId?: string }) {
	const all = total > 0 && selected === total;
	return <Checkbox ref={ref} checked={all} indeterminate={selected > 0 && !all} onCheckedChange={() => onChange(!all)} aria-label={label} aria-invalid={errorId ? true : undefined} aria-describedby={errorId} />;
}

function useSelection(controlled?: string[], defaultIds?: string[], onChange?: (ids: string[]) => void) {
	const [inner, setInner] = React.useState<string[]>(defaultIds ?? []);
	const ids = new Set(controlled ?? inner);
	const set = (next: Set<string>) => {
		setInner([...next]);
		onChange?.([...next]);
	};
	const toggle = (id: string) => {
		const n = new Set(ids);
		n.has(id) ? n.delete(id) : n.add(id);
		set(n);
	};
	return { ids, toggle, set };
}

const CellNull = () => <span className="text-subtle">—</span>;

function RowActions({ items, label = "Row actions" }: { items: Array<{ label: string; icon: React.ReactNode; destructive?: boolean }>; label?: string }) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger render={<Button variant="skeleton" size="icon" aria-label={label} className="text-tertiary-foreground" />}>
				<DotsThreeVerticalIcon size={14} weight="bold" aria-hidden="true" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				{items.map((it, i) => (
					<React.Fragment key={it.label}>
						{it.destructive && i > 0 && <DropdownMenuSeparator />}
						<DropdownMenuItem variant={it.destructive ? "destructive" : undefined}>
							{it.icon}
							{it.label}
						</DropdownMenuItem>
					</React.Fragment>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Avatar + name (+ inactive chip) + one-line subtitle — the first cell of party lists. */
function NameCell({ name, subtitle, inactiveLabel, inactive }: { name: string; subtitle?: string; inactiveLabel: string; inactive?: boolean }) {
	return (
		// Spans only: this renders inside the row's button in Customer and Vendor lists.
		<span className="flex min-w-0 items-center gap-2.5">
			<PartyInitials name={name} className="hidden @md:inline-flex" />
			<span className="block min-w-0">
				<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
					<span className="min-w-0 break-words font-medium text-foreground @2xl:truncate">{name}</span>
					{inactive && (
						<StatusChip tone="neutral" glyph="minus" className="shrink-0">
							{inactiveLabel}
						</StatusChip>
					)}
				</span>
				{subtitle && <span className="block truncate text-xs font-normal text-tertiary-foreground">{subtitle}</span>}
			</span>
		</span>
	);
}

/** Per-currency totals, compact, at most two (cynco formatCurrencyTotals). */
function currencyTotals(bills: CyncoBill[], amount: (b: CyncoBill) => number, compact = true): string {
	const by = new Map<string, number>();
	for (const b of bills) by.set(b.currency ?? "MYR", (by.get(b.currency ?? "MYR") ?? 0) + amount(b));
	const parts = [...by].map(([c, v]) => (compact ? formatCurrencyCompact(v, c) : formatCurrency(v, c)));
	return parts.length > 2 ? `${parts.slice(0, 2).join(" · ")} +${parts.length - 2}` : parts.join(" · ");
}

/* ------------------------------------------------------------------ BillCard */

/** Board quick actions per status (cynco BillCard getQuickActions). */
function quickActions(status: string): Array<{ label: string; destructive?: boolean }> {
	switch (status) {
		case "draft":
			return [{ label: "Submit for Review" }];
		case "in_review":
			return [{ label: "Approve" }, { label: "Send for Approval" }];
		case "pending_approval":
			return [{ label: "Approve" }, { label: "Reject", destructive: true }];
		case "approved":
			return [{ label: "Mark Awaiting Payment" }];
		case "rejected":
			return [{ label: "Re-submit for Review" }];
		default:
			return [];
	}
}

export type BillCardProps = Omit<React.ComponentProps<"div">, "onToggle"> & {
	bill: CyncoBill;
	/** Status chip on the card, for bills shown outside a board column. */
	showStatus?: boolean;
	selected?: boolean;
	onToggle?: (id: string) => void;
	/** Any card on the board selected: keep checkboxes visible. */
	someSelected?: boolean;
	onAction?: (bill: CyncoBill, action: string) => void;
};

export function BillCard({ bill, showStatus = false, selected, onToggle, someSelected, onAction, className, ...props }: BillCardProps) {
	const currency = bill.currency ?? "MYR";
	const partial = bill.status === "partially_paid" && (bill.paidAmount ?? 0) > 0 && bill.totalAmount > 0;
	const paidPct = partial ? Math.round(((bill.paidAmount ?? 0) / bill.totalAmount) * 100) : null;
	const actions = quickActions(bill.status);
	const showCheckbox = !!onToggle && (selected || someSelected);
	const posted = POSTED_STATUSES.has(bill.status);

	return (
		<div
			className={cn(
				"group relative w-full min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:border-input-border-hover",
				selected && "border-primary bg-active-primary",
				className,
			)}
			{...props}
		>
			<div className="flex items-start gap-2.5">
				<div className="relative size-8 shrink-0">
					<PartyInitials name={bill.vendorName} className={cn(onToggle && (showCheckbox ? "opacity-0" : "group-hover:opacity-0 group-focus-within:opacity-0"))} />
					{onToggle && (
						<div className={cn("absolute inset-0 flex items-center justify-center", showCheckbox ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")}>
							<RowSelect checked={!!selected} onToggle={() => onToggle(bill.id)} label={`Select ${bill.vendorName ?? "bill"}`} />
						</div>
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className={cn("flex flex-wrap items-center gap-1.5", actions.length > 0 && "pr-6")}>
						<span className="max-w-full truncate text-sm font-medium text-foreground" title={bill.vendorName ?? undefined}>
							{bill.vendorName || "Unknown Vendor"}
						</span>
						{showStatus && <DocStatus status={bill.status} config={BILL_STATUS} />}
						{paidPct !== null && <span className="text-2xs tabular-nums text-primary">{paidPct}% paid</span>}
						{bill.overdue && (
							<StatusChip tone="red" glyph="alert">
								Overdue
							</StatusChip>
						)}
						{bill.isDuplicate && (
							<StatusChip tone="amber" glyph="alert">
								Duplicate
							</StatusChip>
						)}
					</div>
					{/* Too narrow for both: the amount wraps, neither is clipped. */}
					<div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
						<span className="min-w-0 max-w-full truncate text-tiny-id text-tertiary-foreground" title={bill.billNumber ?? undefined}>
							{bill.billNumber ? `#${bill.billNumber}` : "No bill number"}
						</span>
						<span className="ml-auto shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-foreground">{formatCurrency(bill.totalAmount, currency)}</span>
					</div>
					{partial && (
						<p className="mt-0.5 text-right text-xs tabular-nums text-tertiary-foreground">
							Outstanding: <span className="whitespace-nowrap text-foreground">{formatCurrency(outstandingOf(bill), currency)}</span>
						</p>
					)}
				</div>
			</div>

			<div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-table-row-divider pt-2 text-xs">
				{bill.dueDate ? (
					<span className={cn("flex shrink-0 items-center gap-1.5 whitespace-nowrap", bill.overdue ? cn("font-medium", surfaces.negative) : "text-tertiary-foreground")}>
						<CalendarBlankIcon size={12} aria-hidden="true" />
						Due {dayMonth(bill.dueDate)}
					</span>
				) : (
					<span className="text-subtle">No due date</span>
				)}
				{bill.aiConfidence != null && (
					<span className="flex shrink-0 items-center gap-1 text-tertiary-foreground" title={`Read by Cynco AI, ${bill.aiConfidence}% ${confidenceLabel(bill.aiConfidence)} confidence`}>
						<SparkleIcon size={12} weight="fill" className="text-primary" aria-hidden="true" />
						<span className="tabular-nums">AI {bill.aiConfidence}%</span>
					</span>
				)}
				<span className="ml-auto flex min-w-0 items-center gap-2">
					{bill.category && (
						<span className="flex min-w-0 items-center gap-1 text-tertiary-foreground">
							<TagIcon size={12} className="shrink-0" aria-hidden="true" />
							<span className="max-w-32 truncate" title={bill.category}>
								{bill.category}
							</span>
						</span>
					)}
					{posted &&
						(bill.postedToGl ? (
							<span title="Posted to GL" className="flex shrink-0 text-tertiary-foreground">
								<BookOpenIcon size={13} weight="fill" aria-hidden="true" />
								<span className="sr-only">Posted to GL</span>
							</span>
						) : (
							<span title="No GL entry" className="flex shrink-0">
								<StatusChipIcon tone="amber" glyph="alert" />
								<span className="sr-only">No GL entry</span>
							</span>
						))}
				</span>
			</div>

			{actions.length > 0 && (
				<div className="absolute top-2 right-2">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger render={<Button variant="skeleton" size="icon" aria-label={`Quick actions for ${bill.vendorName || "Unknown Vendor"}`} className="text-tertiary-foreground" />}>
							<DotsThreeVerticalIcon size={14} weight="bold" aria-hidden="true" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							{actions.map((a) => (
								<DropdownMenuItem key={a.label} variant={a.destructive ? "destructive" : undefined} onClick={() => onAction?.(bill, a.label)}>
									{a.label}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onClick={() => onAction?.(bill, "Archive")}>
								<TrashIcon size={14} aria-hidden="true" />
								Archive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ BillsBoard */

const BOARD_COLUMNS = [
	{ key: "in_review", label: "In Review", Icon: ClipboardTextIcon, empty: "No bills to review", statuses: ["in_review"] },
	{ key: "pending_approval", label: "Pending Approval", Icon: UserCheckIcon, empty: "No bills awaiting approval", statuses: ["pending_approval"] },
	{ key: "awaiting_payment", label: "Awaiting Payment", Icon: ClockIcon, empty: "No bills awaiting payment", statuses: ["approved", "awaiting_payment", "partially_paid"] },
	{ key: "scheduled", label: "Scheduled", Icon: CalendarCheckIcon, empty: "No scheduled payments", statuses: ["scheduled"] },
	{ key: "paid", label: "Paid", Icon: CheckCircleIcon, empty: "No paid bills in this period", statuses: ["paid"] },
] as const;

export type BillsBoardColumn = (typeof BOARD_COLUMNS)[number]["key"];

export type BillsBoardProps = React.ComponentProps<"div"> & {
	bills: CyncoBill[];
	/** Columns to show, in board order (default: all five). */
	columns?: BillsBoardColumn[];
	selectedIds?: string[];
	onToggleBill?: (id: string) => void;
	paidFilterLabel?: string;
};

/** Columns side by side on a wide container; stacked sections (cynco's phone layout) when narrow. */
export function BillsBoard({ bills, columns, selectedIds, onToggleBill, paidFilterLabel = "Past 30 Days", className, ...props }: BillsBoardProps) {
	const cols = BOARD_COLUMNS.filter((c) => !columns || columns.includes(c.key));
	const selected = new Set(selectedIds ?? []);
	return (
		<div className={cn("@container min-w-0", className)} {...props}>
			<div className="flex flex-col gap-4 @3xl:flex-row @3xl:gap-3 @3xl:overflow-x-auto @3xl:pb-1">
				{cols.map((col) => {
					const list = bills.filter((b) => (col.statuses as readonly string[]).includes(b.status));
					return (
						<section key={col.key} aria-label={col.label} className="flex min-w-0 flex-col @3xl:min-w-52 @3xl:max-w-md @3xl:flex-1">
							<div className="mb-2 flex h-6 items-center justify-between gap-2 px-1">
								<div className="flex min-w-0 items-center gap-2">
									<col.Icon size={14} weight="fill" className="shrink-0 text-subtle" aria-hidden="true" />
									<h3 className="truncate text-sm font-medium text-foreground">{col.label}</h3>
									{list.length > 0 && <span className="rounded-full bg-muted px-1.5 py-0.5 text-2xs leading-none tabular-nums text-tertiary-foreground">{list.length}</span>}
								</div>
								{col.key === "paid" && (
									<Button variant="skeleton" size="sm" className="text-tertiary-foreground">
										{paidFilterLabel}
									</Button>
								)}
							</div>
							<div className="flex flex-1 flex-col rounded-xl border border-table-tray-border bg-table-tray">
								{list.length === 0 ? (
									<div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center @3xl:py-10">
										<col.Icon size={28} weight="duotone" className="mb-2 text-subtle opacity-60" aria-hidden="true" />
										<p className="text-xs text-tertiary-foreground">{col.empty}</p>
									</div>
								) : (
									<>
										<div className="grid gap-2 p-2 @xl:grid-cols-2 @3xl:flex @3xl:flex-col">
											{list.map((b) => (
												<BillCard key={b.id} bill={b} selected={selected.has(b.id)} onToggle={onToggleBill} someSelected={selected.size > 0} />
											))}
										</div>
										<div className="mt-auto flex items-center justify-between gap-2 border-t border-table-tray-border px-3 py-2">
											<span className="text-xs font-medium text-tertiary-foreground">Total</span>
											<span className="min-w-0 truncate text-xs font-medium tabular-nums text-muted-foreground" title={currencyTotals(list, (b) => b.totalAmount, false)}>
												{currencyTotals(list, (b) => b.totalAmount)}
											</span>
										</div>
									</>
								)}
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ BillDetailHeader */

export type BillDetailHeaderProps = React.ComponentProps<"div"> & {
	bill: CyncoBill & { isArchived?: boolean };
	/** Where the bill came from, when it arrived by email. */
	receivedVia?: string;
	hasDocument?: boolean;
	isReExtracting?: boolean;
	isExtracting?: boolean;
	onReExtract?: () => void;
	onArchive?: () => void;
	onRestore?: () => void;
};

export function BillDetailHeader({ bill, receivedVia, hasDocument = true, isReExtracting, isExtracting, onReExtract, onArchive, onRestore, className, ...props }: BillDetailHeaderProps) {
	const [confirmArchive, setConfirmArchive] = React.useState(false);
	const archived = !!bill.isArchived;
	// The confirm swaps out the control that had focus; move focus to its replacement (Cancel, then back to the menu).
	const moreRef = React.useRef<HTMLButtonElement>(null);
	const cancelRef = React.useRef<HTMLButtonElement>(null);
	const swapped = React.useRef(false);
	React.useEffect(() => {
		if (!swapped.current) return;
		(confirmArchive ? cancelRef : moreRef).current?.focus();
	}, [confirmArchive]);
	const askArchive = (next: boolean) => {
		swapped.current = true;
		setConfirmArchive(next);
	};
	const currency = bill.currency ?? "MYR";
	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			{archived && (
				<BillAlert
					variant="warning"
					icon={<ArchiveIcon weight="fill" aria-hidden="true" />}
					title="This bill is archived"
					description="Archived bills are read-only. Restore to make changes."
					action={
						onRestore && (
							<IconButton variant="secondary" icon={<ArrowCounterClockwiseIcon size={14} />} onClick={onRestore}>
								Restore bill
							</IconButton>
						)
					}
				/>
			)}
			<div className="min-w-0">
				<nav aria-label="Breadcrumb" className="mb-1 flex min-w-0 items-center gap-1 text-xs text-tertiary-foreground">
					<span>Bills</span>
					<CaretRightIcon size={10} aria-hidden="true" />
					<span className="truncate text-muted-foreground">{bill.billNumber ?? "Bill"}</span>
				</nav>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex min-w-0 flex-wrap items-center gap-2">
						<h1 className="text-main min-w-0 truncate">{bill.vendorName || "Untitled Bill"}</h1>
						{archived ? (
							<StatusChip tone="neutral" glyph="minus">
								Archived
							</StatusChip>
						) : (
							<DocStatus status={bill.status} config={BILL_STATUS} />
						)}
						{bill.overdue && !archived && (
							<StatusChip tone="red" glyph="alert">
								Overdue
							</StatusChip>
						)}
					</div>
					{!archived && (
						<ActionBar>
							{confirmArchive ? (
								<>
									<Button ref={cancelRef} variant="secondary" onClick={() => askArchive(false)}>
										Cancel
									</Button>
									<Button
										variant="destructive"
										onClick={() => {
											onArchive?.();
											askArchive(false);
										}}
									>
										Confirm archive
									</Button>
								</>
							) : (
								<>
									<DropdownMenu modal={false}>
										<DropdownMenuTrigger render={<Button ref={moreRef} variant="secondary" aria-label="More bill actions" className="w-7" />}>
											<DotsThreeVerticalIcon size={14} weight="bold" aria-hidden="true" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-44">
											<DropdownMenuItem variant="destructive" onClick={() => askArchive(true)}>
												<TrashIcon size={14} aria-hidden="true" />
												Archive
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									{hasDocument && (
										<IconButton variant="secondary" icon={<ArrowsClockwiseIcon size={14} />} onClick={onReExtract} isLoading={isReExtracting} disabled={isExtracting}>
											Re-extract
										</IconButton>
									)}
								</>
							)}
						</ActionBar>
					)}
				</div>
				<FactStrip
					className="mt-2"
					facts={[
						["Bill no.", bill.billNumber ? <span className="font-mono text-xs">{bill.billNumber}</span> : null],
						["Issued", bill.issueDate ? formatDate(bill.issueDate) : null],
						["Due", bill.dueDate ? <span className={negativeClass(!!bill.overdue)}>{formatDate(bill.dueDate)}</span> : null],
						["Total", <span className="tabular-nums">{formatCurrency(bill.totalAmount, currency)}</span>],
						["Received", receivedVia ? <span className="whitespace-normal break-all">{receivedVia}</span> : null],
					]}
				/>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ BillAlerts */

export type BillAlertsProps = React.ComponentProps<"div"> & {
	isDuplicate?: boolean;
	duplicateBill?: { vendorName: string | null; billNumber?: string | null; totalAmount?: number; currency?: string } | null;
	status?: string;
	rejectionNotes?: string | null;
	vendorLoadError?: boolean;
	lineItemsCorrupted?: boolean;
	/** Vendor credits in the bill's currency (cynco ApplyVendorCreditPanel). */
	unusedCredit?: { amount: number; currency?: string } | null;
	onDismissDuplicate?: () => void;
	onApplyCredit?: () => void;
};

/** Alert with its action under the text on narrow containers, at the right when wide. */
function BillAlert({ variant, icon, title, description, action }: { variant: "warning" | "destructive" | "note"; icon: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode }) {
	return (
		<Alert variant={variant} className="@container">
			{icon}
			<div className="col-start-2 flex min-w-0 flex-col gap-2 @md:flex-row @md:items-center @md:justify-between @md:gap-3">
				<div className="min-w-0">
					<AlertTitle className="text-sm">{title}</AlertTitle>
					{description && <AlertDescription className="text-xs text-tertiary-foreground">{description}</AlertDescription>}
				</div>
				{action && <div className="shrink-0">{action}</div>}
			</div>
		</Alert>
	);
}

export function BillAlerts({ isDuplicate, duplicateBill, status, rejectionNotes, vendorLoadError, lineItemsCorrupted, unusedCredit, onDismissDuplicate, onApplyCredit, className, ...props }: BillAlertsProps) {
	return (
		<div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			{isDuplicate && (
				<BillAlert
					variant="warning"
					icon={<WarningCircleIcon weight="fill" aria-hidden="true" />}
					title={
						<>
							Possible duplicate
							{duplicateBill && (
								<span className="font-normal">
									{" — "}
									{duplicateBill.vendorName ?? "Unknown"}
									{duplicateBill.billNumber ? ` #${duplicateBill.billNumber}` : ""}
									{duplicateBill.totalAmount ? <span className="whitespace-nowrap">{` (${formatCurrency(duplicateBill.totalAmount, duplicateBill.currency ?? "MYR")})`}</span> : ""}
								</span>
							)}
						</>
					}
					action={
						<Button variant="secondary" size="sm" onClick={onDismissDuplicate}>
							Dismiss
						</Button>
					}
				/>
			)}
			{rejectionNotes && status === "rejected" && <BillAlert variant="destructive" icon={<XCircleIcon weight="fill" aria-hidden="true" />} title="Rejected" description={rejectionNotes} />}
			{unusedCredit && unusedCredit.amount > 0 && (
				<BillAlert
					variant="note"
					icon={<ReceiptIcon aria-hidden="true" />}
					title={
						<span className="font-normal">
							This vendor has <span className="whitespace-nowrap font-medium tabular-nums">{formatCurrency(unusedCredit.amount, unusedCredit.currency ?? "MYR")}</span> in unused credits.
						</span>
					}
					action={
						<Button variant="secondary" size="sm" onClick={onApplyCredit}>
							Apply vendor credit
						</Button>
					}
				/>
			)}
			{vendorLoadError && <BillAlert variant="warning" icon={<WarningCircleIcon weight="fill" aria-hidden="true" />} title={<span className="font-normal">Could not load vendor list: vendor linking unavailable</span>} />}
			{lineItemsCorrupted && <BillAlert variant="warning" icon={<WarningCircleIcon weight="fill" aria-hidden="true" />} title={<span className="font-normal">Some line item data could not be loaded; please verify amounts</span>} />}
		</div>
	);
}

/* ------------------------------------------------------------------ PayRunTable */

export type CyncoBankAccount = { id: string; accountCode?: string | null; accountName: string };

export type PayRunTableProps = React.ComponentProps<"div"> & {
	/** Pay-run eligible bills (approved / awaiting payment / scheduled / partially paid). */
	bills: CyncoBill[];
	selectedIds?: string[];
	onSelectedChange?: (ids: string[]) => void;
	defaultSelectedIds?: string[];
	/** YYYY-MM-DD; defaults to `today`. */
	scheduledDate?: string;
	/** YYYY-MM-DD used to validate the schedule date. */
	today?: string;
	/** Optional "Pay from" bank / cash account picker. */
	bankAccounts?: CyncoBankAccount[];
	onSchedule?: (billIds: string[], date: string, bankAccountId?: string) => void;
	isSubmitting?: boolean;
};

export function PayRunTable({ bills, selectedIds, onSelectedChange, defaultSelectedIds, scheduledDate, today, bankAccounts, onSchedule, isSubmitting, className, ...props }: PayRunTableProps) {
	const { ids: sel, toggle, set } = useSelection(selectedIds, defaultSelectedIds, onSelectedChange);
	const todayStr = today ?? new Date().toISOString().slice(0, 10);
	const [date, setDate] = React.useState(scheduledDate ?? todayStr);
	const [bank, setBank] = React.useState(bankAccounts?.[0]?.id ?? "");

	const selected = bills.filter((b) => sel.has(b.id));
	const schedulable = selected.filter((b) => b.status === "approved" || b.status === "awaiting_payment");
	const excluded = selected.length - schedulable.length;
	const overdueCount = bills.filter((b) => b.overdue).length;
	const helper =
		selected.length === 0
			? "Select awaiting-payment bills to schedule them."
			: excluded > 0
				? `${excluded} selected ${excluded === 1 ? "bill is" : "bills are"} already scheduled or partially paid.`
				: `${schedulable.length} ready to schedule.`;

	// Errors show only after "Schedule selected" is pressed, then clear on their own as each one is fixed.
	const [attempted, setAttempted] = React.useState(false);
	const uid = React.useId();
	const dateRef = React.useRef<HTMLInputElement>(null);
	const selectAllRef = React.useRef<HTMLButtonElement>(null);
	const dateError = !date ? "Choose a payment date." : date < todayStr ? "Choose today or a later date." : null;
	const billsError = schedulable.length > 0 ? null : selected.length === 0 ? "Select at least one bill." : "Select at least one bill that is awaiting payment.";
	const showDateError = attempted && !!dateError;
	const showBillsError = attempted && !!billsError;
	const schedule = () => {
		if (isSubmitting) return;
		if (dateError || billsError) {
			setAttempted(true);
			(dateError ? dateRef : selectAllRef).current?.focus();
			return;
		}
		setAttempted(false);
		onSchedule?.(schedulable.map((b) => b.id), date, bank || undefined);
	};

	const columns: DataColumn<CyncoBill>[] = [
		{ key: "vendor", header: "Vendor", mobile: "title", className: "min-w-36", cell: (b) => <span className="line-clamp-2 break-words">{b.vendorName ?? "Unknown vendor"}</span> },
		{ key: "billNumber", header: "Bill no.", cell: (b) => <span className="text-tiny-id text-tertiary-foreground">{b.billNumber || "—"}</span> },
		{ key: "due", header: "Due", cell: (b) => <span className={cn("whitespace-nowrap text-xs tabular-nums", b.overdue ? surfaces.negative : "text-tertiary-foreground")}>{b.dueDate ? formatDate(b.dueDate) : "—"}</span> },
		{ key: "status", header: "Status", mobile: "badge", cell: (b) => <DocStatus status={b.status} config={BILL_STATUS} /> },
		{ key: "schedule", header: "Schedule", cell: (b) => <span className="whitespace-nowrap text-xs tabular-nums text-tertiary-foreground">{b.scheduledPaymentDate ? formatDate(b.scheduledPaymentDate) : "—"}</span> },
		{ key: "outstanding", header: "Outstanding", align: "right", mobile: "value", cell: (b) => <span className="font-medium">{formatCurrency(outstandingOf(b), b.currency ?? "MYR")}</span> },
	];

	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<StatGrid min="sm" className="@md:grid-cols-3">
				<StatTile label="Ready" value={bills.length} />
				<StatTile label="Overdue" value={overdueCount} negative={overdueCount > 0} />
				<StatTile label="Selected" value={selected.length ? currencyTotals(selected, outstandingOf) : formatCurrency(0)} />
			</StatGrid>

			<div className="flex flex-col gap-2 @2xl:flex-row @2xl:items-center @2xl:justify-between">
				<ActionBar>
					<Input
						ref={dateRef}
						type="date"
						aria-label="Scheduled payment date"
						value={date}
						min={todayStr}
						onChange={(e) => setDate(e.target.value)}
						aria-invalid={showDateError || undefined}
						aria-describedby={showDateError ? `${uid}-date-error` : undefined}
						className="w-auto min-w-36 tabular-nums"
					/>
					{bankAccounts && bankAccounts.length > 0 && (
						<Select value={bank} onValueChange={setBank} items={bankAccounts.map((a) => ({ value: a.id, label: `${a.accountCode ? `${a.accountCode} · ` : ""}${a.accountName}` }))}>
							<SelectTrigger aria-label="Pay from" className="min-w-0 max-w-full flex-1 @md:max-w-64">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{bankAccounts.map((a) => (
									<SelectItem key={a.id} value={a.id}>
										{a.accountCode && <span className="font-mono text-xs text-tertiary-foreground">{a.accountCode}</span>}
										{a.accountName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					<IconButton
						variant="primary"
						icon={<CalendarCheckIcon size={14} />}
						// Always enabled: pressing it names each problem and focuses the first one. isLoading keeps focus (aria-disabled).
						isLoading={isSubmitting}
						onClick={schedule}
					>
						Schedule selected
					</IconButton>
				</ActionBar>
				<ActionBar>
					{excluded > 0 && (
						<StatusChip tone="amber" glyph="alert">
							{`${excluded} excluded`}
						</StatusChip>
					)}
					<span className="text-xs tabular-nums text-tertiary-foreground">{helper}</span>
				</ActionBar>
			</div>
			{(showDateError || showBillsError) && (
				<div className="flex flex-col gap-1">
					{showDateError && <FieldError className="text-xs" id={`${uid}-date-error`}>{dateError}</FieldError>}
					{showBillsError && billsError && <FieldError className="text-xs" id={`${uid}-bills-error`}>{billsError}</FieldError>}
				</div>
			)}

			<DataList
				caption="Bills ready for payment"
				columns={columns}
				rows={bills}
				getKey={(b) => b.id}
				stackBelow="2xl"
				isRowSelected={(b) => sel.has(b.id)}
				leadingHeader={
					<SelectAll
						ref={selectAllRef}
						total={bills.length}
						selected={selected.length}
						onChange={(all) => set(all ? new Set(bills.map((b) => b.id)) : new Set())}
						label="Select all bills"
						errorId={showBillsError ? `${uid}-bills-error` : undefined}
					/>
				}
				leading={(b) => <RowSelect checked={sel.has(b.id)} onToggle={() => toggle(b.id)} label={`Select ${b.vendorName ?? "bill"}`} />}
				footer={
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span className="text-xs text-tertiary-foreground">
							{selected.length} of {bills.length} selected
						</span>
						<span className="text-xs text-tertiary-foreground">
							Total to pay <span className="ml-2 whitespace-nowrap text-sm font-medium tabular-nums text-foreground">{selected.length ? currencyTotals(selected, outstandingOf, false) : formatCurrency(0)}</span>
						</span>
					</div>
				}
			/>
		</div>
	);
}

/* ------------------------------------------------------------------ RecordBillPaymentDialog */

const PAYMENT_METHODS = [
	{ value: "__none__", label: "Not specified" },
	{ value: "bank_transfer", label: "Bank Transfer" },
	{ value: "check", label: "Check" },
	{ value: "cash", label: "Cash" },
	{ value: "card", label: "Card" },
];

/** Inline field error: a glyph plus words, so it never relies on colour. Link it with aria-describedby. */
function FormField({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string | null; hint?: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<label htmlFor={htmlFor} className="text-form-label">
				{label}
			</label>
			{children}
			{error ? (
				<FieldError className="text-xs" id={`${htmlFor}-error`}>{error}</FieldError>
			) : (
				hint
			)}
		</div>
	);
}

export type RecordBillPaymentDialogProps = {
	billAmount: number;
	paidAmount?: number;
	currency?: string;
	bankAccounts: CyncoBankAccount[];
	defaultOpen?: boolean;
	/** YYYY-MM-DD; defaults to today. */
	defaultDate?: string;
	disabled?: boolean;
	onSubmit?: (data: { paymentDate: string; paymentAmount: string; paymentMethod?: string; paymentReference?: string; bankAccountId: string; notes?: string }) => void;
	/** Classes for the "Record payment" trigger button. */
	className?: string;
	/** Classes for the sheet panel. */
	contentClassName?: string;
};

export function RecordBillPaymentDialog({ billAmount, paidAmount = 0, currency = "MYR", bankAccounts, defaultOpen = false, defaultDate, disabled, onSubmit, className, contentClassName }: RecordBillPaymentDialogProps) {
	const outstanding = outstandingOf({ totalAmount: billAmount, paidAmount });
	const hasPrior = paidAmount > 0;
	const [open, setOpen] = React.useState(defaultOpen);
	const [amount, setAmount] = React.useState(outstanding.toFixed(2));
	const [date, setDate] = React.useState(defaultDate ?? new Date().toISOString().slice(0, 10));
	const [method, setMethod] = React.useState("__none__");
	const [bank, setBank] = React.useState("__none__");
	const [reference, setReference] = React.useState("");
	const [notes, setNotes] = React.useState("");
	// Errors show only after a submit attempt, then clear on their own as each field is fixed.
	const [attempted, setAttempted] = React.useState(false);
	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const uid = React.useId();
	const fid = (k: string) => `${uid}-${k}`;

	const n = Number(amount.trim());
	const errors = {
		amount:
			amount.trim() === "" || isNaN(n) || n <= 0
				? "Enter an amount greater than zero."
				: Math.round(n * 100) > Math.round(outstanding * 100)
					? `Enter ${formatCurrency(outstanding, currency)} or less, the amount still outstanding.`
					: null,
		date: date ? null : "Choose a payment date.",
		bank: bank !== "__none__" ? null : bankAccounts.length === 0 ? "Add a bank or cash account to your Chart of Accounts first." : "Choose a bank or cash account.",
	};
	const shown = (k: keyof typeof errors) => (attempted ? errors[k] : null);
	const invalidProps = (k: keyof typeof errors) => fieldErrorProps(`${fid(k)}-error`, !!shown(k));
	const openSheet = (o: boolean) => {
		setOpen(o);
		if (o) setAttempted(false);
	};
	const submit = () => {
		if (disabled) return;
		const firstInvalid = (["amount", "date", "bank"] as const).find((k) => errors[k]);
		if (firstInvalid) {
			setAttempted(true);
			document.getElementById(fid(firstInvalid))?.focus();
			return;
		}
		setAttempted(false);
		onSubmit?.({
			paymentDate: date,
			paymentAmount: amount.trim(),
			paymentMethod: method === "__none__" ? undefined : method,
			paymentReference: reference || undefined,
			bankAccountId: bank,
			notes: notes || undefined,
		});
		setOpen(false);
	};
	const bankItems = [{ value: "__none__", label: "Select account..." }, ...bankAccounts.map((a) => ({ value: a.id, label: `${a.accountCode ? `${a.accountCode} · ` : ""}${a.accountName}` }))];

	return (
		<>
			<IconButton ref={triggerRef} variant="primary" icon={<CurrencyCircleDollarIcon size={14} />} disabled={disabled} onClick={() => openSheet(true)} className={className}>
				Record payment
			</IconButton>
			{/* Modal: the sheet and its backdrop cover the page, so focus stays inside, the page behind is inert, and focus returns to "Record payment" on close. */}
			<Sheet open={open} onOpenChange={openSheet}>
				<SheetContent side="right" finalFocus={triggerRef} className={cn("sm:max-w-md", contentClassName)}>
					<SheetHeader className="border-b border-border pr-12">
						<SheetTitle>Record payment</SheetTitle>
						<SheetDescription>Record a full or partial payment.</SheetDescription>
					</SheetHeader>
					<div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
						<KeyValueList
							className="rounded-lg border border-border bg-muted px-3 py-0"
							items={[
								...(hasPrior ? [{ label: "Bill total", value: formatCurrency(billAmount, currency) }] : []),
								{ label: hasPrior ? "Outstanding" : "Amount", value: formatCurrency(outstanding, currency), strong: true },
							]}
						/>
						<FormField label="Payment Amount *" htmlFor={fid("amount")} error={shown("amount")} hint={currency !== "MYR" ? <p className="text-xs text-tertiary-foreground">Exchange rate applied at time of recording</p> : null}>
							<Input id={fid("amount")} type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} {...invalidProps("amount")} required className="tabular-nums" />
						</FormField>
						<FormField label="Payment date *" htmlFor={fid("date")} error={shown("date")}>
							<Input id={fid("date")} type="date" value={date} onChange={(e) => setDate(e.target.value)} {...invalidProps("date")} required className="tabular-nums" />
						</FormField>
						<FormField label="Payment method" htmlFor={fid("method")}>
							<Select value={method} onValueChange={setMethod} items={PAYMENT_METHODS}>
								<SelectTrigger id={fid("method")} className="w-full">
									<SelectValue placeholder="Select method..." />
								</SelectTrigger>
								<SelectContent>
									{PAYMENT_METHODS.map((m) => (
										<SelectItem key={m.value} value={m.value}>
											{m.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						<FormField
							label="Bank / Cash Account *"
							htmlFor={fid("bank")}
							error={shown("bank")}
							hint={bankAccounts.length === 0 ? <p className={cn("text-xs", surfaces.negative)}>No bank/cash accounts found in your Chart of Accounts.</p> : null}
						>
							<Select value={bank} onValueChange={setBank} items={bankItems}>
								<SelectTrigger id={fid("bank")} aria-required="true" {...invalidProps("bank")} className="w-full">
									<SelectValue placeholder="Select account..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__none__">Select account...</SelectItem>
									{bankAccounts.map((a) => (
										<SelectItem key={a.id} value={a.id}>
											{a.accountCode && <span className="font-mono text-xs text-tertiary-foreground">{a.accountCode}</span>}
											{a.accountName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						<FormField label="Reference number" htmlFor={fid("ref")}>
							<Input id={fid("ref")} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. TXN-12345, check number" maxLength={100} />
						</FormField>
						<FormField label="Notes" htmlFor={fid("notes")}>
							<Textarea id={fid("notes")} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional payment notes..." rows={2} maxLength={1000} className="min-h-14 resize-none px-2 py-1.5 text-sm" />
						</FormField>
					</div>
					<SheetFooter className="flex-row flex-wrap justify-end border-t border-border">
						<Button variant="secondary" onClick={() => openSheet(false)}>
							Cancel
						</Button>
						{/* Always enabled: pressing it names each problem and focuses the first one. */}
						<ShortcutButton metaShortcut="enter" onClick={submit}>
							Confirm payment
						</ShortcutButton>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	);
}

/* ------------------------------------------------------------------ ReceiptExtractionProgress */

export type ExtractionStage = "queued" | "reading" | "extracting" | "checking" | "applying" | "done" | "failed";
export type ExtractionView =
	| { kind: "running"; stage: ExtractionStage; detail?: string | null; slow?: boolean }
	| { kind: "timed-out" }
	| { kind: "failed"; message?: string | null; retryable?: boolean }
	| { kind: "done"; confidence: number | null };

const EXTRACTION_STEPS: Array<{ stage: ExtractionStage; label: string }> = [
	{ stage: "reading", label: "Reading" },
	{ stage: "extracting", label: "Extracting" },
	{ stage: "checking", label: "Checking" },
	{ stage: "applying", label: "Applying" },
];
const STAGE_ORDER: ExtractionStage[] = ["queued", "reading", "extracting", "checking", "applying", "done"];
const FALLBACK_FAILURE = "Could not extract data from this document. You can fill in the details manually or try again.";
const TIMED_OUT = "This is taking longer than usual. It may still finish in the background.";

export type ReceiptExtractionProgressProps = React.ComponentProps<"div"> & {
	view: ExtractionView | null;
	hasExtractedData?: boolean;
	/** The user chose to fill the form while extraction runs. */
	manualEntry?: boolean;
	isReExtracting?: boolean;
	onReview?: () => void;
	onReExtract?: () => void;
	onEnterManually?: () => void;
	onCheckStatus?: () => void;
};

export function ReceiptExtractionProgress({ view, hasExtractedData = true, manualEntry = false, isReExtracting, onReview, onReExtract, onEnterManually, onCheckStatus, className, ...props }: ReceiptExtractionProgressProps) {
	if (!view) return null;
	const enterManually = !manualEntry;
	const activeStep = view.kind === "running" ? EXTRACTION_STEPS.find((s) => s.stage === (view.stage === "failed" ? "reading" : view.stage)) : undefined;
	const announcement =
		view.kind === "running"
			? `Reading your bill${activeStep ? `: ${activeStep.label}` : ""}`
			: view.kind === "done"
				? `Read by Cynco AI${view.confidence !== null ? `, ${view.confidence}% ${confidenceLabel(view.confidence)}` : ""}`
				: view.kind === "timed-out"
					? TIMED_OUT
					: "";
	return (
		<div data-slot="extraction-progress" className={cn("@container min-w-0 rounded-lg border border-border bg-card px-3 py-2.5", className)} {...props}>
			<LiveStatus>
				{announcement}
			</LiveStatus>
			{view.kind === "running" && (
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
						<div className="min-w-0">
							<p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
								<SparkleIcon size={13} weight="fill" className="text-primary" aria-hidden="true" />
								Reading your bill
							</p>
							<p className="text-xs text-tertiary-foreground">
								{view.stage === "done" ? "Done" : view.stage === "failed" ? "Ran into a problem, trying again" : view.slow ? "Taking longer than usual, still working" : "Usually under a minute"}
							</p>
						</div>
						{enterManually && (
							<Button variant="skeleton" size="sm" onClick={onEnterManually} className="shrink-0 text-primary">
								Fill in details myself
							</Button>
						)}
					</div>
					<ol className="flex flex-col">
						{EXTRACTION_STEPS.map((step, i) => {
							const at = STAGE_ORDER.indexOf(view.stage === "failed" ? "reading" : view.stage);
							const own = STAGE_ORDER.indexOf(step.stage);
							const status = own < at ? "complete" : own === at ? "active" : "pending";
							const last = i === EXTRACTION_STEPS.length - 1;
							return (
								<li key={step.stage} aria-current={status === "active" ? "step" : undefined} className={cn("flex gap-2.5", status === "pending" && "text-tertiary-foreground [&_*]:text-inherit")}>
									<div className="flex w-3.5 shrink-0 flex-col items-center">
										<div className="flex h-4 items-center">
											{status === "complete" ? (
												<StatusChipIcon tone="green" glyph="check" />
											) : status === "active" ? (
												<SmallSpinner size={14} className="text-primary" />
											) : (
												<span className="size-3 rounded-full border-2 border-subtle" />
											)}
										</div>
										{!last && <div className="mt-0.5 w-px flex-1 bg-border" />}
									</div>
									<div className={cn("flex min-w-0 flex-1 flex-col", last ? "pb-0.5" : "pb-2")}>
										<span className="text-xs leading-4 text-foreground">
											{step.label}
											{status === "active" && "…"}
											<span className="sr-only">{status === "complete" ? ", done" : status === "active" ? ", in progress" : ", not started"}</span>
										</span>
										{status === "active" && view.detail && <span className="text-2xs text-tertiary-foreground">{view.detail}</span>}
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			)}

			{view.kind === "timed-out" && (
				<div className="flex flex-col gap-2">
					<div className="flex items-start gap-2">
						<span className="mt-px shrink-0">
							<StatusChipIcon tone="amber" glyph="hourglass" />
						</span>
						<p className="min-w-0 flex-1 text-xs text-muted-foreground">{TIMED_OUT}</p>
					</div>
					<ActionBar className="pl-6">
						{enterManually && (
							<Button variant="primary" size="sm" onClick={onEnterManually}>
								Fill in details myself
							</Button>
						)}
						<IconButton variant="secondary" size="sm" icon={<ArrowClockwiseIcon size={12} />} onClick={onReExtract} disabled={isReExtracting}>
							Re-extract
						</IconButton>
						<Button variant="skeleton" size="sm" onClick={onCheckStatus} className="text-primary">
							Check again
						</Button>
					</ActionBar>
				</div>
			)}

			{view.kind === "done" && (
				<div className="flex flex-wrap items-center gap-2">
					<ShieldCheckIcon size={14} weight="fill" className="shrink-0 text-primary" aria-hidden="true" />
					<p className="min-w-0 flex-1 text-xs text-tertiary-foreground">
						Read by Cynco AI
						{view.confidence !== null && (
							<>
								{" · "}
								<span className="whitespace-nowrap tabular-nums text-foreground">
									{view.confidence}% {confidenceLabel(view.confidence)}
								</span>
							</>
						)}
					</p>
					{hasExtractedData && (
						<Button variant="secondary" size="sm" onClick={onReview}>
							Review
						</Button>
					)}
				</div>
			)}

			{view.kind === "failed" && (
				<div role="alert" className="flex flex-col gap-2">
					<div className="flex items-start gap-2">
						<span className="mt-px shrink-0">
							<StatusChipIcon tone="red" glyph="alert" />
						</span>
						<p className="min-w-0 flex-1 text-xs text-foreground">{view.message || FALLBACK_FAILURE}</p>
					</div>
					{view.retryable !== false && (
						<ActionBar className="pl-6">
							<IconButton variant="primary" size="sm" icon={<ArrowClockwiseIcon size={12} />} onClick={onReExtract} disabled={isReExtracting}>
								Re-extract
							</IconButton>
						</ActionBar>
					)}
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ Party: overview header */

export type PartyRole = "customer" | "vendor";

export type PartyOverviewHeaderProps = React.ComponentProps<"div"> & {
	role: PartyRole;
	name: string;
	isActive?: boolean;
	/** Subledger balance: positive = they owe you (customer) / you owe them (vendor). */
	balance: number;
	overdue: number;
	/** YYYY-MM-DD of the oldest overdue item. */
	overdueSince?: string | null;
	openCount: number;
	/** Billed (customer) or spend (vendor), trailing 12 months. */
	trendTotal: number;
	paymentTerms?: string | null;
	category?: string | null;
	/** YYYY-MM-DD the party was created. */
	since?: string | null;
	currency?: string;
	tab?: "activity" | "ledger" | "details";
	onTabChange?: (tab: string) => void;
};

export function PartyOverviewHeader({
	role,
	name,
	isActive = true,
	balance,
	overdue,
	overdueSince,
	openCount,
	trendTotal,
	paymentTerms,
	category,
	since,
	currency = "MYR",
	tab: tabProp,
	onTabChange,
	className,
	...props
}: PartyOverviewHeaderProps) {
	const isVendor = role === "vendor";
	const [tab, setTab] = React.useState(tabProp ?? "activity");
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-4", className)} {...props}>
			<div className="min-w-0">
				<nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1 text-xs text-tertiary-foreground">
					<span>{isVendor ? "Vendors" : "Customers"}</span>
					<CaretRightIcon size={10} aria-hidden="true" />
				</nav>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2.5">
						<PartyInitials name={name} size="sm" />
						<h1 className="text-main min-w-0 truncate">{name}</h1>
						{!isActive && (
							<StatusChip tone="neutral" glyph="minus" className="shrink-0">
								Inactive
							</StatusChip>
						)}
					</div>
					<ActionBar>
						<IconButton variant="secondary" icon={<FileTextIcon size={14} />}>
							Statement
						</IconButton>
						<IconButton variant="primary" icon={<PlusIcon size={14} weight="bold" />}>
							{isVendor ? "New bill" : "New invoice"}
						</IconButton>
					</ActionBar>
				</div>
			</div>
			<StatGrid aria-label={isVendor ? "Vendor position" : "Customer position"} className="@3xl:grid-cols-4">
				<StatTile label={isVendor ? "You owe them" : "They owe you"} value={formatCurrency(balance, currency)} />
				<StatTile
					label="Overdue"
					value={formatCurrency(overdue, currency)}
					negative={overdue > 0}
					sub={
						overdue > 0 && overdueSince ? (
							<StatusChip tone="red" glyph="clock">
								{`since ${monthYear(overdueSince)}`}
							</StatusChip>
						) : undefined
					}
				/>
				<StatTile label={isVendor ? "Open bills" : "Open invoices"} value={openCount} />
				<StatTile label={isVendor ? "Spend, 12 months" : "Billed, 12 months"} value={formatCurrency(trendTotal, currency)} />
			</StatGrid>
			<div className="flex flex-col gap-x-6 gap-y-2 border-b border-border @2xl:flex-row @2xl:items-center @2xl:justify-between">
				<ScrollRow>
					<Tabs
						value={tab}
						onValueChange={(v: string) => {
							setTab(v as typeof tab);
							onTabChange?.(v);
						}}
					>
						<TabsList variant="underline" className="border-b-0">
							<TabsTrigger variant="underline" value="activity">
								Activity
							</TabsTrigger>
							<TabsTrigger variant="underline" value="ledger">
								Ledger
							</TabsTrigger>
							<TabsTrigger variant="underline" value="details">
								Details
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</ScrollRow>
				<FactStrip
					className="pb-2 text-xs"
					facts={[
						["Terms", paymentTerms],
						["Category", category],
						[isVendor ? "Vendor since" : "Customer since", since ? monthYear(since) : null],
					]}
				/>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ PartyRail */

/** Aging buckets; tones are status colours (a chart, so var() fills). */
const AGING_BUCKETS = [
	{ key: "current", label: "Not yet due", tone: "var(--status-neutral)" },
	{ key: "days1to30", label: "1–30 days late", tone: "var(--status-amber)" },
	{ key: "days31to60", label: "31–60 days late", tone: "var(--status-orange)" },
	{ key: "days61plus", label: "61+ days late", tone: "var(--status-red)" },
] as const;

const CONTACT_LINK = "min-h-6 rounded-sm outline-none hover:text-foreground hover:underline focus-ring";
const RAIL_ACTION = "inline-flex min-h-6 items-center rounded-sm outline-none hover:underline focus-ring";

export type PartyAging = { current: number; days1to30: number; days31to60: number; days61plus: number };
export type PartyContact = { id: string; name: string; role?: string | null; jobTitle?: string | null; email?: string | null; phone?: string | null; isPrimary?: boolean };

export type PartyRailProps = React.ComponentProps<"aside"> & {
	role: PartyRole;
	currency?: string;
	/** Subledger balance (ground truth). */
	ledgerBalance: number;
	/** Sum of open bills / invoices — ties out against the ledger. */
	openItemsTotal: number;
	aging: PartyAging;
	/** Last 12 months: { month: "2026-10", total }. */
	trend?: Array<{ month: string; total: number }>;
	/** Unused credit notes per currency (customers only). */
	credits?: Array<{ currency: string; amount: number; count: number }>;
	/** Where "View credit notes" goes; renders it as a real link. */
	creditNotesHref?: string;
	/** In-app handler for "View credit notes" when there is no URL; renders it as a button. Without either, the action is hidden. */
	onViewCreditNotes?: () => void;
	contacts?: PartyContact[];
};

/** One column as a rail; two (then three) columns when its container is wide. */
export function PartyRail({ role, currency = "MYR", ledgerBalance, openItemsTotal, aging, trend, credits, creditNotesHref, onViewCreditNotes, contacts, className, ...props }: PartyRailProps) {
	const isVendor = role === "vendor";
	const tiesOut = Math.round(ledgerBalance * 100) === Math.round(openItemsTotal * 100);
	const agingTotal = AGING_BUCKETS.reduce((s, b) => s + aging[b.key], 0);
	const trendTotal = (trend ?? []).reduce((s, m) => s + m.total, 0);
	const trendLabel = isVendor ? "Spend, 12 months" : "Billed, 12 months";
	const chartData = (trend ?? []).map((m) => ({ m: new Date(`${m.month}-01`).toLocaleDateString("en-GB", { month: "short" }), v: m.total }));

	return (
		<aside className={cn("@container min-w-0", className)} {...props}>
			<div className="grid items-start gap-3 @xl:grid-cols-2 @5xl:grid-cols-3">
				{!isVendor && credits && (
					<RailCard title="Available credit">
						{credits.length === 0 ? (
							<p className="text-sm text-muted-foreground">No unused credit.</p>
						) : (
							<KeyValueList className="divide-y-0" items={credits.map((c) => ({ label: `${c.count} credit ${c.count === 1 ? "note" : "notes"}`, value: formatCurrency(c.amount, c.currency), strong: false }))} />
						)}
						{creditNotesHref ? (
							<a href={creditNotesHref} className={cn("mt-1 w-fit text-xs text-primary", RAIL_ACTION)}>
								View credit notes
							</a>
						) : onViewCreditNotes ? (
							<button type="button" onClick={onViewCreditNotes} className={cn("mt-1 w-fit cursor-pointer text-xs text-primary", RAIL_ACTION)}>
								View credit notes
							</button>
						) : null}
					</RailCard>
				)}

				<RailCard
					title="Position"
					trailing={
						tiesOut ? (
							<StatusChip tone="green" glyph="check">
								Books tie
							</StatusChip>
						) : (
							<StatusChip tone="amber" glyph="alert">
								Needs review
							</StatusChip>
						)
					}
				>
					<KeyValueList
						className="divide-y-0"
						items={[
							{ label: "Ledger balance", value: formatCurrency(ledgerBalance, currency) },
							{ label: isVendor ? "Open bills" : "Open invoices", value: formatCurrency(openItemsTotal, currency) },
						]}
					/>
					{!tiesOut && <p className={cn("mt-1 text-xs", surfaces.negative)}>Ledger and documents differ by {formatCurrency(Math.abs(ledgerBalance - openItemsTotal), currency)}.</p>}
				</RailCard>

				<RailCard title="Aging">
					{agingTotal <= 0 ? (
						<p className="py-1 text-sm text-muted-foreground">Nothing open.</p>
					) : (
						<>
							<div aria-hidden="true" className="mb-1.5 flex h-1.5 gap-px overflow-hidden rounded-full bg-muted">
								{AGING_BUCKETS.map((b) => (aging[b.key] > 0 ? <span key={b.key} style={{ width: `${(aging[b.key] / agingTotal) * 100}%`, background: b.tone }} /> : null))}
							</div>
							<KeyValueList
								className="divide-y-0"
								items={AGING_BUCKETS.map((b) => ({
									label: (
										<span className="inline-flex items-center gap-2">
											<span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: b.tone }} />
											{b.label}
										</span>
									),
									value: <span className={cn(aging[b.key] > 0 ? "font-medium" : "text-tertiary-foreground")}>{formatCurrency(aging[b.key], currency)}</span>,
								}))}
							/>
						</>
					)}
				</RailCard>

				{trend && (
					<RailCard title={trendLabel} trailing={<span className="text-xs tabular-nums text-muted-foreground">{formatCurrency(trendTotal, currency)}</span>}>
						{trendTotal > 0 ? (
							<>
								<ChartContainer
									config={{ v: { label: trendLabel, color: "var(--chart-series-1)" } }}
									className="aspect-auto h-16 w-full"
								>
									<BarChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} title={`${trendLabel} by month`} desc="Use the arrow keys to step through months. The same figures follow as a table.">
										<XAxis dataKey="m" hide />
										<ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator formatter={(v) => formatCurrency(Number(v), currency)} />} />
										<Bar dataKey="v" fill="var(--color-v)" radius={2} />
									</BarChart>
								</ChartContainer>
								<table className="sr-only">
									<caption>{trendLabel} by month</caption>
									<tbody>
										{(trend ?? []).map((m) => (
											<tr key={m.month}>
												<th scope="row">{monthYear(`${m.month}-01`)}</th>
												<td>{formatCurrency(m.total, currency)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</>
						) : (
							<p className="py-1 text-sm text-muted-foreground">{isVendor ? "No bills in the last 12 months." : "No invoices in the last 12 months."}</p>
						)}
					</RailCard>
				)}

				{contacts && (
					<RailCard
						title="Contacts"
						trailing={
							<IconButton variant="skeleton" size="sm" icon={<PlusIcon size={12} weight="bold" />} className="-my-1 text-tertiary-foreground">
								Add contact
							</IconButton>
						}
					>
						{contacts.length === 0 ? (
							<p className="py-1 text-sm text-muted-foreground">No contacts</p>
						) : (
							<ul className="-mx-1 flex flex-col">
								{contacts.map((c) => (
									<li key={c.id} className="group flex items-start justify-between gap-2 rounded-lg px-1 py-1.5 hover:bg-table-row-hover">
										<div className="min-w-0 flex-1">
											<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
												<span className="min-w-0 truncate text-sm font-medium text-foreground">{c.name}</span>
												{c.isPrimary && (
													<StatusChip tone="blue" glyph="user" className="shrink-0">
														Primary
													</StatusChip>
												)}
												{c.role && <span className="shrink-0 text-2xs capitalize text-tertiary-foreground">{c.role}</span>}
											</div>
											<div className="mt-0.5 flex min-w-0 flex-col gap-0.5 text-xs text-tertiary-foreground">
												{c.email && (
													<a href={`mailto:${c.email}`} className={cn("flex min-w-0 items-center gap-1", CONTACT_LINK)}>
														<EnvelopeIcon size={12} className="shrink-0" aria-hidden="true" />
														<span className="truncate">{c.email}</span>
													</a>
												)}
												{c.phone && (
													<a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className={cn("flex w-fit items-center gap-1 tabular-nums", CONTACT_LINK)}>
														<PhoneIcon size={12} className="shrink-0" aria-hidden="true" />
														{c.phone}
													</a>
												)}
											</div>
										</div>
										<div className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
											{!c.isPrimary && (
												<Button variant="skeleton" size="icon" aria-label={`Set ${c.name} as primary`}>
													<StarIcon size={13} aria-hidden="true" />
												</Button>
											)}
											<Button variant="skeleton" size="icon" aria-label={`Edit contact ${c.name}`}>
												<PencilSimpleIcon size={13} aria-hidden="true" />
											</Button>
										</div>
									</li>
								))}
							</ul>
						)}
					</RailCard>
				)}
			</div>
		</aside>
	);
}

/* ------------------------------------------------------------------ PartyTimeline */

export type PartyEvent = {
	id: string;
	kind: "document" | "payment" | "bank";
	/** YYYY-MM-DD */
	date: string;
	title?: string | null;
	reference?: string | null;
	status?: string | null;
	dueDate?: string | null;
	overdue?: boolean;
	/** Positive raises the balance; payments are negative. */
	amount: number;
	currency?: string;
	/** Base-currency equivalent for a foreign event. */
	baseAmount?: number | null;
};

const EVENT_DOT: Record<PartyEvent["kind"], string> = { document: "var(--primary)", payment: "var(--status-green)", bank: "var(--status-neutral)" };

export type PartyTimelineProps = React.ComponentProps<"div"> & { events: PartyEvent[]; role: PartyRole; currency?: string };

/** Day column on wide containers; on narrow ones the day joins the detail line. */
export function PartyTimeline({ events, role, currency = "MYR", className, ...props }: PartyTimelineProps) {
	const uid = React.useId();
	if (events.length === 0) {
		return (
			<div className={cn("flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center", className)} {...props}>
				<ClockIcon size={20} className="mb-2 text-subtle" aria-hidden="true" />
				<p className="text-sm font-medium text-foreground">No activity yet</p>
				<p className="mt-0.5 text-xs text-tertiary-foreground">{role === "vendor" ? "Bills and payments for this vendor will appear here." : "Invoices and payments for this customer will appear here."}</p>
			</div>
		);
	}
	const byMonth = new Map<string, PartyEvent[]>();
	for (const e of events) {
		const k = e.date.slice(0, 7);
		byMonth.set(k, [...(byMonth.get(k) ?? []), e]);
	}
	const kindLabel = (e: PartyEvent) => (e.kind === "document" ? (role === "vendor" ? "Bill" : "Invoice") : e.kind === "payment" ? (role === "vendor" ? "Payment sent" : "Payment received") : "Bank line");
	const sectionId = (month: string) => `${uid}-${month}`;
	const statusText = (e: PartyEvent) => (!e.status || e.kind === "bank" ? null : e.kind === "document" && role === "vendor" ? (BILL_STATUS[e.status]?.label ?? e.status) : sentenceCase(e.status));

	return (
		<div className={cn("@container flex min-w-0 flex-col gap-5", className)} {...props}>
			{[...byMonth].map(([month, list]) => (
				<section key={month} aria-labelledby={sectionId(month)}>
					<h3 id={sectionId(month)} className="mb-2 text-xs font-medium text-tertiary-foreground">{new Date(`${month}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h3>
					<ul className={surfaces.surface}>
						{list.map((e) => {
							const kind = kindLabel(e);
							const detail = [e.reference, e.dueDate && e.kind === "document" && e.status !== "paid" ? `Due ${dayMonth(e.dueDate)}` : null, e.overdue ? null : statusText(e)].filter(Boolean).join(" · ");
							const cur = e.currency ?? currency;
							return (
								<li key={e.id} className="flex items-start gap-3 border-b border-table-row-divider px-3 py-2.5 last:border-b-0 hover:bg-table-row-hover @md:items-center">
									<span className="hidden w-12 shrink-0 text-xs tabular-nums text-tertiary-foreground @md:block">{dayMonth(e.date)}</span>
									<span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full @md:mt-0" style={{ background: EVENT_DOT[e.kind] }} />
									<span className="min-w-0 flex-1">
										<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<span className="line-clamp-2 min-w-0 break-words text-sm text-foreground @md:line-clamp-1">
												<span className="font-medium">{kind}</span>
												{e.title && !e.title.startsWith(kind) && <span className="text-muted-foreground"> · {e.title}</span>}
											</span>
											{e.overdue && (
												<StatusChip tone="red" glyph="alert" className="shrink-0">
													Overdue
												</StatusChip>
											)}
										</span>
										<span className="block truncate text-xs text-tertiary-foreground">
											<span className="tabular-nums @md:hidden">
												{dayMonth(e.date)}
												{detail && " · "}
											</span>
											{detail}
										</span>
									</span>
									<span className="shrink-0 text-right tabular-nums">
										<span className={cn("block whitespace-nowrap text-sm font-medium", e.amount < 0 ? "text-muted-foreground" : "text-foreground")}>{partyMoney(e.amount, cur)}</span>
										{cur !== currency && <span className="block whitespace-nowrap text-2xs text-tertiary-foreground">{e.baseAmount == null ? "No rate" : `≈ ${partyMoney(e.baseAmount, currency)}`}</span>}
									</span>
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}

/* ------------------------------------------------------------------ PartyLedgerTable */

export type PartyLedgerRow = { id: string; entryDate: string; event: string; documentNumber?: string | null; documentType?: string; amount: number; runningBalance: number };

export type PartyLedgerTableProps = { rows: PartyLedgerRow[]; currency?: string; className?: string };

export function PartyLedgerTable({ rows, currency = "MYR", className }: PartyLedgerTableProps) {
	// Statement arrives oldest-first (running balance order); show newest first.
	const list = [...rows].reverse();
	const columns: DataColumn<PartyLedgerRow>[] = [
		{ key: "date", header: "Date", cell: (r) => <span className="whitespace-nowrap text-xs tabular-nums text-tertiary-foreground">{formatDate(r.entryDate)}</span> },
		{ key: "event", header: "Event", mobile: "title", cell: (r) => sentenceCase(r.event) },
		{ key: "document", header: "Document", cell: (r) => <span className="text-tiny-id text-tertiary-foreground">{r.documentNumber ?? sentenceCase(r.documentType ?? "")}</span> },
		{ key: "amount", header: `Amount (${currency})`, align: "right", cell: (r) => <span className="text-muted-foreground">{formatBracketed(r.amount)}</span> },
		{ key: "balance", header: "Balance", align: "right", mobile: "value", cell: (r) => <span className="font-medium">{formatCurrency(r.runningBalance, currency)}</span> },
	];
	return (
		<DataList
			className={className}
			caption="Ledger"
			columns={columns}
			rows={list}
			getKey={(r) => r.id}
			dense
			empty="No ledger entries yet · Entries appear when documents post to the books."
		/>
	);
}

/* ------------------------------------------------------------------ CustomerListTable */

export type CyncoCustomerRow = {
	id: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	location?: string | null;
	isActive?: boolean;
	currency?: string;
	creditLimit?: number | null;
	receivables?: {
		outstanding: number;
		overdue: number;
		openInvoiceCount: number;
		extraCurrencies?: number;
		nextAction?: { label: string; tone?: "critical" | "warning" | "neutral" } | null;
	} | null;
	/** Estimated margin over the sales window. */
	margin?: { percent: number; revenue: number; belowCostLines?: number } | null;
};

function creditLimitChip(c: CyncoCustomerRow): { label: string; tone: StatusTone; glyph: StatusGlyph } | null {
	const r = c.receivables;
	if (!r || !c.creditLimit || c.creditLimit <= 0 || r.extraCurrencies) return null;
	if (r.outstanding > c.creditLimit) return { label: "Over limit", tone: "red", glyph: "x" };
	if (r.outstanding >= c.creditLimit * 0.85) return { label: "Near limit", tone: "amber", glyph: "alert" };
	return { label: "Within limit", tone: "green", glyph: "check" };
}

export type CustomerListTableProps = {
	customers: CyncoCustomerRow[];
	selectedIds?: string[];
	onSelectedChange?: (ids: string[]) => void;
	defaultSelectedIds?: string[];
	marginWindowDays?: number;
	onRowClick?: (row: CyncoCustomerRow) => void;
	className?: string;
};

export function CustomerListTable({ customers, selectedIds, onSelectedChange, defaultSelectedIds, marginWindowDays = 90, onRowClick, className }: CustomerListTableProps) {
	const { ids, toggle, set } = useSelection(selectedIds, defaultSelectedIds, onSelectedChange);
	const columns: DataColumn<CyncoCustomerRow>[] = [
		{
			key: "name",
			header: "Customer",
			mobile: "title",
			className: "max-w-64",
			cell: (c) => <NameCell name={c.name} subtitle={[c.email || c.phone, c.location].filter(Boolean).join(" · ")} inactive={c.isActive === false} inactiveLabel="Archived" />,
		},
		{
			key: "receivables",
			header: "Owes you",
			align: "right",
			mobile: "value",
			cell: (c) => {
				const r = c.receivables;
				if (!r || r.openInvoiceCount === 0) return <CellNull />;
				const cur = c.currency ?? "MYR";
				const chip = creditLimitChip(c);
				return (
					<div className="flex flex-col items-end gap-0.5">
						<span className="whitespace-nowrap text-foreground">
							{formatCurrency(r.outstanding, cur)}
							{!!r.extraCurrencies && <span className="ml-1 text-xs font-normal text-tertiary-foreground">+{r.extraCurrencies} currencies</span>}
						</span>
						<span className={cn("whitespace-nowrap text-xs font-normal", r.overdue > 0 ? surfaces.negative : "text-tertiary-foreground")}>
							{r.overdue > 0 ? `${formatCurrency(r.overdue, cur)} overdue` : `${r.openInvoiceCount === 1 ? "1 invoice" : `${r.openInvoiceCount} invoices`} open`}
						</span>
						{chip && (
							<StatusChip tone={chip.tone} glyph={chip.glyph} className="mt-0.5">
								{chip.label}
							</StatusChip>
						)}
					</div>
				);
			},
		},
		{
			key: "margin",
			header: `Est. margin (${marginWindowDays}d)`,
			cell: (c) => {
				const m = c.margin;
				if (!m) return <CellNull />;
				return (
					<span className="inline-flex flex-col">
						<span className={cn("tabular-nums", m.percent < 0 || m.belowCostLines ? surfaces.negative : "text-foreground")}>{m.percent.toFixed(1)}%</span>
						<span className="whitespace-nowrap text-xs font-normal tabular-nums text-tertiary-foreground">{m.belowCostLines ? "sold below cost" : `on ${formatCurrencyCompact(m.revenue, c.currency ?? "MYR")}`}</span>
					</span>
				);
			},
		},
		{
			key: "nextAction",
			header: "Next action",
			mobile: "badge",
			cell: (c) => {
				const a = c.receivables?.nextAction;
				if (!a) return <span className="hidden text-subtle @2xl:inline">—</span>;
				return (
					<StatusChip tone={a.tone === "critical" ? "red" : a.tone === "warning" ? "amber" : "neutral"} glyph={a.tone === "critical" ? "alert" : a.tone === "warning" ? "clock" : undefined}>
						{a.label}
					</StatusChip>
				);
			},
		},
	];
	return (
		<DataList
			className={className}
			caption="Customers"
			columns={columns}
			rows={customers}
			getKey={(c) => c.id}
			stackBelow="2xl"
			onRowClick={onRowClick}
			isRowSelected={(c) => ids.has(c.id)}
			leadingHeader={<SelectAll total={customers.length} selected={customers.filter((c) => ids.has(c.id)).length} onChange={(all) => set(all ? new Set(customers.map((c) => c.id)) : new Set())} label="Select all customers" />}
			leading={(c) => <RowSelect checked={ids.has(c.id)} onToggle={() => toggle(c.id)} label={`Select ${c.name}`} />}
			trailing={(c) => (
				<RowActions
					label={`Actions for ${c.name}`}
					items={[
						{ label: "Edit", icon: <PencilSimpleIcon size={14} /> },
						{ label: "Manage contacts", icon: <UserCheckIcon size={14} /> },
						{ label: "Delete", icon: <TrashIcon size={14} />, destructive: true },
					]}
				/>
			)}
			empty="No matching customers"
		/>
	);
}

/* ------------------------------------------------------------------ VendorListTable */

export type CyncoVendorRow = {
	id: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	category?: string | null;
	city?: string | null;
	country?: string | null;
	isActive?: boolean;
	/** MYR figures (the page formats them in the display currency). */
	outstanding?: number;
	overdue?: number;
	totalPaid?: number;
	lastPaymentDate?: string | null;
};

export type VendorListTableProps = {
	vendors: CyncoVendorRow[];
	selectedIds?: string[];
	onSelectedChange?: (ids: string[]) => void;
	defaultSelectedIds?: string[];
	currency?: string;
	onRowClick?: (row: CyncoVendorRow) => void;
	className?: string;
};

export function VendorListTable({ vendors, selectedIds, onSelectedChange, defaultSelectedIds, currency = "MYR", onRowClick, className }: VendorListTableProps) {
	const { ids, toggle, set } = useSelection(selectedIds, defaultSelectedIds, onSelectedChange);
	const columns: DataColumn<CyncoVendorRow>[] = [
		{
			key: "name",
			header: "Vendor",
			mobile: "title",
			className: "max-w-72",
			cell: (v) => {
				const place = [v.city, v.country].filter(Boolean).join(", ");
				return <NameCell name={v.name} subtitle={[v.email || v.phone, v.category, place].filter(Boolean).join(" · ")} inactive={v.isActive === false} inactiveLabel="Inactive" />;
			},
		},
		{
			key: "outstanding",
			header: "You owe",
			align: "right",
			mobile: "value",
			cell: (v) => {
				const owed = v.outstanding ?? 0;
				const overdue = v.overdue ?? 0;
				if (owed <= 0) return <CellNull />;
				return (
					<div className="leading-tight">
						<div className="text-foreground">{formatCurrency(owed, currency)}</div>
						{overdue > 0 && <div className={cn("text-xs font-normal", surfaces.negative)}>{overdue >= owed ? "All overdue" : `${formatCurrency(overdue, currency)} overdue`}</div>}
					</div>
				);
			},
		},
		{ key: "paid", header: "Paid to date", align: "right", cell: (v) => (v.totalPaid && v.totalPaid > 0 ? <span className="text-muted-foreground">{formatCurrency(v.totalPaid, currency)}</span> : <CellNull />) },
		{ key: "lastPaid", header: "Last paid", align: "right", cell: (v) => (v.lastPaymentDate ? <span className="text-xs text-tertiary-foreground">{formatDate(v.lastPaymentDate)}</span> : <CellNull />) },
	];
	return (
		<DataList
			className={className}
			caption="Vendors"
			columns={columns}
			rows={vendors}
			getKey={(v) => v.id}
			stackBelow="2xl"
			onRowClick={onRowClick}
			isRowSelected={(v) => ids.has(v.id)}
			leadingHeader={<SelectAll total={vendors.length} selected={vendors.filter((v) => ids.has(v.id)).length} onChange={(all) => set(all ? new Set(vendors.map((v) => v.id)) : new Set())} label="Select all vendors" />}
			leading={(v) => <RowSelect checked={ids.has(v.id)} onToggle={() => toggle(v.id)} label={`Select ${v.name}`} />}
			trailing={(v) => (
				<RowActions
					label={`Actions for ${v.name}`}
					items={[
						{ label: "Record payment", icon: <CurrencyCircleDollarIcon size={14} /> },
						{ label: "Edit", icon: <PencilSimpleIcon size={14} /> },
						{ label: v.isActive === false ? "Activate" : "Deactivate", icon: <ArchiveIcon size={14} /> },
						{ label: "Delete", icon: <TrashIcon size={14} />, destructive: true },
					]}
				/>
			)}
			empty="No matching vendors"
		/>
	);
}

/* ------------------------------------------------------------------ Customer statement */

export type StatementMetrics = {
	totalTransactions: number;
	invoicedAmount: number;
	collectionRate: number;
	amountReceived: number;
	creditedAmount: number;
	debitedAmount: number;
	balanceDue: number;
};

export type CustomerStatementMetricsProps = React.ComponentProps<"div"> & { metrics: StatementMetrics; currency?: string; availableCurrencies?: string[]; isSingleCurrency?: boolean };

export function CustomerStatementMetrics({ metrics, currency = "MYR", availableCurrencies, isSingleCurrency = true, className, ...props }: CustomerStatementMetricsProps) {
	const amt = (v: number) => formatCurrency(isSingleCurrency ? v : 0, currency);
	const collected = metrics.collectionRate >= 50;
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<StatGrid aria-label="Statement statistics" className="@3xl:grid-cols-4">
				<StatTile label="Total transactions" value={metrics.totalTransactions} />
				<StatTile
					label="Invoiced amount"
					value={amt(metrics.invoicedAmount)}
					sub={
						isSingleCurrency && metrics.invoicedAmount > 0 ? (
							<StatusChip tone={collected ? "green" : "red"} glyph={collected ? "check" : "alert"}>
								{`${metrics.collectionRate.toFixed(1)}% collected`}
							</StatusChip>
						) : undefined
					}
				/>
				<StatTile label="Amount received" value={amt(metrics.amountReceived)} />
				<StatTile label="Balance due" value={amt(metrics.balanceDue)} negative={isSingleCurrency && metrics.balanceDue > 0} />
			</StatGrid>
			{!isSingleCurrency && (
				<div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3">
					<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
						<InfoIcon size={16} weight="duotone" className="text-muted-foreground" aria-hidden="true" />
					</span>
					<div className="min-w-0">
						<p className="text-sm font-medium text-foreground">Multiple currencies detected</p>
						<p className="text-xs text-tertiary-foreground">Select a currency ({(availableCurrencies ?? []).join(", ")}) to view detailed financial metrics</p>
					</div>
				</div>
			)}
			{isSingleCurrency && (metrics.creditedAmount > 0 || metrics.debitedAmount > 0) && (
				<StatGrid min="lg" aria-label="Credit and debit note totals" className="@xl:grid-cols-2">
					{metrics.creditedAmount > 0 && <StatTile label="Credits applied" value={`-${formatCurrency(metrics.creditedAmount, currency)}`} />}
					{metrics.debitedAmount > 0 && <StatTile label="Debits added" value={`+${formatCurrency(metrics.debitedAmount, currency)}`} />}
				</StatGrid>
			)}
		</div>
	);
}

export type StatementTransaction = {
	date: string;
	transactionType: "Invoice" | "Payment" | "Credit Note" | "Debit Note" | "Opening Balance" | string;
	/** Document number and description. */
	details?: string | null;
	currency?: string;
	/** Debit: invoiced / debit-noted. */
	amount: number;
	/** Credit: received / credited. */
	payment: number;
	balance: number;
};

export type CustomerStatementTableProps = {
	transactions: StatementTransaction[];
	currency?: string;
	isSingleCurrency?: boolean;
	/** Shown on the last page in single-currency mode. */
	balanceDue?: number;
	page?: number;
	totalPages?: number;
	className?: string;
};

export function CustomerStatementTable({ transactions, currency = "MYR", isSingleCurrency = true, balanceDue, page, totalPages, className }: CustomerStatementTableProps) {
	const lastPage = !totalPages || page === totalPages;
	const showBalance = lastPage && isSingleCurrency && balanceDue != null;
	const columns: DataColumn<StatementTransaction>[] = [
		{ key: "date", header: "Date", cell: (t) => <span className="whitespace-nowrap text-xs tabular-nums text-tertiary-foreground">{formatDate(t.date)}</span> },
		{ key: "type", header: "Transactions", mobile: "title", cell: (t) => <span className="whitespace-nowrap">{t.transactionType}</span> },
		{ key: "details", header: "Details", className: "min-w-40", cell: (t) => <span className="text-xs font-normal text-muted-foreground">{t.details || "—"}</span> },
		{ key: "currency", header: "Currency", cell: (t) => <span className="text-tiny-id text-tertiary-foreground">{t.currency || "—"}</span> },
		{ key: "amount", header: "Amount", align: "right", cell: (t) => <ReportAmount amount={t.amount > 0 ? t.amount : 0} /> },
		{ key: "payment", header: "Payment", align: "right", cell: (t) => <ReportAmount amount={t.payment > 0 ? t.payment : 0} /> },
		{ key: "balance", header: "Balance", align: "right", mobile: "value", cell: (t) => <span className="font-medium">{isSingleCurrency ? formatBracketed(t.balance) : `${t.currency} ${formatBracketed(t.balance)}`}</span> },
	];
	return (
		<DataList
			className={className}
			caption="Statement of account"
			columns={columns}
			rows={transactions}
			getKey={(t, i) => `${t.date}-${i}`}
			stackBelow="2xl"
			empty={
				<>
					<ReceiptIcon size={18} weight="fill" className="mx-auto mb-1 text-subtle" aria-hidden="true" />
					<span className="block text-sm text-foreground">No transactions found</span>
					<span className="block text-xs">No transactions found for the selected date range.</span>
				</>
			}
			footer={
				showBalance || (totalPages ?? 0) > 1 ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span className="text-xs text-tertiary-foreground">{(totalPages ?? 0) > 1 ? `Page ${page} of ${totalPages}` : `${transactions.length} transactions`}</span>
						{showBalance && (
							<span className="flex items-baseline gap-6">
								<span className="text-xs font-medium text-tertiary-foreground">Balance Due</span>
								<span className="whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">{formatCurrency(balanceDue!, currency)}</span>
							</span>
						)}
					</div>
				) : undefined
			}
		/>
	);
}
