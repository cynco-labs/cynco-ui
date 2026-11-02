/**
 * Cynco UI — fast data entry (group "Cynco · Productivity").
 *
 * New productivity primitives for the screens accountants type into all day: journal entries,
 * bills, expense claims and bank-line descriptions. Not ports of existing screens — built so they
 * can drop into Cynco's production code: keyboard first, controlled or uncontrolled, sized by their
 * CONTAINER (`@container` + `@xl:`), tokens only.
 *
 * - AmountInput     the money field: plain figures, accounting brackets, 1.2k, and formulas.
 * - JournalGrid     spreadsheet-fast journal line editor with a sticky Dr/Cr balance footer.
 * - InlineEditCell  click / Enter / F2 to edit a table cell in place, with async save states.
 *
 * Money in every API is a decimal string ("1234.50"), never a float; maths goes through `./money`.
 */
import * as React from "react";
import { Button, IconButton, Input, InputGroup, InputGroupAddon, InputGroupInput, StatusChip, cn, LiveStatus } from "../base";
import { CaretUpDownIcon, CheckIcon, CircleNotchIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Kbd, ToneDot, formatCurrency, fromSen, isDecimalString, parseAmount, sumAmounts, surfaces, toSen, type StatusToneName } from "../lib/shared";

/* ------------------------------------------------------------------ helpers */

const isMacPlatform = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
/** ⌘ on Mac, Ctrl elsewhere — matches `Kbd keys="mod"`. */
const isMod = (e: React.KeyboardEvent) => (isMacPlatform() ? e.metaKey : e.ctrlKey);
const noMods = (e: React.KeyboardEvent) => !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;

const plainFmt = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "1234.5" → "1,234.50" exactly (Intl formats the decimal string without a float round-trip). "" → "". */
function formatPlain(v: string) {
	if (!isDecimalString(v)) return v;
	return plainFmt.format(v);
}
/** Accounting display: negatives bracketed, "(500.00)". */
function formatAccounting(v: string) {
	return v.startsWith("-") ? `(${formatPlain(v.slice(1))})` : formatPlain(v);
}
/** The currency's symbol as Cynco prints it: MYR → "RM", USD → "$". */
function currencySymbol(currency: string) {
	return formatCurrency("0", currency).replace(/[\d.,\s -]/g, "") || currency;
}
const sameAmount = (a: string, b: string) => (a === "" || b === "" ? a === b : toSen(a) === toSen(b));
const money = (v: string, currency?: string) => (currency ? formatCurrency(v || "0", currency) : formatPlain(v || "0.00"));

/** Cynco UI's destructive input styling, kept visible after blur (the form CSS only colours hover/focus). */
const INVALID_INPUT = "!border-destructive";
const INVALID_GROUP = "!border-destructive focus-within:!shadow-[var(--input-shadow-destructive)]";

/* ============================================================== AmountInput */

export type AmountInputProps = Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type" | "ref"> & {
	/** Controlled value: a decimal string ("1296.00") or "" for empty. */
	value?: string;
	/** Uncontrolled initial value. */
	defaultValue?: string;
	/** Fires with the evaluated decimal string when the figure is committed (blur or Enter) and changed. */
	onValueChange?: (value: string) => void;
	/** ISO code (e.g. "MYR"): shows the symbol as a prefix and in the live result hint. */
	currency?: string;
	/** Accept negatives ("-500", "(500)"). Default false. */
	allowNegative?: boolean;
	/** Force the error styling (e.g. server-side validation). */
	invalid?: boolean;
	/** Message shown with `invalid`. */
	errorMessage?: React.ReactNode;
	/** Where the hint/error appear: in flow under the field (forms) or floating over the next row (grids). */
	messages?: "below" | "overlay";
	/**
	 * Typing `=` alone then Enter calls this; return a decimal string to commit it (e.g. the figure that
	 * balances a journal), or nothing if you've handled it yourself.
	 */
	onAutoFill?: () => string | void;
	/** Called when a commit is refused because the text isn't a valid amount. */
	onParseError?: (message: string, text: string) => void;
	/** Classes for the <input> itself (`className` goes on the root). */
	inputClassName?: string;
};

/**
 * The money field accountants type into. Focused: the raw text you typed. Blurred / Enter: the
 * evaluated figure, formatted and right-aligned. Formulas show their live result as a hint; an
 * invalid entry keeps its text, shows the error and is not committed. Esc reverts.
 */
