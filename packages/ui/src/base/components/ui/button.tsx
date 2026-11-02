/* eslint-disable react-refresh/only-export-components */

import { SmallSpinner } from "../general/small-spinner";
import { cn } from "../../lib/utils";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
	`relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-ring cursor-pointer
  rounded-lg group/btn transition-colors  w-fit transform-gpu
  `,
	{
		variants: {
			variant: {
				primary: `
				!text-primary-foreground
				bg-primary
				hover:bg-primary/90
				relative overflow-hidden
				border
				border-primary
				before:content-[''] before:absolute before:inset-0 before:z-[1] before:pointer-events-none
				dark:hover:before:bg-background/25 dark:before:bg-background/20 dark:hover:before:bg-background/25
				after:content-[''] after:absolute after:inset-0 after:z-[1] after:pointer-events-none
				after:bg-[linear-gradient(135deg,color-mix(in_oklch,var(--background)_10%,transparent)_10%,transparent_65%,color-mix(in_oklch,var(--background)_10%,transparent)_100%)]
				shadow-sm
				`,

				secondary: `bg-interactive-secondary border border-border hover:bg-interactive-secondary-hover btn-secondary-shadow
				focus-visible:bg-active-primary focus-visible:border-primary text-foreground
				`,

				skeleton: `border border-transparent hover:text-primary!
				 focus-visible:border-primary
				active:bg-interactive-secondary-hover active:border-primary`,

				muted: `bg-muted hover:bg-interactive-secondary-hover border border-transparent
				 focus-visible:border-primary hover:interactive-secondary-hover
				active:bg-interactive-secondary-hover
				`,

				destructive: `bg-destructive !text-primary-foreground border-[1.2px] border-transparent
					hover:bg-destructive-hover btn-destructive-shadow
					focus-visible:border-destructive-border
					active:border-destructive-border
					`,

				dotted: `bg-background border border-dashed border-border shadow-hairline
					hover:border-primary hover:border-solid
					focus-visible:border-primary focus-visible:border-solid
					active:border-primary active:border-solid
					`,
			},
			size: {
				default: "py-1 !px-[7px] text-body h-input",
				sm: "py-1 !px-[7px] text-tiny h-6",
				mini: "py-1 !px-1.5 text-sm h-6",
				icon: "p-1 h-6 text-xs",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ComponentProps<"button">,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	isLoading?: boolean;
	transition?: boolean;
	disableActive?: boolean;
	hide?: boolean;
	render?: React.ReactElement;
	/** Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`. */
	focusableWhenDisabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			isLoading = false,
			transition = false,
			disableActive = true,
			hide = false,
			focusableWhenDisabled = false,
			disabled,
			children,
			render: renderProp,
			...props
		},
		ref,
	) => {
		const effectiveRender =
			asChild && React.isValidElement(children) ? children : renderProp;

		const getDisableActiveStyles = () => {
			if (!disableActive) return "";

			switch (variant) {
				case "primary":
					return "";

				case "secondary":
					return "";

				case "skeleton":
					return "active:!bg-transparent active:!border-transparent focus-visible:!bg-transparent focus-visible:!border-transparent";

				case "muted":
					return "active:!bg-interactive-secondary-hover active:!border-transparent focus-visible:!bg-interactive-secondary-hover focus-visible:!border-transparent";

				case "destructive":
					return "active:!bg-destructive active:!border-transparent focus-visible:!bg-destructive focus-visible:!border-transparent";

				case "dotted":
					return "active:!bg-background active:!border-dashed active:!border-border focus-visible:!bg-background focus-visible:!border-dashed focus-visible:!border-border";

				default:
					return "";
			}
		};

		if (hide) return null;

		return (
			<ButtonPrimitive
				ref={ref}
				data-slot="button"
				render={effectiveRender}
				className={cn(
					buttonVariants({ variant, size, className }),
					getDisableActiveStyles(),
				)}
				aria-busy={isLoading || undefined}
				{...props}
				// After the spread, so an explicit disabled={false} can't re-enable a loading button.
				disabled={isLoading || disabled}
				// A loading button keeps focus (aria-disabled, not native disabled) and announces it is busy.
				focusableWhenDisabled={isLoading || focusableWhenDisabled}
			>
				{effectiveRender ? undefined : (
					<>
						{isLoading && (
							<SmallSpinner
								size={14}
								className={cn(
									"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
									variant === "primary" && "z-10",
								)}
							/>
						)}
						<span
							className={cn(
								"inline-flex items-center gap-2",
								variant === "primary" && "relative z-10 transition-none",
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
	},
);

Button.displayName = "Button";

export { Button, buttonVariants };
