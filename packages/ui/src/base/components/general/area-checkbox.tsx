/** biome-ignore-all lint/a11y/noStaticElementInteractions: shush */
"use client";

import { Checkbox } from "../ui/checkbox";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../ui/tooltip";
import { useControllableState } from "../../hooks/use-controllable-state";
import { cn } from "../../lib/utils";
import React from "react";

type AreaCheckboxProps = Omit<React.ComponentProps<"div">, "title" | "children" | "defaultChecked"> & {
	checked?: boolean;
	/** Initial state for uncontrolled use. */
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	title: string;
	disabled?: boolean;
	disabledReason?: string;
	hide?: boolean;
	description?: string;
	children?: React.ReactNode;
};

function AreaCheckbox({
	checked: checkedProp,
	defaultChecked = false,
	onCheckedChange,
	title,
	disabled = false,
	disabledReason,
	hide = false,
	description,
	children,
	className,
	...props
}: AreaCheckboxProps) {
	const [checked = false, setChecked] = useControllableState({ prop: checkedProp, defaultProp: defaultChecked, onChange: onCheckedChange });
	const id = React.useId();
	const reasonId = `${id}-reason`;

	if (hide) return null;

	const isDisabled = disabled || !!disabledReason;

	const content = (
		<div className={cn("flex items-start gap-[6px] text-sm", className)} {...props}>
			<Checkbox
				id={id}
				checked={checked}
				onCheckedChange={(next) => {
					if (!isDisabled) setChecked(next === true);
				}}
				disabled={isDisabled}
				aria-describedby={disabledReason ? reasonId : undefined}
				size="sm"
				className="mt-[3px]"
			/>

			<div className="flex flex-col w-full">
				<label
					htmlFor={id}
					className={cn(
						"text-muted-foreground font-medium select-none w-fit",
						!isDisabled && "hover:text-foreground",
						isDisabled && "cursor-not-allowed opacity-50",
					)}
				>
					{title}
				</label>
				{/* Expanded content */}
				{(children || description) && (
					<div
						// Collapsed content stays mounted for the height transition; inert keeps
						// its controls out of the tab order and the accessibility tree.
						inert={!checked}
						className={cn(
							"grid transition-all duration-200",
							checked
								? "grid-rows-[1fr] opacity-100"
								: "grid-rows-[0fr] opacity-0",
						)}
					>
						<div className="overflow-hidden space-y-2">
							{description && (
								<p className="text-tertiary-foreground">{description}</p>
							)}
							{children}
						</div>
					</div>
				)}
			</div>
		</div>
	);

	if (disabledReason) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div>{content}</div>
				</TooltipTrigger>
				<TooltipContent side="left" className="max-w-60">
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

export { AreaCheckbox };