export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
	{
		value,
		defaultValue,
		onValueChange,
		currency,
		allowNegative = false,
		invalid,
		errorMessage,
		messages = "below",
		onAutoFill,
		onParseError,
		placeholder = "0.00",
		className,
		inputClassName,
		disabled,
		onFocus,
		onBlur,
		onKeyDown,
		"aria-describedby": describedBy,
		...props
	},
	forwardedRef,
) {
	const [inner, setInner] = React.useState(defaultValue ?? "");
	const committed = value !== undefined ? value : inner;
	const [focused, setFocused] = React.useState(false);
	/** Non-null while the text differs from the committed figure (typing, or invalid after blur). */
	const [draft, setDraft] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const selectAll = React.useRef(false);
	const msgId = React.useId();

	React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

	// The figure changed from outside (controlled update, auto-balance): drop any stale draft.
	const prevCommitted = React.useRef(committed);
	React.useEffect(() => {
		if (prevCommitted.current !== committed) {
			prevCommitted.current = committed;
			setDraft(null);
			setError(null);
		}
	}, [committed]);

	// Select the whole figure on focus, after the formatted text has been swapped for the raw one.
	// (Also after Esc reverts.) Runs every render; the flag makes it a one-shot.
	React.useLayoutEffect(() => {
		if (focused && selectAll.current) {
			selectAll.current = false;
			inputRef.current?.select();
		}
	});

	const set = (v: string) => {
		if (value === undefined) setInner(v);
		prevCommitted.current = v;
		onValueChange?.(v);
	};
	const fail = (msg: string, text: string) => {
		setError(msg);
		onParseError?.(msg, text);
		return false;
	};

	/** Evaluate the draft. Returns false (and keeps the text) when it can't be committed. */
	const commit = (): boolean => {
		if (draft == null) return true;
		if (draft.trim() === "=" && onAutoFill) {
			setDraft(null);
			setError(null);
			const v = onAutoFill();
			if (typeof v === "string" && !sameAmount(v, committed)) set(v);
			return true;
		}
		const p = parseAmount(draft);
		if (!p.ok) return fail(p.error === "Incomplete" ? "Incomplete formula" : p.error, draft);
		if (!allowNegative && p.value.startsWith("-")) return fail("Negative amounts aren’t allowed here", draft);
		setDraft(null);
		setError(null);
		if (!sameAmount(p.value, committed)) set(p.value);
		return true;
	};

	const text = draft ?? (focused ? committed : formatAccounting(committed));
	const live = focused && draft != null ? parseAmount(draft) : null;
	const hint: React.ReactNode =
		focused && draft?.trim() === "=" && onAutoFill ? (
			<>
				<span aria-hidden="true">↵</span>
				<span className="sr-only">Enter</span> fills the balancing figure
			</>
		) : live && live.ok && live.isExpression && live.value !== "" ? (
			`= ${money(live.value, currency ?? "MYR")}`
		) : null;
	const isInvalid = !!invalid || !!error;
	const message = error ?? (invalid ? errorMessage : null);
	const negative = !focused && draft == null && committed.startsWith("-");
	const negId = React.useId();

	const inputProps = {
		...props,
		ref: inputRef,
		type: "text",
		inputMode: "decimal" as const,
		autoComplete: "off",
		spellCheck: false,
		enterKeyHint: "done" as const,
		placeholder,
		disabled,
		value: text,
		"aria-invalid": isInvalid || undefined,
		// A bracketed figure "(500.00)" is often read without its brackets: describe it as negative.
		"aria-describedby": cn(describedBy, negative && negId, (message || hint) && msgId) || undefined,
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
			setDraft(e.target.value);
			if (error) setError(null);
		},
		onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
			selectAll.current = true;
			setFocused(true);
			onFocus?.(e);
		},
		onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
			setFocused(false);
			commit();
			onBlur?.(e);
		},
		onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && !isMod(e) && !e.altKey && !e.nativeEvent.isComposing) {
				if (!commit()) {
					// Stay put so the figure can be fixed; don't let a grid move on.
					e.preventDefault();
					e.stopPropagation();
					return;
				}
			} else if (e.key === "Escape" && (draft != null || error)) {
				e.preventDefault();
				e.stopPropagation();
				setDraft(null);
				setError(null);
				selectAll.current = true;
				return;
			}
			onKeyDown?.(e);
		},
		className: cn("text-right tabular-nums", negative && "!text-error-text", inputClassName),
	};

	const overlay = messages === "overlay";
	return (
		<div data-slot="cy-amount-input" className={cn("relative min-w-0", className)}>
			{currency ? (
				<InputGroup data-disabled={disabled || undefined} className={cn(isInvalid && INVALID_GROUP)}>
					<InputGroupAddon align="inline-start" className="pr-0 pl-2.5 text-xs text-tertiary-foreground">
						{currencySymbol(currency)}
					</InputGroupAddon>
					<InputGroupInput {...inputProps} />
				</InputGroup>
			) : (
				<Input variant={isInvalid ? "destructive" : "default"} {...inputProps} className={cn(inputProps.className, isInvalid && INVALID_INPUT)} />
			)}
			{negative && (
				<span id={negId} className="sr-only">
					Negative amount
				</span>
			)}
			<div
				id={msgId}
				aria-live="polite"
				className={cn(
					"text-2xs tabular-nums",
					overlay
						? "pointer-events-none absolute inset-x-0 top-full z-20 mt-1 rounded-md border border-overlay-border bg-overlay px-1.5 py-0.5 text-right shadow-overlay"
						: "mt-1",
					overlay && !(focused && (message || hint)) && "sr-only",
					!overlay && !message && !hint && "sr-only",
					message ? surfaces.negative : "text-tertiary-foreground",
				)}
			>
				{message ?? hint}
			</div>
		</div>
	);
});

