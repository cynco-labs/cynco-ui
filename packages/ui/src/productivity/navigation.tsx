/**
 * Cynco UI — navigation productivity: the ⌘K command palette, the "?" shortcuts sheet with
 * two-key "g then i" jumps, and saved views for any list.
 *
 * Route names, keybinds and keywords follow Cynco's command registry
 * (remix/app/services/commands/navigationCatalog.*.ts and shortcuts.ts), so these can replace
 * KumoSearchPalette / KeyboardShortcutsSheet without retraining anyone's fingers.
 */
import * as React from "react";
import {
	Button,
	Checkbox,
	Command,
	CommandDialog,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandHint,
	CommandInput,
	CommandItem,
	CommandList,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	FilterChip,
	IconButton,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Label,
	Switch,
	cn,
	useCharacterKeyShortcuts,
	useShortcutAllowed,
	useControllableState,
	LiveStatus,
} from "../base";
import {
	ArrowCounterClockwiseIcon,
	BankIcon,
	BooksIcon,
	BuildingsIcon,
	ChartLineUpIcon,
	CircleHalfIcon,
	CopyIcon,
	DotsThreeIcon,
	FileTextIcon,
	FlaskIcon,
	GearIcon,
	HandCoinsIcon,
	HourglassMediumIcon,
	HouseIcon,
	IdentificationCardIcon,
	InvoiceIcon,
	KeyboardIcon,
	LockSimpleIcon,
	MagnifyingGlassIcon,
	NotebookIcon,
	PackageIcon,
	PencilSimpleIcon,
	PercentIcon,
	PlusIcon,
	ReceiptIcon,
	ScalesIcon,
	SidebarSimpleIcon,
	StorefrontIcon,
	TrashIcon,
	TreeStructureIcon,
	UserIcon,
	UserPlusIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { ActionBar, DocStatus, FieldError, INVOICE_STATUS, Kbd, Money, ScrollRow, parseAmount, useHotkey } from "../lib/shared";

/* ───────────── Small local helpers ───────────── */

/** Controlled/uncontrolled state with a guaranteed initial value. */
function useControlled<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void): [T, (v: T) => void] {
	const [v, set] = useControllableState<T>({ prop: value, defaultProp: defaultValue, onChange });
	return [v as T, set];
}

/**
 * A shortcut as keycaps. `"mod+k"` is one chord; `"g i"` is a sequence (G, then I);
 * an array lists alternatives (`["j", "down"]`).
 */
function KeySeq({ keys, className }: { keys: string | string[]; className?: string }) {
	const alts = Array.isArray(keys) ? keys : [keys];
	return (
		<span data-slot="cy-key-seq" className={cn("inline-flex shrink-0 items-center gap-1", className)}>
			{alts.map((alt, a) => (
				<React.Fragment key={a}>
					{a > 0 && <span className="text-2xs text-tertiary-foreground">or</span>}
					{alt
						.trim()
						.split(/\s+/)
						.map((chord, i) => (
							<React.Fragment key={i}>
								{i > 0 && <span className="sr-only">then</span>}
								<Kbd keys={chord} />
							</React.Fragment>
						))}
				</React.Fragment>
			))}
		</span>
	);
}

/**
 * The alternatives that can fire right now: printable-only ones ("?", "g i") drop out while the
 * user has single-key shortcuts turned off (WCAG 2.1.4). Chords with ⌘/Ctrl/Alt always stay.
 */
function liveKeys(keys: string | string[], allowed: (keys: string) => boolean): string[] {
	return (Array.isArray(keys) ? keys : [keys]).filter(allowed);
}

/** Readable text for a shortcut, used for search ("alt b", "g then i"). */
const describeKeys = (keys: string | string[]) =>
	(Array.isArray(keys) ? keys : [keys]).map((k) => k.replace(/\+/g, " ").replace(/\bmod\b/g, "mod cmd ctrl")).join(" ");

const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
const BOUNDARY = /[\s\-_/.,:#·()&]/;

/** Subsequence match ("jrnl" → "journal entries"): 10–45, higher when the letters sit close together. */
function subsequenceScore(token: string, field: string): number {
	let fi = field.indexOf(token[0]);
	if (fi < 0) return 0;
	// The first letter must start a word, or matches get noisy.
	while (fi > 0 && !BOUNDARY.test(field[fi - 1])) {
		fi = field.indexOf(token[0], fi + 1);
		if (fi < 0) return 0;
	}
	const start = fi;
	for (let ti = 1; ti < token.length; ti++) {
		fi = field.indexOf(token[ti], fi + 1);
		if (fi < 0) return 0;
	}
	const span = fi - start + 1;
	return Math.round(10 + 35 * (token.length / span));
}

/** Best score of one query token against a record's fields (0 = no match). */
function scoreToken(token: string, fields: string[], amount?: string): number {
	let best = 0;
	const numeric = /^(rm)?[\d,]+(\.\d+)?k?$/.test(token);
	if (numeric && amount) {
		const parsed = parseAmount(token.replace(/^rm/, ""));
		if (parsed.ok && Number(parsed.value) === Number(amount)) best = 120;
		const plain = token.replace(/^rm/, "").replace(/,/g, "");
		if (!best && amount.replace(/,/g, "").startsWith(plain)) best = 70;
	}
	for (const f of fields) {
		const i = f.indexOf(token);
		if (i === 0) best = Math.max(best, 100);
		else if (i > 0) best = Math.max(best, BOUNDARY.test(f[i - 1]) ? 80 : 45);
		else if (!numeric && token.length >= 2) best = Math.max(best, subsequenceScore(token, f));
		if (best >= 100) break;
	}
	return best;
}

/** All tokens must match somewhere; the sum ranks results. */
function scoreFields(query: string, fields: string[], amount?: string): number {
	const tokens = fold(query).split(/\s+/).filter(Boolean);
	if (!tokens.length) return 1;
	const folded = fields.filter(Boolean).map(fold);
	// Acronyms: "gl" → General ledger, "pl" → Profit & loss.
	for (const f of [...folded]) {
		const initials = f.split(/[\s\-_/&]+/).filter(Boolean).map((w) => w[0]).join("");
		if (initials.length > 1) folded.push(initials);
	}
	let total = 0;
	for (const t of tokens) {
		const s = scoreToken(t, folded, amount);
		if (!s) return 0;
		total += s;
	}
	// Whole query is the start of the label: float it to the top.
	if (folded[0]?.startsWith(fold(query.trim()))) total += 30;
	return total;
}

/* ───────────── Command palette ───────────── */

export type CommandPaletteItem = {
	id: string;
	/** Heading it is listed under: "Go to", "Create", "Recent", "Actions" or your own. */
	group: string;
	label: string;
	/** Extra words that find it ("P&L", "income statement"). */
	keywords?: string[];
	icon?: React.ReactNode;
	/** Shown as keycaps: "mod+k", "g i" (sequence), "?" */
	shortcut?: string;
	/** Muted text at the right (e.g. a path or a type). */
	hint?: React.ReactNode;
	/** Destination, for items that navigate; your `onSelect` routes to it. */
	href?: string;
	disabled?: boolean;
	onSelect?: () => void;
	/** Set on items built from `recent` records. */
	record?: CommandPaletteRecord;
};

export type CommandPaletteRecordType = "invoice" | "quotation" | "bill" | "credit_note" | "customer" | "vendor" | "journal" | "payment" | "item" | "account";

export type CommandPaletteRecord = {
	id: string;
	type: CommandPaletteRecordType;
	/** Document number or code: "INV-2026-0142", "1000-001". */
	number?: string;
	/** Name: the customer, vendor or description. */
	label: string;
	/** Document status, styled with Cynco's invoice status map ("overdue", "paid"…). */
	status?: string;
	/** Decimal string; typing the figure ("3240", "3,240.00") finds the record. */
	amount?: string;
	currency?: string;
	keywords?: string[];
	href?: string;
	onSelect?: () => void;
};

const RECORD_META: Record<CommandPaletteRecordType, { label: string; icon: React.ReactNode }> = {
	invoice: { label: "Invoice", icon: <InvoiceIcon /> },
	quotation: { label: "Quotation", icon: <FileTextIcon /> },
	bill: { label: "Bill", icon: <ReceiptIcon /> },
	credit_note: { label: "Credit note", icon: <FileTextIcon /> },
	customer: { label: "Customer", icon: <UserIcon /> },
	vendor: { label: "Vendor", icon: <StorefrontIcon /> },
	journal: { label: "Journal entry", icon: <NotebookIcon /> },
	payment: { label: "Payment", icon: <HandCoinsIcon /> },
	item: { label: "Item", icon: <PackageIcon /> },
	account: { label: "Account", icon: <TreeStructureIcon /> },
};

const nav = (id: string, label: string, href: string, icon: React.ReactNode, keywords: string[] = [], shortcut?: string): CommandPaletteItem => ({ id, group: "Go to", label, href, icon, keywords, shortcut });
const make = (id: string, label: string, href: string, icon: React.ReactNode, keywords: string[] = [], shortcut?: string): CommandPaletteItem => ({ id, group: "Create", label, href, icon, keywords, shortcut });

/**
 * Cynco's palette commands: main areas, create actions and app actions, with the registry's own
 * paths, keybinds and keywords. Pass to `CommandPalette items` (spread and add your own), then
 * route in `onSelect` with `item.href` / `item.id`.
 */
export const CYNCO_PALETTE_ITEMS: CommandPaletteItem[] = [
	nav("go-dashboard", "Dashboard", "/dashboard", <HouseIcon />, ["home", "overview"], "g d"),
	nav("go-invoices", "Invoices", "/dashboard/invoicing", <InvoiceIcon />, ["billing", "revenue", "sales", "receivables"], "g i"),
	nav("go-quotations", "Quotations", "/dashboard/quotations", <FileTextIcon />, ["quotes", "estimates"], "g q"),
	nav("go-bills", "Bills", "/dashboard/expenses", <ReceiptIcon />, ["expenses", "purchases", "payables"]),
	nav("go-customers", "Customers", "/dashboard/customers", <UserIcon />, ["clients", "contacts"], "g c"),
	nav("go-vendors", "Vendors", "/dashboard/vendors", <StorefrontIcon />, ["suppliers"], "g v"),
	nav("go-journal", "Journal entries", "/dashboard/accounting/journal", <NotebookIcon />, ["JE", "journal", "manual entries"]),
	nav("go-coa", "Chart of accounts", "/dashboard/chart-of-accounts", <TreeStructureIcon />, ["COA", "accounts"]),
	nav("go-ledger", "General ledger", "/dashboard/accounting/ledger", <BooksIcon />, ["GL", "ledger", "transactions"]),
	nav("go-banking", "Banking", "/dashboard/banking", <BankIcon />, ["bank", "cards", "reconcile", "feeds"], "g b"),
	nav("go-pl", "Profit & loss", "/dashboard/reports/profit-loss", <ChartLineUpIcon />, ["P&L", "PnL", "income statement", "report"]),
	nav("go-bs", "Balance sheet", "/dashboard/reports/balance-sheet", <ScalesIcon />, ["BS", "financial position", "report"]),
	nav("go-tb", "Trial balance", "/dashboard/reports/trial-balance", <ScalesIcon />, ["TB", "report"]),
	nav("go-aging", "Aging receivable", "/dashboard/reports/aging-receivable", <HourglassMediumIcon />, ["AR aging", "ageing", "overdue", "report"]),
	nav("go-aging-ap", "Aging payable", "/dashboard/reports/aging-payable", <HourglassMediumIcon />, ["AP aging", "ageing", "report"]),
	nav("go-tax", "Tax", "/dashboard/settings/tax", <PercentIcon />, ["SST", "service tax", "LHDN", "e-invoice", "MyInvois"]),
	nav("go-assets", "Fixed assets", "/dashboard/accounting/fixed-assets", <BuildingsIcon />, ["asset register", "depreciation", "capital allowance"]),
	nav("go-items", "Items", "/dashboard/items", <PackageIcon />, ["products", "services", "inventory"]),
	nav("go-payroll", "Payroll", "/dashboard/payroll", <IdentificationCardIcon />, ["salary", "payslip", "EPF", "SOCSO", "EIS", "PCB"]),
	nav("go-settings", "Settings", "/dashboard/settings", <GearIcon />, ["preferences", "company", "configuration"], "mod+,"),
	make("new-invoice", "New invoice", "/dashboard/invoicing-new", <PlusIcon />, ["create", "add", "bill customer"], "c i"),
	make("new-quotation", "New quotation", "/dashboard/quotations-new", <PlusIcon />, ["create", "quote", "estimate"], "c q"),
	make("new-bill", "New bill", "/dashboard/expenses/new", <PlusIcon />, ["create", "expense", "purchase"]),
	make("new-journal", "New journal entry", "/dashboard/accounting/journal/new", <PlusIcon />, ["create", "JE", "manual"], "c j"),
	make("record-payment", "Record payment", "/dashboard/invoicing?action=payment", <HandCoinsIcon />, ["receive", "receipt", "collect", "pay"]),
	make("new-customer", "New customer", "/dashboard/customers?action=create", <UserPlusIcon />, ["create", "add", "client"], "c c"),
	make("new-vendor", "New vendor", "/dashboard/vendors?action=create", <UserPlusIcon />, ["create", "add", "supplier"]),
	{ id: "act-sandbox", group: "Actions", label: "Switch to sandbox", icon: <FlaskIcon />, keywords: ["test", "demo", "live", "environment"] },
	{ id: "act-theme", group: "Actions", label: "Toggle theme", icon: <CircleHalfIcon />, keywords: ["dark", "light", "appearance"] },
	{ id: "act-sidebar", group: "Actions", label: "Toggle sidebar", icon: <SidebarSimpleIcon />, keywords: ["collapse", "expand"], shortcut: "mod+b" },
	{ id: "act-shortcuts", group: "Actions", label: "Keyboard shortcuts", icon: <KeyboardIcon />, keywords: ["help", "keys", "hotkeys"], shortcut: "?" },
];

const GROUP_ORDER = ["Recent", "Go to", "Create", "Actions"];

function recordToItem(r: CommandPaletteRecord): CommandPaletteItem {
	const meta = RECORD_META[r.type];
	const statusLabel = r.status ? INVOICE_STATUS[r.status]?.label ?? r.status : "";
	return {
		id: `recent-${r.type}-${r.id}`,
		group: "Recent",
		label: r.number ? `${r.number} ${r.label}` : r.label,
		keywords: [r.number?.replace(/[^a-z0-9]/gi, "") ?? "", r.label, meta.label, statusLabel, ...(r.keywords ?? [])],
		icon: meta.icon,
		href: r.href,
		onSelect: r.onSelect,
		record: r,
	};
}

/** One row: icon, label, hint and keycaps — or, for records, number, name, status and amount. */
/** `allowed` comes from the palette (read once there, not per row). */
function PaletteRow({ item, allowed }: { item: CommandPaletteItem; allowed: (keys: string) => boolean }) {
	const r = item.record;
	const shortcut = item.shortcut ? liveKeys(item.shortcut, allowed) : [];
	return (
		<>
			<span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center text-tertiary-foreground [&_svg]:size-4">
				{item.icon}
			</span>
			{r ? (
				<span className="flex min-w-0 flex-1 items-baseline gap-2">
					{r.number && <span className="shrink-0 font-mono text-xs text-foreground">{r.number}</span>}
					<span className={cn("min-w-0 truncate", r.number ? "text-muted-foreground" : "text-foreground")}>{r.label}</span>
				</span>
			) : (
				<span className="min-w-0 flex-1 truncate text-foreground">{item.label}</span>
			)}
			<span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
				{r ? (
					<>
						{r.status && <DocStatus status={r.status} config={INVOICE_STATUS} className="hidden @md:inline-flex" />}
						{r.amount && <Money amount={r.amount} currency={r.currency} className="hidden text-xs text-muted-foreground @sm:inline" />}
						<span className="hidden text-xs text-tertiary-foreground @lg:inline">{RECORD_META[r.type].label}</span>
					</>
				) : (
					item.hint && <span className="hidden truncate text-xs text-tertiary-foreground @md:inline">{item.hint}</span>
				)}
				{shortcut.length > 0 && <KeySeq keys={shortcut} className="hidden @sm:inline-flex" />}
			</span>
		</>
	);
}

/** The palette's slot sizing, so the inline variant matches the dialog (Cynco UI's palette sizes). */
const INLINE_SLOTS = cn(
	"[&_[data-slot=command-input-wrapper]]:h-11 [&_[data-slot=command-input-wrapper]]:gap-2.5 [&_[data-slot=command-input-wrapper]]:px-3.5",
	"[&_[data-slot=command-list]]:max-h-[22rem]",
	"[&_[data-slot=command-item]]:h-9 [&_[data-slot=command-item]]:gap-2.5 [&_[data-slot=command-item]]:rounded-lg [&_[data-slot=command-item]]:px-2.5",
	"[&_[data-slot=command-item][data-selected=true]]:bg-foreground/6",
);

export type CommandPaletteProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Commands. Defaults to CYNCO_PALETTE_ITEMS. */
	items?: CommandPaletteItem[];
	/** Recently opened records, newest first. Searchable by number, name, status and amount. */
	recent?: CommandPaletteRecord[];
	/** How many recent records to list before the user types. Default 5. */
	recentLimit?: number;
	/** Called for every chosen item (after the item's own onSelect), e.g. to route to `item.href`. */
	onSelect?: (item: CommandPaletteItem) => void;
	/** Shortcut that toggles the palette. Default "mod+k"; `false` to bind your own. */
	hotkey?: string | string[] | false;
	placeholder?: string;
	/** Render in place (a card on the page) instead of as a ⌘K dialog. */
	inline?: boolean;
	className?: string;
};

