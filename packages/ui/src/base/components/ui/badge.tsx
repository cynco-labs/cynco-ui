"use client";

import { cn } from "../../lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
	"inline-flex items-center rounded-lg border border-border px-1.5 py-0.5 text-body-secondary",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-foreground text-background shadow hover:bg-foreground/80",

				muted: "bg-muted border border-border/50",
				secondary:
					"border-transparent bg-muted text-foreground hover:bg-muted/80",
			},
			size: {
				default: "px-1.5 py-0.5 text-xs",
				sm: "px-1.5 py-0.5 text-2xs",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Badge({
	className,
	variant,
	size,
	asChild = false,
	render: renderProp,
	...props
}: useRender.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	return useRender({
		defaultTagName: "span",
		props: mergeProps<"span">(
			{
				className: cn(badgeVariants({ variant, size }), className),
			},
			props,
		),
		render: renderProp,
		state: {
			slot: "badge",
			variant,
		},
	});
}

export { Badge };