/* ============================================================== JournalGrid */

export type JournalGridAccount = { id: string; code: string; name: string; type: string };
export type JournalGridLine = { id: string; accountId?: string; description?: string; debit?: string; credit?: string };

type Col = "account" | "description" | "debit" | "credit";
const COLS: Col[] = ["account", "description", "debit", "credit"];

const TYPE_TONE: Record<string, StatusToneName> = { asset: "blue", liability: "amber", equity: "purple", revenue: "green", income: "green", expense: "red" };
const toneOf = (type: string) => TYPE_TONE[type.replace(/^contra_/, "")] ?? (type.includes("expense") || type.includes("cost") ? "red" : "neutral");

/** Matches on code (with or without the dash) first, then name and type. */
function filterAccounts(accounts: JournalGridAccount[], query: string) {
	const q = query.trim().toLowerCase();
	if (!q) return accounts;
	const qc = q.replace(/-/g, "");
	const byCode = accounts.filter((a) => a.code.toLowerCase().replace(/-/g, "").startsWith(qc));
	const rest = accounts.filter((a) => !byCode.includes(a) && `${a.name} ${a.type} ${a.code}`.toLowerCase().includes(q));
	return [...byCode, ...rest];
}

type AccountComboboxProps = {
	accounts: JournalGridAccount[];
	valueId?: string;
	onSelect: (a: JournalGridAccount) => void;
	inputProps: React.ComponentProps<"input"> & Record<`data-${string}`, string>;
};

/**
 * A searchable account cell: type a code or name and the list filters; ↑ ↓ choose, Enter or Tab
 * takes the highlighted account, Esc closes. With the list closed, arrows and Enter belong to the grid.
 */
function AccountCombobox({ accounts, valueId, onSelect, inputProps }: AccountComboboxProps) {
	const selected = accounts.find((a) => a.id === valueId);
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState<string | null>(null);
	const [hl, setHl] = React.useState(0);
	const [focused, setFocused] = React.useState(false);
	const listRef = React.useRef<HTMLUListElement>(null);
	const wrapRef = React.useRef<HTMLDivElement>(null);
	const listId = React.useId();
	const results = React.useMemo(() => filterAccounts(accounts, query ?? "").slice(0, 60), [accounts, query]);
	const label = selected ? `${selected.code} · ${selected.name}` : "";

	React.useEffect(() => {
		if (!open) return;
		listRef.current?.querySelector<HTMLElement>(`[data-index="${hl}"]`)?.scrollIntoView({ block: "nearest" });
	}, [hl, open]);

	const close = () => {
		setOpen(false);
		setQuery(null);
	};
	const choose = (a: JournalGridAccount | undefined) => {
		if (a) onSelect(a);
		close();
		// Keep focus in the cell with the new label selected, so typing searches again.
		requestAnimationFrame(() => {
			const el = wrapRef.current?.querySelector("input");
			if (el && document.activeElement === el) el.select();
		});
	};
	const openList = () => {
		setOpen(true);
		setHl(Math.max(0, results.findIndex((a) => a.id === valueId)));
	};

	return (
		<div ref={wrapRef} className="relative min-w-0">
			<Input
				{...inputProps}
				role="combobox"
				aria-expanded={open}
				aria-controls={listId}
				aria-autocomplete="list"
				aria-activedescendant={open && results[hl] ? `${listId}-${hl}` : undefined}
				autoComplete="off"
				spellCheck={false}
				placeholder="Code or name…"
				title={label || undefined}
				value={query ?? label}
				className={cn("pr-7", !focused && selected && "!text-transparent")}
				onFocus={(e) => {
					setFocused(true);
					e.currentTarget.select();
				}}
				onBlur={() => {
					setFocused(false);
					close();
				}}
				onClick={() => !open && openList()}
				onChange={(e) => {
					setQuery(e.target.value);
					setOpen(true);
					setHl(0);
				}}
				onKeyDown={(e) => {
					const consume = () => {
						e.preventDefault();
						e.stopPropagation();
					};
					if ((e.key === "ArrowDown" && e.altKey) || e.key === "F4") {
						consume();
						if (open) close();
						else openList();
					} else if (open && e.key === "ArrowDown") {
						consume();
						setHl((i) => Math.min(results.length - 1, i + 1));
					} else if (open && e.key === "ArrowUp") {
						consume();
						setHl((i) => Math.max(0, i - 1));
					} else if (open && e.key === "Enter" && !isMod(e)) {
						consume();
						choose(results[hl]);
					} else if (open && e.key === "Escape") {
						consume();
						close();
					} else if (open && e.key === "Tab" && query) {
						choose(results[hl]); // then let the grid move on
					}
				}}
			/>
			{/* Styled read-out (mono code + name) over the input when it isn't being edited. */}
			{!focused && selected && (
				<span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 right-7 flex min-w-0 items-center gap-1.5 pl-2">
					<span className="shrink-0 text-tiny-id text-tertiary-foreground">{selected.code}</span>
					<span className="min-w-0 truncate text-sm text-foreground">{selected.name}</span>
				</span>
			)}
			<CaretUpDownIcon aria-hidden="true" size={12} className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-tertiary-foreground" />
			{open && (
				<ul
					ref={listRef}
					id={listId}
					role="listbox"
					aria-label="Accounts"
					className="absolute top-full left-0 z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-overlay-border bg-overlay p-1 shadow-overlay @xl:w-[max(100%,18rem)]"
				>
					{/* Not an option: hidden from the listbox and announced by the status region below. */}
					{results.length === 0 && <li role="presentation" aria-hidden="true" className="px-2 py-3 text-center text-xs text-tertiary-foreground">No account matches “{query}”</li>}
					{results.map((a, i) => (
						<li
							key={a.id}
							id={`${listId}-${i}`}
							data-index={i}
							role="option"
							aria-selected={i === hl}
							onMouseDown={(e) => e.preventDefault()}
							onMouseMove={() => setHl(i)}
							onClick={() => choose(a)}
							className={cn("flex min-h-[30px] cursor-default items-center gap-2 rounded-lg px-2 py-1 text-sm text-muted-foreground", i === hl && "bg-overlay-hover text-foreground")}
						>
							<ToneDot tone={toneOf(a.type)} />
							<span className="w-16 shrink-0 text-tiny-id text-tertiary-foreground">{a.code}</span>
							<span className="min-w-0 flex-1 truncate">{a.name}</span>
							{a.id === valueId && <CheckIcon aria-hidden="true" size={12} className="shrink-0 text-tertiary-foreground" />}
						</li>
					))}
				</ul>
			)}
			{/* Always mounted so the "no match" message is announced when the list empties. */}
			<LiveStatus>
				{open && results.length === 0 ? `No account matches “${query ?? ""}”` : ""}
			</LiveStatus>
		</div>
	);
}

