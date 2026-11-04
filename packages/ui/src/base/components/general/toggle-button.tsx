"use client";

import type * as React from "react";
import { useControllableState } from "../../hooks/use-controllable-state";
import { cn, hasSubmitShortcutModifier } from "../../lib/utils";
import { IconButton, type IconButtonProps } from "./icon-button";
import { SelectedMark } from "./selected-mark";

export interface ToggleButtonProps extends Omit<IconButtonProps, "onChange"> {
	/** Controlled pressed state. */
	pressed?: boolean;
	/** Initial pressed state for uncontrolled use. */
	defaultPressed?: boolean;
	onPressedChange?: (pressed: boolean) => void;
}

/**
 * A button that stays pressed: a filter, a view mode, a panel toggle. It reports `aria-pressed`
 * rather than posing as a checkbox, and the corner mark means the state never rests on colour.
 */
function ToggleButton({
	className,
	variant = "secondary",
	size = "sm",
	iconOrientation = "center",
	pressed: pressedProp,
	defaultPressed = false,
	onPressedChange,
	onClick,
	onKeyDown,
	children,
	tooltip,
	"aria-label": ariaLabel,
	...props
}: ToggleButtonProps) {
	const [pressed = false, setPressed] = useControllableState({
		prop: pressedProp,
		defaultProp: defaultPressed,
		onChange: onPressedChange,
	});

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setPressed(!pressed);
		onClick?.(event);
		// Drop focus after a pointer click so the active state doesn't stick. Keyboard activation
		// (detail 0) keeps focus, so keyboard users don't lose their place.
		if (event.detail > 0) event.currentTarget.blur();
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		// Suppress the native button click without toggling, so cmd/ctrl+enter
		// only triggers sheet-level submit shortcuts.
		if (event.key === "Enter" && hasSubmitShortcutModifier(event)) event.preventDefault();
		onKeyDown?.(event);
	};

	return (
		<IconButton
			data-slot="toggle-button"
			variant={variant}
			size={size}
			iconOrientation={iconOrientation}
			className={cn("relative", pressed ? "border-primary text-foreground" : "text-tertiary-foreground", className)}
			tooltip={tooltip}
			// The corner mark is decoration, so the button is still icon-only without a label of its own.
			aria-label={ariaLabel ?? (children == null && typeof tooltip === "string" ? tooltip : undefined)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			aria-pressed={pressed}
			{...props}
		>
			{children}
			{pressed && <SelectedMark />}
		</IconButton>
	);
}

export { ToggleButton };
