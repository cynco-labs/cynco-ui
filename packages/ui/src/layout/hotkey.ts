"use client";

import * as React from "react";
import { useShortcutAllowed } from "../base";
import { hasModKey, isTypingTarget } from "../lib/keyboard";

/**
 * Run `handler` when a shortcut is pressed anywhere on the page: "mod+k", "?", "alt+b", "shift+enter", "esc".
 * Ignored while the user is typing (text input, textarea, select, contenteditable) unless `allowInInputs`
 * or the combo uses mod. A checkbox, radio or button does not count as typing, so a bare-letter shortcut
 * stays live over a column of tick boxes.
 */
export function useHotkey(
	combo: string | string[],
	handler: (e: KeyboardEvent) => void,
	opts: { enabled?: boolean; allowInInputs?: boolean } = {},
) {
	const ref = React.useRef(handler);
	ref.current = handler;
	const allowed = useShortcutAllowed();
	const combos = (Array.isArray(combo) ? combo : [combo])
		// Printable-only keys honour the user's "Single-key shortcuts" switch (WCAG 2.1.4).
		.filter(allowed)
		.join("|");
	React.useEffect(() => {
		if (opts.enabled === false || !combos) return;
		const list = combos.split("|").map((c) => {
			const parts = c.toLowerCase().split("+");
			const key = parts.pop() as string;
			return {
				key: key === "esc" ? "escape" : key,
				mod: parts.includes("mod"),
				alt: parts.includes("alt"),
				shift: parts.includes("shift"),
			};
		});
		const onKey = (e: KeyboardEvent) => {
			const typing = isTypingTarget(e.target);
			for (const c of list) {
				const mod = hasModKey(e);
				if (e.key.toLowerCase() !== c.key || mod !== c.mod || e.altKey !== c.alt) continue;
				if (c.shift && !e.shiftKey) continue;
				if (typing && !c.mod && !opts.allowInInputs) continue;
				e.preventDefault();
				ref.current(e);
				return;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [combos, opts.enabled, opts.allowInInputs]);
}
