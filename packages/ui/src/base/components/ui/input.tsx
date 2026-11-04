"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import {
	inputFocusClassName,
	inputHeightClassName,
	inputInvalidClassName,
	inputPaddingClassName,
	inputSurfaceClassName,
} from "../../lib/input-classes";
import { cn } from "../../lib/utils";

const inputVariants = cva(
	cn(
		"w-full min-w-0 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground selection:bg-primary selection:text-primary-foreground",
		inputSurfaceClassName,
		inputHeightClassName,
		inputPaddingClassName,
	),
	{
		variants: {
			variant: {
				default: inputFocusClassName,
				destructive: cn(
					inputFocusClassName,
					"border-destructive hover:border-destructive focus:border-destructive focus:shadow-input-destructive",
				),
				/** No surface of its own: for a field already framed by its container, such as a table cell. */
				headless: "border-transparent bg-transparent p-0 px-0.5 shadow-none",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface InputProps extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, ...props }: InputProps) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(inputVariants({ variant }), inputInvalidClassName, className)}
			{...props}
		/>
	);
}

export { Input };
