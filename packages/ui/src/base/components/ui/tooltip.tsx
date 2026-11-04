"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import * as React from "react";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";

const InsideProvider = React.createContext(false);

/**
 * Base UI 1.9's Tooltip.Root wires dismissal and positioning but no ARIA, so the hint is visual only.
 * This carries the popup's id and whether it is open, so the popup can claim `role="tooltip"` and the
 * trigger can point `aria-describedby` at it while it is showing.
 */
const TooltipAria = React.createContext<{ id: string; open: boolean } | null>(null);

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
	return (
		<InsideProvider.Provider value={true}>
			<TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
		</InsideProvider.Provider>
	);
}

/** Uses the nearest TooltipProvider's delay; `delayDuration` overrides it for this tooltip alone. */
function Tooltip({ delayDuration, onOpenChange, ...props }: TooltipPrimitive.Root.Props & { delayDuration?: number }) {
	const insideProvider = React.useContext(InsideProvider);
	const id = React.useId();
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(props.defaultOpen ?? false);
	const open = props.open ?? uncontrolledOpen;

	const root = (
		<TooltipAria.Provider value={{ id, open }}>
			<TooltipPrimitive.Root
				data-slot="tooltip"
				{...props}
				// After the spread: the caller's handler still runs, but it cannot replace the one that
				// keeps aria-describedby in step with the popup.
				onOpenChange={(nextOpen, ...rest) => {
					setUncontrolledOpen(nextOpen);
					onOpenChange?.(nextOpen, ...rest);
				}}
			/>
		</TooltipAria.Provider>
	);

	if (insideProvider && delayDuration === undefined) return root;
	return <TooltipProvider delay={delayDuration}>{root}</TooltipProvider>;
}

function TooltipTrigger({
	asChild,
	children,
	render,
	"aria-describedby": describedBy,
	...props
}: TooltipPrimitive.Trigger.Props & { asChild?: boolean }) {
	const aria = React.useContext(TooltipAria);
	const element = renderProp(asChild, children, render);
	// The caller's own description stays; the tooltip's id joins it while the popup is showing.
	const described = [describedBy, aria?.open ? aria.id : undefined].filter(Boolean).join(" ") || undefined;
	return (
		<TooltipPrimitive.Trigger
			data-slot="tooltip-trigger"
			render={element}
			aria-describedby={described}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function TooltipContent({
	className,
	sideOffset = 6,
	side = "top",
	align = "center",
	children,
	...props
}: TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, "align" | "side" | "sideOffset">) {
	const aria = React.useContext(TooltipAria);
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				positionMethod="fixed"
				// Above popovers, selects and dropdowns: a tooltip is the topmost hint.
				className="isolate z-tooltip"
			>
				<TooltipPrimitive.Popup
					data-slot="tooltip-content"
					role="tooltip"
					id={aria?.id}
					className={cn(
						"overflow-hidden rounded-[6px] border bg-interactive-secondary px-2 py-[3px] text-sm font-medium leading-[1.6] tracking-[-0.039px] text-muted-foreground shadow-glow dark:bg-card",
						"animate-in fade-in-0 zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
						className,
					)}
					{...props}
				>
					{children}
				</TooltipPrimitive.Popup>
			</TooltipPrimitive.Positioner>
		</TooltipPrimitive.Portal>
	);
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
