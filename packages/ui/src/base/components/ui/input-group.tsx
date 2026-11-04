/** biome-ignore-all lint/a11y/useKeyWithClickEvents: shadcn */
/** biome-ignore-all lint/a11y/useSemanticElements: shadcn */
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import {
	inputFocusWithinClassName,
	inputHeightClassName,
	inputInvalidClassName,
	inputSurfaceClassName,
} from "../../lib/input-classes";
import { cn } from "../../lib/utils";
import { LongInput as Textarea } from "../general/long-input";
import { Button } from "./button";
import { Input } from "./input";

function InputGroup({ className, onFocus, onBlur, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-group"
			role="group"
			className={cn(
				"group/input-group relative flex w-full cursor-text items-center pr-0",
				inputSurfaceClassName,
				inputHeightClassName,
				inputFocusWithinClassName,
				inputInvalidClassName,

				// Variants based on alignment.
				"has-[>[data-align=inline-start]]:[&>input]:pl-2",
				"has-[>[data-align=inline-end]]:[&>input]:pr-2",
				"has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
				"has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

				// A control inside the group reports invalid, so the frame around it draws the state.
				"has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:focus-within:shadow-input-destructive",

				// Disabled state
				"data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",

				className,
			)}
			onClick={(e) => {
				if ((e.target as HTMLElement).closest("button")) {
					return;
				}
				const input = e.currentTarget.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
				input?.focus();
			}}
			{...props}
		/>
	);
}

const inputGroupAddonVariants = cva(
	"text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
	{
		variants: {
			align: {
				"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
				"inline-end": "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
				"block-start": "order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
				"block-end": "order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	},
);

function InputGroupAddon({
	className,
	align = "inline-start",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
	return (
		<div
			role="group"
			data-slot="input-group-addon"
			data-align={align}
			className={cn(inputGroupAddonVariants({ align }), className)}
			onClick={(e) => {
				if ((e.target as HTMLElement).closest("button")) {
					return;
				}
				e.currentTarget.parentElement?.querySelector("input")?.focus();
			}}
			{...props}
		/>
	);
}

const inputGroupButtonVariants = cva("text-sm shadow-none flex gap-2 items-center", {
	variants: {
		size: {
			sm: "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
			md: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
			"icon-sm": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
			"icon-md": "size-8 p-0 has-[>svg]:p-0",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

function InputGroupButton({
	className,
	type = "button",
	size = "sm",
	...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
	return (
		<Button type={type} data-size={size} className={cn(inputGroupButtonVariants({ size }), className)} {...props} />
	);
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<Input
			data-slot="input-group-control"
			className={cn("flex-1 rounded-none", className)}
			variant="headless"
			{...props}
		/>
	);
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<Textarea
			data-slot="input-group-control"
			className={cn(
				"min-h-0 flex-1 resize-none rounded-none border-transparent bg-transparent py-3 shadow-none hover:border-transparent focus:border-transparent focus:shadow-none",
				className,
			)}
			{...props}
		/>
	);
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };
