"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react";
import * as React from "react";
import { useIsClient } from "../../hooks/use-platform";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";

/**
 * Where every Sheet below this point portals its panel. The default is `document.body`; an app sets it
 * when the panel has to live inside one of its own elements, for example so a transform or a stacking
 * context on an outer shell does not apply to it.
 */
const SheetPortalContainer = React.createContext<HTMLElement | null>(null);

/**
 * Gives every Sheet below it a portal container. Pass the element itself, or a ref's current value once
 * it is set; `null` keeps `document.body`. A single Sheet can still override it with `portalContainer`.
 */
function SheetPortalContainerProvider({
	container,
	children,
}: {
	container: HTMLElement | null;
	children?: React.ReactNode;
}) {
	return <SheetPortalContainer.Provider value={container}>{children}</SheetPortalContainer.Provider>;
}

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ asChild, children, render, ...props }: SheetPrimitive.Trigger.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<SheetPrimitive.Trigger
			data-slot="sheet-trigger"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function SheetClose({ asChild, children, render, ...props }: SheetPrimitive.Close.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<SheetPrimitive.Close
			data-slot="sheet-close"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function SheetPortal({
	container,
	...props
}: SheetPrimitive.Portal.Props & {
	/** Overrides the nearest SheetPortalContainerProvider for this sheet alone. */
	container?: HTMLElement | null;
}) {
	const isClient = useIsClient();
	const fromContext = React.useContext(SheetPortalContainer);
	const resolvedContainer = container ?? fromContext ?? (isClient ? document.body : undefined);
	return (
		<SheetPrimitive.Portal data-slot="sheet-portal" container={resolvedContainer as HTMLElement | undefined} {...props} />
	);
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
	return (
		<SheetPrimitive.Backdrop
			data-slot="sheet-overlay"
			className={cn(
				"fixed inset-0 z-sheet bg-overlay-veil transition-opacity duration-300 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

const SIDE_STYLES = {
	right:
		"top-0 bottom-0 right-0 w-full md:top-2 md:bottom-2 md:right-3 md:min-w-xs md:max-w-md md:rounded-2xl md:border md:border-border/40 translate-x-0 data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
	left:
		"top-0 bottom-0 left-0 w-3/4 border-r border-border/40 sm:max-w-sm translate-x-0 data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
	top: "left-0 right-0 top-0 h-auto border-b border-border/40 translate-y-0 data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
	bottom:
		"left-0 right-0 bottom-0 h-auto border-t border-border/40 translate-y-0 data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
} as const;

function SheetContent({
	className,
	children,
	side = "right",
	hideCloseButton = false,
	overlayClassName,
	portalContainer,
	keepMounted,
	...props
}: SheetPrimitive.Popup.Props & {
	side?: "top" | "right" | "bottom" | "left";
	hideCloseButton?: boolean;
	overlayClassName?: string;
	/**
	 * Portals the panel into this element instead of the nearest SheetPortalContainerProvider's
	 * container, or `document.body` when there is none.
	 */
	portalContainer?: HTMLElement | null;
	/** Keep the content mounted (hidden) while closed, so reopening skips the mount. */
	keepMounted?: boolean;
}) {
	return (
		<SheetPortal container={portalContainer} keepMounted={keepMounted}>
			<SheetOverlay className={overlayClassName} />
			<SheetPrimitive.Popup
				data-slot="sheet-content"
				className={cn(
					"bg-card fixed z-sheet flex flex-col gap-0 overflow-hidden transition-transform duration-300 ease-in-out",
					// Base UI skips a nested dialog's backdrop, so dim the sheet itself.
					"after:pointer-events-none after:absolute after:inset-0 after:z-10 after:bg-overlay-dim after:opacity-0 after:transition-opacity after:duration-200 after:content-[''] data-nested-dialog-open:after:opacity-100",
					SIDE_STYLES[side],
					className,
				)}
				{...props}
			>
				{children}
				{!hideCloseButton && (
					<SheetPrimitive.Close className="absolute top-4 right-4 flex size-auto items-center justify-center rounded-xs opacity-70 transition-opacity outline-none after:absolute after:-inset-1 hover:opacity-100 focus-visible:opacity-100 focus-ring data-open:bg-muted disabled:pointer-events-none touch:top-3 touch:right-3 touch:size-10 touch:rounded-sm">
						<XIcon className="size-4 touch:size-5" />
						<span className="sr-only">Close</span>
					</SheetPrimitive.Close>
				)}
			</SheetPrimitive.Popup>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
	return (
		<SheetPrimitive.Title data-slot="sheet-title" className={cn("text-foreground font-semibold", className)} {...props} />
	);
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetOverlay,
	SheetPortal,
	SheetPortalContainerProvider,
	SheetTitle,
	SheetTrigger,
};
