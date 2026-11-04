"use client";

import {
	FileTextIcon,
	HandCoinsIcon,
	InvoiceIcon,
	MagnifyingGlassIcon,
	NotebookIcon,
	PackageIcon,
	ReceiptIcon,
	StorefrontIcon,
	TreeStructureIcon,
	UserIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandHint,
	CommandInput,
	CommandItem,
	CommandList,
	cn,
	LiveStatus,
	useControllableState,
	useShortcutAllowed,
} from "../../base";
import { DocStatus, INVOICE_STATUS, Kbd, Money, useHotkey } from "../../lib/shared";
import { KeySeq, liveKeys } from "./key-seq";
import { scoreFields } from "./score";

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

export type CommandPaletteRecordType =
	| "invoice"
	| "quotation"
	| "bill"
	| "credit_note"
	| "customer"
	| "vendor"
	| "journal"
	| "payment"
	| "item"
	| "account";

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

const GROUP_ORDER = ["Recent", "Go to", "Create", "Actions"];

function recordToItem(r: CommandPaletteRecord): CommandPaletteItem {
	const meta = RECORD_META[r.type];
	const statusLabel = r.status ? (INVOICE_STATUS[r.status]?.label ?? r.status) : "";
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
			<span
				aria-hidden="true"
				className="flex size-4 shrink-0 items-center justify-center text-tertiary-foreground [&_svg]:size-4"
			>
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
						{r.amount && (
							<Money amount={r.amount} currency={r.currency} className="hidden text-xs text-muted-foreground @sm:inline" />
						)}
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

export type CommandPaletteProps = Omit<React.ComponentProps<"div">, "onSelect" | "children"> & {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Commands: places to go, things to create, actions. Route in `onSelect` with `item.href` / `item.id`. */
	items: CommandPaletteItem[];
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
	items,
	recent = [],
	recentLimit = 5,
	onSelect,
	hotkey = "mod+k",
	placeholder = "Search or jump to…",
	inline = false,
	className,
	...props
}: CommandPaletteProps) {
	const [open, setOpen] = useControllableState({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange });
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
					? [
							r.number ?? "",
							r.label,
							...(item.keywords ?? []),
							r.amount ?? "",
							r.amount ? Number(r.amount).toLocaleString("en-MY", { minimumFractionDigits: 2 }) : "",
						]
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
			return {
				group,
				best: sorted[0]?.score ?? 0,
				items: (!q && group === "Recent" ? sorted.slice(0, recentLimit) : sorted).map((s) => s.item),
			};
		});
		const rank = (g: string) => GROUP_ORDER.indexOf(g) + 1 || GROUP_ORDER.length + 1;
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
			{/* cmdk names the input from the Command's own label, so an aria-label here would be ignored. */}
			<CommandInput value={query} onValueChange={setQuery} placeholder={actionsOnly ? "Search actions…" : placeholder} />
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
					<CommandHint>
						<Kbd keys={["up"]} />
						<Kbd keys={["down"]} />
						<span className="hidden @sm:inline">Navigate</span>
					</CommandHint>
					<CommandHint>
						<Kbd keys="enter" />
						<span className="hidden @sm:inline">Open</span>
					</CommandHint>
					<CommandHint>
						<Kbd keys={[">"]} />
						<span className={cn(actionsOnly && "font-medium text-foreground")}>
							{actionsOnly ? "Actions only" : "Actions"}
						</span>
					</CommandHint>
				</div>
				<CommandHint className="shrink-0">
					<Kbd keys="esc" />
					<span className="hidden @sm:inline">{inline ? "Clear" : "Close"}</span>
				</CommandHint>
			</CommandFooter>
			{/* cmdk's empty state isn't announced; this stable region reports the result count as you type. */}
			<LiveStatus>
				{q
					? resultCount === 0
						? `No results for “${q}”`
						: `${resultCount} ${resultCount === 1 ? "result" : "results"}`
					: ""}
			</LiveStatus>
		</>
	);

	if (inline) {
		return (
			<div
				data-slot="cy-command-palette"
				className={cn(
					"@container min-w-0 overflow-hidden rounded-xl border border-border bg-interactive-secondary",
					className,
				)}
				{...props}
			>
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
			{...props}
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
export function CommandPaletteTrigger({
	label = "Search or jump to…",
	shortcut = "mod+k",
	className,
	...props
}: CommandPaletteTriggerProps) {
	const allowed = useShortcutAllowed();
	const showKeys = !!shortcut && allowed(shortcut);
	return (
		<button
			type="button"
			data-slot="cy-command-palette-trigger"
			aria-haspopup="dialog"
			aria-keyshortcuts={shortcut === "mod+k" ? "Meta+K Control+K" : undefined}
			className={cn(
				"flex h-7 w-full max-w-xs min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input bg-interactive-secondary px-2 text-sm text-tertiary-foreground shadow-btn-secondary transition-colors",
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
