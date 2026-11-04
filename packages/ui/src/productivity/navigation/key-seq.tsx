"use client";

import * as React from "react";
import { cn } from "../../base";
import { Kbd } from "../../lib/shared";

/**
 * A shortcut as keycaps. `"mod+k"` is one chord; `"g i"` is a sequence (G, then I);
 * an array lists alternatives (`["j", "down"]`).
 */
export function KeySeq({ keys, className }: { keys: string | string[]; className?: string }) {
	const alts = Array.isArray(keys) ? keys : [keys];
	return (
		<span data-slot="cy-key-seq" className={cn("inline-flex shrink-0 items-center gap-1", className)}>
			{alts.map((alt, a) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: a shortcut is a fixed positional sequence of chords
				<React.Fragment key={a}>
					{a > 0 && <span className="text-2xs text-tertiary-foreground">or</span>}
					{alt
						.trim()
						.split(/\s+/)
						.map((chord, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: a shortcut is a fixed positional sequence of chords
							<React.Fragment key={i}>
								{i > 0 && <span className="sr-only">then</span>}
								<Kbd keys={chord} />
							</React.Fragment>
						))}
				</React.Fragment>
			))}
		</span>
	);
}

/**
 * The alternatives that can fire right now: printable-only ones ("?", "g i") drop out while the
 * user has single-key shortcuts turned off (WCAG 2.1.4). Chords with ⌘/Ctrl/Alt always stay.
 */
export function liveKeys(keys: string | string[], allowed: (keys: string) => boolean): string[] {
	return (Array.isArray(keys) ? keys : [keys]).filter(allowed);
}

/** Readable text for a shortcut, used for search ("alt b", "g then i"). */
export const describeKeys = (keys: string | string[]) =>
	(Array.isArray(keys) ? keys : [keys]).map((k) => k.replace(/\+/g, " ").replace(/\bmod\b/g, "mod cmd ctrl")).join(" ");
