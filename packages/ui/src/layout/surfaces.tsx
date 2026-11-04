"use client";

import type * as React from "react";
import { cn } from "../base";

/** Class names for Cynco UI's table tray: a recessed band holding a raised surface. */
export const surfaces = {
	tray: "rounded-xl border border-table-tray-border bg-table-tray p-1",
	/** `relative` keeps absolutely placed descendants (sr-only text) inside the clip, so they cannot widen the page. */
	surface: "relative overflow-hidden rounded-lg border border-table-surface-border bg-table-surface",
	card: "rounded-xl border border-border bg-card",
	/** Negative figures and error text — readable in every theme. */
	negative: "text-error-text",
} as const;

/** Shorthand: `text-error-text` when the condition holds. */
export const negativeClass = (isNegative: boolean) => (isNegative ? surfaces.negative : undefined);

export type SectionPanelProps = Omit<React.ComponentProps<"section">, "title"> & {
	title?: React.ReactNode;
	description?: React.ReactNode;
	/** Rendered at the right of the header; wraps under the title on narrow containers. */
	actions?: React.ReactNode;
	/** Remove body padding (for tables and lists that run edge to edge). */
	flush?: boolean;
};

/** A titled card. The header wraps its actions under the title when space runs out. */
export function SectionPanel({ title, description, actions, flush, className, children, ...props }: SectionPanelProps) {
	return (
		<section data-slot="cy-panel" className={cn("@container min-w-0", surfaces.card, className)} {...props}>
			{(title || actions) && (
				<header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4">
					<div className="min-w-0">
						{title && <h3 className="text-md font-semibold text-foreground">{title}</h3>}
						{description && <p className="mt-0.5 text-xs text-tertiary-foreground">{description}</p>}
					</div>
					{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
				</header>
			)}
			<div className={cn(flush ? "pt-3" : "p-4", !title && !actions && !flush && "pt-4")}>{children}</div>
		</section>
	);
}

/** Focus ring for a scroll viewport that became a tab stop; inset so an overflow-hidden parent keeps it. */
export const SCROLL_STOP_RING = "outline-none focus-ring-inset";
