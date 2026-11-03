"use client";

import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShortcutAllowed } from "./use-character-key-shortcuts";

/**
 * Hook to toggle a dropdown open/closed with a keyboard shortcut
 */
export function useDropdownShortcut({
	shortcut,
	isOpen,
	setIsOpen,
	enabled = true,
}: {
	shortcut: string;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	enabled?: boolean;
}) {
	const allowed = useShortcutAllowed();
	useHotkeys(
		shortcut,
		(e) => {
			e.preventDefault();
			setIsOpen(!isOpen);
		},
		{
			// A bare letter honours the user's "Single-key shortcuts" switch (WCAG 2.1.4).
			enabled: enabled && allowed(shortcut),
			enableOnFormTags: false,
		},
	);
}

export type ShortcutEntry = { key: string; handler: () => void };

/**
 * Capture-phase keydown listener that fires registered shortcuts
 * before Base UI's typeahead can intercept them.
 */
export function useMenuShortcuts(isOpen: boolean, close: () => void) {
	const shortcuts = useRef<ShortcutEntry[]>([]);

	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}
			const match = shortcuts.current.find(
				(s) => s.key.toLowerCase() === e.key.toLowerCase(),
			);
			if (match) {
				e.preventDefault();
				e.stopPropagation();
				match.handler();
				close();
			}
		};
		document.addEventListener("keydown", handler, true);
		return () => document.removeEventListener("keydown", handler, true);
	}, [isOpen, close]);

	return { shortcuts, close };
}