/**
 * ⌘K / Ctrl+K command palette: jump to any area, create documents, reopen recent records and run
 * app actions. Fuzzy search across labels and keywords ("inv 0142" → INV-2026-0142, "3240" → the
 * record with that total, "gl" → General ledger). Typing ">" narrows to actions.
 */
export function CommandPalette({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	items = CYNCO_PALETTE_ITEMS,
	recent = [],
	recentLimit = 5,
	onSelect,
	hotkey = "mod+k",
	placeholder = "Search or jump to…",
	inline = false,
	className,
}: CommandPaletteProps) {
	const [open, setOpen] = useControlled(openProp, defaultOpen, onOpenChange);
	const [query, setQuery] = React.useState("");

	const allowed = useShortcutAllowed();
	// useHotkey drops printable-only keys itself while single-key shortcuts are off.
	useHotkey(hotkey || "mod+k", () => setOpen(!open), { enabled: hotkey !== false && !inline, allowInInputs: true });

	const actionsOnly = query.trimStart().startsWith(">");
	const q = actionsOnly ? query.trimStart().slice(1).trim() : query.trim();

	const groups = React.useMemo(() => {
		const recentItems = recent.map(recordToItem);
		const pool = actionsOnly ? items.filter((i) => i.group === "Actions") : [...recentItems, ...items];
		const scored = pool
			.map((item, index) => {
				const r = item.record;
				const fields = r
					? [r.number ?? "", r.label, ...(item.keywords ?? []), r.amount ?? "", r.amount ? Number(r.amount).toLocaleString("en-MY", { minimumFractionDigits: 2 }) : ""]
					: [item.label, ...(item.keywords ?? []), typeof item.hint === "string" ? item.hint : "", item.group];
				return { item, index, score: q ? scoreFields(q, fields, r?.amount) : 1 };
			})
			.filter((s) => s.score > 0);
		const byGroup = new Map<string, typeof scored>();
		for (const s of scored) {
			const list = byGroup.get(s.item.group) ?? [];
			list.push(s);
			byGroup.set(s.item.group, list);
		}
		const out = [...byGroup.entries()].map(([group, list]) => {
			const sorted = q ? [...list].sort((a, b) => b.score - a.score || a.index - b.index) : list;
			return { group, best: sorted[0]?.score ?? 0, items: (!q && group === "Recent" ? sorted.slice(0, recentLimit) : sorted).map((s) => s.item) };
		});
		const rank = (g: string) => (GROUP_ORDER.indexOf(g) + 1 || GROUP_ORDER.length + 1);
		return out.sort((a, b) => (q ? b.best - a.best : 0) || rank(a.group) - rank(b.group));
	}, [items, recent, q, actionsOnly, recentLimit]);
	const resultCount = groups.reduce((n, g) => n + g.items.length, 0);

	const run = (item: CommandPaletteItem) => {
		if (item.disabled) return;
		if (!inline) setOpen(false);
		setQuery("");
		item.onSelect?.();
		onSelect?.(item);
	};

	const body = (
		<>
			<CommandInput value={query} onValueChange={setQuery} placeholder={actionsOnly ? "Search actions…" : placeholder} aria-label="Search commands and records" />
			<CommandList>
				<CommandEmpty>
					<div className="text-foreground">No results for “{q || query}”</div>
					<div className="mt-1 text-xs">Try an invoice number, a customer, an amount, or “&gt;” for actions.</div>
				</CommandEmpty>
				{groups.map((g) => (
					<CommandGroup key={g.group} heading={g.group}>
						{g.items.map((item) => (
							<CommandItem key={item.id} value={item.id} disabled={item.disabled} onSelect={() => run(item)}>
								<PaletteRow item={item} allowed={allowed} />
							</CommandItem>
						))}
					</CommandGroup>
				))}
			</CommandList>
			<CommandFooter className="gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<CommandHint><Kbd keys={["up"]} /><Kbd keys={["down"]} /><span className="hidden @sm:inline">Navigate</span></CommandHint>
					<CommandHint><Kbd keys="enter" /><span className="hidden @sm:inline">Open</span></CommandHint>
					<CommandHint>
						<Kbd keys={[">"]} />
						<span className={cn(actionsOnly && "font-medium text-foreground")}>{actionsOnly ? "Actions only" : "Actions"}</span>
					</CommandHint>
				</div>
				<CommandHint className="shrink-0"><Kbd keys="esc" /><span className="hidden @sm:inline">{inline ? "Clear" : "Close"}</span></CommandHint>
			</CommandFooter>
			{/* cmdk's empty state isn't announced; this stable region reports the result count as you type. */}
			<LiveStatus>
				{q ? (resultCount === 0 ? `No results for “${q}”` : `${resultCount} ${resultCount === 1 ? "result" : "results"}`) : ""}
			</LiveStatus>
		</>
	);

	if (inline) {
		return (
			<div data-slot="cy-command-palette" className={cn("@container min-w-0 overflow-hidden rounded-xl border border-border bg-interactive-secondary", className)}>
				<Command
					shouldFilter={false}
					label="Command palette"
					className={cn("min-h-0 rounded-none bg-transparent", INLINE_SLOTS)}
					onKeyDown={(e) => {
						if (e.key === "Escape" && query) {
							e.preventDefault();
							setQuery("");
						}
					}}
				>
					{body}
				</Command>
			</div>
		);
	}

	return (
		<CommandDialog
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setQuery("");
			}}
			title="Command palette"
			description="Search pages, records and commands. Type > for actions."
			className={cn("@container", className)}
		>
			{body}
		</CommandDialog>
	);
}

