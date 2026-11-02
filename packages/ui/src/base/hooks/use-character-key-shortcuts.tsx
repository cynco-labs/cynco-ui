"use client";

import * as React from "react";

/**
 * WCAG 2.1.4 Character Key Shortcuts: page-wide shortcuts made only of printable keys ("?", "n",
 * "g i") must be something the user can turn off. Every such shortcut in the library reads this
 * switch; chords with ⌘/Ctrl/Alt and named keys (Esc, Enter, arrows, F-keys) are never affected.
 *
 * The preference persists in localStorage, so a user who turns it off stays off across reloads and
 * tabs. It works with no provider; mount KeyboardShortcutsProvider only to set a different default
 * or to own the value yourself (e.g. store it in the user's profile).
 */

const STORAGE_KEY = "cy-character-key-shortcuts";

type Setter = (enabled: boolean) => void;
type ContextValue = { enabled: boolean; setEnabled: Setter };

const listeners = new Set<() => void>();
/** The preference as last read or set on this page; undefined until first read. Survives blocked storage. */
let current: boolean | null | undefined;

function readStored(): boolean | null {
	try {
		const v = window.localStorage.getItem(STORAGE_KEY);
		return v === "on" ? true : v === "off" ? false : null;
	} catch {
		return null;
	}
}

function notify() {
	for (const l of listeners) l();
}

function writeStored(enabled: boolean) {
	try {
		window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
	} catch {
		// Storage blocked (private mode, sandboxed frame): the switch still works for this page.
	}
	current = enabled;
	notify();
}

/** Another tab changed the preference. */
function onStorage(e: StorageEvent) {
	if (e.key !== STORAGE_KEY) return;
	current = readStored();
	notify();
}

/** One window listener for every subscriber, added with the first and removed with the last. */
function subscribe(onChange: () => void) {
	if (listeners.size === 0) window.addEventListener("storage", onStorage);
	listeners.add(onChange);
	return () => {
		listeners.delete(onChange);
		if (listeners.size === 0) window.removeEventListener("storage", onStorage);
	};
}

const subscribeNothing = () => () => {};
const getSnapshot = () => {
	if (current === undefined) current = readStored();
	return current;
};
const getServerSnapshot = () => null;

const KeyboardShortcutsContext = React.createContext<ContextValue | null>(null);

export type KeyboardShortcutsProviderProps = {
	/** Controlled: whether single-key shortcuts are on. You own persistence; nothing is stored. */
	characterKeys?: boolean;
	/** Uncontrolled: the value until the user chooses (their choice is persisted). Default true. */
	defaultCharacterKeys?: boolean;
	onCharacterKeysChange?: (enabled: boolean) => void;
	children?: React.ReactNode;
};

/** Sets the default for, or takes control of, the single-key shortcuts switch below it. */
export function KeyboardShortcutsProvider({
	characterKeys,
	defaultCharacterKeys = true,
	onCharacterKeysChange,
	children,
}: KeyboardShortcutsProviderProps) {
	const controlled = characterKeys !== undefined;
	// A controlled provider owns the value, so it needn't follow storage.
	const stored = React.useSyncExternalStore(controlled ? subscribeNothing : subscribe, getSnapshot, getServerSnapshot);
	const enabled = controlled ? characterKeys : (stored ?? defaultCharacterKeys);
	const onChangeRef = React.useRef(onCharacterKeysChange);
	onChangeRef.current = onCharacterKeysChange;
	const setEnabled = React.useCallback<Setter>(
		(next) => {
			if (!controlled) writeStored(next);
			onChangeRef.current?.(next);
		},
		[controlled],
	);
	const value = React.useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled]);
	return <KeyboardShortcutsContext.Provider value={value}>{children}</KeyboardShortcutsContext.Provider>;
}

/**
 * `[enabled, setEnabled]` for single-key shortcuts. Gate any page-wide shortcut made only of
 * printable keys on `enabled`, and hide its keycap hint when it is false.
 */
