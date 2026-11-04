"use client";

import type * as React from "react";
import { cn } from "../base";

/** A row of controls that wraps instead of overflowing. */
export function ActionBar({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="cy-action-bar" className={cn("flex min-w-0 flex-wrap items-center gap-2", className)} {...props} />
	);
}
