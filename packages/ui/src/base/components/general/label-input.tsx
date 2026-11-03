"use client";

import { Input } from "../ui/input";
import type React from "react";
import { useId } from "react";

export const LabelInput = ({
	label,
	description,
	placeholder,
	className,
	...props
}: {
	label: string | React.ReactElement<typeof HTMLSpanElement>;
	description?: string;
	placeholder: string;
} & React.ComponentProps<"input">) => {
	const generatedId = useId();
	const inputId = props.id ?? generatedId;
	const descriptionId = `${inputId}-description`;
	const describedBy =
		[description ? descriptionId : undefined, props["aria-describedby"]]
			.filter(Boolean)
			.join(" ") || undefined;

	return (
		<div className={className}>
			<label htmlFor={inputId} className="text-form-label block mb-1">
				{label}
			</label>
			{description && (
				<p id={descriptionId} className="text-tertiary-foreground text-xs mb-1">
					{description}
				</p>
			)}
			<Input
				placeholder={placeholder}
				{...props}
				id={inputId}
				aria-describedby={describedBy}
			/>
		</div>
	);
};
