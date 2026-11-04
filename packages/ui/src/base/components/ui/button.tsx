/* eslint-disable react-refresh/only-export-components */

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";
import { SmallSpinner } from "../general/small-spinner";

/** The diagonal sheen on a primary button: one `after:` layer, deepened in dark where the fill is lighter. */
const PRIMARY_SHEEN =
	"after:content-[''] after:absolute after:inset-0 after:z-[1] after:pointer-events-none after:bg-[linear-gradient(135deg,color-mix(in_oklch,var(--background)_10%,transparent)_10%,transparent_65%,color-mix(in_oklch,var(--background)_10%,transparent)_100%)] dark:after:bg-[linear-gradient(135deg,color-mix(in_oklch,var(--background)_28%,transparent)_10%,color-mix(in_oklch,var(--background)_20%,transparent)_65%,color-mix(in_oklch,var(--background)_28%,transparent)_100%)]";

const buttonVariants = cva(
	"group/btn relative inline-flex w-fit shrink-0 transform-gpu cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm outline-none transition-[background-color,border-color,box-shadow,color] duration-100 focus-ring disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				primary: cn(
					"relative overflow-hidden border border-primary bg-primary text-primary-foreground shadow-btn-primary",
					"hover:bg-primary/90 hover:shadow-btn-primary-hover",
					"active:shadow-btn-primary-pressed focus-visible:shadow-btn-primary-pressed",
					PRIMARY_SHEEN,
				),
				secondary: cn(
					"border border-border bg-interactive-secondary text-foreground shadow-btn-secondary",
					"hover:bg-interactive-secondary-hover hover:shadow-btn-secondary-hover",
					"focus-visible:border-primary focus-visible:bg-active-primary",
					// A secondary button that opens a menu keeps the open state visible while focus is in the popup.
					"data-popup-open:border-primary data-popup-open:bg-interactive-secondary-hover",
				),
				skeleton:
					"border border-transparent hover:text-primary focus-visible:border-primary active:border-primary active:bg-interactive-secondary-hover",
				muted:
					"border border-transparent bg-muted hover:bg-interactive-secondary-hover focus-visible:border-primary active:bg-interactive-secondary-hover",
				destructive: cn(
					"border-[1.2px] border-transparent bg-destructive text-primary-foreground shadow-btn-destructive",
					"hover:bg-destructive-hover hover:shadow-btn-destructive-hover",
					"focus-visible:border-destructive-border active:border-destructive-border",
					"active:shadow-btn-destructive-pressed focus-visible:shadow-btn-destructive-pressed",
				),
				dotted:
					"border border-dashed border-border bg-background shadow-hairline hover:border-solid hover:border-primary focus-visible:border-solid focus-visible:border-primary active:border-solid active:border-primary",
			},
			size: {
				/** 24px, for dense toolbars and inline rows. */
				sm: "h-6 px-1.5 py-1",
				/** 28px, matching an Input so a button and a field line up in a form row. */
				md: "h-7 px-[7px] py-1",
				/** 24px square, for a button whose whole label is its icon. */
				icon: "size-6 p-1",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
	/** Radix compatibility: render the single child element instead of a `<button>`. */
	asChild?: boolean;
	/** Swaps the label for a spinner and disables the button, while the label stays its accessible name. */
	isLoading?: boolean;
	/** The element to render instead of a `<button>` (Base UI). */
	render?: React.ReactElement;
	/** Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`. */
	focusableWhenDisabled?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
}

function Button({
	className,
	variant,
	size,
	asChild = false,
	isLoading = false,
	focusableWhenDisabled = false,
	disabled,
	children,
	render,
	...props
}: ButtonProps) {
	const element = renderProp(asChild, children, render);

	return (
		<ButtonPrimitive
			data-slot="button"
			render={element}
			className={cn(buttonVariants({ variant, size, className }))}
			aria-busy={isLoading || undefined}
			{...props}
			// After the spread, so an explicit disabled={false} can't re-enable a loading button.
			disabled={isLoading || disabled}
			// A loading button keeps focus (aria-disabled, not native disabled) and announces it is busy.
			focusableWhenDisabled={isLoading || focusableWhenDisabled}
		>
			{element === children ? undefined : (
				<>
					{isLoading && (
						<SmallSpinner
							size={14}
							className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", variant === "primary" && "z-10")}
						/>
					)}
					<span
						className={cn(
							"inline-flex items-center gap-2",
							variant === "primary" && "relative z-10",
							// opacity, not visibility: the label stays the accessible name while the spinner shows.
							isLoading && "opacity-0",
						)}
					>
						{children}
					</span>
				</>
			)}
		</ButtonPrimitive>
	);
}

export { Button, buttonVariants };
