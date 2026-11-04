"use client";

import * as React from "react";
import { cn, useMergedRef } from "../base";
import { useNeedsScrollStop } from "./scroll-stop";
import { SCROLL_STOP_RING } from "./surfaces";

/**
 * A single row that scrolls sideways when it doesn't fit (tabs, chips, steppers). When it overflows
 * with nothing focusable inside, it becomes a tab stop so the keyboard can scroll it — pass
 * `aria-label` so that stop has a name.
 */
export function ScrollRow({ className, ref, role, tabIndex, ...props }: React.ComponentProps<"div">) {
	const inner = React.useRef<HTMLDivElement>(null);
	const setRef = useMergedRef(inner, ref);
	const needsStop = useNeedsScrollStop(inner);
	const named = props["aria-label"] != null || props["aria-labelledby"] != null;
	return (
		<div
			ref={setRef}
			data-slot="cy-scroll-row"
			role={role ?? (needsStop && named ? "group" : undefined)}
			tabIndex={tabIndex ?? (needsStop ? 0 : undefined)}
			className={cn(
				"relative flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				SCROLL_STOP_RING,
				className,
			)}
			{...props}
		/>
	);
}
