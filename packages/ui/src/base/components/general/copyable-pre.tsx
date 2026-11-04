"use client";

import type React from "react";
import { cn } from "../../lib/utils";
import { CopyButton } from "./copy-button";

/** A code block with a copy button pinned to its corner. For a single value inline, use `CopyButton`. */
export function CopyablePre({
	text,
	className,
	...props
}: Omit<React.ComponentProps<"div">, "children"> & { text: string }) {
	return (
		<div data-slot="copyable-pre" className={cn("relative w-full min-w-0", className)} {...props}>
			<pre className="text-sm bg-muted/50 p-4 rounded-lg overflow-auto border w-full h-full">
				<CopyButton variant="icon" text={text} side="left" className="absolute top-2 right-2 z-10" />
				<code className="text-sm block w-full whitespace-pre-wrap [overflow-wrap:anywhere]">{text}</code>
			</pre>
		</div>
	);
}
