"use client";

import { iconButtonVariants } from "./icon-button";
import { useControllableState } from "../../hooks/use-controllable-state";
import { Button, type ButtonProps } from "../ui/button";
import { cn, hasSubmitShortcutModifier } from "../../lib/utils";
import type { VariantProps } from "class-variance-authority";
import { SelectedMark } from "./selected-mark";
import * as React from "react";

interface IconCheckboxProps
	extends ButtonProps,
		VariantProps<typeof iconButtonVariants> {
	checked?: boolean;
	/** Initial state for uncontrolled use. */
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	icon?: React.ReactNode;
	iconOrientation?: "left" | "center" | "right";
}

const IconCheckbox = React.forwardRef<HTMLButtonElement, IconCheckboxProps>(
	(
		{
			className,
			variant = "secondary",
			size = "sm",
			hide = false,
			iconOrientation = "center",
			asChild = false,
			checked: checkedProp,
			defaultChecked = false,
			onCheckedChange,
			icon,
			onClick,
			onKeyDown,
			children,
			...props
		},
		ref,
	) => {
		const [checked = false, setChecked] = useControllableState({ prop: checkedProp, defaultProp: defaultChecked, onChange: onCheckedChange });
		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			setChecked(!checked);
			onClick?.(event);
			// Remove focus after a pointer click to prevent stuck active state. Keyboard
			// activation (detail 0) keeps focus so keyboard users don't lose their place.
			if (event.detail > 0) event.currentTarget.blur();
		};

		const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
			// Suppress the native button click without toggling, so
			// cmd/ctrl+enter only triggers sheet-level submit shortcuts
			if (event.key === "Enter" && hasSubmitShortcutModifier(event)) {
				event.preventDefault();
			}
			onKeyDown?.(event);
		};

		const renderIcon = (icon: React.ReactNode) => {
			if (!icon) return null;

			if (
				React.isValidElement<{ className?: string; "aria-label"?: string }>(
					icon,
				)
			) {
				return React.cloneElement(icon, {
					// Decorative unless the caller named the icon itself.
					...(icon.props["aria-label"] ? {} : { "aria-hidden": true }),
					className: cn(
						size === "sm" ? "size-3" : "size-3.5",
						icon.props.className,
					),
				} as React.HTMLAttributes<HTMLElement>);
			}

			return icon;
		};

		const renderContent = () => {
			switch (iconOrientation) {
				case "left":
					return (
						<>
							{renderIcon(icon)}
							{children}
						</>
					);
				case "right":
					return (
						<>
							{children}
							{renderIcon(icon)}
						</>
					);
				case "center":
					return (
						<>
							{renderIcon(icon)}
							{children}
						</>
					);
				default:
					return (
						<>
							{renderIcon(icon)}
							{children}
						</>
					);
			}
		};

		const iconToMainClass = () => {
			switch (iconOrientation) {
				case "center":
					if (size === "sm") {
						return "!h-6 w-6";
					} else {
						return "!h-7 w-7";
					}
				default:
					return "";
			}
		};

		if (hide) return null;

		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				className={cn(
					iconButtonVariants({ iconOrientation }),
					iconToMainClass(),
					"text-tertiary-foreground!",
					checked && "text-foreground! border-primary",
					className,
				)}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				data-state={checked ? "open" : "closed"}
				aria-pressed={checked}
				{...props}
			>
				{renderContent()}
				{checked && <SelectedMark />}
			</Button>
		);
	},
);

IconCheckbox.displayName = "IconCheckbox";

export { IconCheckbox };
