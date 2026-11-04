import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";

const alertVariants = cva(
	"@container group/alert relative grid w-full gap-0.5 rounded-xl border px-3.5 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "border-status-neutral/15 bg-status-neutral/[0.04] text-foreground/80 *:[svg]:text-tertiary-foreground",
				note: "border-status-blue/15 bg-status-blue/[0.04] text-foreground/80 *:[svg]:text-primary",
				success: "border-status-green/15 bg-status-green/[0.04] text-foreground/80 *:[svg]:text-status-green-text",
				warning: "border-status-amber/15 bg-status-amber/[0.04] text-foreground/80 *:[svg]:text-status-amber-text",
				destructive: "border-status-red/15 bg-status-red/[0.04] text-foreground/80 *:[svg]:text-error-text",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			// Only errors interrupt; notes, successes and warnings are polite. Pass `role` to override.
			role={variant === "destructive" ? "alert" : "status"}
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"text-sm text-balance @md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
				className,
			)}
			{...props}
		/>
	);
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="alert-action" className={cn("absolute top-2 right-2", className)} {...props} />;
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