export function useCharacterKeyShortcuts(): readonly [boolean, Setter] {
	const ctx = React.useContext(KeyboardShortcutsContext);
	// Under a provider the context already carries the value; only provider-less callers watch storage.
	const stored = React.useSyncExternalStore(ctx ? subscribeNothing : subscribe, getSnapshot, getServerSnapshot);
	if (ctx) return [ctx.enabled, ctx.setEnabled] as const;
	return [stored ?? true, writeStored] as const;
}

/**
 * `(keys) => boolean`: whether a shortcut may fire (and its keycap be shown) right now. Printable-only
 * shortcuts follow the user's switch; chords and named keys are always allowed. Use this rather than
 * combining `useCharacterKeyShortcuts` and `isCharacterKeyShortcut` by hand.
 */
export function useShortcutAllowed(): (keys: string | string[]) => boolean {
	const [characterKeys] = useCharacterKeyShortcuts();
	return React.useCallback((keys) => characterKeys || !isCharacterKeyShortcut(keys), [characterKeys]);
}

const MODIFIERS = new Set(["mod", "ctrl", "control", "meta", "cmd", "command", "alt", "option"]);

/**
 * True when a shortcut uses only printable keys: "n", "?", "shift+x", "g i". False when any step
 * holds ⌘/Ctrl/Alt ("mod+k", "alt+b") or uses a named key ("esc", "enter", "down", "F8").
 * Accepts the library's key syntax, or an array of alternatives (true only if every one is).
 */
export function isCharacterKeyShortcut(keys: string | string[]): boolean {
	const alts = Array.isArray(keys) ? keys : [keys];
	return (
		alts.length > 0 &&
		alts.every((alt) => {
			const chords = alt.trim().split(/\s+/).filter(Boolean);
			return (
				chords.length > 0 &&
				chords.every((chord) => {
					const parts = chord.toLowerCase().split("+");
					// "+" itself: "shift++" splits into ["shift", "", ""].
					const key = parts.at(-1) === "" && parts.length > 1 ? "+" : (parts.at(-1) ?? "");
					const mods = key === "+" ? parts.slice(0, -2) : parts.slice(0, -1);
					return (key.length === 1 || key === "space") && !mods.some((m) => MODIFIERS.has(m));
				})
			);
		})
	);
}


const isMacPlatform = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Library key names → the UI Events key values aria-keyshortcuts expects. */
const ARIA_KEY: Record<string, string> = {
	ctrl: "Control", control: "Control", cmd: "Meta", command: "Meta", meta: "Meta", alt: "Alt", option: "Alt", shift: "Shift",
	esc: "Escape", escape: "Escape", enter: "Enter", return: "Enter", tab: "Tab", space: "Space", backspace: "Backspace", delete: "Delete",
	up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", pageup: "PageUp", pagedown: "PageDown",
};

/**
 * The `aria-keyshortcuts` spelling of a combo in the library's key syntax: "mod+k" → "Meta+K" (Mac) or
 * "Control+K", "shift+up" → "Shift+ArrowUp". Undefined for a sequence ("g i"): the attribute can't
 * express one (a space there separates alternatives).
 */
export function toAriaKeyShortcuts(combo: string): string | undefined {
	const trimmed = combo.trim();
	if (!trimmed || /\s/.test(trimmed)) return undefined;
	const parts = trimmed.split("+");
	// "shift++" splits into ["shift", "", ""]: the last key is "+", which ARIA spells "Plus".
	const keys = parts.at(-1) === "" && parts.length > 1 ? [...parts.slice(0, -2), "Plus"] : parts;
	return keys
		.map((k) => {
			const l = k.toLowerCase();
			if (l === "mod") return isMacPlatform() ? "Meta" : "Control";
			return ARIA_KEY[l] ?? (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1));
		})
		.join("+");
}