export type CommandPaletteTriggerProps = React.ComponentProps<"button"> & {
	/** Placeholder text. Default "Search or jump to…". */
	label?: React.ReactNode;
	/** Keycap shown at the right. Default "mod+k". */
	shortcut?: string;
};

/** A search-field-looking button for headers that opens the palette (wire `onClick`). */
export function CommandPaletteTrigger({ label = "Search or jump to…", shortcut = "mod+k", className, ...props }: CommandPaletteTriggerProps) {
	const allowed = useShortcutAllowed();
	const showKeys = !!shortcut && allowed(shortcut);
	return (
		<button
			type="button"
			data-slot="cy-command-palette-trigger"
			aria-haspopup="dialog"
			aria-keyshortcuts={shortcut === "mod+k" ? "Meta+K Control+K" : undefined}
			className={cn(
				"flex h-input w-full max-w-xs min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-input)] bg-interactive-secondary px-2 text-sm text-tertiary-foreground btn-secondary-shadow transition-colors",
				"outline-none hover:bg-interactive-secondary-hover hover:text-muted-foreground focus-visible:border-primary focus-ring",
				className,
			)}
			{...props}
		>
			<MagnifyingGlassIcon aria-hidden="true" className="size-3.5 shrink-0" />
			<span className="min-w-0 flex-1 truncate text-left">{label}</span>
			{showKeys && <Kbd keys={shortcut} className="shrink-0" />}
		</button>
	);
}