let lineSeq = 0;
const newLine = (): JournalGridLine => ({ id: `jl-${Date.now().toString(36)}-${++lineSeq}`, accountId: undefined, description: "", debit: "", credit: "" });
/** Zero is stored as "" so an empty cell and 0.00 mean the same thing. */
const normAmount = (v: string) => (v === "" || toSen(v) === 0n ? "" : v);

/** Controlled + uncontrolled lines with a ref that always holds the latest list, so several edits in one keystroke compose. */
function useLines(lines: JournalGridLine[] | undefined, defaultLines: JournalGridLine[] | undefined, onLinesChange?: (l: JournalGridLine[]) => void) {
	const [inner, setInner] = React.useState<JournalGridLine[]>(() => defaultLines ?? [newLine(), newLine()]);
	const current = lines ?? inner;
	const ref = React.useRef(current);
	ref.current = current;
	const cb = React.useRef(onLinesChange);
	cb.current = onLinesChange;
	const controlled = lines !== undefined;
	const update = React.useCallback(
		(fn: (prev: JournalGridLine[]) => JournalGridLine[]) => {
			const next = fn(ref.current);
			ref.current = next;
			if (!controlled) setInner(next);
			cb.current?.(next);
		},
		[controlled],
	);
	return [current, update, ref] as const;
}

/** Desktop column template; under @xl each line becomes a card. */
const GRID_COLS = "@xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(6.5rem,7.5rem)_minmax(6.5rem,7.5rem)_1.5rem] @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(7rem,9rem)_minmax(7rem,9rem)_1.75rem]";

export type JournalGridProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
	/** Controlled lines. */
	lines?: JournalGridLine[];
	/** Uncontrolled initial lines (default: two blank lines). */
	defaultLines?: JournalGridLine[];
	onLinesChange?: (lines: JournalGridLine[]) => void;
	/** The chart of accounts for the Account picker. */
	accounts: JournalGridAccount[];
	currency?: string;
	/** Fewest lines kept; deleting below this clears the line instead. Default 2 (double entry). */
	minLines?: number;
	/** Show the keyboard legend under the footer. Default true. */
	showShortcuts?: boolean;
};

/**
 * Keyboard-first journal entry. Tab walks Account → Description → Debit → Credit and wraps to the next
 * line; Enter moves down (adding a line at the end); ↑ ↓ move between lines; mod+Enter adds, mod+⌫
 * deletes; Alt+B or `=` then Enter fills the balancing figure. A sticky footer keeps Dr, Cr and the
 * difference in view. Wide containers get a grid; narrow ones a card per line.
 */
