/**
 * Cynco UI — general ledger & journals.
 * Hand-written presentational ports of cynco-labs/cynco
 * remix/app/components/accounting/{journal,periods,opening-balances}/…,
 * the Chart of Accounts tree/detail panel, the GL register and the
 * accounting workbench chrome, rebuilt with Cynco UI primitives and tokens.
 *
 * Every component sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import * as React from "react";
import { parseDate } from "../base/lib/utils";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	IconButton,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	STATUS_TONES,
	StatusChip,
	StatusChipIcon,
	Textarea,
	cn,
	type StatusGlyph,
	type StatusTone,
	LiveStatus,
} from "../base";
import {
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowSquareOutIcon,
	ArrowUpIcon,
	ArrowUpRightIcon,
	BookmarkSimpleIcon,
	CaretDownIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CheckIcon,
	ClockCounterClockwiseIcon,
	ClockIcon,
	DownloadSimpleIcon,
	FloppyDiskIcon,
	InfoIcon,
	LockIcon,
	LockOpenIcon,
	PaperPlaneTiltIcon,
	PencilSimpleIcon,
	PlusIcon,
	PowerIcon,
	TrashIcon,
	WarningIcon,
	XIcon,
} from "@phosphor-icons/react";
import {
	FieldError,
	ActionBar,
	DataList,
	DocStatus,
	SectionLabel,
	StatGrid,
	StatTile,
	formatCurrency,
	formatDate,
	negativeClass,
	surfaces,
	type DataColumn,
	type StatusEntry,
	ToneDot,
} from "../lib/shared";

/* ------------------------------------------------------------------ helpers */

/** cynco coa-helpers getTypeColor / getCategoryDotColor → a status tone. */
const ACCOUNT_TYPE_TONE: Record<string, StatusTone> = {
	asset: "blue",
	contra_asset: "blue",
	liability: "amber",
	contra_liability: "amber",
	equity: "purple",
	contra_equity: "purple",
	revenue: "green",
	contra_revenue: "green",
	other_income: "green",
	expense: "red",
	contra_expense: "red",
	cost_of_sales: "red",
	operating_expense: "red",
	other_expense: "red",
};