/* ───────────── Shortcuts dialog + "g then x" ───────────── */

export type ShortcutsDialogItem = {
	/** "mod+k", "g i" (sequence), "?"; an array lists alternatives. */
	keys: string | string[];
	label: string;
	/**
	 * Fires only while its own component has focus (e.g. "=" inside an amount cell), so the
	 * single-key switch doesn't apply and the row is never shown as off.
	 */
	focusScoped?: boolean;
};
export type ShortcutsDialogSection = { title: string; items: ShortcutsDialogItem[] };

/** Cynco's shortcut map: the registry's go-to and create sequences plus list and journal keys. */
export const CYNCO_SHORTCUT_SECTIONS: ShortcutsDialogSection[] = [
	{
		title: "Global",
		items: [
			{ keys: "mod+k", label: "Open command palette" },
			{ keys: "?", label: "Show keyboard shortcuts" },
			{ keys: "mod+b", label: "Toggle sidebar" },
			{ keys: "mod+,", label: "Settings" },
			{ keys: "esc", label: "Close dialog or clear selection" },
		],
	},
	{
		title: "Go to",
		items: [
			{ keys: "g d", label: "Dashboard" },
			{ keys: "g i", label: "Invoices" },
			{ keys: "g q", label: "Quotations" },
			{ keys: "g c", label: "Customers" },
			{ keys: "g v", label: "Vendors" },
			{ keys: "g b", label: "Banking" },
			{ keys: "g a", label: "Accounting workbench" },
			{ keys: "g r", label: "Data room" },
		],
	},
	{
		title: "Create",
		items: [
			{ keys: "c i", label: "New invoice" },
			{ keys: "c q", label: "New quotation" },
			{ keys: "c j", label: "New journal entry" },
			{ keys: "c c", label: "New customer" },
		],
	},
	{
		title: "Lists",
		items: [
			{ keys: ["j", "down"], label: "Next row" },
			{ keys: ["k", "up"], label: "Previous row" },
			{ keys: "x", label: "Select row" },
			{ keys: "shift+x", label: "Select range" },
			{ keys: "enter", label: "Open row" },
			{ keys: "/", label: "Search this list" },
		],
	},
	{
		title: "Journal entry",
		items: [
			{ keys: "Tab", label: "Next cell" },
			{ keys: "enter", label: "New line" },
			{ keys: "alt+b", label: "Balance this line" },
			{ keys: "=", label: "Start a formula (=1200*1.08)", focusScoped: true },
			{ keys: "mod+enter", label: "Post entry" },
			{ keys: "mod+s", label: "Save draft" },
		],
	},
];

export type ShortcutsDialogProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Defaults to CYNCO_SHORTCUT_SECTIONS. */
	sections?: ShortcutsDialogSection[];
	/** Key that opens the sheet. Default "?" (Shift+/); `false` to bind your own. */
	hotkey?: string | string[] | false;
	title?: string;
	className?: string;
};

/** The "?" sheet: every keyboard shortcut, grouped and searchable. */
export function ShortcutsDialog({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	sections = CYNCO_SHORTCUT_SECTIONS,
	hotkey = "?",
	title = "Keyboard shortcuts",
	className,
}: ShortcutsDialogProps) {
	const [open, setOpen] = useControlled(openProp, defaultOpen, onOpenChange);
	const [query, setQuery] = React.useState("");
	const searchId = React.useId();
	const switchDescId = React.useId();
	const [characterKeys, setCharacterKeys] = useCharacterKeyShortcuts();
	const allowed = useShortcutAllowed();

	useHotkey(hotkey || "?", () => setOpen(true), { enabled: hotkey !== false && !open });

	const q = fold(query.trim());
	const shown = sections
		.map((s) => ({
			...s,
			items: q
				? s.items.filter((it) => {
						const hay = fold(`${it.label} ${describeKeys(it.keys)} ${s.title}`);
						return q.split(/\s+/).every((t) => hay.includes(t));
					})
				: s.items,
		}))
		.filter((s) => s.items.length > 0);
	const shownCount = shown.reduce((n, s) => n + s.items.length, 0);

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setQuery("");
			}}
		>
			<DialogContent className={cn("@container flex max-h-[85dvh] max-w-[46rem] flex-col gap-0 p-0", className)}>
				<DialogHeader className="px-4 pt-4 pb-3">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Shortcuts never fire while you are typing in a field. Sequences like <Kbd keys="g" /> <Kbd keys="i" /> mean press G, then I.
					</DialogDescription>
				</DialogHeader>
				<div className="px-4 pb-3">
					<label htmlFor={searchId} className="sr-only">Search shortcuts</label>
					<InputGroup>
						<InputGroupAddon align="inline-start" className="pr-0 pl-2.5 text-tertiary-foreground">
							<MagnifyingGlassIcon aria-hidden="true" className="size-3.5" />
						</InputGroupAddon>
						<InputGroupInput id={searchId} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search shortcuts…" autoComplete="off" />
					</InputGroup>
				</div>
				{/* A short count instead of a live list: re-reading every matching row on each keystroke is noise. */}
				<LiveStatus>
					{q ? (shownCount === 0 ? `No shortcuts match “${query.trim()}”` : `${shownCount} ${shownCount === 1 ? "shortcut" : "shortcuts"}`) : ""}
				</LiveStatus>
				{/* Text only, so it takes a tab stop of its own for keyboard scrolling. */}
				<div
					tabIndex={0}
					role="group"
					aria-label={title}
					className="min-h-0 flex-1 overflow-y-auto border-t border-border px-4 pt-3 pb-4 outline-none focus-ring-inset"
				>
					{shown.length === 0 ? (
						<p className="py-8 text-center text-sm text-tertiary-foreground">No shortcuts match “{query.trim()}”.</p>
					) : (
						<div className="gap-x-8 @xl:columns-2">
							{shown.map((s) => (
								<section key={s.title} className="mb-5 min-w-0 break-inside-avoid last:mb-0">
									<h3 className="mb-1 text-xs font-medium text-tertiary-foreground">{s.title}</h3>
									<ul className="divide-y divide-table-row-divider">
										{s.items.map((it) => {
											const live = it.focusScoped ? [it.keys].flat() : liveKeys(it.keys, allowed);
											const off = live.length === 0;
											return (
												<li
													key={it.label + String(it.keys)}
													data-off={off || undefined}
													className={cn("flex items-center justify-between gap-3 py-1.5 text-sm", off ? "text-tertiary-foreground" : "text-foreground")}
												>
													<span className="min-w-0">{it.label}</span>
													<span className="flex shrink-0 items-center gap-2">
														{off && <span className="text-2xs">Off</span>}
														<KeySeq keys={off ? it.keys : live} className={cn(off && "opacity-50")} />
													</span>
												</li>
											);
										})}
									</ul>
								</section>
							))}
						</div>
					)}
				</div>
				<div className="border-t border-border px-4 py-3">
					<Label>
						<Switch checked={characterKeys} onCheckedChange={setCharacterKeys} aria-describedby={switchDescId} />
						Single-key shortcuts
					</Label>
					<p id={switchDescId} className="mt-1.5 pl-11 text-xs text-muted-foreground">
						Shortcuts made of letters or symbols alone, like <Kbd keys="?" /> or <Kbd keys="g" /> then <Kbd keys="i" />. Turn off if you use speech input or switch control.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}