export function JournalGrid({
	lines: linesProp,
	defaultLines,
	onLinesChange,
	accounts,
	currency = "MYR",
	minLines = 2,
	showShortcuts = true,
	className,
	onKeyDown,
	...props
}: JournalGridProps) {
	const [lines, setLines, linesRef] = useLines(linesProp, defaultLines, onLinesChange);
	const rootRef = React.useRef<HTMLDivElement>(null);
	const pendingFocus = React.useRef<{ id: string; col: Col } | null>(null);
	const [announcement, setAnnouncement] = React.useState("");
	const say = (s: string) => setAnnouncement((prev) => (prev === s ? `${s} ` : s));

	const cellEl = (id: string, col: Col) =>
		rootRef.current?.querySelector<HTMLElement>(`[data-jg-line="${CSS.escape(id)}"][data-jg-col="${col}"]`) ?? null;
	const focusCell = (id: string, col: Col) => {
		const el = cellEl(id, col);
		if (el) el.focus();
		else pendingFocus.current = { id, col };
	};
	React.useLayoutEffect(() => {
		const p = pendingFocus.current;
		if (!p) return;
		const el = cellEl(p.id, p.col);
		if (el) {
			pendingFocus.current = null;
			el.focus();
		}
	});

	const patch = (id: string, changes: Partial<JournalGridLine>) => setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));

	/** Commit a figure typed into Dr or Cr: clears the other side; a negative flips to the other side. */
	const setAmount = (id: string, side: "debit" | "credit", raw: string) => {
		const other = side === "debit" ? "credit" : "debit";
		let v = normAmount(raw);
		let target: "debit" | "credit" = side;
		if (v.startsWith("-")) {
			v = v.slice(1);
			target = other;
			say(`Negative figure moved to ${other}`);
		}
		const otherOfTarget = target === "debit" ? "credit" : "debit";
		patch(id, v ? { [target]: v, [otherOfTarget]: "" } : { [side]: "" });
	};

	const addLine = (afterIndex: number, focusCol: Col = "account") => {
		const l = newLine();
		setLines((prev) => [...prev.slice(0, afterIndex + 1), l, ...prev.slice(afterIndex + 1)]);
		pendingFocus.current = { id: l.id, col: focusCol };
		say(`Line ${afterIndex + 2} added`);
	};

	const removeLine = (index: number, col: Col = "account") => {
		const cur = linesRef.current;
		if (cur.length <= minLines) {
			const id = cur[index]!.id;
			setLines((prev) => prev.map((l) => (l.id === id ? { id, accountId: undefined, description: "", debit: "", credit: "" } : l)));
			say(`Line ${index + 1} cleared — an entry needs at least ${minLines} lines`);
			focusCell(id, col);
			return;
		}
		const next = cur[index + 1] ?? cur[index - 1];
		setLines((prev) => prev.filter((_, i) => i !== index));
		say(`Line ${index + 1} deleted`);
		if (next) pendingFocus.current = { id: next.id, col };
	};

	/** The figure (and side) that balances the entry, ignoring line `index`. */
	const balancing = (index: number) => {
		const others = linesRef.current.filter((_, i) => i !== index);
		const diff = toSen(sumAmounts(others.map((l) => l.debit))) - toSen(sumAmounts(others.map((l) => l.credit)));
		if (diff === 0n) return null;
		return { side: (diff > 0n ? "credit" : "debit") as "debit" | "credit", amount: fromSen(diff > 0n ? diff : -diff) };
	};
	/** `viaInput`: called from an AmountInput's "=" Enter, which commits the returned figure itself. */
	const fillBalance = (index: number, fromCol?: Col, viaInput = false): string | void => {
		const line = linesRef.current[index];
		if (!line) return;
		const b = balancing(index);
		if (!b) {
			say("The other lines already balance");
			return;
		}
		say(`Filled ${formatCurrency(b.amount, currency)} ${b.side} to balance`);
		if (viaInput && fromCol === b.side) return b.amount; // the AmountInput commits it (and clears the other side)
		patch(line.id, b.side === "debit" ? { debit: b.amount, credit: "" } : { credit: b.amount, debit: "" });
		focusCell(line.id, b.side);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-jg-col]");
		if (!cell) return;
		const cur = linesRef.current;
		const row = cur.findIndex((l) => l.id === cell.dataset.jgLine);
		const ci = COLS.indexOf(cell.dataset.jgCol as Col);
		if (row < 0 || ci < 0) return;
		const col = COLS[ci]!;
		const at = (r: number, c: number) => {
			e.preventDefault();
			focusCell(cur[r]!.id, COLS[c]!);
		};

		if (e.key === "Tab" && !isMod(e) && !e.altKey) {
			const flat = row * COLS.length + ci + (e.shiftKey ? -1 : 1);
			// Past the first/last cell, let Tab leave the grid (no keyboard trap).
			if (flat >= 0 && flat < cur.length * COLS.length) at(Math.floor(flat / COLS.length), flat % COLS.length);
		} else if (e.key === "Enter" && isMod(e)) {
			e.preventDefault();
			addLine(row);
		} else if (e.key === "Enter" && noMods(e)) {
			if (row < cur.length - 1) at(row + 1, ci);
			else {
				e.preventDefault();
				addLine(row);
			}
		} else if (e.key === "Enter" && e.shiftKey && !isMod(e) && !e.altKey) {
			if (row > 0) at(row - 1, ci);
		} else if (e.key === "ArrowDown" && noMods(e)) {
			if (row < cur.length - 1) at(row + 1, ci);
		} else if (e.key === "ArrowUp" && noMods(e)) {
			if (row > 0) at(row - 1, ci);
		} else if (e.key === "Backspace" && isMod(e)) {
			e.preventDefault();
			removeLine(row, col);
		} else if (e.altKey && !isMod(e) && e.code === "KeyB") {
			// e.code: on a Mac, Alt+B types "∫".
			e.preventDefault();
			fillBalance(row, col);
		}
	};

	const totalDr = sumAmounts(lines.map((l) => l.debit));
	const totalCr = sumAmounts(lines.map((l) => l.credit));
	const diffSen = toSen(totalDr) - toSen(totalCr);
	const diff = fromSen(diffSen < 0n ? -diffSen : diffSen);
	const hasAmounts = toSen(totalDr) !== 0n || toSen(totalCr) !== 0n;
	const balanced = hasAmounts && diffSen === 0n;
	const missingAccounts = lines.filter((l) => !l.accountId && (l.debit || l.credit)).length;

	return (
		<div data-slot="cy-journal-grid" ref={rootRef} className={cn("@container flex min-w-0 flex-col", className)} onKeyDown={handleKeyDown} {...props}>
			{showShortcuts && <JournalGridLegend />}
			{/* scroll-mb: a cell focused by Tab or Enter must not scroll in under the sticky balance footer. */}
			<div role="group" aria-label="Journal lines" className="flex flex-col gap-2 @xl:gap-0 @xl:rounded-lg @xl:border @xl:border-table-surface-border @xl:bg-table-surface [&_[data-jg-col]]:scroll-mb-28">
				<div aria-hidden="true" className={cn("hidden gap-2 border-b border-table-row-divider px-2 py-1.5 text-xs font-medium text-tertiary-foreground @xl:grid", GRID_COLS)}>
					<span>Account</span>
					<span>Description</span>
					<span className="text-right">Debit</span>
					<span className="text-right">Credit</span>
					<span />
				</div>
				{lines.map((line, i) => {
					const n = i + 1;
					const id = (c: Col) => `${line.id}-${c}`;
					const cell = (c: Col) => ({ id: id(c), "data-jg-line": line.id, "data-jg-col": c });
					const del = (
						<IconButton
							variant="skeleton"
							size="icon"
							tabIndex={-1}
							aria-label={lines.length <= minLines ? `Clear line ${n}` : `Delete line ${n}`}
							title={`${lines.length <= minLines ? "Clear" : "Delete"} line (${isMacPlatform() ? "⌘" : "Ctrl"}+Backspace)`}
							icon={<TrashIcon />}
							onClick={() => removeLine(i)}
						/>
					);
					const fieldLabel = "text-2xs text-tertiary-foreground @xl:sr-only";
					return (
						<div
							key={line.id}
							role="group"
							aria-label={`Line ${n}`}
							className={cn(
								"grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-lg border border-border bg-card p-2.5 focus-within:border-focus-ring",
								"@xl:items-center @xl:gap-y-0 @xl:rounded-none @xl:border-0 @xl:border-b @xl:border-table-row-divider @xl:bg-transparent @xl:px-2 @xl:py-1 @xl:last:border-b-0 @xl:focus-within:bg-table-row-hover",
								GRID_COLS,
							)}
						>
							<div className="col-span-2 flex items-center justify-between @xl:hidden">
								<span className="text-xs font-medium text-muted-foreground">Line {n}</span>
								{del}
							</div>
							<div className="col-span-2 flex min-w-0 flex-col gap-1 @xl:col-span-1">
								<label htmlFor={id("account")} className={fieldLabel}>Account</label>
								<AccountCombobox
									accounts={accounts}
									valueId={line.accountId}
									onSelect={(a) => patch(line.id, { accountId: a.id })}
									inputProps={{ ...cell("account"), "aria-label": `Line ${n} account` }}
								/>
							</div>
							<div className="col-span-2 flex min-w-0 flex-col gap-1 @xl:col-span-1">
								<label htmlFor={id("description")} className={fieldLabel}>Description</label>
								<Input
									{...cell("description")}
									aria-label={`Line ${n} description`}
									placeholder="Line description…"
									autoComplete="off"
									value={line.description ?? ""}
									onFocus={(e) => e.currentTarget.select()}
									onChange={(e) => patch(line.id, { description: e.target.value })}
								/>
							</div>
							{(["debit", "credit"] as const).map((side) => (
								<div key={side} className="flex min-w-24 flex-col gap-1">
									<label htmlFor={id(side)} className={fieldLabel}>{side === "debit" ? "Debit" : "Credit"}</label>
									<AmountInput
										{...cell(side)}
										aria-label={`Line ${n} ${side}`}
										value={line[side] ?? ""}
										allowNegative
										messages="overlay"
										placeholder=""
										onValueChange={(v) => setAmount(line.id, side, v)}
										onAutoFill={() => fillBalance(i, side, true)}
									/>
								</div>
							))}
							<div className="hidden justify-center @xl:flex">{del}</div>
						</div>
					);
				})}
			</div>

			<Button variant="dotted" className="mt-2 w-full text-tertiary-foreground" onClick={() => addLine(lines.length - 1)}>
				<PlusIcon size={14} aria-hidden="true" />
				Add line
			</Button>

			{/* Sticky balance footer: stays in view while the lines scroll. */}
			<div className={cn("sticky bottom-0 z-10 mt-2", surfaces.card, "shadow-[0_-6px_12px_-10px_var(--border)]")}>
				<div className={cn("grid grid-cols-2 items-center gap-x-3 gap-y-2 px-3 py-2.5 @xl:gap-x-2 @xl:px-2", GRID_COLS)}>
					<div className="col-span-2 flex min-w-0 flex-wrap items-center gap-2 @xl:col-span-2" aria-live="polite">
						{!hasAmounts ? (
							<StatusChip tone="neutral" glyph="dashed" dashed>No amounts yet</StatusChip>
						) : balanced ? (
							<StatusChip tone="green" glyph="check">Balanced</StatusChip>
						) : (
							<StatusChip tone="red" glyph="alert">
								<span className="tabular-nums">Out by {formatCurrency(diff, currency)}</span>
							</StatusChip>
						)}
						{hasAmounts && !balanced && (
							<span className="hidden text-xs text-tertiary-foreground @md:inline">
								{diffSen > 0n ? "Credits short" : "Debits short"} · <Kbd keys="alt+b" className="align-middle" /> on a line to fill it
							</span>
						)}
						{missingAccounts > 0 && (
							<span className={cn("text-xs", surfaces.negative)}>
								{missingAccounts} {missingAccounts === 1 ? "line needs" : "lines need"} an account
							</span>
						)}
					</div>
					{(
						[
							["Total Dr", totalDr],
							["Total Cr", totalCr],
						] as const
					).map(([lbl, v]) => (
						<div key={lbl} className="flex min-w-0 flex-col @xl:items-end @xl:pr-2">
							<span className="text-2xs text-tertiary-foreground">{lbl}</span>
							<span className="text-sm font-semibold whitespace-nowrap tabular-nums text-foreground">{formatCurrency(v, currency)}</span>
						</div>
					))}
					<span className="hidden @xl:block" />
				</div>
			</div>

			<div aria-live="polite" className="sr-only">{announcement}</div>
		</div>
	);
}

