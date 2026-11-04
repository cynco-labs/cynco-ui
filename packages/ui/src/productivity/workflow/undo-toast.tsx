"use client";

import { ArrowCounterClockwiseIcon, XIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button, cn, toAriaKeyShortcuts } from "../../base";
import { useIsMac } from "../../base/hooks/use-platform";
import { isTypingTarget, matchesCombo } from "../../lib/keyboard";
import { Kbd } from "../../lib/shared";

/** The countdown bar's animation, mounted with the viewport so a consumer needs no extra stylesheet. */
const UNDO_TOAST_CSS = "@keyframes cy-undo-countdown { from { transform: scaleX(1); } to { transform: scaleX(0); } }";
function UndoToastStyles() {
	return <style data-cy-undo-css="">{UNDO_TOAST_CSS}</style>;
}

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
export function UndoToastProvider({
	children,
	max = 3,
	duration = Number.POSITIVE_INFINITY,
	viewport = true,
	position,
}: UndoToastProviderProps) {
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
	const undo = React.useCallback(
		(id?: string) => {
			const target = id ?? list.current[list.current.length - 1]?.id;
			if (target) settle(target, "undo");
		},
		[settle],
	);
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

	const value = React.useMemo<UndoToastContextValue>(
		() => ({ toasts, show, undo, dismiss, defaultDuration: duration, returnFocus }),
		[toasts, show, undo, dismiss, duration],
	);
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
			className={cn(
				"pointer-events-none fixed bottom-4 z-tooltip flex flex-col print:hidden",
				POSITION[position],
				className,
			)}
			onFocusCapture={(e) => {
				const from = e.relatedTarget as HTMLElement | null;
				if (from && !e.currentTarget.contains(from)) returnFocus.current = from;
			}}
			{...props}
		>
			<UndoToastStyles />
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
export function UndoToast({
	message,
	onUndo,
	onDismiss,
	onExpire,
	duration = Number.POSITIVE_INFINITY,
	undoLabel = "Undo",
	showShortcut = true,
	paused: pausedProp,
	returnFocusTo,
	className,
	...props
}: UndoToastProps) {
	const mac = useIsMac();
	const [hover, setHover] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const [hidden, setHidden] = React.useState(
		() => typeof document !== "undefined" && document.visibilityState === "hidden",
	);
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
			if (!node?.contains(document.activeElement)) return;
			const viewport = node.closest("[data-cy-undo-viewport]");
			requestAnimationFrame(() => {
				const others = viewport ? Array.from(viewport.querySelectorAll<HTMLElement>("[data-cy-undo-button]")) : [];
				const target = others[others.length - 1] ?? returnFocusTo?.current;
				if (target?.isConnected) target.focus();
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
			<Button
				variant="secondary"
				data-cy-undo-button=""
				onClick={onUndo}
				aria-keyshortcuts={showShortcut ? toAriaKeyShortcuts("mod+z", mac) : undefined}
				className="shrink-0 gap-1.5"
			>
				<ArrowCounterClockwiseIcon size={14} aria-hidden="true" />
				{undoLabel}
				{showShortcut && <Kbd keys="mod+z" aria-hidden="true" />}
			</Button>
			{onDismiss && (
				<Button
					variant="skeleton"
					size="icon"
					aria-label="Dismiss"
					onClick={onDismiss}
					className="size-7 shrink-0 text-tertiary-foreground"
				>
					<XIcon size={14} aria-hidden="true" />
				</Button>
			)}
			{timed && (
				<div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-overlay-separator">
					<div
						className="h-full origin-left bg-primary"
						style={{
							animation: `cy-undo-countdown ${duration}ms linear forwards`,
							animationPlayState: paused ? "paused" : "running",
						}}
					/>
				</div>
			)}
		</li>
	);
}
