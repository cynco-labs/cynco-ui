"use client";

import { cn } from "../../lib/utils";
import type * as React from "react";

export interface GroupedTabButtonProps<V extends string = string> extends Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onChange"> {
	value: V;
	onValueChange: (value: V) => void;
	options: Array<{
		value: V;
		label?: React.ReactNode;
		icon?: React.ReactNode;
		ariaLabel?: string;
		disabled?: boolean;
	}>;
	className?: string;
	buttonClassName?: string;
	disabled?: boolean;
}

export const GroupedTabButton = <V extends string = string>({
	value,
	onValueChange,
	options,
	className,
	buttonClassName,
	disabled,
	...props
}: GroupedTabButtonProps<V>) => {
	return (
		// A group of toggle buttons: pass aria-label (or aria-labelledby) to name it.
		<div
			role="group"
			{...props}
			className={cn(
				"flex items-center gap-0.5 rounded-lg border border-table-tray-border bg-table-tray p-0.5",
				className,
			)}
		>
			{options.map((option) => {
				const isActive = value === option.value;

				return (
					<button
						key={option.value}
						type="button"
						aria-label={option.ariaLabel}
						aria-pressed={isActive}
						disabled={disabled || option.disabled}
						onClick={() => onValueChange(option.value)}
						className={cn(
							"flex h-6 w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 text-tertiary-foreground outline-none transition-colors duration-150",
							"hover:text-foreground focus-visible:text-foreground focus-visible:border-primary",
							"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
							isActive &&
								"border-table-surface-border bg-table-surface text-foreground shadow-segment",
							buttonClassName,
						)}
					>
						{option.icon && (
							<span
								aria-hidden="true"
								className="flex size-[14px] items-center justify-center"
							>
								{option.icon}
							</span>
						)}
						{option.label != null && (
							<span className="text-sm font-medium">{option.label}</span>
						)}
					</button>
				);
			})}
		</div>
	);
};
