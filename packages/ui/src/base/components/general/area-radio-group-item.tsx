"use client";

import type * as React from "react";
import { useId } from "react";
import { cn } from "../../lib/utils";
import { RadioGroupItem } from "../ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface AreaRadioGroupItemProps extends Omit<React.ComponentProps<"label">, "children"> {
	value: string;
	label: string;
	description?: string;
	disabled?: boolean;
	disabledReason?: string;
}

function AreaRadioGroupItem({
	className,
	value,
	label,
	description,
	disabled = false,
	disabledReason,
	...props
}: AreaRadioGroupItemProps) {
	const id = useId();
	const reasonId = `${id}-reason`;

	const isDisabled = disabled || !!disabledReason;

	const content = (
		<label
			htmlFor={id}
			data-slot="area-radio-group-item"
			className={cn("flex items-start space-x-[6px] cursor-pointer", isDisabled && "cursor-not-allowed", className)}
			{...props}
		>
			<RadioGroupItem
				value={value}
				id={id}
				className="mt-[3px]"
				disabled={isDisabled}
				aria-describedby={disabledReason ? reasonId : undefined}
			/>
			<div className="flex-1 space-y-1">
				<div className="flex items-center gap-2">
					<span className={cn("text-sm font-semibold text-muted-foreground", isDisabled && "opacity-50")}>{label}</span>
				</div>
				{description && <p className="text-sm font-medium text-tertiary-foreground">{description}</p>}
			</div>
		</label>
	);

	if (disabledReason) {
		return (
			<Tooltip data-slot="area-radio-group-item">
				<TooltipTrigger asChild>
					<div>{content}</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="max-w-60">
					{disabledReason}
				</TooltipContent>
				<span id={reasonId} hidden>
					{disabledReason}
				</span>
			</Tooltip>
		);
	}

	return content;
}

export { AreaRadioGroupItem };
