"use client";

import { XIcon } from "@phosphor-icons/react";
import {
	Select,
	SelectContent,
	SelectTrigger,
} from "../ui/select";
import { cn } from "../../lib/utils";
import * as React from "react";

interface TagSelectOption {
	value: string;
	label: string;
}

/** Lets a form label the trigger and point it at an error message. */
type TagSelectA11yProps = Pick<
	React.ComponentProps<"button">,
	"id" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid"
>;

/** Controlled only: you add values from `renderContent`; the chips' remove buttons report through `onValueChange`. */
interface TagSelectProps extends TagSelectA11yProps {
	value: string[];
	onValueChange: (values: string[]) => void;
	options: TagSelectOption[];
	placeholder?: string;
	formatTag?: (value: string) => string;
	renderContent?: (setOpen: (open: boolean) => void) => React.ReactNode;
	showAllProducts?: boolean;
	/** Classes for the field box (the root). */
	className?: string;
}

/**
 * The trigger fills the field box from behind; the chips sit above it as siblings, so each remove
 * button is its own control rather than a button nested inside the combobox. Clicks that miss a
 * remove button fall through to the trigger.
 */
export function TagSelect({
	value = [],
	onValueChange,
	options,
	placeholder = "Select...",
	formatTag,
	renderContent,
	showAllProducts = false,
	className,
	...a11yProps
}: TagSelectProps) {
	const [open, setOpen] = React.useState(false);
	const triggerRef = React.useRef<HTMLButtonElement>(null);

	const getLabel = (val: string) => {
		const option = options.find((opt) => opt.value === val);
		return formatTag ? formatTag(val) : option?.label || val;
	};

	const removeTag = (tagValue: string, button: HTMLButtonElement) => {
		// The button unmounts; hand focus to the neighbouring chip, else the trigger.
		const item = button.closest("li");
		const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;
		const next = neighbour?.querySelector("button") ?? triggerRef.current;
		next?.focus();
		onValueChange(value.filter((v) => v !== tagValue));
	};

	const showTags = !showAllProducts && value.length > 0;

	return (
		<div className={cn("relative w-full min-h-input", className)}>
			<Select open={open} onOpenChange={setOpen}>
				<SelectTrigger
					{...a11yProps}
					ref={triggerRef}
					className="absolute inset-0 h-auto w-full"
				>
					<span className="min-w-0 flex-1 truncate text-left">
						{showAllProducts ? (
							<span className="text-muted-foreground">All Products</span>
						) : showTags ? (
							<span className="sr-only">{value.length} selected</span>
						) : (
							<span className="text-placeholder">{placeholder}</span>
						)}
					</span>
				</SelectTrigger>
				<SelectContent className="w-[var(--anchor-width)] max-w-[var(--anchor-width)]">
					{renderContent?.(setOpen)}
				</SelectContent>
			</Select>
			{showTags && (
				// pointer-events-none: only the remove buttons take clicks; the rest reach the trigger.
				<ul className="pointer-events-none relative flex flex-wrap items-center gap-2 py-2 pl-2 pr-8">
					{value.map((val) => {
						const label = getLabel(val);
						return (
							<li
								key={val}
								className="flex min-w-0 max-w-full items-center gap-1 border border-border bg-background rounded-lg pl-3 pr-2 py-1 text-xs"
							>
								<span className="truncate max-w-[280px] text-tiny">{label}</span>
								<button
									type="button"
									aria-label={`Remove ${label}`}
									// 24×24 target (WCAG 2.5.8); negative margins keep the chip's size.
									className="pointer-events-auto -my-1.5 -mr-1.5 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm focus-ring"
									onClick={(e) => removeTag(val, e.currentTarget)}
								>
									<XIcon aria-hidden="true" className="size-3 text-subtle" />
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
