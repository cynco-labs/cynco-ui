"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import type * as React from "react";
import {
	inputHeightClassName,
	inputInvalidClassName,
	inputPaddingClassName,
	inputPopupClassName,
	inputSurfaceClassName,
} from "../../lib/input-classes";
import {
	overlayItemClassName,
	overlayItemHighlightClassName,
	overlayItemIndicatorClassName,
	overlayLabelClassName,
	overlayMotionClassName,
	overlaySeparatorClassName,
	overlaySurfaceClassName,
} from "../../lib/overlay-classes";
import { cn } from "../../lib/utils";

function Select({
	onValueChange,
	onOpenChange,
	value,
	defaultValue,
	items,
	...props
}: Omit<SelectPrimitive.Root.Props<string>, "onValueChange" | "onOpenChange"> & {
	/** `null` when the selection is cleared. */
	onValueChange?: (value: string | null) => void;
	onOpenChange?: (open: boolean) => void;
	/** `null` means nothing is selected (the placeholder shows) while staying controlled. */
	value?: string | null;
	defaultValue?: string;
	items?: Record<string, string> | ReadonlyArray<{ label: string; value: string }>;
}) {
	const Root = SelectPrimitive.Root<string>;
	return (
		<Root
			data-slot="select"
			value={value}
			defaultValue={defaultValue}
			items={items}
			onValueChange={onValueChange}
			onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
			{...props}
		/>
	);
}

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
	return <SelectPrimitive.Value data-slot="select-value" className={cn("min-w-0 truncate", className)} {...props} />;
}

function SelectTrigger({
	className,
	size = "md",
	children,
	...props
}: SelectPrimitive.Trigger.Props & {
	/** `md` matches an Input (28px); `sm` is the 24px field for dense toolbars. */
	size?: "sm" | "md";
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				"flex min-w-0 cursor-pointer items-center justify-between gap-2 whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
				inputSurfaceClassName,
				inputPopupClassName,
				inputInvalidClassName,
				size === "sm" ? "h-6 px-1.5 py-0.5" : cn(inputHeightClassName, inputPaddingClassName),
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon>
				<CaretDownIcon className="size-3.5 text-tertiary-foreground" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	align = "start",
	sideOffset = 4,
	side = "bottom",
	...props
}: SelectPrimitive.Popup.Props & {
	align?: "start" | "center" | "end";
	sideOffset?: number;
	side?: "top" | "bottom" | "left" | "right";
}) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				align={align}
				sideOffset={sideOffset}
				side={side}
				alignItemWithTrigger={false}
				positionMethod="fixed"
				className="isolate z-popover outline-none"
			>
				<SelectPrimitive.Popup
					data-slot="select-content"
					className={cn(
						"relative max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-x-hidden overflow-y-auto p-1",
						overlaySurfaceClassName,
						overlayMotionClassName,
						className,
					)}
					{...props}
				>
					{children}
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
	return (
		<SelectPrimitive.GroupLabel data-slot="select-label" className={cn(overlayLabelClassName, className)} {...props} />
	);
}

function SelectItem({
	className,
	children,
	indicator = true,
	...props
}: SelectPrimitive.Item.Props & {
	/** Opt out when the row already reads as selected without a checkmark. */
	indicator?: boolean;
}) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				overlayItemClassName,
				overlayItemHighlightClassName,
				"w-full *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				indicator ? "pr-8" : "pr-2",
				className,
			)}
			{...props}
		>
			{indicator ? (
				<span className={overlayItemIndicatorClassName}>
					<SelectPrimitive.ItemIndicator>
						<CheckIcon className="text-foreground" />
					</SelectPrimitive.ItemIndicator>
				</span>
			) : null}
			<SelectPrimitive.ItemText className="flex items-center gap-2">{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="select-separator"
			className={cn(overlaySeparatorClassName, "pointer-events-none", className)}
			{...props}
		/>
	);
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
