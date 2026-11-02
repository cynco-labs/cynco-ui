import * as React from "react";
import { Button, type ButtonProps } from "../ui/button";
import { cn, getMetaKey } from "../../lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { toAriaKeyShortcuts, useShortcutAllowed } from "../../hooks/use-character-key-shortcuts";
import { useMergedRef } from "../../hooks/use-merged-ref";

export const ShortcutButton = ({
	metaShortcut,
	singleShortcut,
	children,
	isLoading,
	variant,
	ref,
	...props
}: {
	metaShortcut?: string;
	singleShortcut?: string;
	children: React.ReactNode;
	isLoading?: boolean;
	variant?: "primary" | "secondary";
} & ButtonProps) => {
	// A bare printable key (e.g. "n") must not fire while the user is typing in a field, and the
	// user can turn it off entirely with the single-key shortcuts switch (WCAG 2.1.4). ⌘/Ctrl
	// chords and named keys like Escape are unaffected.
	const allowed = useShortcutAllowed();
	const isCharacterKey = !metaShortcut && !!singleShortcut && singleShortcut.length === 1;
	const shortcutActive = metaShortcut ? true : !!singleShortcut && allowed(singleShortcut);

	const buttonRef = React.useRef<HTMLButtonElement | null>(null);
	const setRef = useMergedRef(buttonRef, ref);

	useHotkeys(
		metaShortcut
			? [`mod+${metaShortcut}`]
			: singleShortcut
				? [singleShortcut]
				: [],
		(e) => {
			if (props.disabled || isLoading) return;
			e.preventDefault();
			// A real click, so onClick gets a genuine event and form submit buttons submit.
			buttonRef.current?.click();
		},
		{
			enabled: shortcutActive,
			enableOnFormTags: !isCharacterKey,
		},
	);

	const keystrokeContainer = (keyStroke: string, isEnter = false) => {
		const isSingleChar = keyStroke.length === 1;
		const sizeClasses = isSingleChar ? "w-4" : "px-1";
		const baseClasses = `flex items-center justify-center ${sizeClasses} h-4 rounded-md text-tiny font-medium`;
		const variantClasses =
			variant === "secondary"
				? "bg-muted text-body-secondary"
				: // Outlined, so the key reads on the button's own colour at the button's own text contrast.
					"ring-1 ring-inset ring-primary-foreground/60";

		return (
			<div className={`${baseClasses} ${variantClasses}`}>
				<span
					className={
						isEnter ? "inline-block translate-y-[1px] translate-x-[-0.5px]" : ""
					}
				>
					{keyStroke}
				</span>
			</div>
		);
	};

	const getShortcutDisplay = () => {
		if (metaShortcut) {
			if (metaShortcut === "enter") return "↵";
			if (metaShortcut === "backspace") return "⌫";
			return metaShortcut.toUpperCase();
		}
		if (singleShortcut) {
			if (singleShortcut === "escape") return "Esc";
			return singleShortcut.toUpperCase();
		}
		return "";
	};

	// Only advertise a shortcut that will actually fire.
	const ariaKeyShortcuts = !shortcutActive
		? undefined
		: metaShortcut
			? toAriaKeyShortcuts(`mod+${metaShortcut}`)
			: singleShortcut
				? toAriaKeyShortcuts(singleShortcut)
				: undefined;

	return (
		<Button
			isLoading={isLoading}
			variant={variant}
			aria-keyshortcuts={ariaKeyShortcuts}
			{...props}
			ref={setRef}
			className={cn("gap-1 items-center", props.className)}
		>
			{children}
			{shortcutActive && (
				// Glyphs like ⌘ ↵ read as noise; the shortcut is exposed via aria-keyshortcuts.
				<span aria-hidden="true" className="flex items-center gap-0.5">
					{metaShortcut && keystrokeContainer(getMetaKey())}
					{keystrokeContainer(getShortcutDisplay(), metaShortcut === "enter")}
				</span>
			)}
		</Button>
	);
};