const isTypingTarget = (t: EventTarget | null) => {
	const el = t as HTMLElement | null;
	return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

/** Cynco's go-to routes for useGoToShortcuts (letter after "g", or a full "c i" sequence). */
export const CYNCO_GOTO_ROUTES: Record<string, string> = {
	d: "/dashboard",
	i: "/dashboard/invoicing",
	q: "/dashboard/quotations",
	c: "/dashboard/customers",
	v: "/dashboard/vendors",
	b: "/dashboard/banking",
	a: "/dashboard/accounting",
	r: "/dashboard/dataroom",
	"c i": "/dashboard/invoicing-new",
	"c q": "/dashboard/quotations-new",
	"c j": "/dashboard/accounting/journal/new",
	"c c": "/dashboard/customers?action=create",
};

/**
 * Two-key sequences, Linear/GitHub style: press G, then I within `timeout` ms to go to Invoices.
 * `map` keys are a single letter (after the "g" leader) or a full sequence ("c i"). Ignored while
 * typing, inside dialogs and menus, with Ctrl/⌘/Alt held, and while the user has single-key
 * shortcuts turned off (useCharacterKeyShortcuts). Returns the pending leader key so a UI can show
 * "G…" while it waits.
 */
export function useGoToShortcuts<T = string>(
	map: Record<string, T>,
	navigate: (target: T, sequence: string) => void,
	opts: { enabled?: boolean; timeout?: number; leader?: string } = {},
): { pending: string | null } {
	const { enabled: enabledOpt = true, timeout = 1200, leader = "g" } = opts;
	// Every sequence here is printable keys only, so the user's single-key switch turns them all off.
	const [characterKeys] = useCharacterKeyShortcuts();
	const enabled = enabledOpt && characterKeys;
	const [pending, setPending] = React.useState<string | null>(null);
	const navRef = React.useRef(navigate);
	navRef.current = navigate;
	const mapRef = React.useRef(map);
	mapRef.current = map;
	const sig = Object.keys(map).join("|");

	React.useEffect(() => {
		if (!enabled) return;
		const seqs = new Map<string, string>();
		for (const k of sig.split("|").filter(Boolean)) {
			const seq = k.trim().includes(" ") ? k.trim().toLowerCase() : `${leader} ${k.trim().toLowerCase()}`;
			seqs.set(seq, k);
		}
		const leaders = new Set([...seqs.keys()].map((s) => s.split(" ")[0]));
		let current: string | null = null;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const reset = () => {
			current = null;
			clearTimeout(timer);
			setPending(null);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
			const t = e.target as HTMLElement | null;
			if (isTypingTarget(t) || t?.closest?.('[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"]')) {
				if (current) reset();
				return;
			}
			const k = e.key.toLowerCase();
			if (current) {
				const seq = `${current} ${k}`;
				const original = seqs.get(seq);
				reset();
				if (original !== undefined) {
					e.preventDefault();
					navRef.current(mapRef.current[original], seq);
				}
				return;
			}
			if (leaders.has(k) && !e.shiftKey) {
				current = k;
				setPending(k);
				clearTimeout(timer);
				timer = setTimeout(reset, timeout);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			clearTimeout(timer);
		};
	}, [sig, enabled, timeout, leader]);

	return { pending: enabled ? pending : null };
}

/* ───────────── Saved views ───────────── */

export type SavedViewFilter = { id: string; field: string; label: string; value: string };
export type SavedView = {
	id: string;
	name: string;
	filters: SavedViewFilter[];
	/** Rows matching the view (or pass `counts`). */
	count?: number;
	/** Shared with the team (true) or personal. */
	shared?: boolean;
	/** Built-in: can't be renamed, overwritten or deleted (still duplicable). */
	locked?: boolean;
};

const filterKey = (f: SavedViewFilter) => `${f.field}\u0000${f.value}`;
const sameFilters = (a: SavedViewFilter[], b: SavedViewFilter[]) => {
	if (a.length !== b.length) return false;
	const s = new Set(a.map(filterKey));
	return b.every((f) => s.has(filterKey(f)));
};

export type SavedViewsBarProps = Omit<React.ComponentProps<"div">, "children" | "defaultValue"> & {
	views?: SavedView[];
	defaultViews?: SavedView[];
	onViewsChange?: (views: SavedView[]) => void;
	activeViewId?: string;
	defaultActiveViewId?: string;
	onActiveViewChange?: (id: string) => void;
	/** Filters applied to the list right now. Uncontrolled default: the active view's filters. */
	filters?: SavedViewFilter[];
	defaultFilters?: SavedViewFilter[];
	onFiltersChange?: (filters: SavedViewFilter[]) => void;
	/** Row counts per view id (overrides `view.count`). */
	counts?: Record<string, number>;
	/** Your "Add filter" control, shown after the chips. */
	addFilter?: React.ReactNode;
	/** Accessible name of the view switcher. Default "Saved views". */
	label?: string;
};

type NameDialogState = { mode: "create" | "rename"; viewId?: string; name: string; shared: boolean } | null;

/**
 * Saved views for any list: a scrolling row of view tabs with counts, the active filters as
 * removable chips, and Save / Save as new / Reset once the filters drift from the view. Rename,
 * duplicate, share and delete live in the active view's menu.
 */
export function SavedViewsBar({
	views: viewsProp,
	defaultViews = [],
	onViewsChange,
	activeViewId: activeProp,
	defaultActiveViewId,
	onActiveViewChange,
	filters: filtersProp,
	defaultFilters,
	onFiltersChange,
	counts,
	addFilter,
	label = "Saved views",
	className,
	...props
}: SavedViewsBarProps) {
	const [views, setViews] = useControlled(viewsProp, defaultViews, onViewsChange);
	const initialActive = defaultActiveViewId ?? (viewsProp ?? defaultViews)[0]?.id ?? "";
	const [activeId, setActiveId] = useControlled(activeProp, initialActive, onActiveViewChange);
	const active = views.find((v) => v.id === activeId) ?? views[0];
	const [filters, setFilters] = useControlled(filtersProp, defaultFilters ?? active?.filters ?? [], onFiltersChange);
	const [dialog, setDialog] = React.useState<NameDialogState>(null);
	/** Where focus lands when the name dialog closes: the view just saved or renamed, else the active view. */
	const returnTo = React.useRef<string | null>(null);
	const activeRef = React.useRef<string | undefined>(undefined);
	const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());
	const focusTab = (id: string | undefined) => id && requestAnimationFrame(() => tabRefs.current.get(id)?.focus());

	const modified = !!active && !sameFilters(filters, active.filters);
	activeRef.current = active?.id;

	const selectView = (v: SavedView) => {
		setActiveId(v.id);
		setFilters(v.filters.map((f) => ({ ...f })));
	};
	const update = (id: string, patch: Partial<SavedView>) => setViews(views.map((v) => (v.id === id ? { ...v, ...patch } : v)));
	const remove = (id: string) => {
		const rest = views.filter((v) => v.id !== id);
		setViews(rest);
		if (id === active?.id && rest[0]) {
			selectView(rest[0]);
			focusTab(rest[0].id);
		}
	};
	const duplicate = (v: SavedView) => {
		const copy: SavedView = { ...v, id: `view-${Date.now().toString(36)}`, name: `${v.name} copy`, locked: false, shared: false, filters: v.filters.map((f) => ({ ...f })) };
		setViews([...views, copy]);
		selectView(copy);
		focusTab(copy.id);
	};
	const [nameError, setNameError] = React.useState(false);
	const nameInput = React.useRef<HTMLInputElement>(null);
	const nameErrorId = React.useId();
	const submitDialog = () => {
		if (!dialog) return;
		const name = dialog.name.trim();
		// Validate on submit (the button stays enabled): mark the field and move focus to it.
		if (!name) {
			setNameError(true);
			nameInput.current?.focus();
			return;
		}
		setNameError(false);
		if (dialog.mode === "rename" && dialog.viewId) {
			update(dialog.viewId, { name, shared: dialog.shared });
			returnTo.current = dialog.viewId;
		} else {
			const v: SavedView = { id: `view-${Date.now().toString(36)}`, name, shared: dialog.shared, filters: filters.map((f) => ({ ...f })) };
			setViews([...views, v]);
			setActiveId(v.id);
			returnTo.current = v.id;
		}
		setDialog(null);
	};

	/** Arrow keys move between views (Home/End to the ends); Enter or Space opens one. */
	const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
		const last = views.length - 1;
		const next = e.key === "ArrowRight" ? Math.min(last, index + 1) : e.key === "ArrowLeft" ? Math.max(0, index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
		if (next < 0) return;
		e.preventDefault();
		const el = tabRefs.current.get(views[next].id);
		el?.focus();
		el?.scrollIntoView({ block: "nearest", inline: "nearest" });
	};
	const [focusIndex, setFocusIndex] = React.useState<number | null>(null);
	const rovingIndex = focusIndex ?? Math.max(0, views.findIndex((v) => v.id === active?.id));

	return (
		<div data-slot="cy-saved-views" className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			<div className="flex min-w-0 items-center gap-2">
				<ScrollRow role="group" aria-label={label} className="relative flex-1 gap-0.5 rounded-lg border border-table-tray-border bg-table-tray p-0.5">
					{views.map((v, i) => {
						const isActive = v.id === active?.id;
						const count = counts?.[v.id] ?? v.count;
						return (
							<div
								key={v.id}
								className={cn(
									"flex shrink-0 items-center rounded-md border border-transparent",
									isActive && "border-table-surface-border bg-table-surface shadow-segment",
								)}
							>
								<button
									ref={(el) => {
										if (el) tabRefs.current.set(v.id, el);
										else tabRefs.current.delete(v.id);
									}}
									type="button"
									aria-pressed={isActive}
									tabIndex={i === rovingIndex ? 0 : -1}
									onFocus={() => setFocusIndex(i)}
									onBlur={() => setFocusIndex(null)}
									onClick={() => selectView(v)}
									onKeyDown={(e) => onTabKeyDown(e, i)}
									className={cn(
										"relative flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-medium whitespace-nowrap text-tertiary-foreground outline-none transition-colors",
										"hover:text-foreground focus-ring-inset",
										isActive && "text-foreground",
									)}
								>
									{v.shared ? (
										<UsersThreeIcon aria-hidden="true" className="size-3.5 shrink-0 text-tertiary-foreground" />
									) : !v.locked ? (
										<LockSimpleIcon aria-hidden="true" className="size-3 shrink-0 text-tertiary-foreground" />
									) : null}
									<span>{v.name}</span>
									<span className="sr-only">{v.shared ? ", shared with team" : !v.locked ? ", personal" : ""}</span>
									{count != null && (
										<span className="rounded bg-muted px-1 text-2xs leading-4 font-normal tabular-nums text-muted-foreground">
											<span className="sr-only">, </span>
											{count}
											<span className="sr-only"> rows</span>
										</span>
									)}
									{isActive && modified && (
										<>
											<span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
											<span className="sr-only">, modified</span>
										</>
									)}
								</button>
								{isActive && (
									<DropdownMenu>
										<DropdownMenuTrigger
											render={<Button variant="skeleton" size="icon" aria-label={`Options for ${v.name} view`} className="mx-0.5 !size-5 justify-center !p-0 text-tertiary-foreground focus-ring" />}
										>
											<DotsThreeIcon weight="bold" className="size-3.5" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="min-w-48">
											<DropdownMenuItem disabled={v.locked} onClick={() => setDialog({ mode: "rename", viewId: v.id, name: v.name, shared: !!v.shared })}>
												<PencilSimpleIcon /> Rename…
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => duplicate(v)}>
												<CopyIcon /> Duplicate
											</DropdownMenuItem>
											<DropdownMenuItem disabled={v.locked} onClick={() => update(v.id, { shared: !v.shared })}>
												{v.shared ? <LockSimpleIcon /> : <UsersThreeIcon />} {v.shared ? "Make personal" : "Share with team"}
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem variant="destructive" disabled={v.locked || views.length < 2} onClick={() => remove(v.id)}>
												<TrashIcon /> Delete view
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						);
					})}
				</ScrollRow>
				<IconButton
					variant="secondary"
					size="icon"
					iconOrientation="center"
					icon={<PlusIcon />}
					aria-label="New view from current filters"
					title="New view from current filters"
					className="!size-7 shrink-0"
					onClick={() => setDialog({ mode: "create", name: "", shared: false })}
				/>
			</div>

			<ActionBar className="min-h-6">
				{filters.length === 0 && <span className="text-xs text-tertiary-foreground">No filters</span>}
				{filters.map((f) => (
					<FilterChip key={f.id} label={f.label} value={f.value} onRemove={() => setFilters(filters.filter((x) => x.id !== f.id))} />
				))}
				{addFilter}
				{filters.length > 1 && (
					<Button variant="skeleton" size="sm" onClick={() => setFilters([])}>
						Clear all
					</Button>
				)}
				{/* Mounted before it has text, so the change is announced reliably. */}
				<LiveStatus>
					{modified ? `View “${active?.name}” has unsaved changes` : ""}
				</LiveStatus>
				{modified && (
					<div className="ml-auto flex flex-wrap items-center gap-1.5" role="group" aria-label="Unsaved view changes">
						<IconButton variant="skeleton" size="sm" icon={<ArrowCounterClockwiseIcon />} onClick={() => active && selectView(active)}>
							Reset
						</IconButton>
						<Button variant="secondary" size="sm" onClick={() => setDialog({ mode: "create", name: "", shared: false })}>
							Save as new
						</Button>
						{!active?.locked && (
							<Button variant="primary" size="sm" onClick={() => active && update(active.id, { filters: filters.map((f) => ({ ...f })) })}>
								Save view
							</Button>
						)}
					</div>
				)}
			</ActionBar>

			<Dialog
				open={!!dialog}
				onOpenChange={(o) => {
					if (o) return;
					setDialog(null);
					setNameError(false);
				}}
			>
				<DialogContent
					finalFocus={() => {
						const id = returnTo.current ?? activeRef.current;
						returnTo.current = null;
						return (id && tabRefs.current.get(id)) || true;
					}}
				>
					<form
						className="flex flex-col gap-3"
						onSubmit={(e) => {
							e.preventDefault();
							submitDialog();
						}}
					>
						<DialogHeader>
							<DialogTitle>{dialog?.mode === "rename" ? "Rename view" : "Save as new view"}</DialogTitle>
							<DialogDescription>
								{dialog?.mode === "rename" ? "Views keep their filters; only the name changes." : `Saves the ${filters.length || "no"} filter${filters.length === 1 ? "" : "s"} applied now.`}
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-1">
							<Input
								ref={nameInput}
								autoFocus
								aria-label="View name"
								aria-invalid={nameError || undefined}
								aria-describedby={nameError ? nameErrorId : undefined}
								variant={nameError ? "destructive" : "default"}
								placeholder="e.g. Overdue over RM 10k"
								value={dialog?.name ?? ""}
								onChange={(e) => {
									const name = e.target.value;
									setDialog((d) => (d ? { ...d, name } : d));
									if (name.trim()) setNameError(false);
								}}
							/>
							{nameError && (
								<FieldError id={nameErrorId} className="text-xs">
									Enter a name for the view.
								</FieldError>
							)}
						</div>
						<label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
							<Checkbox checked={!!dialog?.shared} onCheckedChange={(c) => setDialog((d) => (d ? { ...d, shared: !!c } : d))} />
							Share with team
							<span className="text-xs text-tertiary-foreground">(everyone in the company sees it)</span>
						</label>
						<DialogFooter>
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setDialog(null);
									setNameError(false);
								}}
							>
								Cancel
							</Button>
							<Button type="submit" variant="primary">
								{dialog?.mode === "rename" ? "Rename" : "Save view"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
