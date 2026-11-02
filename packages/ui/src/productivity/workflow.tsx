/**
 * Cynco UI — workflow quality-of-life primitives.
 *
 * - BulkActionBar: what you can do with the rows you ticked (count, money total, actions, Esc to clear).
 * - UndoToast (+ UndoToastProvider, UndoToastViewport, useUndoToast): "do it, then offer Undo" instead of
 *   "are you sure?" dialogs. The real write happens late, in onCommit, when the toast is dismissed,
 *   pushed out of the stack or (only with an explicit `duration`) times out.
 * - DensityToggle: Compact / Default / Comfortable rows, feeding DensityProvider.
 * - PrintButton: prints the document on screen (documents themselves live in the document kit, ./documents).
 */
import * as React from "react";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
	cn,
	toAriaKeyShortcuts,
	useShortcutAllowed,
	LiveStatus,
} from "../base";
import { ArrowCounterClockwiseIcon, DotsThreeIcon, PrinterIcon, XIcon } from "@phosphor-icons/react";
import { isMacPlatform, useIsMac } from "../base/lib/utils";
import { Kbd, formatCurrency, formatDate, parseAmount, sumAmounts, useHotkey, type Density } from "../lib/shared";

/* ───────────── local helpers ───────────── */

/** True when a key event comes from somewhere the user is typing text. */
function isTypingTarget(t: EventTarget | null) {
	const el = t as HTMLElement | null;
	if (!el || !el.tagName) return false;
	if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
	if (el.tagName !== "INPUT") return false;
	const type = (el as HTMLInputElement).type;
	return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"].includes(type);
}

/** "mod+shift+e" against a KeyboardEvent; `mod` is ⌘ on Mac, Ctrl elsewhere. */
function matchesCombo(e: KeyboardEvent, combo: string) {
	const parts = combo.toLowerCase().split("+");
	let key = parts.pop() as string;
	if (key === "esc") key = "escape";
	const mod = isMacPlatform() ? e.metaKey : e.ctrlKey;
	return e.key.toLowerCase() === key && mod === parts.includes("mod") && e.altKey === parts.includes("alt") && e.shiftKey === parts.includes("shift");
}


/** value/defaultValue/onValueChange in one place. */
function useControlledValue<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void): [T, (v: T) => void] {
	const [inner, setInner] = React.useState(defaultValue);
	const controlled = value !== undefined;
	const onChangeRef = React.useRef(onChange);
	onChangeRef.current = onChange;
	const set = React.useCallback(
		(v: T) => {
			if (!controlled) setInner(v);
			onChangeRef.current?.(v);
		},
		[controlled],
	);
	return [controlled ? (value as T) : inner, set];
}

/**
 * Remember where focus came from when it enters an element; if the element unmounts while it
 * holds focus (the bar disappears, the toast expires), send focus back there instead of <body>.
 */
function useFocusReturn<T extends HTMLElement>() {
	const ref = React.useRef<T>(null);
	const back = React.useRef<HTMLElement | null>(null);
	const onFocusCapture = React.useCallback((e: React.FocusEvent) => {
		const from = e.relatedTarget as HTMLElement | null;
		if (from && ref.current && !ref.current.contains(from)) back.current = from;
	}, []);
	React.useLayoutEffect(() => {
		const node = ref.current;
		return () => {
			const target = back.current;
			if (node && target && node.contains(document.activeElement)) {
				requestAnimationFrame(() => {
					if (target.isConnected) target.focus();
				});
			}
		};
	}, []);
	return { ref, onFocusCapture };
}

