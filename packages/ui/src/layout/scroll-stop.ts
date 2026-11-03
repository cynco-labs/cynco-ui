"use client";

import * as React from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

/**
 * True while `ref` overflows and holds nothing focusable. Such a scroller needs its own tab stop,
 * or keyboard users (Safari, older Chrome) can't scroll to the hidden part. Re-checked when the
 * scroller resizes or its content is added or removed, not on every render.
 */
export function useNeedsScrollStop<E extends HTMLElement>(ref: React.RefObject<E | null>) {
	const [needs, setNeeds] = React.useState(false);
	React.useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const check = () => {
			const overflows = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
			setNeeds(overflows && !el.querySelector(FOCUSABLE));
		};
		check();
		const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(check);
		resize?.observe(el);
		const content = new MutationObserver(check);
		content.observe(el, { childList: true, subtree: true });
		return () => {
			resize?.disconnect();
			content.disconnect();
		};
	}, [ref]);
	return needs;
}
