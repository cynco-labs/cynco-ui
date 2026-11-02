import {
	overlayMotionClassName,
	overlaySurfaceClassName,
} from "../../lib/overlay-classes";
import { cn } from "../../lib/utils";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import * as React from "react";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	asChild,
	children,
	...props
}: PopoverPrimitive.Trigger.Props & { asChild?: boolean }) {
	if (asChild && React.isValidElement(children)) {
		return (
			<PopoverPrimitive.Trigger
				data-slot="popover-trigger"
				render={children}
				{...props}
			/>
		);
	}
	return (
		<PopoverPrimitive.Trigger data-slot="popover-trigger" {...props}>
			{children}
		</PopoverPrimitive.Trigger>
	);
}

function PopoverContent({
	className,
	align = "center",
	sideOffset = 4,
	side = "bottom",
	anchor,
	collisionAvoidance,
	onEscapeKeyDown: _onEscapeKeyDown,
	onPointerDownOutside: _onPointerDownOutside,
	onOpenAutoFocus: _onOpenAutoFocus,
	onCloseAutoFocus: _onCloseAutoFocus,
	forceMount: _forceMount,
	asChild: _asChild,
	...props
}: PopoverPrimitive.Popup.Props &
	Pick<
		PopoverPrimitive.Positioner.Props,
		"align" | "side" | "sideOffset" | "anchor" | "collisionAvoidance"
	> & {
		/** Radix compatibility props; accepted and ignored (Base UI handles dismissal and focus itself). */
		onEscapeKeyDown?: (event: Event) => void;
		onPointerDownOutside?: (event: Event) => void;
		onOpenAutoFocus?: (event: Event) => void;
		onCloseAutoFocus?: (event: Event) => void;
		forceMount?: boolean;
		asChild?: boolean;
	}) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				align={align}
				side={side}
				sideOffset={sideOffset}
				anchor={anchor}
				collisionAvoidance={collisionAvoidance}
				positionMethod="fixed"
				className="isolate z-[300]"
			>
				<PopoverPrimitive.Popup
					data-slot="popover-content"
					className={cn(
						"w-72 p-3 outline-hidden",
						overlaySurfaceClassName,
						overlayMotionClassName,
						className,
					)}
					{...props}
				/>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverTrigger, PopoverContent };
