"use client";

import { useEffect, useState } from "react";

/**
 * Measures an element's own width with a ResizeObserver. Attach `ref` to the element you want
 * measured; `width` is undefined until the first measurement, which covers every server render and
 * the first client one.
 *
 * It hands back a callback ref rather than taking a RefObject on purpose: a layout that swaps one
 * root for another would otherwise keep observing the element it already unmounted, and the width
 * would freeze at whatever triggered the swap.
 *
 * Reach for this only where a layout changes structure, not just styling: a table that becomes
 * cards, a list that becomes a different shape. Styling follows the container through `@sm:`…`@3xl:`
 * classes. Neither reads the viewport, so a component narrows with its own column.
 */
export function useContainerWidth<T extends HTMLElement>(): {
	ref: (element: T | null) => void;
	width: number | undefined;
} {
	const [element, setElement] = useState<T | null>(null);
	const [width, setWidth] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (!element) return;

		const observer = new ResizeObserver(([entry]) => {
			if (entry) setWidth(entry.contentRect.width);
		});
		observer.observe(element);
		setWidth(element.getBoundingClientRect().width);

		return () => observer.disconnect();
	}, [element]);

	return { ref: setElement, width };
}
