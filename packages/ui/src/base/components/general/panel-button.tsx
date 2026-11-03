"use client";

import { cn } from "../../lib/utils";
import { SelectedMark } from "./selected-mark";
import type { ComponentProps, ReactNode } from "react";

/** Native button props (e.g. `aria-label`, required for this icon-only button) go on the root. */
interface PanelButtonProps
	extends Omit<ComponentProps<"button">, "onClick" | "className" | "children"> {
	isSelected: boolean;
	onClick: () => void;
	icon: ReactNode;
	className?: string;
}

export function PanelButton({
	isSelected,
	onClick,
	icon,
	className = "",
	...props
}: PanelButtonProps) {
	return (
		<button
			type="button"
			aria-pressed={isSelected}
			{...props}
			onClick={onClick}
			data-state={isSelected ? "open" : "closed"}
			className={cn(
				// Up to 124×72; shrinks with its row down to 80px wide, keeping the proportions.
				"w-full max-w-[124px] min-w-20 aspect-[31/18] relative flex items-center justify-center cursor-pointer",

				// Thicker border for panel effect
				"!rounded-[0.5rem] !border-[0.09375rem]",
				// Custom panel shadows
				"shadow-panel-inset",

				// Design system classes (following Select pattern)
				// No outline-none: selected and focused share the primary border, so keyboard
				// focus keeps the browser ring to stay distinguishable from selection.
				"input-base input-shadow-default input-state-open !bg-background",
				"hover:!border-primary focus-visible:!border-primary data-[state=open]:!border-primary",
				className,
			)}
		>
			{isSelected && <SelectedMark />}

			{/* Screws in corners */}
			<div
				className={`absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected
						? "bg-primary/20 dark:bg-primary/40"
						: "bg-border"
				}`}
			/>
			<div
				className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected
						? "bg-primary/20 dark:bg-primary/40"
						: "bg-border"
				}`}
			/>
			<div
				className={`absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected
						? "bg-primary/20 dark:bg-primary/40"
						: "bg-border"
				}`}
			/>
			<div
				className={`absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
					isSelected
						? "bg-primary/20 dark:bg-primary/40"
						: "bg-border"
				}`}
			/>

			{/* Vertical seams - touch inner border edge */}
			<div className="absolute left-1/4 top-0 bottom-0 w-px bg-subtle/30" />
			<div className="absolute left-1/2 top-0 bottom-0 w-px bg-subtle/30" />
			<div className="absolute left-3/4 top-0 bottom-0 w-px bg-subtle/30" />

			{/* Centered icon */}
			<div
				aria-hidden="true"
				className={cn(
					"size-9 rounded-xl flex items-center justify-center relative bg-interactive-secondary-hover border",
				)}
			>
				<div className={isSelected ? "text-primary" : "text-muted-foreground"}>
					{icon}
				</div>
			</div>
		</button>
	);
}