const LEGEND: Array<[string | string[], string]> = [
	["Tab", "next cell"],
	[["Enter"], "down / new line"],
	[["Up", "Down"], "line"],
	["mod+Enter", "add line"],
	[["mod", "⌫"], "delete line"],
	["alt+b", "balance"],
	[["=", "Enter"], "balance cell"],
	["Esc", "revert"],
];

function JournalGridLegend() {
	return (
		<ul aria-label="Keyboard shortcuts" className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-0.5 text-2xs text-tertiary-foreground">
			{LEGEND.map(([k, label]) => (
				<li key={label} className="flex items-center gap-1">
					<Kbd keys={k} />
					<span>{label}</span>
				</li>
			))}
		</ul>
	);
}

/* =========================================================== InlineEditCell */

export type InlineEditCellProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
	/** The saved value (text, or a decimal string for `kind="amount"`). */
	value: string;
	/** Persist the new value. Return a promise to show a spinner; reject to revert and show its message. */
	onSave: (value: string) => void | Promise<void>;
	kind?: "text" | "amount";
	/** For amounts: formats the read-out ("RM 1,296.00"). */
	currency?: string;
	placeholder?: string;
	/** For amounts: accept negatives. Default true. */
	allowNegative?: boolean;
	disabled?: boolean;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";
