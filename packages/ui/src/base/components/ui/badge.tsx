"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-lg border border-border px-1.5 py-0.5 text-sm text-subtle",
	{
		variants: {
			variant: {
				default: "border-transparent bg-foreground text-background shadow hover:bg-foreground/80",
				muted: "bg-muted border border-border/50",
				secondary: "border-transparent bg-muted text-foreground hover:bg-muted/80",
			},
			size: {
				/** 12px type, matching the surrounding body text. */
				md: "px-1.5 py-0.5 text-xs",
				/** 11px type, for a badge that rides inside a dense row. */
				sm: "px-1.5 py-0.5 text-2xs",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

/** `data-*` is valid on a DOM element but absent from React's object prop types, so it is named here. */
const SLOT = { "data-slot": "badge" } as React.HTMLAttributes<HTMLSpanElement>;

function Badge({
	className,
	variant,
	size,
	asChild = false,
	render,
	children,
	...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return useRender({
		defaultTagName: "span",
		props: mergeProps<"span">(
			{ ...SLOT, className: cn(badgeVariants({ variant, size }), className) },
			{ ...props, ...(element === children ? {} : { children }) },
		),
		render: element,
		state: { variant },
	});
}

export { Badge };
