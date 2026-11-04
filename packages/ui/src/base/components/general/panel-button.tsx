"use client";

import type { ComponentProps, ReactNode } from "react";
import { inputSurfaceClassName } from "../../lib/input-classes";
import { cn } from "../../lib/utils";
import { SelectedMark } from "./selected-mark";

/** Native button props (e.g. `aria-label`, required for this icon-only button) go on the root. */
interface PanelButtonProps extends Omit<ComponentProps<"button">, "onClick" | "className" | "children"> {
	isSelected: boolean;
	onClick: () => void;
	icon: ReactNode;
	className?: string;
}

export function PanelButton({ isSelected, onClick, icon, className = "", ...props }: PanelButtonProps) {
	return (
		<button
			data-slot="panel-button"
			type="button"
			aria-pressed={isSelected}
			{...props}
			onClick={onClick}
			className={cn(
				// Up to 124×72; shrinks with its row down to 80px wide, keeping the proportions.
				"w-full max-w-[124px] min-w-20 aspect-[31/18] relative flex items-center justify-center cursor-pointer",

				// No outline-none: selected and focused share the primary border, so keyboard focus
				// keeps the browser ring and stays distinguishable from selection.
				inputSurfaceClassName,
				// A panel is a raised face, not a field: a thicker border, the page ground, and an inset bevel.
				"rounded-[0.5rem] border-[0.09375rem] bg-background shadow-panel-inset",
				"hover:border-primary focus-visible:border-primary aria-pressed:border-primary",
				className,
			)}
		>
			{isSelected && <SelectedMark />}

			{/* Screws in corners */}
			<div
				className={`absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected ? "bg-primary/20 dark:bg-primary/40" : "bg-border"
				}`}
			/>
			<div
				className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected ? "bg-primary/20 dark:bg-primary/40" : "bg-border"
				}`}
			/>
			<div
				className={`absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected ? "bg-primary/20 dark:bg-primary/40" : "bg-border"
				}`}
			/>
			<div
				className={`absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected ? "bg-primary/20 dark:bg-primary/40" : "bg-border"
				}`}
			/>

			{/* Vertical seams - touch inner border edge */}
			<div className="absolute left-1/4 top-0 bottom-0 w-px bg-subtle/30" />
			<div className="absolute left-1/2 top-0 bottom-0 w-px bg-subtle/30" />
			<div className="absolute left-3/4 top-0 bottom-0 w-px bg-subtle/30" />

			{/* Centered icon */}
			<div
				aria-hidden="true"
				className={cn("size-9 rounded-xl flex items-center justify-center relative bg-interactive-secondary-hover border")}
			>
				<div className={isSelected ? "text-primary" : "text-muted-foreground"}>{icon}</div>
			</div>
		</button>
	);
}
