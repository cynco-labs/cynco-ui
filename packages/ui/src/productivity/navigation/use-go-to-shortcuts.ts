"use client";

import * as React from "react";
import { useCharacterKeyShortcuts } from "../../base";
import { isTypingTarget } from "../../lib/keyboard";

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
