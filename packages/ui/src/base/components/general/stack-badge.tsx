"use client";

import type * as React from "react";
import { cn } from "../../lib/utils";
import { SelectedMark } from "./selected-mark";

interface StackBadgeProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
	stack: string;
	asset?: string;
	icon?: React.ReactNode;
	isSelected?: boolean;
	onClick?: () => void;
	onSelectedChange?: (selected: boolean) => void;
	className?: string;
}

export function StackBadge({
	stack,
	asset,
	icon,
	isSelected = false,
	onClick,
	onSelectedChange,
	className,
	...props
}: StackBadgeProps) {
	const isClickable = !!(onClick || onSelectedChange);
	// A toggle exposes its state through aria-pressed; anything else says it in text.
	const isToggle = !!onSelectedChange;

	const handleClick = () => {
		if (!isClickable) return;
		onSelectedChange?.(!isSelected);
		onClick?.();
	};

	const Component = isClickable ? "button" : "div";

	return (
		<Component
			data-slot="stack-badge"
			{...props}
			type={isClickable ? "button" : undefined}
			onClick={isClickable ? handleClick : undefined}
			aria-pressed={isToggle ? isSelected : undefined}
			data-state={isSelected ? "selected" : "unselected"}
			className={cn(
				"relative pr-2 rounded-md shadow-bevel outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-1.5 transition-none",
				isSelected ? "bg-interactive-secondary outline-primary" : "bg-interactive-secondary outline-border",
				isClickable && !isSelected && "hover:outline-primary cursor-pointer",
				isClickable && "focus-ring",
				className,
			)}
		>
			<div
				className={cn(
					"size-auto p-1 rounded-tl rounded-bl shadow-bevel-pressed outline outline-1 outline-offset-[-1px] flex justify-center items-center gap-2.5",
					isSelected ? "bg-interactive-secondary outline-primary" : "bg-interactive-secondary outline-border",
				)}
			>
				{asset ? (
					// Decorative: the stack name is the visible text beside it.
					<img className="w-4 h-4" src={asset} alt="" />
				) : (
					<div aria-hidden="true" className="w-4 h-4 flex items-center justify-center">
						{icon}
					</div>
				)}
			</div>
			<div className={cn("justify-start text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
				{stack}
				{isSelected && !isToggle && <span className="sr-only"> (selected)</span>}
			</div>
			{isSelected && <SelectedMark />}
		</Component>
	);
}
