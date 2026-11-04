"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ asChild, children, render, ...props }: DialogPrimitive.Trigger.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<DialogPrimitive.Trigger
			data-slot="dialog-trigger"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ asChild, children, render, ...props }: DialogPrimitive.Close.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<DialogPrimitive.Close
			data-slot="dialog-close"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				"data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-dialog-backdrop bg-overlay-backdrop",
				className,
			)}
			{...props}
		/>
	);
}

function DialogCloseButton() {
	return (
		<DialogPrimitive.Close
			data-slot="dialog-close"
			className="absolute top-3 right-3 grid size-6 place-items-center rounded-md text-tertiary-foreground transition-colors duration-150 hover:bg-overlay-hover hover:text-foreground outline-none focus-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
		>
			<XIcon />
			<span className="sr-only">Close</span>
		</DialogPrimitive.Close>
	);
}

function DialogContent({
	ref,
	className,
	children,
	showCloseButton = true,
	overlayClassName,
	...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean; overlayClassName?: string } & {
	ref?: React.Ref<HTMLDivElement>;
}) {
	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay className={overlayClassName} />
			<DialogPrimitive.Popup
				ref={ref}
				data-slot="dialog-content"
				className={cn(
					"data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-[0.97] data-open:zoom-in-[0.97] fixed top-[50%] left-[50%] z-dialog grid translate-x-[-50%] translate-y-[-50%] duration-150",
					"w-[calc(100%-2rem)] max-w-[400px] gap-3 rounded-2xl border border-overlay-border bg-overlay-dialog text-muted-foreground shadow-overlay-dialog preset:border-border preset:bg-background",
					// Dims this dialog while a nested dialog is open on top of it.
					"after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-overlay-dim after:opacity-0 after:transition-opacity after:duration-200 after:content-[''] data-nested-dialog-open:after:opacity-100",
					"p-4",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && <DialogCloseButton />}
			</DialogPrimitive.Popup>
		</DialogPortal>
	);
}
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="dialog-header" className={cn("flex flex-col gap-0.5 pr-7 text-left", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				// Side by side while they fit; otherwise stacked with the last (primary) action on top.
				"flex flex-wrap-reverse gap-2 pt-1 *:grow *:basis-36",
				className,
			)}
			{...props}
		/>
	);
}

function DialogTitle({
	ref,
	className,
	...props
}: DialogPrimitive.Title.Props & { ref?: React.Ref<HTMLHeadingElement> }) {
	return (
		<DialogPrimitive.Title
			ref={ref}
			data-slot="dialog-title"
			className={cn("font-semibold text-foreground text-sm leading-[18px] tracking-[-0.01em]", className)}
			{...props}
		/>
	);
}
function DialogDescription({
	ref,
	className,
	...props
}: DialogPrimitive.Description.Props & { ref?: React.Ref<HTMLParagraphElement> }) {
	return (
		<DialogPrimitive.Description
			ref={ref}
			data-slot="dialog-description"
			className={cn("text-sm text-tertiary-foreground leading-[18px]", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