const errorText = (err: unknown) => (err instanceof Error ? err.message : typeof err === "string" ? err : "Couldn’t save — try again");

/**
 * Edit a table cell in place: click, Enter or F2 to edit; Enter or Tab saves; Esc cancels. While an
 * async save is pending the new value shows with a spinner; a rejection reverts it and shows why.
 */
export function InlineEditCell({
	value,
	onSave,
	kind = "text",
	currency,
	placeholder,
	allowNegative = true,
	disabled,
	className,
	"aria-label": ariaLabel = "Value",
	...props
}: InlineEditCellProps) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState(value);
	const [pending, setPending] = React.useState<string | null>(null);
	const [status, setStatus] = React.useState<SaveStatus>("idle");
	const [error, setError] = React.useState<string | null>(null);
	const editingRef = React.useRef(false);
	const refocus = React.useRef(false);
	const amountRef = React.useRef(value);
	const amountInvalid = React.useRef(false);
	const buttonRef = React.useRef<HTMLButtonElement>(null);
	const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
	const alive = React.useRef(true);
	const msgId = React.useId();
	React.useEffect(
		() => () => {
			alive.current = false;
			clearTimeout(timer.current);
		},
		[],
	);
	React.useLayoutEffect(() => {
		if (!editing && refocus.current) {
			refocus.current = false;
			buttonRef.current?.focus();
		}
	}, [editing]);

	const shown = pending ?? value;
	const isAmount = kind === "amount";

	const start = () => {
		if (disabled || status === "saving") return;
		clearTimeout(timer.current);
		setError(null);
		setStatus("idle");
		setDraft(shown);
		amountRef.current = shown;
		amountInvalid.current = false;
		editingRef.current = true;
		setEditing(true);
	};
	const cancel = () => {
		editingRef.current = false;
		refocus.current = true;
		setEditing(false);
	};
	const flashSaved = () => {
		setStatus("saved");
		timer.current = setTimeout(() => alive.current && setStatus("idle"), 1600);
	};
	const finish = (next: string, focusBack: boolean) => {
		if (!editingRef.current) return;
		editingRef.current = false;
		refocus.current = focusBack;
		setEditing(false);
		const v = isAmount ? next : next.trim();
		if (isAmount ? sameAmount(v, value) : v === value) return;
		let result: void | Promise<void>;
		try {
			result = onSave(v);
		} catch (err) {
			setStatus("error");
			setError(errorText(err));
			return;
		}
		if (result && typeof (result as Promise<void>).then === "function") {
			setPending(v);
			setStatus("saving");
			(result as Promise<void>).then(
				() => {
					if (!alive.current) return;
					setPending(null);
					flashSaved();
				},
				(err) => {
					if (!alive.current) return;
					setPending(null);
					setStatus("error");
					setError(errorText(err));
				},
			);
		} else flashSaved();
	};

	const readout = isAmount ? (shown === "" ? "" : money(shown, currency)) : shown;
	const negative = isAmount && shown.startsWith("-");

	return (
		<div data-slot="cy-inline-edit" className={cn("min-w-0", className)} {...props}>
			{editing ? (
				<div
					className="min-w-0"
					onKeyDownCapture={(e) => {
						if (e.key === "Escape") {
							e.preventDefault();
							e.stopPropagation();
							cancel();
						} else if (e.key === "Enter") amountInvalid.current = false;
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.nativeEvent.isComposing) {
							e.preventDefault();
							finish(isAmount ? amountRef.current : draft, true);
						}
					}}
					onBlurCapture={() => {
						amountInvalid.current = false;
					}}
					onBlur={() => {
						if (!amountInvalid.current) finish(isAmount ? amountRef.current : draft, false);
					}}
				>
					{isAmount ? (
						<AmountInput
							autoFocus
							aria-label={ariaLabel}
							defaultValue={shown}
							currency={currency}
							allowNegative={allowNegative}
							placeholder={placeholder}
							messages="overlay"
							onValueChange={(v) => (amountRef.current = v)}
							onParseError={() => (amountInvalid.current = true)}
						/>
					) : (
						<Input
							autoFocus
							aria-label={ariaLabel}
							value={draft}
							placeholder={placeholder}
							onFocus={(e) => e.currentTarget.select()}
							onChange={(e) => setDraft(e.target.value)}
						/>
					)}
				</div>
			) : (
				<button
					ref={buttonRef}
					type="button"
					disabled={disabled}
					aria-label={`${ariaLabel}: ${readout || "empty"}. Edit`}
					aria-describedby={error ? msgId : undefined}
					onClick={start}
					onKeyDown={(e) => {
						if (e.key === "F2") {
							e.preventDefault();
							start();
						}
					}}
					className={cn(
						"group/iec -mx-1.5 flex min-h-input w-[calc(100%+0.75rem)] min-w-0 py-1 cursor-text items-center gap-1.5 rounded-md px-1.5 text-left text-sm text-foreground outline-none transition-colors",
						"hover:bg-interactive-secondary-hover focus-ring disabled:cursor-default disabled:hover:bg-transparent",
						isAmount && "justify-end text-right",
						status === "error" && "ring-1 ring-destructive/40",
					)}
				>
					<span
						className={cn(
							"min-w-0",
							isAmount ? "whitespace-nowrap tabular-nums" : "break-words whitespace-normal",
							!readout && "text-tertiary-foreground",
							negative && surfaces.negative,
							status === "saving" && "opacity-70",
						)}
					>
						{readout || placeholder || "—"}
					</span>
					<span aria-hidden="true" className={cn("flex size-3.5 shrink-0 items-center justify-center", isAmount && "order-first")}>
						{status === "saving" ? (
							<CircleNotchIcon size={13} className="animate-spin text-tertiary-foreground" />
						) : status === "saved" ? (
							<CheckIcon size={13} weight="bold" className="text-status-green-text" />
						) : (
							!disabled && <PencilSimpleIcon size={13} className="text-tertiary-foreground opacity-0 transition-opacity group-hover/iec:opacity-100 group-focus-visible/iec:opacity-100" />
						)}
					</span>
				</button>
			)}
			<div id={msgId} aria-live="polite" className={cn("text-2xs", error ? cn("mt-0.5", surfaces.negative, isAmount && "text-right") : "sr-only")}>
				{error ?? (status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "")}
			</div>
		</div>
	);
}

/** Dr/Cr totals and difference for a set of journal lines (exact, via sumAmounts). */
export const journalTotals = (lines: JournalGridLine[]) => {
	const debit = sumAmounts(lines.map((l) => l.debit));
	const credit = sumAmounts(lines.map((l) => l.credit));
	return { debit, credit, difference: fromSen(toSen(debit) - toSen(credit)) };
};
