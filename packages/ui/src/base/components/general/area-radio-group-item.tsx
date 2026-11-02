"use client";

import { RadioGroupItem } from "../ui/radio-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";
import { useId } from "react";

interface AreaRadioGroupItemProps {
	className?: string;
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
}: AreaRadioGroupItemProps) {
	const id = useId();
	const reasonId = `${id}-reason`;

	const isDisabled = disabled || !!disabledReason;

	const content = (
		<label
			className={cn(
				"flex items-start space-x-[6px] cursor-pointer",
				isDisabled && "cursor-not-allowed",
				className,
			)}
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
					<span
						className={cn("text-checkbox-label", isDisabled && "opacity-50")}
					>
						{label}
					</span>
				</div>
				{description && (
					<p className="text-body-sec-paragraph">{description}</p>
				)}
			</div>
		</label>
	);

	if (disabledReason) {
		return (
			<Tooltip>
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
