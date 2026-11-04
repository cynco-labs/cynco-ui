"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Button, type ButtonProps } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const iconButtonVariants = cva("", {
	variants: {
		iconOrientation: {
			left: "flex-row gap-1",
			center: "flex-row justify-center gap-1",
			right: "flex-row gap-1",
		},
	},
	defaultVariants: {
		iconOrientation: "left",
	},
});

export interface IconButtonProps extends ButtonProps, VariantProps<typeof iconButtonVariants> {
	icon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	/** A hint on hover and focus. On an icon-only button it also names the button when no `aria-label` is given. */
	tooltip?: React.ReactNode;
	/** Which side the tooltip opens on. */
	tooltipSide?: "top" | "bottom" | "left" | "right";
}

function IconButton({
	className,
	variant,
	size,
	iconOrientation = "left",
	asChild = false,
	icon,
	rightIcon,
	tooltip,
	tooltipSide,
	children,
	"aria-label": ariaLabel,
	...props
}: IconButtonProps) {
	const getIconColor = () => {
		switch (variant) {
			case "secondary":
			case "muted":
				return "group-hover:text-inherit";
			case "skeleton":
				return "";
			case "primary":
				return "text-primary-foreground";
			case "destructive":
				return "text-error-light";
			default:
				return "text-tertiary-foreground";
		}
	};

	const renderIcon = (icon: React.ReactNode) => {
		if (!icon) return null;

		if (React.isValidElement<{ className?: string; "aria-label"?: string }>(icon)) {
			return React.cloneElement(icon, {
				// Decorative unless the caller named the icon itself.
				...(icon.props["aria-label"] ? {} : { "aria-hidden": true }),
				className: cn(size === "sm" ? "size-3" : "size-3.5", getIconColor(), icon.props.className),
			} as React.HTMLAttributes<HTMLElement>);
		}

		return icon;
	};

	const content =
		iconOrientation === "right" ? (
			<>
				{children}
				{renderIcon(icon)}
				{renderIcon(rightIcon)}
			</>
		) : iconOrientation === "center" ? (
			<>
				{renderIcon(icon || rightIcon)}
				{children}
			</>
		) : (
			<>
				{renderIcon(icon)}
				{children}
				{renderIcon(rightIcon)}
			</>
		);

	const button = (
		<Button
			data-slot="icon-button"
			variant={variant}
			size={size}
			asChild={asChild}
			// A centred icon has no label beside it, so the button is square at the small size.
			className={cn(iconButtonVariants({ iconOrientation }), iconOrientation === "center" && "h-6 w-6", className)}
			aria-label={ariaLabel ?? (!children && typeof tooltip === "string" ? tooltip : undefined)}
			{...props}
		>
			{content}
		</Button>
	);

	if (!tooltip) return button;

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
		</Tooltip>
	);
}

export { IconButton, iconButtonVariants };