/** Global CSS this file needs: print page setup, print isolation and the toast countdown. */
const WORKFLOW_CSS = `
@keyframes cy-undo-countdown { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@page { size: A4; margin: 16mm; @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8pt system-ui, sans-serif; color: #737373; } }
@media print {
	html, body { background: #fff !important; color-scheme: light !important; }
	body:has([data-cy-print-root]) * { visibility: hidden; }
	html body [data-cy-print-root], html body [data-cy-print-root] * { visibility: visible; }
	html body [data-cy-print-root] { position: absolute; left: 0; top: 0; width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;
function WorkflowStyles() {
	return <style data-cy-workflow-css="">{WORKFLOW_CSS}</style>;
}

/* ═════════════ BulkActionBar ═════════════ */

export type BulkAction = {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onSelect: () => void;
	/** Red label; lives at the end of the overflow menu unless there's room. */
	destructive?: boolean;
	/** "p", "shift+v", "mod+e" — active while rows are selected (single keys are ignored while typing). */
	shortcut?: string;
	disabled?: boolean;
	/** Always put this action in the ⋯ menu. */
	overflow?: boolean;
};

export type BulkActionBarProps = Omit<React.ComponentProps<"div">, "children"> & {
	/** Selected rows. The bar renders nothing at 0. */
	count: number;
	/** Sum of the selected rows' money field, as a decimal string (use `sumAmounts`). */
	total?: string;
	currency?: string;
	/** Rows in the whole list — shows "Select all N" while only some are selected. */
	totalCount?: number;
	onSelectAll?: () => void;
	/** Clear the selection (also Esc). */
	onClear: () => void;
	actions: BulkAction[];
	/** Buttons shown before the rest go into the ⋯ menu. Default 3. */
	maxVisible?: number;
	/** Stick to the bottom of the scrolling container. Default true. */
	sticky?: boolean;
	/** Accessible name of the toolbar. */
	label?: string;
};

/** Floating toolbar for ticked rows: "3 selected · RM 34,890.00", Select all / Clear, actions and a ⋯ menu. */
export function BulkActionBar(props: BulkActionBarProps) {
	const { count, total, currency = "MYR" } = props;
	// Stays mounted at 0 so the first "1 selected" is announced; a live region inserted with its text often isn't.
	const status = count > 0 ? `${count} selected${total != null ? `, ${formatCurrency(total, currency)}` : ""}` : "";
	return (
		<>
			<LiveStatus>
				{status}
			</LiveStatus>
			{count > 0 && <BulkActionBarInner {...props} />}
		</>
	);
}

function BulkActionBarInner({ count, total, currency = "MYR", totalCount, onSelectAll, onClear, actions, maxVisible = 3, sticky = true, label = "Bulk actions", className, ...props }: BulkActionBarProps) {
	const mac = useIsMac();
	const [menuOpen, setMenuOpen] = React.useState(false);
	const { ref, onFocusCapture } = useFocusReturn<HTMLDivElement>();
	const allowed = useShortcutAllowed();
	const latest = React.useRef({ actions, onClear, allowed });
	latest.current = { actions, onClear, allowed };
	/** The shortcut to advertise, or undefined while the user has single-key shortcuts off. */
	const liveShortcut = (k?: string) => (k && allowed(k) ? k : undefined);

	// Esc clears; action shortcuts run. Paused while the ⋯ menu is open (it owns Esc then).
	React.useEffect(() => {
		if (menuOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.defaultPrevented) return;
			const typing = isTypingTarget(e.target);
			if (matchesCombo(e, "esc")) {
				if (typing) return;
				e.preventDefault();
				latest.current.onClear();
				return;
			}
			for (const a of latest.current.actions) {
				if (!a.shortcut || a.disabled || !matchesCombo(e, a.shortcut)) continue;
				// Bare-letter shortcuts honour the user's "Single-key shortcuts" switch (WCAG 2.1.4).
				if (!latest.current.allowed(a.shortcut)) continue;
				if (typing && !a.shortcut.toLowerCase().includes("mod")) return;
				e.preventDefault();
				a.onSelect();
				return;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [menuOpen]);

	const inline = actions.filter((a) => !a.overflow).slice(0, maxVisible);
	const more = actions.filter((a) => !inline.includes(a));
	const canSelectAll = !!onSelectAll && totalCount != null && count < totalCount;

	// ← → Home End move along the toolbar (Tab still works).
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
		const root = e.currentTarget;
		if (!root.contains(e.target as Node)) return; // keys from the portalled menu bubble here in React
		const items = Array.from(root.querySelectorAll<HTMLElement>("button:not([disabled])"));
		const i = items.indexOf(document.activeElement as HTMLElement);
		if (i < 0) return;
		e.preventDefault();
		const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
		items[next].focus();
	};

	return (
		<div data-slot="cy-bulk-action-bar" className={cn("@container pointer-events-none z-30 flex justify-center print:hidden", sticky && "sticky bottom-3", className)} {...props}>
			<div
				ref={ref}
				role="toolbar"
				aria-label={label}
				aria-orientation="horizontal"
				onKeyDown={onKeyDown}
				onFocusCapture={onFocusCapture}
				className="pointer-events-auto flex w-full max-w-full flex-wrap items-center gap-x-1 gap-y-1.5 rounded-xl border border-overlay-border bg-overlay p-1.5 shadow-overlay @3xl:w-fit"
			>
				<div className="flex min-w-0 flex-1 basis-full flex-wrap items-center gap-1 @3xl:basis-auto">
					<p className="mr-auto min-w-0 basis-full px-1.5 py-0.5 text-sm @sm:basis-auto @sm:py-0 text-foreground tabular-nums">
						<span className="font-medium whitespace-nowrap">{count} selected</span>
						{total != null && (
							<>
								<span aria-hidden="true" className="px-1.5 text-tertiary-foreground">·</span>
								<span className="whitespace-nowrap text-muted-foreground">{formatCurrency(total, currency)}</span>
							</>
						)}
					</p>
					{canSelectAll && (
						<Button variant="skeleton" onClick={onSelectAll} className="text-primary">
							Select all {totalCount}
						</Button>
					)}
					<Button variant="skeleton" onClick={onClear} aria-keyshortcuts="Escape" className="gap-1.5">
						<XIcon size={14} aria-hidden="true" />
						Clear
						<Kbd keys="esc" className="hidden @xl:inline-flex" aria-hidden="true" />
					</Button>
				</div>
				<span aria-hidden="true" className="mx-0.5 hidden h-5 w-px bg-overlay-separator @3xl:block" />
				<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 @3xl:flex-none">
					{inline.map((a) => (
						<Button
							key={a.id}
							variant="secondary"
							disabled={a.disabled}
							onClick={a.onSelect}
							aria-keyshortcuts={liveShortcut(a.shortcut) ? toAriaKeyShortcuts(a.shortcut, mac) : undefined}
							title={liveShortcut(a.shortcut) ? `${a.label} (${a.shortcut.toUpperCase()})` : undefined}
							className={cn("gap-1.5", a.destructive && "text-error-text hover:!text-error-text")}
						>
							{a.icon && <span aria-hidden="true" className="flex size-3.5 items-center justify-center">{a.icon}</span>}
							{a.label}
							{liveShortcut(a.shortcut) && <Kbd keys={a.shortcut} aria-hidden="true" className="hidden @3xl:inline-flex" />}
						</Button>
					))}
					{more.length > 0 && (
						<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
							<DropdownMenuTrigger render={<Button variant="secondary" aria-label="More actions" className="w-7 !px-0" />}>
								<DotsThreeIcon size={16} weight="bold" aria-hidden="true" />
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" align="end" className="w-52">
								{more.map((a) => (
									<DropdownMenuItem
										key={a.id}
										disabled={a.disabled}
										onClick={a.onSelect}
										aria-keyshortcuts={liveShortcut(a.shortcut) ? toAriaKeyShortcuts(a.shortcut, mac) : undefined}
										className={cn(a.destructive && "text-error-text focus:text-error-text data-highlighted:text-error-text [&_svg]:text-current")}
									>
										{a.icon && <span aria-hidden="true" className="flex size-3.5 items-center justify-center">{a.icon}</span>}
										{a.label}
										{liveShortcut(a.shortcut) && (
											<DropdownMenuShortcut>
												<Kbd keys={a.shortcut} aria-hidden="true" />
											</DropdownMenuShortcut>
										)}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</div>
	);
}

/* ═════════════ UndoToast ═════════════ */

export type UndoToastOptions = {
	message: React.ReactNode;
	/** Put things back. The toast closes without committing. */
	onUndo: () => void;
	/** Do the real (irreversible) write: runs once, when the toast expires, is dismissed or is pushed out of the stack. */
	onCommit?: () => void;
	/** Milliseconds before it commits. Default: the provider's `duration` (never). 0 or Infinity = never auto-commit. */
	duration?: number;
	undoLabel?: string;
	/** Reuse an id to replace nothing — ids just need to be unique; one is generated when omitted. */
	id?: string;
};

type UndoEntry = UndoToastOptions & { id: string };

type UndoToastContextValue = {
	toasts: UndoEntry[];
	/** Show a toast; returns its id. */
	show: (options: UndoToastOptions) => string;
	/** Undo a toast (newest when no id). */
	undo: (id?: string) => void;
	/** Close a toast now and commit it. */
	dismiss: (id: string) => void;
	defaultDuration: number;
	/** Where focus goes back to when the last toast holding focus closes. */
	returnFocus: React.MutableRefObject<HTMLElement | null>;
};

const UndoToastContext = React.createContext<UndoToastContextValue | null>(null);

export type UndoToastProviderProps = {
	children: React.ReactNode;
	/** Toasts on screen at once; a new one commits the oldest. Default 3. */
	max?: number;
	/**
	 * Default auto-commit delay in ms. Default Infinity: a toast stays until it is dismissed, undone or pushed
	 * out, so nobody loses Undo for being slow (WCAG 2.2.1). Pass a number only for low-stakes actions.
	 */
	duration?: number;
	/** Render the viewport automatically. Set false and place <UndoToastViewport /> yourself. */
	viewport?: boolean;
	position?: UndoToastViewportProps["position"];
};

/**
 * Mount once near the app root. Holds the toast stack, owns ⌘/Ctrl+Z (undo newest) and F8 (focus the
 * newest toast), and commits anything still pending when it unmounts or the page is hidden for good.
 */
export function UndoToastProvider({ children, max = 3, duration = Number.POSITIVE_INFINITY, viewport = true, position }: UndoToastProviderProps) {
	const [toasts, setToasts] = React.useState<UndoEntry[]>([]);
	const list = React.useRef<UndoEntry[]>([]);
	const seq = React.useRef(0);
	const returnFocus = React.useRef<HTMLElement | null>(null);

	const settle = React.useCallback((id: string, how: "undo" | "commit") => {
		const entry = list.current.find((t) => t.id === id);
		if (!entry) return; // already settled: each toast undoes OR commits exactly once
		list.current = list.current.filter((t) => t.id !== id);
		setToasts(list.current);
		if (how === "undo") entry.onUndo();
		else entry.onCommit?.();
	}, []);

	const show = React.useCallback(
		(o: UndoToastOptions) => {
			const id = o.id ?? `undo-${++seq.current}`;
			const next = [...list.current.filter((t) => t.id !== id), { ...o, id }];
			const pushedOut = next.slice(0, Math.max(0, next.length - max));
			list.current = next.slice(-max);
			setToasts(list.current);
			for (const t of pushedOut) t.onCommit?.();
			return id;
		},
		[max],
	);
	const undo = React.useCallback((id?: string) => {
		const target = id ?? list.current[list.current.length - 1]?.id;
		if (target) settle(target, "undo");
	}, [settle]);
	const dismiss = React.useCallback((id: string) => settle(id, "commit"), [settle]);

	// Commit whatever is pending when the provider goes away or the page is being left.
	React.useEffect(() => {
		const flush = () => {
			const pending = list.current;
			list.current = [];
			for (const t of pending) t.onCommit?.();
		};
		window.addEventListener("pagehide", flush);
		return () => {
			window.removeEventListener("pagehide", flush);
			flush();
		};
	}, []);

	// ⌘/Ctrl+Z undoes the newest toast — but not while the user is typing (that's the field's own undo).
	// F8 jumps to the newest toast's Undo button.
	const live = toasts.length > 0;
	React.useEffect(() => {
		if (!live) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.defaultPrevented) return;
			const inToast = (e.target as HTMLElement | null)?.closest?.("[data-cy-undo-viewport]");
			if (matchesCombo(e, "mod+z")) {
				if (isTypingTarget(e.target) && !inToast) return;
				e.preventDefault();
				undo();
			} else if (e.key === "F8" && !e.metaKey && !e.ctrlKey && !e.altKey) {
				const buttons = document.querySelectorAll<HTMLElement>("[data-cy-undo-viewport] [data-cy-undo-button]");
				const last = buttons[buttons.length - 1];
				if (!last) return;
				e.preventDefault();
				if (!inToast) returnFocus.current = document.activeElement as HTMLElement | null;
				last.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [live, undo]);

	const value = React.useMemo<UndoToastContextValue>(() => ({ toasts, show, undo, dismiss, defaultDuration: duration, returnFocus }), [toasts, show, undo, dismiss, duration]);
	return (
		<UndoToastContext.Provider value={value}>
			{children}
			{viewport && <UndoToastViewport position={position} />}
		</UndoToastContext.Provider>
	);
}

/** `const { show } = useUndoToast(); show({ message: "2 invoices voided", onUndo, onCommit })`. Needs an UndoToastProvider. */
export function useUndoToast() {
	const ctx = React.useContext(UndoToastContext);
	if (!ctx) throw new Error("useUndoToast must be used inside <UndoToastProvider>.");
	return { show: ctx.show, undo: ctx.undo, dismiss: ctx.dismiss, count: ctx.toasts.length };
}

export type UndoToastViewportProps = Omit<React.ComponentProps<"section">, "children"> & {
	position?: "bottom-center" | "bottom-right" | "bottom-left";
};

const POSITION = {
	"bottom-center": "inset-x-4 items-center",
	"bottom-right": "inset-x-4 items-end",
	"bottom-left": "inset-x-4 items-start",
} as const;

/** Where the toasts render (fixed to the bottom of the viewport). Rendered by the provider unless `viewport={false}`. */
export function UndoToastViewport({ position = "bottom-center", className, ...props }: UndoToastViewportProps) {
	const ctx = React.useContext(UndoToastContext);
	if (!ctx) return null;
	const { toasts, undo, dismiss, defaultDuration, returnFocus } = ctx;
	return (
		<section
			data-cy-undo-viewport=""
			aria-label="Notifications (F8)"
			className={cn("pointer-events-none fixed bottom-4 z-[400] flex flex-col print:hidden", POSITION[position], className)}
			onFocusCapture={(e) => {
				const from = e.relatedTarget as HTMLElement | null;
				if (from && !e.currentTarget.contains(from)) returnFocus.current = from;
			}}
			{...props}
		>
			<WorkflowStyles />
			<ol aria-live="polite" aria-relevant="additions text" className="flex w-full max-w-sm flex-col gap-2">
				{toasts.map((t, i) => (
					<UndoToast
						key={t.id}
						message={t.message}
						undoLabel={t.undoLabel}
						duration={t.duration ?? defaultDuration}
						showShortcut={i === toasts.length - 1}
						onUndo={() => undo(t.id)}
						onDismiss={() => dismiss(t.id)}
						onExpire={() => dismiss(t.id)}
						returnFocusTo={returnFocus}
					/>
				))}
			</ol>
		</section>
	);
}

export type UndoToastProps = Omit<React.ComponentProps<"li">, "children"> & {
	message: React.ReactNode;
	onUndo: () => void;
	/** Close button / Esc. */
	onDismiss?: () => void;
	/** The countdown ran out. */
	onExpire?: () => void;
	/** ms; 0 or Infinity = no countdown. Default Infinity (stays until dismissed). */
	duration?: number;
	undoLabel?: string;
	/** Show the ⌘/Ctrl+Z keycap on the Undo button (the newest toast). Default true. */
	showShortcut?: boolean;
	/** Hold the countdown (it also pauses on hover, on focus and while the tab is hidden). */
	paused?: boolean;
	/** Focus target when this toast closes while focused. */
	returnFocusTo?: React.MutableRefObject<HTMLElement | null>;
};

/** One toast: message, Undo (⌘/Ctrl+Z), dismiss, and a countdown bar that pauses on hover or focus. */
export function UndoToast({ message, onUndo, onDismiss, onExpire, duration = Number.POSITIVE_INFINITY, undoLabel = "Undo", showShortcut = true, paused: pausedProp, returnFocusTo, className, ...props }: UndoToastProps) {
	const mac = useIsMac();
	const [hover, setHover] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const [hidden, setHidden] = React.useState(() => typeof document !== "undefined" && document.visibilityState === "hidden");
	const ref = React.useRef<HTMLLIElement>(null);
	const paused = !!pausedProp || hover || focused || hidden;
	const timed = duration > 0 && Number.isFinite(duration);

	// The countdown is a timer, not the bar's animationend: a reduced-motion rule that shortens or
	// removes animations must never make the toast expire (and commit) early.
	const remaining = React.useRef(duration);
	const expire = React.useRef(onExpire);
	expire.current = onExpire;
	React.useEffect(() => {
		if (!timed || paused) return;
		const started = Date.now();
		const t = setTimeout(() => expire.current?.(), remaining.current);
		return () => {
			clearTimeout(t);
			remaining.current = Math.max(0, remaining.current - (Date.now() - started));
		};
	}, [timed, paused]);

	React.useEffect(() => {
		const onVis = () => setHidden(document.visibilityState === "hidden");
		document.addEventListener("visibilitychange", onVis);
		return () => document.removeEventListener("visibilitychange", onVis);
	}, []);

	// Closing while focused: hand focus back to where the user was.
	React.useLayoutEffect(() => {
		const node = ref.current;
		return () => {
			if (!node || !node.contains(document.activeElement)) return;
			const viewport = node.closest("[data-cy-undo-viewport]");
			requestAnimationFrame(() => {
				const others = viewport ? Array.from(viewport.querySelectorAll<HTMLElement>("[data-cy-undo-button]")) : [];
				const target = others[others.length - 1] ?? returnFocusTo?.current;
				if (target && target.isConnected) target.focus();
			});
		};
	}, [returnFocusTo]);

	return (
		<li
			ref={ref}
			data-slot="cy-undo-toast"
			data-paused={paused || undefined}
			onPointerEnter={() => setHover(true)}
			onPointerLeave={() => setHover(false)}
			onFocus={() => setFocused(true)}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape" && onDismiss) {
					e.preventDefault();
					e.stopPropagation();
					onDismiss();
				}
			}}
			className={cn(
				"pointer-events-auto relative flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-overlay-border bg-overlay py-2 pr-1.5 pl-3.5 text-sm text-foreground shadow-overlay",
				"animate-in fade-in-0 slide-in-from-bottom-2 duration-150",
				className,
			)}
			{...props}
		>
			<div className="min-w-0 flex-1 py-0.5">{message}</div>
			<Button variant="secondary" data-cy-undo-button="" onClick={onUndo} aria-keyshortcuts={showShortcut ? toAriaKeyShortcuts("mod+z", mac) : undefined} className="shrink-0 gap-1.5">
				<ArrowCounterClockwiseIcon size={14} aria-hidden="true" />
				{undoLabel}
				{showShortcut && <Kbd keys="mod+z" aria-hidden="true" />}
			</Button>
			{onDismiss && (
				<Button variant="skeleton" size="icon" aria-label="Dismiss" onClick={onDismiss} className="size-7 shrink-0 text-tertiary-foreground">
					<XIcon size={14} aria-hidden="true" />
				</Button>
			)}
			{timed && (
				<div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-overlay-separator">
					<div
						className="h-full origin-left bg-primary"
						style={{ animation: `cy-undo-countdown ${duration}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
					/>
				</div>
			)}
		</li>
	);
}

