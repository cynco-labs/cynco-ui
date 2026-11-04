"use client";

import * as React from "react";
import { cn } from "../base";
import { useIsMac } from "../base/hooks/use-platform";

/** Spoken names for keycap glyphs: screen readers read "⌘" or "↵" as symbol names, or skip them. */
const KEY_NAME: Record<string, string> = {
	"⌘": "Command",
	"⌥": "Option",
	"⇧": "Shift",
	"↵": "Enter",
	"↑": "Up arrow",
	"↓": "Down arrow",
	"←": "Left arrow",
	"→": "Right arrow",
	"⌫": "Backspace",
};

/** A keycap. `mod` renders ⌘ on Mac and Ctrl elsewhere. */
export function Kbd({
	keys,
	className,
	...props
}: Omit<React.ComponentProps<"kbd">, "children"> & { keys: string | string[] }) {
	const mac = useIsMac();
	const list = (Array.isArray(keys) ? keys : keys.split("+")).map((k) => {
		const l = k.toLowerCase();
		if (l === "mod") return mac ? "⌘" : "Ctrl";
		if (l === "alt") return mac ? "⌥" : "Alt";
		if (l === "shift") return "⇧";
		if (l === "enter") return "↵";
		if (l === "esc" || l === "escape") return "Esc";
		if (l === "up") return "↑";
		if (l === "down") return "↓";
		if (l === "left") return "←";
		if (l === "right") return "→";
		return k.length === 1 ? k.toUpperCase() : k;
	});
	return (
		<kbd data-slot="cy-kbd" className={cn("inline-flex items-center gap-0.5 font-sans", className)} {...props}>
			{list.map((k, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: a chord is a fixed positional sequence of key names
				<React.Fragment key={i}>
					<span
						aria-hidden={KEY_NAME[k] ? true : undefined}
						className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md border border-border bg-interactive-secondary px-1 text-2xs font-medium text-muted-foreground shadow-[0_1px_0_var(--border)]"
					>
						{k}
					</span>
					{KEY_NAME[k] && <span className="sr-only">{KEY_NAME[k]}</span>}
				</React.Fragment>
			))}
		</kbd>
	);
}
