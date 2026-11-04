import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { overlayMotionClassName, overlaySurfaceClassName } from "../../lib/overlay-classes";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	asChild,
	children,
	render,
	...props
}: PopoverPrimitive.Trigger.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<PopoverPrimitive.Trigger
			data-slot="popover-trigger"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function PopoverContent({
	className,
	align = "center",
	sideOffset = 4,
	side = "bottom",
	anchor,
	collisionAvoidance,
	...props
}: PopoverPrimitive.Popup.Props &
	Pick<PopoverPrimitive.Positioner.Props, "align" | "side" | "sideOffset" | "anchor" | "collisionAvoidance">) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				align={align}
				side={side}
				sideOffset={sideOffset}
				anchor={anchor}
				collisionAvoidance={collisionAvoidance}
				positionMethod="fixed"
				className="isolate z-popover"
			>
				<PopoverPrimitive.Popup
					data-slot="popover-content"
					className={cn("w-72 p-3 outline-hidden", overlaySurfaceClassName, overlayMotionClassName, className)}
					{...props}
				/>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverContent, PopoverTrigger };