/* ═════════════ DensityToggle ═════════════ */

const DENSITIES: Array<{ value: Density; label: string; lines: number[] }> = [
	{ value: "compact", label: "Compact", lines: [2.5, 5.5, 8.5, 11.5] },
	{ value: "default", label: "Default", lines: [3, 7, 11] },
	{ value: "comfortable", label: "Comfortable", lines: [4, 10] },
];

function DensityGlyph({ lines }: { lines: number[] }) {
	return (
		<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
			{lines.map((y) => (
				<line key={y} x1="2" x2="12" y1={y} y2={y} />
			))}
		</svg>
	);
}

export type DensityToggleProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
	value?: Density;
	defaultValue?: Density;
	onValueChange?: (density: Density) => void;
	/** `auto` hides the words when the nearest @container is under 22rem; `never` = icons only. */
	labels?: "auto" | "always" | "never";
	/** Remember the choice in localStorage under this key (uncontrolled use). */
	storageKey?: string;
	/** Accessible name of the radio group. */
	label?: string;
};

/** Compact / Default / Comfortable as a radio group (← → to change). Feed its value to DensityProvider. */
export function DensityToggle({ value, defaultValue = "default", onValueChange, labels = "auto", storageKey, label = "Row density", className, ...props }: DensityToggleProps) {
	const [current, setCurrent] = useControlledValue<Density>(value, defaultValue, (d) => {
		onValueChange?.(d);
		if (storageKey) {
			try {
				localStorage.setItem(storageKey, d);
			} catch {
				/* storage unavailable */
			}
		}
	});
	const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

	React.useEffect(() => {
		if (!storageKey || value !== undefined) return;
		try {
			const saved = localStorage.getItem(storageKey) as Density | null;
			if (saved && DENSITIES.some((d) => d.value === saved) && saved !== current) setCurrent(saved);
		} catch {
			/* storage unavailable */
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageKey]);

	const onKeyDown = (e: React.KeyboardEvent, i: number) => {
		const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
		const next = step ? (i + step + DENSITIES.length) % DENSITIES.length : e.key === "Home" ? 0 : e.key === "End" ? DENSITIES.length - 1 : -1;
		if (next < 0) return;
		e.preventDefault();
		setCurrent(DENSITIES[next].value);
		refs.current[next]?.focus();
	};

	return (
		<div
			role="radiogroup"
			aria-label={label}
			data-slot="cy-density-toggle"
			className={cn("inline-flex max-w-full items-center gap-0.5 rounded-lg border border-table-tray-border bg-table-tray p-0.5 print:hidden", className)}
			{...props}
		>
			{DENSITIES.map((d, i) => {
				const active = current === d.value;
				return (
					<button
						key={d.value}
						ref={(el) => {
							refs.current[i] = el;
						}}
						type="button"
						role="radio"
						aria-checked={active}
						aria-label={d.label}
						title={d.label}
						tabIndex={active ? 0 : -1}
						onClick={() => setCurrent(d.value)}
						onKeyDown={(e) => onKeyDown(e, i)}
						className={cn(
							"flex h-6 min-w-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 text-tertiary-foreground outline-none transition-colors duration-150",
							"hover:text-foreground focus-visible:text-foreground focus-ring",
							active && "border-table-surface-border bg-table-surface text-foreground shadow-segment",
						)}
					>
						<DensityGlyph lines={d.lines} />
						{labels !== "never" && <span className={cn("text-sm font-medium", labels === "auto" && "@max-[22rem]:sr-only")}>{d.label}</span>}
					</button>
				);
			})}
		</div>
	);
}

/* ═════════════ Print ═════════════ */

export type PrintButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
	/** Replace window.print() — e.g. download a server-rendered PDF. */
	onPrint?: () => void;
	/** Handle ⌘/Ctrl+P on this page. Default: only when `onPrint` is given (otherwise the browser's own print already uses the print layout). */
	bindShortcut?: boolean;
	/** Show the ⌘/Ctrl+P keycap. Default true. */
	showShortcut?: boolean;
};

/** "Print" with a ⌘/Ctrl+P keycap; calls window.print() unless `onPrint` is given. Hidden in print. */
export function PrintButton({ onPrint, bindShortcut, showShortcut = true, variant = "secondary", className, children, ...props }: PrintButtonProps) {
	const mac = useIsMac();
	const print = React.useCallback(() => {
		if (onPrint) onPrint();
		else if (typeof window !== "undefined") window.print();
	}, [onPrint]);
	useHotkey("mod+p", print, { enabled: bindShortcut ?? !!onPrint });
	return (
		<Button variant={variant} onClick={print} aria-keyshortcuts={toAriaKeyShortcuts("mod+p", mac)} className={cn("gap-1.5 print:hidden", className)} {...props}>
			<PrinterIcon size={14} aria-hidden="true" />
			{children ?? "Print"}
			{showShortcut && <Kbd keys="mod+p" aria-hidden="true" />}
		</Button>
	);
}