function typeLabel(type: string) {
	const s = type.replaceAll("_", " ");
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The account type's category dot. */
function TypeDot({ type, className }: { type: string; className?: string }) {
	return <ToneDot tone={ACCOUNT_TYPE_TONE[type] ?? "neutral"} title={typeLabel(type)} className={className} />;
}

/**
 * For the one `aria-disabled` button that must keep its hover title (Button's own `focusableWhenDisabled`
 * turns pointer events off): it stays focusable and the handler ignores activation.
 */
const UNAVAILABLE = "aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

/** "50,000.00" — the journal's plain two-decimal figure (journal/types formatCurrency). */
function plain(n: number) {
	return n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toNum(v: string | number | null | undefined) {
	const n = typeof v === "number" ? v : parseFloat(v ?? "");
	return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/** "29 Oct 2026, 14:32" */
function formatDateTime(d: string) {
	const date = new Date(d);
	return `${formatDate(date)}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

/** "October 2026" from "2026-10" (periods/format formatPeriodLabel). */
function periodLabel(period: string) {
	const [y, m] = period.split("-").map(Number);
	return new Date(y ?? 2026, (m ?? 1) - 1, 1).toLocaleDateString("en-MY", { month: "long", year: "numeric" });
}

/** cynco JOURNAL_STATUS_BADGE_CONFIG (journal/types.ts) as DocStatus entries. */
export const JOURNAL_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral", glyph: "pencil" },
	pending_approval: { label: "Pending Approval", variant: "warning", glyph: "hourglass" },
	approved: { label: "Approved", variant: "info", glyph: "check" },
	posted: { label: "Posted", variant: "success" },
	reversed: { label: "Reversed", variant: "error", glyph: "refresh" },
	cancelled: { label: "Cancelled", variant: "neutral", strike: true },
};

/* ------------------------------------------------------- JournalEntryHeader */

export type JournalEntryHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
	title: string;
	entryNumber?: string | null;
	status?: string;
	isCreate?: boolean;
	approvalRequired?: boolean;
	isSaving?: boolean;
	isPosting?: boolean;
	onBack?: () => void;
	onFromTemplate?: () => void;
	onSave?: () => void;
	onPost?: () => void;
};

/** journal/JournalEntryTopBar.tsx */
export function JournalEntryHeader({
	title,
	entryNumber,
	status,
	isCreate,
	approvalRequired,
	isSaving,
	isPosting,
	onBack,
	onFromTemplate,
	onSave,
	onPost,
	className,
	...props
}: JournalEntryHeaderProps) {
	return (
		<div className={cn("flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b bg-background px-4 py-3", className)} {...props}>
			<div className="flex min-w-0 items-center gap-3">
				<IconButton variant="skeleton" icon={<ArrowLeftIcon />} onClick={onBack}>
					Back
				</IconButton>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<h1 className="min-w-0 break-words text-main">{title}</h1>
						{status && <DocStatus status={status} config={JOURNAL_STATUS} />}
					</div>
					{entryNumber && <div className="text-tiny-id text-tertiary-foreground">{entryNumber}</div>}
				</div>
			</div>
			<ActionBar>
				{isCreate && (
					<IconButton variant="secondary" icon={<BookmarkSimpleIcon />} onClick={onFromTemplate}>
						From template
					</IconButton>
				)}
				<IconButton variant="secondary" icon={<FloppyDiskIcon />} isLoading={isSaving} disabled={isPosting} onClick={onSave}>
					{isCreate ? "Save Draft" : "Save"}
				</IconButton>
				<IconButton variant="primary" icon={<PaperPlaneTiltIcon />} isLoading={isPosting} disabled={isSaving} onClick={onPost}>
					{approvalRequired ? "Save & Submit for Approval" : "Save & Post"}
				</IconButton>
			</ActionBar>
		</div>
	);
}

/* ------------------------------------------------------ AccountPickerField */

export type LedgerPickerAccount = {
	id: string;
	accountCode: string;
	accountName: string;
	accountType: string;
	normalBalance: "debit" | "credit";
};

const PICKER_GROUPS: { label: string; types: string[] }[] = [
	{ label: "Assets", types: ["asset", "contra_asset"] },
	{ label: "Liabilities", types: ["liability", "contra_liability"] },
	{ label: "Equity", types: ["equity", "contra_equity"] },
	{ label: "Revenue", types: ["revenue", "contra_revenue", "other_income"] },
	{ label: "Expenses", types: ["expense", "contra_expense", "cost_of_sales", "operating_expense", "other_expense"] },
];

/** The popup follows the trigger's width, never narrower than 18rem nor wider than the viewport. */
const PICKER_POPUP = "w-(--anchor-width) min-w-72 max-w-[calc(100vw-2rem)] p-0";

function AccountOption({ a, selected }: { a: LedgerPickerAccount; selected?: boolean }) {
	return (
		<span className="flex w-full min-w-0 items-center gap-2">
			<span className="w-14 shrink-0 text-tiny-id text-tertiary-foreground">{a.accountCode}</span>
			<span className={cn("min-w-0 flex-1 truncate text-sm", selected ? "text-foreground" : "text-muted-foreground")}>{a.accountName}</span>
			{a.accountType.startsWith("contra") && <span className="shrink-0 text-2xs text-tertiary-foreground">Contra</span>}
			<span className="w-5 shrink-0 text-right text-2xs text-tertiary-foreground">{a.normalBalance === "debit" ? "DR" : "CR"}</span>
		</span>
	);
}

/** The searchable list inside the picker: recent first, then one group per account type. */
function AccountPickerList({
	accounts,
	recentIds = [],
	selectedId,
	onSelect,
	onCreate,
}: {
	accounts: LedgerPickerAccount[];
	recentIds?: string[];
	selectedId?: string;
	onSelect: (a: LedgerPickerAccount) => void;
	onCreate?: (query: string) => void;
}) {
	const [query, setQuery] = React.useState("");
	const recent = recentIds.map((id) => accounts.find((a) => a.id === id)).filter((a): a is LedgerPickerAccount => !!a);
	return (
		<Command className="rounded-lg">
			<CommandInput placeholder="Search by code or name..." value={query} onValueChange={setQuery} />
			<CommandList className="max-h-64">
				<CommandEmpty>No accounts found.</CommandEmpty>
				{recent.length > 0 && !query && (
					<CommandGroup heading="Recent">
						{recent.map((a) => (
							<CommandItem key={`r-${a.id}`} value={`recent ${a.accountCode} ${a.accountName}`} onSelect={() => onSelect(a)}>
								<AccountOption a={a} selected={a.id === selectedId} />
							</CommandItem>
						))}
					</CommandGroup>
				)}
				{PICKER_GROUPS.map((g) => {
					const items = accounts.filter((a) => g.types.includes(a.accountType));
					if (!items.length) return null;
					return (
						<CommandGroup
							key={g.label}
							heading={
								<span className="flex items-center gap-1.5">
									<TypeDot type={g.types[0]!} />
									{g.label}
								</span>
							}
						>
							{items.map((a) => (
								<CommandItem key={a.id} value={`${a.accountCode} ${a.accountName}`} onSelect={() => onSelect(a)}>
									<AccountOption a={a} selected={a.id === selectedId} />
								</CommandItem>
							))}
						</CommandGroup>
					);
				})}
			</CommandList>
			<CommandSeparator />
			{/* Pinned below the scrolling list, so it needs its own listbox for the option role to be valid. */}
			<div className="p-1" role="listbox" aria-label="Account actions">
				<CommandItem value="__create_new__" forceMount onSelect={() => onCreate?.(query.trim())}>
					<PlusIcon size={14} className="text-tertiary-foreground" aria-hidden="true" />
					<span className="text-sm">{query.trim() ? `Create “${query.trim()}”` : "Create new account"}</span>
				</CommandItem>
			</div>
		</Command>
	);
}

function PickerTriggerLabel({ account, placeholder = "Select account...", id }: { account?: LedgerPickerAccount | null; placeholder?: string; id?: string }) {
	if (!account)
		return (
			<span id={id} className="truncate text-tertiary-foreground">
				{placeholder}
			</span>
		);
	return (
		<span id={id} className="flex min-w-0 items-center gap-1.5 overflow-hidden">
			<span className="shrink-0 text-tiny-id text-tertiary-foreground">{account.accountCode}</span>
			<span className="min-w-0 truncate text-foreground">{account.accountName}</span>
		</span>
	);
}

export type AccountPickerFieldProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
	accounts: LedgerPickerAccount[];
	recentIds?: string[];
	selectedId?: string;
	defaultOpen?: boolean;
	label?: string;
	onSelect?: (a: LedgerPickerAccount) => void;
	onCreate?: (query: string) => void;
};

/** journal/AccountPicker.tsx — combobox over the chart of accounts, grouped by type. */
export function AccountPickerField({ accounts, recentIds, selectedId, defaultOpen, label, onSelect, onCreate, className, ...props }: AccountPickerFieldProps) {
	const [open, setOpen] = React.useState(!!defaultOpen);
	const [value, setValue] = React.useState(selectedId);
	const selected = accounts.find((a) => a.id === value) ?? null;
	const id = React.useId();
	return (
		<div className={cn("flex w-full max-w-md min-w-0 flex-col gap-1", className)} {...props}>
			{label && (
				<span id={`${id}-label`} className="text-form-label">
					{label}
				</span>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						<Button
							variant="secondary"
							aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
							className="w-full min-w-0 font-normal [&>span]:w-full [&>span]:min-w-0 [&>span]:justify-between"
						>
							<PickerTriggerLabel account={selected} id={`${id}-value`} />
							<CaretDownIcon size={12} className="shrink-0 text-tertiary-foreground" aria-hidden="true" />
						</Button>
					}
				/>
				<PopoverContent align="start" className={PICKER_POPUP}>
					<AccountPickerList
						accounts={accounts}
						recentIds={recentIds}
						selectedId={value}
						onSelect={(a) => {
							setValue(a.id);
							setOpen(false);
							onSelect?.(a);
						}}
						onCreate={onCreate}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

/* -------------------------------------------------------- JournalLineEditor */

export type JournalEditorLine = {
	key: string;
	accountId?: string;
	accountCode?: string;
	accountName?: string;
	description?: string;
	debitAmount?: string;
	creditAmount?: string;
};

/** "1.2.3" → "1.23", "RM 5,000" → "5000"; a leading minus is kept (LineItemEditor toAmountString). */
function toAmountString(raw: string) {
	const sign = raw.trim().startsWith("-") ? "-" : "";
	const [whole = "", ...fraction] = raw.replace(/[^\d.]/g, "").split(".");
	return fraction.length > 0 ? `${sign}${whole}.${fraction.join("").slice(0, 2)}` : `${sign}${whole}`;
}

/** Raw number while editing, grouped (50,000.00) otherwise. */
function AmountInput({ value, onValueChange, placeholder, label, className }: { value: string; onValueChange: (v: string) => void; placeholder: string; label?: string; className?: string }) {
	const [editing, setEditing] = React.useState(false);
	const n = Number(value);
	const display = editing || value === "" || !Number.isFinite(n) ? value : plain(n);
	return (
		<Input
			inputMode="decimal"
			aria-label={label ?? placeholder}
			placeholder={placeholder}
			value={display}
			onFocus={() => setEditing(true)}
			onBlur={() => setEditing(false)}
			onChange={(e) => onValueChange(toAmountString(e.target.value))}
			className={cn("min-w-24 text-right tabular-nums", className)}
		/>
	);
}

/**
 * Wide container: one grid row per line (Account · Description · Debit · Credit · remove).
 * Narrow container: each line is a small card — account and description full width, debit and credit side by side.
 */
const LINE_GRID_WIDE = "@xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_7rem_7rem_1.5rem] @xl:items-center";

export type JournalLineEditorProps = Omit<React.ComponentProps<"div">, "onChange"> & {
	lines: JournalEditorLine[];
	accounts?: LedgerPickerAccount[];
	recentIds?: string[];
	/** Keyed `${line.key}.accountId`. */
	fieldErrors?: Record<string, string>;
	onLinesChange?: (lines: JournalEditorLine[]) => void;
};

/** journal/LineItemEditor.tsx — spreadsheet-style debit/credit grid with account picker cells. */
export function JournalLineEditor({ lines: initial, accounts = [], recentIds, fieldErrors = {}, onLinesChange, className, ...props }: JournalLineEditorProps) {
	const [lines, setLinesState] = React.useState(initial);
	const [openKey, setOpenKey] = React.useState<string | null>(null);
	const setLines = (next: JournalEditorLine[]) => {
		setLinesState(next);
		onLinesChange?.(next);
	};
	const counter = React.useRef(0);
	const id = React.useId();
	const listRef = React.useRef<HTMLDivElement>(null);
	/** Index of a removed line: its Remove button unmounts, so focus moves to the line that takes its place. */
	const refocus = React.useRef<number | null>(null);
	React.useEffect(() => {
		const i = refocus.current;
		if (i === null) return;
		refocus.current = null;
		const buttons = listRef.current?.querySelectorAll<HTMLElement>("[data-line-remove]");
		if (buttons && buttons.length > 0) buttons[Math.min(i, buttons.length - 1)]?.focus();
	}, [lines]);
	const addLine = () => setLines([...lines, { key: `new_${++counter.current}`, debitAmount: "", creditAmount: "", description: "" }]);
	const removeLine = (key: string) => {
		if (lines.length <= 2) return;
		refocus.current = lines.findIndex((l) => l.key === key);
		setLines(lines.filter((l) => l.key !== key));
	};
	const update = (key: string, field: keyof JournalEditorLine, value: string) =>
		setLines(
			lines.map((l) => {
				if (l.key !== key) return l;
				const u = { ...l, [field]: value };
				// Auto-clear the opposite amount field.
				if (field === "debitAmount" && toNum(value) > 0) u.creditAmount = "";
				if (field === "creditAmount" && toNum(value) > 0) u.debitAmount = "";
				return u;
			}),
		);
	const setAccount = (key: string, a: LedgerPickerAccount) =>
		setLines(lines.map((l) => (l.key === key ? { ...l, accountId: a.id, accountCode: a.accountCode, accountName: a.accountName } : l)));

	return (
		<div className={cn("@container flex min-w-0 flex-col", className)} {...props}>
			<div className="mb-3 flex items-center justify-between gap-2">
				<h3 className="text-sub">Line items</h3>
				<IconButton variant="secondary" size="sm" icon={<PlusIcon weight="bold" />} onClick={addLine}>
					Add line
				</IconButton>
			</div>
			{/* Visual column heads only: every field carries its own "…, line N" name. */}
			<div aria-hidden="true" className={cn("mb-1.5 hidden gap-2 px-0.5 text-2xs text-tertiary-foreground @xl:grid", LINE_GRID_WIDE)}>
				<span>Account</span>
				<span>Description</span>
				<span className="text-right">Debit</span>
				<span className="text-right">Credit</span>
				<span />
			</div>
			<div ref={listRef} className="flex flex-col gap-2 @xl:gap-1.5">
				{lines.map((line, i) => {
					const warn = !line.accountId && !!line.accountCode;
					const err = fieldErrors[`${line.key}.accountId`];
					const account = line.accountId ? accounts.find((a) => a.id === line.accountId) : undefined;
					const shown: LedgerPickerAccount | null = account ?? (line.accountCode ? { id: "", accountCode: line.accountCode, accountName: line.accountName ?? "", accountType: "", normalBalance: "debit" } : null);
					const n = i + 1;
					const errId = `${id}-${line.key}-error`;
					return (
						<div key={line.key} className="flex flex-col gap-0.5">
							<div
								role="group"
								aria-label={`Line ${i + 1}`}
								className={cn("group grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1.5rem] items-center gap-2 rounded-lg border bg-card p-2 @xl:rounded-none @xl:border-0 @xl:bg-transparent @xl:p-0", LINE_GRID_WIDE)}
							>
								<div className="col-span-3 min-w-0 @xl:col-span-1">
									<Popover open={openKey === line.key} onOpenChange={(o) => setOpenKey(o ? line.key : null)}>
										<PopoverTrigger
											render={
												<Button
													variant="secondary"
													aria-label={`Account, line ${n}${warn ? ", unconfirmed AI suggestion" : ""}: ${shown ? `${shown.accountCode} ${shown.accountName}` : "Select account..."}`}
													aria-invalid={err ? true : undefined}
													aria-describedby={err ? errId : undefined}
													title={warn ? `AI suggested ${line.accountCode}: confirm via picker` : undefined}
													className={cn("w-full min-w-0 justify-start font-normal [&>span]:min-w-0 [&>span]:gap-1.5 [&>span]:overflow-hidden", (warn || err) && "border-dashed")}
												>
													{warn && <WarningIcon weight="fill" size={14} className={cn("shrink-0", STATUS_TONES.amber)} aria-label="Unconfirmed AI suggestion" />}
													<PickerTriggerLabel account={shown} />
												</Button>
											}
										/>
										<PopoverContent align="start" className={PICKER_POPUP}>
											<AccountPickerList
												accounts={accounts}
												recentIds={recentIds}
												selectedId={line.accountId}
												onSelect={(a) => {
													setAccount(line.key, a);
													setOpenKey(null);
												}}
											/>
										</PopoverContent>
									</Popover>
								</div>
								<Input
									aria-label={`Description, line ${n}`}
									placeholder="Line description..."
									value={line.description ?? ""}
									onChange={(e) => update(line.key, "description", e.target.value)}
									className="col-span-3 @xl:col-span-1"
								/>
								<AmountInput placeholder="Debit" label={`Debit, line ${n}`} value={line.debitAmount ?? ""} onValueChange={(v) => update(line.key, "debitAmount", v)} />
								<AmountInput placeholder="Credit" label={`Credit, line ${n}`} value={line.creditAmount ?? ""} onValueChange={(v) => update(line.key, "creditAmount", v)} />
								<IconButton
									variant="skeleton"
									size="icon"
									data-line-remove=""
									aria-label={`Remove line ${n}`}
									aria-disabled={lines.length <= 2 || undefined}
									title={lines.length <= 2 ? "Minimum 2 lines required for double-entry" : undefined}
									className={cn("justify-self-center transition-opacity @xl:opacity-40 @xl:group-hover:opacity-100 focus-visible:opacity-100", UNAVAILABLE)}
									icon={<TrashIcon />}
									onClick={() => removeLine(line.key)}
								/>
							</div>
							{err && (
								<FieldError id={errId} className="pl-0.5">
									{err}
								</FieldError>
							)}
						</div>
					);
				})}
			</div>
			<Button variant="dotted" className="mt-2 w-full text-tertiary-foreground" onClick={addLine}>
				<PlusIcon size={14} aria-hidden="true" />
				Add line
			</Button>
		</div>
	);
}

/* --------------------------------------------------------- JournalBalanceBar */

export type JournalBalanceBarProps = React.ComponentProps<"div"> & {
	totalDebit: number;
	totalCredit: number;
	currency?: string;
	hasAmounts?: boolean;
	showError?: boolean;
	/** The auto-save line above the bar. */
	autoSave?: "saving" | "saved" | null;
};

/** journal/BalanceBar.tsx + JournalDraftStatus AutoSaveIndicator — DR = CR footer of the journal form. */
export function JournalBalanceBar({ totalDebit, totalCredit, currency = "MYR", hasAmounts, showError, autoSave, className, ...props }: JournalBalanceBarProps) {
	const difference = Math.round((totalDebit - totalCredit) * 100) / 100;
	const isBalanced = difference === 0;
	const any = hasAmounts ?? (totalDebit > 0 || totalCredit > 0);
	return (
		<div className={cn("flex min-w-0 flex-col overflow-hidden", surfaces.card, className)} {...props}>
			{/* Live regions stay mounted, so "Draft saved" and the balance state are announced when they change. */}
			<div role="status">
				{autoSave && (
					<div className="flex items-center gap-1.5 border-b px-4 py-1 text-2xs text-tertiary-foreground">
						<ToneDot tone={autoSave === "saving" ? "amber" : "green"} className={autoSave === "saving" ? "animate-pulse" : undefined} />
						{autoSave === "saving" ? "Saving draft…" : "Draft saved"}
					</div>
				)}
			</div>
			<LiveStatus>
				{any ? (isBalanced ? "Balanced" : `Off by ${currency} ${plain(Math.abs(difference))}`) : ""}
			</LiveStatus>
			{!any ? (
				<div className="m-1 flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm text-tertiary-foreground">
					<InfoIcon size={16} aria-hidden="true" />
					Enter amounts to see balance
				</div>
			) : (
				<div className="px-4 py-3">
					<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm tabular-nums">
							<span className="text-tertiary-foreground">DR</span>
							<span className="text-foreground">
								{currency} {plain(totalDebit)}
							</span>
							<span className="mx-1 text-tertiary-foreground">
								<span aria-hidden="true">{isBalanced ? "=" : "≠"}</span>
								<span className="sr-only">{isBalanced ? "equals" : "does not equal"}</span>
							</span>
							<span className="text-tertiary-foreground">CR</span>
							<span className="text-foreground">
								{currency} {plain(totalCredit)}
							</span>
						</div>
						{isBalanced ? (
							<StatusChip tone="green" glyph="check">
								Balanced
							</StatusChip>
						) : (
							<StatusChip tone="red" glyph="alert">
								<span className="tabular-nums">
									Off by {currency} {plain(Math.abs(difference))}
								</span>
							</StatusChip>
						)}
					</div>
					{showError && !isBalanced && (
						<p role="alert" className={cn("mt-1 text-2xs", surfaces.negative)}>
							Entry must be balanced before posting
						</p>
					)}
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------- JournalDraftRecoveryBanner */

export type JournalDraftRecoveryBannerProps = React.ComponentProps<"div"> & { savedAgo: string; onRecover?: () => void; onDismiss?: () => void };

/** journal/JournalDraftStatus.tsx DraftRecoveryBanner — offer to restore an unsaved local draft. */
export function JournalDraftRecoveryBanner({ savedAgo, onRecover, onDismiss, className, ...props }: JournalDraftRecoveryBannerProps) {
	return (
		<Alert variant="warning" role="status" className={cn("flex flex-wrap items-center justify-between gap-2 py-2", className)} {...props}>
			<span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
				<ClockCounterClockwiseIcon size={16} className={cn("shrink-0", STATUS_TONES.amber)} aria-hidden="true" />
				You have an unsaved draft from {savedAgo}.
			</span>
			<ActionBar>
				<Button variant="secondary" onClick={onRecover}>
					Recover
				</Button>
				<IconButton variant="skeleton" icon={<XIcon />} onClick={onDismiss}>
					Discard
				</IconButton>
			</ActionBar>
		</Alert>
	);
}

/* ---------------------------------------------------------- JournalLinesTable */

export type JournalPostedLine = {
	id: string;
	lineNumber: number;
	accountCode: string;
	accountName: string;
	accountType: string;
	debitAmount: string | number;
	creditAmount: string | number;
	description?: string | null;
};

/** The amount a line carries, marked by side — the one figure a stacked line shows. */
function SidedAmount({ debit, credit, currency }: { debit: number; credit: number; currency: string }) {
	const isCredit = credit > 0 && !(debit > 0);
	return (
		<span className="inline-flex items-baseline gap-1 tabular-nums">
			{formatCurrency(isCredit ? credit : debit, currency)}
			<span className="text-2xs font-normal text-tertiary-foreground">{isCredit ? "Cr" : "Dr"}</span>
		</span>
	);
}

export type JournalLinesTableProps = React.ComponentProps<"section"> & { lines: JournalPostedLine[]; currency?: string };

/** journal/JournalLineItemsTable.tsx — the read-only lines of a saved entry with totals. */
export function JournalLinesTable({ lines, currency = "MYR", className, ...props }: JournalLinesTableProps) {
	const dr = lines.reduce((s, l) => s + toNum(l.debitAmount), 0);
	const cr = lines.reduce((s, l) => s + toNum(l.creditAmount), 0);
	const balanced = Math.round((dr - cr) * 100) === 0;
	const money = (v: string | number) => (toNum(v) > 0 ? formatCurrency(toNum(v), currency) : "");
	const columns: DataColumn<JournalPostedLine>[] = [
		{ key: "n", header: "#", className: "w-9 text-tertiary-foreground tabular-nums", mobile: "hidden", cell: (l) => l.lineNumber },
		{
			key: "account",
			header: "Account",
			className: "w-2/5",
			mobile: "title",
			// The row header: a line is named by its account, not its line number.
			primary: true,
			cell: (l) => (
				<span className="flex min-w-0 items-center gap-2">
					<span className="shrink-0 text-tiny-id text-tertiary-foreground">{l.accountCode}</span>
					<span className="min-w-0 break-words">{l.accountName}</span>
					<TypeDot type={l.accountType} />
					<span className="sr-only">{typeLabel(l.accountType)}</span>
				</span>
			),
		},
		{ key: "description", header: "Description", className: "w-1/3 max-w-0", cell: (l) => <span className="block text-tertiary-foreground @xl:truncate" title={l.description ?? undefined}>{l.description || "—"}</span> },
		{ key: "debit", header: "Debit", align: "right", mobile: "hidden", cell: (l) => money(l.debitAmount) },
		{ key: "credit", header: "Credit", align: "right", mobile: "hidden", cell: (l) => money(l.creditAmount) },
		// Stacked layout only: one figure per line, marked Dr/Cr.
		{ key: "amount", header: "Amount", className: "hidden", mobile: "value", cell: (l) => <SidedAmount debit={toNum(l.debitAmount)} credit={toNum(l.creditAmount)} currency={currency} /> },
	];
	return (
		<section className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			<div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
				<h3 className="text-sub">Line items</h3>
				{balanced ? (
					<StatusChip tone="green" glyph="check">
						Balanced
					</StatusChip>
				) : (
					<StatusChip tone="red" glyph="x">
						Unbalanced
					</StatusChip>
				)}
			</div>
			<DataList
				caption="Journal entry line items"
				columns={columns}
				rows={lines}
				getKey={(l) => l.id}
				dense
				empty="No line items"
				footer={
					<div className="flex flex-wrap items-baseline justify-end gap-x-6 gap-y-1 font-semibold text-foreground tabular-nums">
						<span className="mr-auto font-medium text-tertiary-foreground">Total</span>
						<span>
							<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Debit</span>
							{formatCurrency(dr, currency)}
						</span>
						<span>
							<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Credit</span>
							{formatCurrency(cr, currency)}
						</span>
					</div>
				}
			/>
		</section>
	);
}

/* --------------------------------------------------- JournalEntryDetailsRail */

export type JournalStatusEvent = { id: string; fromStatus: string | null; toStatus: string; changedBy?: string; changedAt: string; notes?: string | null };

const ACTIVITY_TONE: Record<string, StatusTone> = { posted: "green", reversed: "red", cancelled: "neutral", approved: "blue", pending_approval: "amber", draft: "neutral" };

function RailField({ label, value, mono, wrap }: { label: string; value: React.ReactNode; mono?: boolean; wrap?: boolean }) {
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-x-3">
			<dt className="shrink-0 text-2xs text-tertiary-foreground">{label}</dt>
			<dd className={cn("min-w-0 text-right text-sm text-foreground", wrap ? "break-words" : "truncate", mono && "tabular-nums")}>{value}</dd>
		</div>
	);
}

export type JournalEntryDetailsRailProps = React.ComponentProps<"div"> & {
	entry: {
		entryDate: string;
		period: string;
		currency: string;
		documentNumber?: string | null;
		manualReason?: string | null;
		vendorName?: string | null;
		customerName?: string | null;
		approvedBy?: string | null;
		approvedAt?: string | null;
		postedAt?: string | null;
		memo?: string | null;
	};
	statusHistory?: JournalStatusEvent[];
	createdAt?: string;
	updatedAt?: string;
};

/** journal/EntryDetailsRail.tsx — Details · Memo · Activity panel beside a journal entry. */
export function JournalEntryDetailsRail({ entry, statusHistory = [], createdAt, updatedAt, className, ...props }: JournalEntryDetailsRailProps) {
	return (
		<div className={cn("w-full min-w-0 divide-y overflow-hidden", surfaces.card, className)} {...props}>
			<section className="p-4">
				<SectionLabel className="mb-2.5">Details</SectionLabel>
				<dl className="flex flex-col gap-1.5">
					<RailField label="Entry date" value={formatDate(entry.entryDate)} mono />
					<RailField label="Period" value={<span className="text-tiny-id">{entry.period}</span>} />
					<RailField label="Currency" value={entry.currency} />
					{entry.manualReason?.trim() && <RailField label="Reason" value={entry.manualReason.trim()} wrap />}
					{entry.documentNumber?.trim() && <RailField label="Reference" value={<span className="text-tiny-id">{entry.documentNumber}</span>} />}
					{entry.vendorName && <RailField label="Vendor" value={entry.vendorName} wrap />}
					{entry.customerName && <RailField label="Customer" value={entry.customerName} wrap />}
					{entry.approvedBy && <RailField label="Approved by" value={entry.approvedBy} wrap />}
					{entry.approvedAt && <RailField label="Approved" value={formatDateTime(entry.approvedAt)} mono />}
					{entry.postedAt && <RailField label="Posted" value={formatDateTime(entry.postedAt)} mono />}
				</dl>
			</section>
			{entry.memo && (
				<section className="p-4">
					<SectionLabel className="mb-2.5">Memo</SectionLabel>
					<p className="break-words text-sm leading-relaxed text-foreground">{entry.memo}</p>
				</section>
			)}
			<section className="p-4">
				<SectionLabel className="mb-2.5">Activity</SectionLabel>
				{statusHistory.length > 0 ? (
					<ol>
						{statusHistory.map((item, i) => {
							const last = i === statusHistory.length - 1;
							return (
								<li key={item.id} className="flex gap-2.5">
									<div className="flex flex-col items-center">
										<ToneDot tone={ACTIVITY_TONE[item.toStatus] ?? "neutral"} className="mt-1.5 size-2" />
										{!last && <span className="my-0.5 w-px flex-1 bg-border" />}
									</div>
									<div className={cn("min-w-0", !last && "pb-3")}>
										<div className="flex flex-wrap items-center gap-1.5">
											<DocStatus status={item.toStatus} config={JOURNAL_STATUS} />
											{item.fromStatus && <span className="text-2xs text-tertiary-foreground">from {JOURNAL_STATUS[item.fromStatus]?.label ?? item.fromStatus}</span>}
										</div>
										<p className="mt-0.5 text-2xs tabular-nums text-tertiary-foreground">
											{formatDateTime(item.changedAt)}
											{item.changedBy && ` · ${item.changedBy}`}
										</p>
										{item.notes && <p className="mt-1 break-words text-2xs italic text-muted-foreground">{item.notes}</p>}
									</div>
								</li>
							);
						})}
					</ol>
				) : (
					<div className="flex flex-col gap-1 text-2xs tabular-nums text-tertiary-foreground">
						{createdAt && <p>Created {formatDateTime(createdAt)}</p>}
						{updatedAt && <p>Updated {formatDateTime(updatedAt)}</p>}
					</div>
				)}
			</section>
		</div>
	);
}

/* -------------------------------------------------------- ChartOfAccountsTree */

export type CoaTreeNode = {
	id: string;
	accountCode: string;
	accountName: string;
	accountType: string;
	balance?: number;
	isHeaderAccount?: boolean;
	isActive?: boolean;
	children?: CoaTreeNode[];
};

/**
 * One row's cells. Wide container: caret · dot · code · name · type · balance on one line.
 * Narrow container: the code sits above the name and the type column is dropped.
 */
function CoaCells({
	caret,
	dot,
	code,
	name,
	extra,
	type,
	balance,
}: {
	caret: React.ReactNode;
	dot: React.ReactNode;
	code: React.ReactNode;
	name: React.ReactNode;
	extra?: React.ReactNode;
	type: React.ReactNode;
	balance: React.ReactNode;
}) {
	return (
		<>
			{caret}
			{dot}
			<span className="flex min-w-0 flex-1 flex-col @md:flex-row @md:items-center @md:gap-2">
				<span className="shrink-0 text-tiny-id text-tertiary-foreground @md:w-16">{code}</span>
				<span className="flex min-w-0 flex-1 items-center gap-2">{name}</span>
			</span>
			{extra}
			<span className="hidden w-28 shrink-0 truncate text-2xs text-tertiary-foreground @xl:inline">{type}</span>
			<span className="shrink-0 text-right tabular-nums @md:w-32">{balance}</span>
		</>
	);
}

function CoaRow({
	node,
	level,
	expanded,
	selectedId,
	tabId,
	currency,
	onToggle,
	onSelect,
	onFocusItem,
}: {
	node: CoaTreeNode;
	level: number;
	expanded: Set<string>;
	selectedId?: string;
	/** The one treeitem in the tab order (roving tabindex). */
	tabId?: string;
	currency: string;
	onToggle: (id: string) => void;
	onSelect: (id: string) => void;
	onFocusItem: (id: string) => void;
}) {
	const kids = node.children ?? [];
	const open = expanded.has(node.id);
	const selected = selectedId === node.id;
	const balance = node.isHeaderAccount ? null : formatCurrency(node.balance ?? 0, currency);
	return (
		<>
			<div
				role="treeitem"
				data-tree-id={node.id}
				tabIndex={tabId === node.id ? 0 : -1}
				aria-level={level}
				aria-expanded={kids.length ? open : undefined}
				aria-selected={selected}
				aria-label={[`${node.accountCode} ${node.accountName}`, typeLabel(node.accountType), balance, node.isActive === false && "inactive"].filter(Boolean).join(", ")}
				onClick={() => onSelect(node.id)}
				onFocus={(e) => e.target === e.currentTarget && onFocusItem(node.id)}
				className={cn(
					"group flex min-h-8 cursor-pointer items-center gap-2 rounded-md py-1 pr-2 text-sm outline-none transition-colors hover:bg-table-row-hover focus-ring",
					selected && "bg-active-primary hover:bg-active-primary",
				)}
				// Indent is data-driven: one step per tree level.
				style={{ paddingLeft: `${0.25 + (level - 1) * 1.125}rem` }}
			>
				<CoaCells
					caret={
						kids.length ? (
							<IconButton
								variant="skeleton"
								size="icon"
								tabIndex={-1}
								aria-label={open ? `Collapse ${node.accountName}` : `Expand ${node.accountName}`}
								className="size-5 shrink-0 p-0"
								onClick={(e) => {
									e.stopPropagation();
									onToggle(node.id);
								}}
								icon={<CaretRightIcon weight="bold" className={cn("size-3 text-tertiary-foreground transition-transform", open && "rotate-90")} />}
							/>
						) : (
							<span className="size-5 shrink-0" aria-hidden="true" />
						)
					}
					dot={<TypeDot type={node.accountType} />}
					code={node.accountCode}
					name={
						<>
							<span className={cn("min-w-0 truncate text-foreground", node.isHeaderAccount && "font-semibold", node.isActive === false && "text-tertiary-foreground")}>{node.accountName}</span>
							{node.isActive === false && <StatusChip className="h-5 shrink-0 text-2xs">Inactive</StatusChip>}
						</>
					}
					type={typeLabel(node.accountType)}
					balance={<span className={cn(balance ? "text-foreground" : "text-tertiary-foreground", negativeClass((node.balance ?? 0) < 0 && !node.isHeaderAccount))}>{balance ?? "—"}</span>}
				/>
			</div>
			{open &&
				kids.map((c) => (
					<CoaRow key={c.id} node={c} level={level + 1} expanded={expanded} selectedId={selectedId} tabId={tabId} currency={currency} onToggle={onToggle} onSelect={onSelect} onFocusItem={onFocusItem} />
				))}
		</>
	);
}

export type ChartOfAccountsTreeProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
	nodes: CoaTreeNode[];
	currency?: string;
	defaultExpandedIds?: string[];
	selectedId?: string;
	onSelect?: (id: string) => void;
};

/** CoaAccountTreeRow.tsx — the nested Chart of Accounts with codes, type and balance. */
export function ChartOfAccountsTree({ nodes, currency = "MYR", defaultExpandedIds, selectedId: initialSelected, onSelect, className, ...props }: ChartOfAccountsTreeProps) {
	const [expanded, setExpanded] = React.useState(() => new Set(defaultExpandedIds ?? nodes.map((n) => n.id)));
	const [selectedId, setSelected] = React.useState(initialSelected);
	const toggle = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	const select = (id: string) => {
		setSelected(id);
		onSelect?.(id);
	};
	/** Visible rows in order, with their parents: what the arrow keys move through. */
	const visible: { id: string; parentId: string | null; hasKids: boolean }[] = [];
	const walk = (list: CoaTreeNode[], parentId: string | null) => {
		for (const n of list) {
			const hasKids = (n.children?.length ?? 0) > 0;
			visible.push({ id: n.id, parentId, hasKids });
			if (hasKids && expanded.has(n.id)) walk(n.children!, n.id);
		}
	};
	walk(nodes, null);
	const [focusId, setFocusId] = React.useState<string | undefined>(undefined);
	const isVisible = (id?: string) => !!id && visible.some((v) => v.id === id);
	// Exactly one row is tabbable: the last one focused, else the selected one, else the first.
	const tabId = isVisible(focusId) ? focusId : isVisible(selectedId) ? selectedId : visible[0]?.id;
	const treeRef = React.useRef<HTMLDivElement>(null);
	const focusRow = (id: string) => {
		setFocusId(id);
		treeRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)?.focus();
	};
	/** APG tree keys: Up/Down/Home/End move, Right opens or enters, Left closes or climbs, Enter/Space select. */
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const id = (e.target as HTMLElement).dataset.treeId;
		const i = visible.findIndex((v) => v.id === id);
		const row = visible[i];
		if (!id || !row) return;
		let next: string | null | undefined;
		switch (e.key) {
			case "ArrowDown":
				next = visible[i + 1]?.id;
				break;
			case "ArrowUp":
				next = visible[i - 1]?.id;
				break;
			case "Home":
				next = visible[0]?.id;
				break;
			case "End":
				next = visible[visible.length - 1]?.id;
				break;
			case "ArrowRight":
				if (row.hasKids && !expanded.has(id)) toggle(id);
				else if (row.hasKids) next = visible[i + 1]?.id;
				break;
			case "ArrowLeft":
				if (row.hasKids && expanded.has(id)) toggle(id);
				else next = row.parentId;
				break;
			case "Enter":
			case " ":
				select(id);
				break;
			default:
				return;
		}
		e.preventDefault();
		if (next) focusRow(next);
	};
	return (
		<div className={cn("@container min-w-0", surfaces.tray, className)} {...props}>
			{/* Column headers reuse the row's cell layout so they line up at every width. */}
			<div aria-hidden="true" className="flex h-7 items-center gap-2 py-1 pr-3 pl-2 text-xs text-tertiary-foreground">
				<CoaCells caret={<span className="size-5 shrink-0" />} dot={<span className="size-1.5 shrink-0" />} code="Code" name="Account" type="Type" balance="Balance" />
			</div>
			<div ref={treeRef} role="tree" aria-label="Chart of accounts" onKeyDown={onKeyDown} className={cn(surfaces.surface, "p-1")}>
				{nodes.map((n) => (
					<CoaRow
						key={n.id}
						node={n}
						level={1}
						expanded={expanded}
						selectedId={selectedId}
						tabId={tabId}
						currency={currency}
						onToggle={toggle}
						onSelect={select}
						onFocusItem={setFocusId}
					/>
				))}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------ CoaAccountPanel */

export type CoaPanelAccount = {
	accountCode: string;
	accountName: string;
	accountType: string;
	normalBalance: "debit" | "credit";
	description?: string | null;
	isActive: boolean;
	isSystemAccount?: boolean;
	isBankAccount?: boolean;
	isCashAccount?: boolean;
	isRetainedEarnings?: boolean;
	taxRelated?: boolean;
	currency?: string | null;
	isMonetary?: boolean | null;
	mappingKeywords?: string[];
};

type BalanceHistoryRow = { period: string; periodDebit: number; periodCredit: number; closingBalance: number };

const BALANCE_HISTORY_COLUMNS: DataColumn<BalanceHistoryRow>[] = [
	{ key: "period", header: "Period", mobile: "title", cell: (h) => <span className="text-tiny-id text-tertiary-foreground">{h.period}</span> },
	{ key: "dr", header: "Debit", align: "right", cell: (h) => plain(h.periodDebit) },
	{ key: "cr", header: "Credit", align: "right", cell: (h) => plain(h.periodCredit) },
	{ key: "closing", header: "Closing", align: "right", mobile: "value", cell: (h) => <span className={cn("font-medium", negativeClass(h.closingBalance < 0))}>{plain(h.closingBalance)}</span> },
];

export type CoaAccountPanelProps = React.ComponentProps<"aside"> & {
	account: CoaPanelAccount;
	currency?: string;
	currentBalance?: number;
	transactionCount?: number;
	lastTransactionAt?: string | null;
	balanceHistory?: BalanceHistoryRow[];
	transactions?: { id: string; date: string; description: string; type: "debit" | "credit"; amount: number; source?: string }[];
	defaultEditing?: boolean;
	onClose?: () => void;
};

/** CoaAccountDetailPanel.tsx — the right-hand panel for the selected account. */
export function CoaAccountPanel({
	account,
	currency = "MYR",
	currentBalance = 0,
	transactionCount = 0,
	lastTransactionAt,
	balanceHistory = [],
	transactions = [],
	defaultEditing,
	onClose,
	className,
	...props
}: CoaAccountPanelProps) {
	const [editing, setEditing] = React.useState(!!defaultEditing);
	const [active, setActive] = React.useState(account.isActive);
	const editRef = React.useRef<HTMLButtonElement>(null);
	/** Save and Cancel unmount with the form, so focus returns to the Edit button that opened it. */
	const closeEditor = () => {
		setEditing(false);
		editRef.current?.focus();
	};
	const flags = [
		account.isSystemAccount && "System",
		account.isBankAccount && "Bank",
		account.isCashAccount && "Cash",
		account.isRetainedEarnings && "Retained earnings",
		account.taxRelated && "Tax related",
		account.currency && `${account.currency} only`,
		account.isMonetary === true && "Monetary",
		account.isMonetary === false && "Non-monetary",
	].filter((f): f is string => typeof f === "string");
	return (
		<aside className={cn("@container flex w-full min-w-0 flex-col overflow-hidden", surfaces.card, className)} {...props}>
			<div className="flex items-center justify-between gap-2 border-b px-4 py-3">
				<div className="min-w-0 flex-1">
					<h2 className="break-words text-sm font-semibold text-foreground">{account.accountName}</h2>
					<p className="flex items-center gap-1.5 truncate text-2xs text-tertiary-foreground">
						<span className="text-tiny-id">{account.accountCode}</span>·<TypeDot type={account.accountType} />
						{typeLabel(account.accountType)}
					</p>
				</div>
				<div className="flex items-center gap-1">
					{!account.isSystemAccount && <IconButton ref={editRef} variant="skeleton" size="icon" aria-label="Edit account" aria-expanded={editing} icon={<PencilSimpleIcon weight="bold" />} onClick={() => setEditing(!editing)} />}
					<IconButton variant="skeleton" size="icon" aria-label="Close detail panel" icon={<XIcon weight="bold" />} onClick={onClose} />
				</div>
			</div>
			<div className="flex flex-col gap-4 p-4">
				<StatTile
					className="bg-interactive-secondary"
					label="Current balance"
					value={<span className={cn(currentBalance === 0 && "text-tertiary-foreground")}>{formatCurrency(currentBalance, currency)}</span>}
					negative={currentBalance < 0}
					sub={
						<span className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
							<span className="flex items-center gap-1">
								<ClockIcon size={12} aria-hidden="true" />
								{transactionCount} transactions
							</span>
							{lastTransactionAt && <span>Last: {parseDate(lastTransactionAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
						</span>
					}
				/>

				{editing && (
					<form className="flex flex-col gap-3 rounded-lg border bg-background p-3" onSubmit={(e) => (e.preventDefault(), closeEditor())}>
						<div className="text-sm font-semibold text-foreground">Edit account</div>
						{transactionCount > 0 && (
							<Alert variant="warning" role="note" className="px-2.5 py-1.5 text-2xs">
								This account has {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}. Changing the code or name will affect existing reports. Account type cannot be changed.
							</Alert>
						)}
						<label className="flex flex-col gap-1">
							<span className="text-form-label">Account code</span>
							<Input defaultValue={account.accountCode} className="font-mono text-xs" required />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-form-label">Account name</span>
							<Input defaultValue={account.accountName} required />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-form-label">Description</span>
							<Input defaultValue={account.description ?? ""} placeholder="Optional description" />
						</label>
						<ActionBar>
							<IconButton type="submit" variant="primary" icon={<CheckIcon weight="bold" />}>
								Save
							</IconButton>
							<Button type="button" variant="skeleton" onClick={closeEditor}>
								Cancel
							</Button>
						</ActionBar>
					</form>
				)}

				<div className="flex flex-col gap-3">
					{account.description && <p className="break-words text-sm leading-relaxed text-muted-foreground">{account.description}</p>}
					<div className="grid grid-cols-1 gap-3 @[18rem]:grid-cols-2">
						<div>
							<div className="text-2xs text-tertiary-foreground">Normal balance</div>
							<div className="text-sm capitalize text-foreground">{account.normalBalance}</div>
						</div>
						<div>
							<div className="text-2xs text-tertiary-foreground">Status</div>
							<div className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
								<ToneDot tone={active ? "green" : "neutral"} />
								{active ? "Active" : "Inactive"}
								<IconButton variant="skeleton" size="sm" className="ml-auto" icon={<PowerIcon weight="bold" />} onClick={() => setActive(!active)}>
									{active ? "Deactivate" : "Activate"}
								</IconButton>
							</div>
						</div>
					</div>
					{flags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{flags.map((f) => (
								<Badge key={f} variant="muted" size="sm">
									{f}
								</Badge>
							))}
						</div>
					)}
				</div>

				{balanceHistory.length > 0 && (
					<div className="flex flex-col gap-2">
						<SectionLabel>Balance history</SectionLabel>
						<DataList caption="Balance history" columns={BALANCE_HISTORY_COLUMNS} rows={balanceHistory.slice(0, 6)} getKey={(h) => h.period} dense stackBelow="lg" />
					</div>
				)}

				{transactions.length > 0 && (
					<div className="flex flex-col gap-2">
						<SectionLabel>Recent transactions</SectionLabel>
						<div className="flex flex-col gap-3">
							{transactions.slice(0, 10).map((t) => (
								<div key={t.id} className="flex items-start gap-2">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-tertiary-foreground">
										{t.type === "debit" ? <ArrowUpIcon weight="bold" size={12} aria-hidden="true" /> : <ArrowDownIcon weight="bold" size={12} aria-hidden="true" />}
									</div>
									<div className="min-w-0 flex-1">
										<div className="break-words text-sm text-foreground">{t.description || "No description"}</div>
										<div className="text-2xs text-tertiary-foreground">
											{formatDate(t.date)}
											{t.source && ` · ${t.source}`}
										</div>
									</div>
									<span className="shrink-0 text-sm tabular-nums text-foreground">
										{plain(t.amount)}
										<span className="ml-1 text-2xs text-tertiary-foreground">{t.type === "debit" ? "Dr" : "Cr"}</span>
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{transactions.length === 0 && transactionCount === 0 && (
					<div className="flex flex-col items-center gap-1.5 py-4 text-sm text-tertiary-foreground">
						<ClockIcon size={16} weight="fill" aria-hidden="true" />
						No activity yet
					</div>
				)}

				{account.mappingKeywords && account.mappingKeywords.length > 0 && (
					<div className="flex flex-col gap-2">
						<SectionLabel>AI Mapping Keywords</SectionLabel>
						<div className="flex flex-wrap gap-1">
							{account.mappingKeywords.map((k) => (
								<Badge key={k} variant="muted" size="sm">
									{k}
								</Badge>
							))}
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}

/* -------------------------------------------------------- GeneralLedgerTable */

export type GlRegisterRow = {
	id: string;
	date: string;
	entryNumber: string;
	accountCode?: string;
	accountName?: string;
	description: string;
	counterparty?: string | null;
	debit: number;
	credit: number;
	/** Base-currency equivalents of a foreign line. */
	baseDebit?: number;
	baseCredit?: number;
	currency?: string;
	runningBalance: number;
	isReconciled?: boolean;
};

/** A GL amount in its own currency; a foreign line shows the ISO code and the base figure (cynco AmountCell). */
function GlAmount({ amount, base, currency, baseCurrency }: { amount: number; base?: number; currency: string; baseCurrency: string }) {
	if (!amount) return <span className="text-tertiary-foreground">-</span>;
	if (currency === baseCurrency) return <span className="tabular-nums">{formatCurrency(amount, currency)}</span>;
	return (
		<span className="inline-flex flex-col items-end leading-tight tabular-nums" title={`${currency} line · ${formatCurrency(base ?? 0, baseCurrency)} in ${baseCurrency}`}>
			<span className="whitespace-nowrap">
				<span className="mr-1 text-2xs text-tertiary-foreground">{currency}</span>
				{formatCurrency(amount, currency)}
			</span>
			<span className="whitespace-nowrap text-2xs text-tertiary-foreground">≈ {formatCurrency(base ?? 0, baseCurrency)}</span>
		</span>
	);
}

function GlBalance({ value, currency }: { value: number; currency: string }) {
	return <span className={cn("tabular-nums text-foreground", negativeClass(value < 0))}>{formatCurrency(value, currency)}</span>;
}

/** A register row, or the synthetic opening-balance row that heads the register. */
type GlListRow = (GlRegisterRow & { kind: "line" }) | { kind: "opening"; id: string; date?: string; runningBalance: number };

export type GeneralLedgerTableProps = {
	className?: string;
	rows: GlRegisterRow[];
	baseCurrency?: string;
	/** No account selected → show the account column instead of a meaningful running balance. */
	showAccount?: boolean;
	openingBalance?: number;
	openingDate?: string;
	closingDate?: string;
};

/** routes/dashboard.accounting.ledger.tsx + ledger-explorer/LedgerRegister — the GL register with running balance. */
export function GeneralLedgerTable({ rows, baseCurrency = "MYR", showAccount, openingBalance, openingDate, closingDate, className }: GeneralLedgerTableProps) {
	const dr = rows.reduce((s, r) => s + (r.baseDebit ?? r.debit), 0);
	const cr = rows.reduce((s, r) => s + (r.baseCredit ?? r.credit), 0);
	const closing = rows.length ? rows[rows.length - 1]!.runningBalance : openingBalance ?? 0;
	const list: GlListRow[] = [
		...(openingBalance != null ? [{ kind: "opening" as const, id: "__opening__", date: openingDate, runningBalance: openingBalance }] : []),
		...rows.map((r) => ({ ...r, kind: "line" as const })),
	];
	const line = (r: GlListRow, render: (l: GlRegisterRow & { kind: "line" }) => React.ReactNode) => (r.kind === "line" ? render(r) : null);
	const columns: DataColumn<GlListRow>[] = [
		{
			key: "date",
			header: "Date · Entry #",
			className: "w-32",
			mobile: "meta",
			cell: (r) => (
				<span className="flex flex-col">
					<span className="tabular-nums whitespace-nowrap text-muted-foreground">{r.date ? formatDate(r.date) : ""}</span>
					{r.kind === "line" && <span className="whitespace-nowrap text-tiny-id text-tertiary-foreground">{r.entryNumber}</span>}
				</span>
			),
		},
		...(showAccount
			? [
					{
						key: "account",
						header: "Account",
						cell: (r: GlListRow) =>
							line(r, (l) => (
								<span className="flex flex-col">
									<span className="text-tiny-id text-tertiary-foreground">{l.accountCode}</span>
									<span>{l.accountName}</span>
								</span>
							)),
					} satisfies DataColumn<GlListRow>,
				]
			: []),
		{
			key: "description",
			header: "Description",
			// Table layout: the description takes the spare width and truncates (title carries the full text).
			className: "w-full max-w-0",
			mobile: "title",
			cell: (r) =>
				r.kind === "opening" ? (
					<span className="font-semibold text-muted-foreground">Opening balance</span>
				) : (
					<span className="flex min-w-0 flex-col" title={r.description}>
						<span className="break-words @2xl:truncate">{r.description}</span>
						<span className="text-2xs text-tertiary-foreground @2xl:truncate">{r.counterparty ?? "-"}</span>
					</span>
				),
		},
		{ key: "debit", header: "Debit", align: "right", mobile: "hidden", cell: (r) => line(r, (l) => <GlAmount amount={l.debit} base={l.baseDebit} currency={l.currency ?? baseCurrency} baseCurrency={baseCurrency} />) },
		{ key: "credit", header: "Credit", align: "right", mobile: "hidden", cell: (r) => line(r, (l) => <GlAmount amount={l.credit} base={l.baseCredit} currency={l.currency ?? baseCurrency} baseCurrency={baseCurrency} />) },
		// Stacked layout only: the posting's amount, marked by side (LedgerRegister's phone "Amount" column).
		{
			key: "amount",
			header: "Amount",
			className: "hidden",
			mobile: "value",
			cell: (r) =>
				line(r, (l) => {
					const isCredit = !!l.credit;
					return (
						<span className="inline-flex items-baseline gap-1">
							<GlAmount amount={isCredit ? l.credit : l.debit} base={isCredit ? l.baseCredit : l.baseDebit} currency={l.currency ?? baseCurrency} baseCurrency={baseCurrency} />
							<span className="text-2xs font-normal text-tertiary-foreground">{isCredit ? "Cr" : "Dr"}</span>
						</span>
					);
				}),
		},
		{
			key: "balance",
			header: "Balance",
			align: "right",
			cell: (r) => (
				<span className={r.kind === "opening" ? "font-semibold" : undefined}>
					<GlBalance value={r.runningBalance} currency={baseCurrency} />
				</span>
			),
		},
		{
			key: "rec",
			header: (
				<>
					<span aria-hidden="true">Rec.</span>
					<span className="sr-only">Reconciled</span>
				</>
			),
			align: "center",
			className: "w-12",
			cell: (r) =>
				line(r, (l) =>
					l.isReconciled ? (
						<span className="inline-flex align-middle" title="Reconciled">
							<StatusChipIcon tone="green" glyph="check" />
							<span className="sr-only">Yes</span>
						</span>
					) : (
						<span className="text-2xs text-tertiary-foreground">No</span>
					),
				),
		},
	];
	return (
		<DataList
			className={className}
			caption="General ledger"
			columns={columns}
			rows={list}
			getKey={(r) => r.id}
			dense
			stackBelow="2xl"
			empty="No postings for this account in the selected period."
			footer={
				<div className="flex flex-col gap-1 tabular-nums">
					<div className="flex flex-wrap items-baseline justify-between gap-x-4">
						<span className="font-medium text-tertiary-foreground">Page total ({baseCurrency})</span>
						<span className="flex flex-wrap justify-end gap-x-4 font-semibold text-foreground">
							<span className="whitespace-nowrap">
								<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Dr</span>
								{formatCurrency(dr, baseCurrency)}
							</span>
							<span className="whitespace-nowrap">
								<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Cr</span>
								{formatCurrency(cr, baseCurrency)}
							</span>
						</span>
					</div>
					<div className="flex flex-wrap items-baseline justify-between gap-x-4">
						<span className="font-medium text-tertiary-foreground">Closing balance{closingDate ? ` · ${formatDate(closingDate)}` : ""}</span>
						<span className="ml-auto font-semibold">
							<GlBalance value={closing} currency={baseCurrency} />
						</span>
					</div>
				</div>
			}
		/>
	);
}

/* ------------------------------------------------------------- BankLedgerHeader */

export type BankLedgerHeaderProps = React.ComponentProps<"div"> & {
	account: { name: string; number?: string; glCode?: string; institutionName?: string; currency: string };
	/** "2026-10" */
	month: string;
	tieOut: { status: "tied"; statementClosing: number } | { status: "off"; difference: number } | { status: "none"; basis: "statement" | "unverified" };
	bookBalance: number;
	statement?: { date: string; balance: number; unreconciledDifference: number } | null;
	notCounted?: { label: string; title?: string }[];
	transactionCount: number;
	credits: number;
	debits: number;
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
	const diff = statement?.unreconciledDifference ?? 0;
	return (
		<div className={cn("flex min-w-0 flex-col gap-3 px-4 py-3", surfaces.card, className)} {...props}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<h2 className="min-w-0 break-words text-sm font-semibold text-foreground">{account.name}</h2>
						{account.number && <span className="text-2xs text-tertiary-foreground">{account.number}</span>}
						{account.glCode && <span className="rounded-md bg-muted px-1.5 py-0.5 text-tiny-id text-muted-foreground">{account.glCode}</span>}
					</div>
					{account.institutionName && <p className="mt-0.5 truncate text-2xs text-tertiary-foreground">{account.institutionName}</p>}
				</div>
				{tieOut.status === "tied" ? (
					<StatusChip tone="green" glyph="check" className="h-auto min-h-5.5 py-0.5 whitespace-normal">
						<span className="tabular-nums">Ties to statement · {formatCurrency(tieOut.statementClosing, c)}</span>
					</StatusChip>
				) : tieOut.status === "off" ? (
					<StatusChip tone="red" glyph="alert" className="h-auto min-h-5.5 py-0.5 whitespace-normal">
						<span className="tabular-nums">Off by {formatCurrency(Math.abs(tieOut.difference), c)} vs statement</span>
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
				{statement && diff !== 0 && (
					<div className="flex flex-wrap items-baseline gap-x-1.5">
						<dt className="text-tertiary-foreground">Unreconciled on {formatDate(statement.date)}</dt>
						<dd className="flex items-center gap-1 text-sm text-foreground">
							<WarningIcon weight="fill" size={12} className={STATUS_TONES.amber} aria-hidden="true" />
							{diff > 0 ? "+" : "−"}
							{formatCurrency(Math.abs(diff), c)}
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
					<IconButton variant="secondary" size="icon" aria-label="Previous month" disabled={!canPrev} focusableWhenDisabled icon={<CaretLeftIcon weight="bold" />} onClick={() => onMonthChange?.(-1)} />
					<span role="status" className="min-w-28 text-center text-sm text-foreground">
						{periodLabel(month)}
					</span>
					<IconButton variant="secondary" size="icon" aria-label="Next month" disabled={!canNext} focusableWhenDisabled icon={<CaretRightIcon weight="bold" />} onClick={() => onMonthChange?.(1)} />
				</div>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs tabular-nums">
					<span className="text-tertiary-foreground">
						{transactionCount} {transactionCount === 1 ? "transaction" : "transactions"}
					</span>
					<span className="text-foreground">+{formatCurrency(credits, c)}</span>
					<span className="text-tertiary-foreground">−{formatCurrency(debits, c)}</span>
					<IconButton variant="skeleton" size="icon" aria-label="Download month as CSV" disabled={transactionCount === 0} icon={<DownloadSimpleIcon />} onClick={onDownload} />
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------ PeriodCloseRow */

export type LedgerPeriod = {
	period: string;
	fiscalStatus: "open" | "closed" | "locked";
	accountCount: number;
	transactionCount: number;
	totalDebit: number;
	totalCredit: number;
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
export function PeriodCloseRow({ period: p, isYearEnd, baseCurrency = "MYR", onClose, onReopen, onLock, onUnlock, className, ...props }: PeriodCloseRowProps) {
	const closed = p.fiscalStatus !== "open";
	return (
		<div className={cn("flex min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-3", surfaces.card, className)} {...props}>
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
						{p.accountCount} account{p.accountCount !== 1 ? "s" : ""} · {p.transactionCount} transaction{p.transactionCount !== 1 ? "s" : ""}
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

/* ------------------------------------------------------- PeriodCloseChecklist */

export type CloseCheckStatus = "fail" | "attention" | "warn" | "pass";
export type CloseAttentionCard = {
	key: string;
	title: string;
	accounts?: { code: string; name: string }[];
	why: string;
	risk: string;
	fixes?: { label: string }[];
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

const CHECK_STATUS: Record<CloseCheckStatus, { title: string; hint?: string; tone: StatusTone; glyph: StatusGlyph }> = {
	fail: { title: "Blocking", hint: "These stop the close. Fix them, or override with a reason.", tone: "red", glyph: "x" },
	attention: { title: "Needs attention", hint: "Cynco could not verify these. Fix them, or note why it is fine to close.", tone: "amber", glyph: "alert" },
	warn: { title: "Advisories", hint: "For your information. They do not stop the close.", tone: "neutral", glyph: "minus" },
	pass: { title: "Passed", tone: "green", glyph: "check" },
};
const TASK_LABEL = { depreciation: "Post depreciation", recognition: "Post recognition", fxRevaluation: "Run revaluation" } as const;

function CountChip({ status, count }: { status: CloseCheckStatus; count: number }) {
	return (
		<StatusChip tone={CHECK_STATUS[status].tone} glyph={CHECK_STATUS[status].glyph} className="h-5">
			<span className="tabular-nums">{count}</span>
			<span className="sr-only">{count === 1 ? " check" : " checks"}</span>
		</StatusChip>
	);
}

/** The attention card body shared by the checklist and the standalone card. */
function CloseAttention({ card, note, onNote, className, ...props }: { card: CloseAttentionCard; note: string; onNote: (n: string) => void } & Omit<React.ComponentProps<"div">, "children">) {
	const acknowledged = note.trim().length > 0;
	return (
		<Alert variant="warning" className={cn("flex min-w-0 flex-col gap-2 p-3", className)} role="group" aria-label={card.title} {...props}>
			<AlertTitle className="text-sm font-semibold text-foreground">{card.title}</AlertTitle>
			<AlertDescription className="flex flex-col gap-2 text-wrap md:text-wrap [&_p:not(:last-child)]:mb-0">
				{card.accounts && card.accounts.length > 0 && (
					<p className="text-2xs text-tertiary-foreground">
						On{" "}
						{card.accounts.map((a, i) => (
							<span key={a.code}>
								{i > 0 && ", "}
								<span className="text-tiny-id">{a.code}</span> {a.name}
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
								<a href="#" className="inline-flex items-center gap-1 text-sm text-primary hover:underline focus-visible:rounded-sm focus-ring" onClick={(e) => e.preventDefault()}>
									{f.label}
									<ArrowSquareOutIcon size={12} aria-hidden="true" />
									<span className="sr-only">(opens in a new tab)</span>
								</a>
							</li>
						))}
					</ul>
				) : (
					card.fallback && <p className="text-sm text-muted-foreground">{card.fallback}</p>
				)}
				<label className="flex flex-col gap-1">
					<span className="text-form-label">{acknowledged ? "Acknowledged. Note for the close record" : "Closing anyway? Add a note for the close record"}</span>
					<Textarea
						value={note}
						maxLength={500}
						rows={2}
						onChange={(e) => onNote(e.target.value)}
						placeholder="What you checked, and why it is fine to close"
						className="input-base input-shadow-default input-state-focus min-h-14 rounded-lg text-sm"
					/>
				</label>
			</AlertDescription>
		</Alert>
	);
}

export type PeriodCloseAttentionCardProps = Omit<React.ComponentProps<"div">, "children"> & { card: CloseAttentionCard; note?: string; onNoteChange?: (n: string) => void };

/** periods/AttentionCardView.tsx — a check Cynco could not verify, with fixes and the closer's note. */
export function PeriodCloseAttentionCard({ card, note: initialNote = "", onNoteChange, ...props }: PeriodCloseAttentionCardProps) {
	const [note, setNote] = React.useState(initialNote);
	return (
		<CloseAttention
			card={card}
			note={note}
			onNote={(n) => {
				setNote(n);
				onNoteChange?.(n);
			}}
			{...props}
		/>
	);
}

export type PeriodCloseChecklistProps = React.ComponentProps<"div"> & {
	items: CloseCheckItem[];
	runningTask?: CloseCheckItem["task"] | null;
	busy?: boolean;
	onRunTask?: (task: NonNullable<CloseCheckItem["task"]>) => void;
	onClosePeriodFirst?: (period: string) => void;
};

/** periods/CloseChecklist.tsx — pre-close checks grouped worst first; passed checks fold away. */
export function PeriodCloseChecklist({ items, runningTask, busy, onRunTask, onClosePeriodFirst, className, ...props }: PeriodCloseChecklistProps) {
	const order: CloseCheckStatus[] = ["fail", "attention", "warn", "pass"];
	const groups = order.map((s) => ({ status: s, items: items.filter((i) => i.status === s) })).filter((g) => g.items.length);
	const onlyPassed = groups.length === 1 && groups[0]!.status === "pass";
	const [notes, setNotes] = React.useState<Record<string, string>>({});
	const [passedOpen, setPassedOpen] = React.useState<boolean | null>(null);
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			{groups.map(({ status, items: group }) => {
				const meta = CHECK_STATUS[status];
				if (status === "pass") {
					const open = passedOpen ?? onlyPassed;
					return (
						<Collapsible key={status} open={open} onOpenChange={setPassedOpen} className="overflow-hidden rounded-xl border bg-table-tray">
							<h3>
								<CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-foreground outline-none focus-ring-inset">
									<span className="flex items-center gap-2">
										Passed
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
											<StatusChipIcon tone="green" glyph="check" className="mt-0.5" />
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
								{meta.title}
								<CountChip status={status} count={group.length} />
							</h3>
							{meta.hint && <p className="text-2xs text-tertiary-foreground">{meta.hint}</p>}
						</div>
						<ul className="divide-y border-t bg-card">
							{group.map((item) => (
								<li key={item.id} className="flex gap-3 px-4 py-3.5">
									<StatusChipIcon tone={meta.tone} glyph={meta.glyph} className="mt-0.5" />
									<div className="flex min-w-0 flex-1 flex-col gap-0.5">
										<span className="text-sm font-semibold text-foreground">{item.label}</span>
										<span className="text-sm text-muted-foreground">{item.detail}</span>
										{item.failure && (
											<p role="alert" className={cn("mt-1 text-2xs", surfaces.negative)}>
												{item.failure}
											</p>
										)}
										{item.attention?.map((card) => (
											<CloseAttention key={card.key} className="mt-3" card={card} note={notes[card.key] ?? ""} onNote={(n) => setNotes((p) => ({ ...p, [card.key]: n }))} />
										))}
										{(item.task || item.unclosedPeriod) && (
											<ActionBar className="mt-2.5">
												{item.task && (
													<Button variant="secondary" isLoading={runningTask === item.task} disabled={busy} onClick={() => onRunTask?.(item.task!)}>
														{TASK_LABEL[item.task]}
													</Button>
												)}
												{item.unclosedPeriod && (
													<IconButton variant="secondary" iconOrientation="right" icon={<ArrowRightIcon />} disabled={busy} onClick={() => onClosePeriodFirst?.(item.unclosedPeriod!)}>
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

/* --------------------------------------------------- OpeningBalanceTotalsBar */

export type OpeningBalanceTotalsBarProps = React.ComponentProps<"div"> & {
	debit: number;
	credit: number;
	currency?: string;
	/** Rows with a typed amount. */
	filled: number;
	invalidCount?: number;
	overLimit?: boolean;
	maxAmount?: number;
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
	const difference = Math.round((debit - credit) * 100) / 100;
	const limit = maxAmount != null ? `, up to ${plain(maxAmount)}` : "";
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
		detail = `Debits and credits must each stay within ${maxAmount != null ? plain(maxAmount) : "the ledger limit"}.`;
	} else if (filled > 0 && difference === 0) {
		tone = "success";
		text = "Balanced";
	} else if (filled > 0) {
		tone = "warning";
		text = `Out by ${formatCurrency(Math.abs(difference), currency)}`;
		detail = `${difference > 0 ? "More debits" : "More credits"}: the gap goes to ${suspenseLabel}.`;
	}
	const postLabel = isPosting ? "Posting…" : entryStatus === "posted" ? (isDirty ? "Post changes" : "Posted") : entryStatus === "draft" ? "Post draft" : "Post opening balances";
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
				<div role="status" aria-live="polite" className="flex min-w-0 flex-1 basis-56 items-center gap-2 rounded-lg border bg-interactive-secondary px-2.5 py-1.5 @3xl:max-w-sm">
					{tone === "neutral" ? (
						<ToneDot tone="neutral" className="mx-1" />
					) : (
						<StatusChipIcon tone={tone === "success" ? "green" : tone === "warning" ? "amber" : "red"} glyph={tone === "success" ? "check" : tone === "warning" ? "alert" : "x"} />
					)}
					<span className="min-w-0">
						<span className="block text-2xs font-medium text-foreground tabular-nums">{text}</span>
						{detail && <span className="block text-2xs text-tertiary-foreground">{detail}</span>}
					</span>
				</div>
				<div className="ml-auto flex flex-wrap items-center justify-end gap-2">
					{onlySubledger && !isDirty && <span className="max-w-56 text-right text-2xs text-tertiary-foreground">Nothing typed to post. Customer and vendor openings are already in the ledger.</span>}
					{isDirty && (
						<Button variant="skeleton" disabled={isPosting} onClick={onDiscard}>
							Discard
						</Button>
					)}
					<Button variant="primary" disabled={!canPost || (entryStatus === "posted" && !isDirty)} isLoading={isPosting} onClick={onPost}>
						{postLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}

/* ---------------------------------------------------- AccountingWorkbenchHeader */

export type WorkbenchStat = {
	key: string;
	label: string;
	value: React.ReactNode;
	hint?: React.ReactNode;
	href?: string;
	status?: "success" | "warning" | "danger";
};
const STAT_STATUS: Record<NonNullable<WorkbenchStat["status"]>, { tone: StatusTone; glyph: StatusGlyph; word: string }> = {
	success: { tone: "green", glyph: "check", word: "OK" },
	warning: { tone: "amber", glyph: "alert", word: "Warning" },
	danger: { tone: "red", glyph: "x", word: "Problem" },
};
/** auto-fit (not auto-fill) so a short row of tiles stretches across the header, as Cynco's StatGrid does. */

export type AccountingWorkbenchHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
	title: React.ReactNode;
	meta?: React.ReactNode;
	actions?: React.ReactNode;
	stats?: WorkbenchStat[];
};

/** workbench-chrome.tsx WorkbenchHeader + StatGrid — the title bar and metric strip that open every workbench tab. */
export function AccountingWorkbenchHeader({ title, meta, actions, stats = [], className, ...props }: AccountingWorkbenchHeaderProps) {
	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			<div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
				<div className="min-w-0">
					<h1 className="break-words text-main">{title}</h1>
					{meta && <p className="text-2xs text-tertiary-foreground">{meta}</p>}
				</div>
				{actions && <ActionBar>{actions}</ActionBar>}
			</div>
			{stats.length > 0 && (
				<StatGrid min="md">
					{stats.map((s) => {
						const value = s.status ? (
							<span className="inline-flex items-center gap-1.5">
								<StatusChipIcon tone={STAT_STATUS[s.status].tone} glyph={STAT_STATUS[s.status].glyph} />
								<span className="sr-only">{STAT_STATUS[s.status].word}: </span>
								{s.value}
							</span>
						) : (
							s.value
						);
						const tile = (
							<StatTile
								label={s.label}
								value={value}
								sub={s.hint}
								className={cn("h-full", s.href && "transition-colors group-hover:border-primary/40")}
								badge={s.href ? <ArrowUpRightIcon weight="bold" size={14} aria-hidden="true" className="text-tertiary-foreground opacity-0 transition-opacity group-hover:opacity-100" /> : undefined}
							/>
						);
						return s.href ? (
							<a key={s.key} href={s.href} onClick={(e) => e.preventDefault()} className="group block min-w-0 rounded-xl focus-ring">
								{tile}
							</a>
						) : (
							<React.Fragment key={s.key}>{tile}</React.Fragment>
						);
					})}
				</StatGrid>
			)}
		</div>
	);
}
