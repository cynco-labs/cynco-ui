"use client";

import * as React from "react";
import { useControllableState } from "../../hooks/use-controllable-state";
import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ConditionalTooltip } from "./conditional-tooltip";

type AreaCheckboxProps = Omit<React.ComponentProps<"div">, "title" | "defaultChecked"> & {
	checked?: boolean;
	/** Initial state for uncontrolled use. */
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	title: string;
	disabled?: boolean;
	/** Disables the choice and says why, on a tooltip and to screen readers. */
	disabledReason?: string;
	description?: string;
	/** Revealed while the box is checked: the settings that only apply once it is on. */
	children?: React.ReactNode;
};

/**
 * A checkbox whose label heads a block of nested settings. The block stays mounted so its height can
 * animate, and `inert` keeps it out of the tab order and the accessibility tree while it is collapsed.
 */
function AreaCheckbox({
	checked: checkedProp,
	defaultChecked = false,
	onCheckedChange,
	title,
	disabled = false,
	disabledReason,
	description,
	children,
	className,
	...props
}: AreaCheckboxProps) {
	const [checked = false, setChecked] = useControllableState({
		prop: checkedProp,
		defaultProp: defaultChecked,
		onChange: onCheckedChange,
	});
	const id = React.useId();
	const reasonId = `${id}-reason`;
	const isDisabled = disabled || !!disabledReason;

	return (
		<ConditionalTooltip enabled={!!disabledReason} content={disabledReason} className="max-w-60">
			<div data-slot="area-checkbox" className={cn("flex items-start gap-[6px] text-sm", className)} {...props}>
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
				<div className="flex w-full flex-col">
					<Label
						htmlFor={id}
						className={cn(
							"w-fit text-muted-foreground",
							!isDisabled && "hover:text-foreground",
							isDisabled && "cursor-not-allowed opacity-50",
						)}
					>
						{title}
					</Label>
					{(children || description) && (
						<div
							inert={!checked}
							className={cn(
								"grid transition-[grid-template-rows,opacity] duration-200",
								checked ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
							)}
						>
							<div className="overflow-hidden space-y-2">
								{description && <p className="text-tertiary-foreground">{description}</p>}
								{children}
							</div>
						</div>
					)}
				</div>
				{disabledReason && (
					<span id={reasonId} hidden>
						{disabledReason}
					</span>
				)}
			</div>
		</ConditionalTooltip>
	);
}

export { AreaCheckbox };
