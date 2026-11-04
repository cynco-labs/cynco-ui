import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";

function HoverCard({
	openDelay: _openDelay,
	closeDelay: _closeDelay,
	...props
}: PreviewCardPrimitive.Root.Props & {
	openDelay?: number;
	closeDelay?: number;
}) {
	return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
	asChild,
	children,
	render,
	...props
}: PreviewCardPrimitive.Trigger.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<PreviewCardPrimitive.Trigger
			data-slot="hover-card-trigger"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function HoverCardContent({
	className,
	align = "center",
	sideOffset = 4,
	side = "bottom",
	...props
}: PreviewCardPrimitive.Popup.Props & Pick<PreviewCardPrimitive.Positioner.Props, "align" | "side" | "sideOffset">) {
	return (
		<PreviewCardPrimitive.Portal data-slot="hover-card-portal">
			<PreviewCardPrimitive.Positioner
				align={align}
				side={side}
				sideOffset={sideOffset}
				positionMethod="fixed"
				className="isolate z-popover"
			>
				<PreviewCardPrimitive.Popup
					data-slot="hover-card-content"
					className={cn(
						"bg-overlay text-muted-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-64 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden",
						className,
					)}
					{...props}
				/>
			</PreviewCardPrimitive.Positioner>
		</PreviewCardPrimitive.Portal>
	);
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
