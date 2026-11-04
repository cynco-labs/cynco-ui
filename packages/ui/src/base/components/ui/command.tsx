"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import * as React from "react";
import { useMergedRef } from "../../hooks/use-merged-ref";
import {
	overlayItemLayoutClassName,
	overlaySeparatorClassName,
	overlayShortcutClassName,
} from "../../lib/overlay-classes";
import { cn } from "../../lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
	return (
		<CommandPrimitive
			data-slot="command"
			className={cn(
				"bg-overlay text-muted-foreground flex h-full w-full flex-col overflow-hidden rounded-xl preset:bg-background",
				className,
			)}
			{...props}
		/>
	);
}

// Palette-only sizing, applied through data-slots so inline pickers keep their compact rows.
const COMMAND_DIALOG_SLOT_STYLES = {
	default: [
		"[&_[data-slot=command-input-wrapper]]:h-13 [&_[data-slot=command-input-wrapper]]:shrink-0 [&_[data-slot=command-input-wrapper]]:gap-3 [&_[data-slot=command-input-wrapper]]:px-4",
		"[&_[data-slot=command-input]]:text-md",
		"[&_[data-slot=command-list]]:max-h-[360px] [&_[data-slot=command-list]]:min-h-0 [&_[data-slot=command-list]]:flex-1",
		"[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-tertiary-foreground",
		"[&_[data-slot=command-item]]:h-9 [&_[data-slot=command-item]]:gap-2.5 [&_[data-slot=command-item]]:rounded-lg [&_[data-slot=command-item]]:px-2.5",
		"[&_[data-slot=command-item][data-selected=true]]:bg-foreground/6",
	],
	compact: [
		"[&_[data-slot=command-input-wrapper]]:h-11 [&_[data-slot=command-input-wrapper]]:shrink-0 [&_[data-slot=command-input-wrapper]]:gap-2.5 [&_[data-slot=command-input-wrapper]]:px-3.5",
		"[&_[data-slot=command-input]]:text-sm",
		"[&_[data-slot=command-list]]:max-h-[320px] [&_[data-slot=command-list]]:min-h-0 [&_[data-slot=command-list]]:flex-1",
		"[&_[cmdk-group]]:p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-1.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-tertiary-foreground",
		"[&_[data-slot=command-item]]:h-8 [&_[data-slot=command-item]]:gap-2 [&_[data-slot=command-item]]:rounded-md [&_[data-slot=command-item]]:px-2",
		"[&_[data-slot=command-item][data-selected=true]]:bg-foreground/6",
		"[&_[data-slot=command-footer]]:h-9 [&_[data-slot=command-footer]]:px-3",
	],
} as const;

const COMMAND_DIALOG_WIDTH = {
	default: "max-w-[640px]",
	compact: "max-w-[540px]",
} as const;

/** The cmdk settings `CommandDialog` hands to the `Command` it owns, rather than to the dialog. */
type CommandControlProps = Pick<
	React.ComponentProps<typeof Command>,
	"value" | "onValueChange" | "filter" | "shouldFilter" | "loop" | "label"
>;

function CommandDialog({
	title = "Command Palette",
	description = "Search for a command to run...",
	children,
	className,
	showCloseButton = false,
	size = "default",
	open,
	defaultOpen,
	onOpenChange,
	modal,
	value,
	onValueChange,
	filter,
	shouldFilter = false,
	loop,
	label = title,
	...props
}: Omit<React.ComponentProps<typeof DialogContent>, "children" | "title"> &
	Pick<React.ComponentProps<typeof Dialog>, "open" | "defaultOpen" | "onOpenChange" | "modal"> &
	CommandControlProps & {
		title?: string;
		description?: string;
		showCloseButton?: boolean;
		size?: keyof typeof COMMAND_DIALOG_SLOT_STYLES;
		children?: React.ReactNode;
	}) {
	return (
		<Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
			<DialogContent
				className={cn(
					"top-[18%] flex max-h-[calc(82dvh-1rem)] translate-y-0 flex-col gap-0 overflow-hidden rounded-xl bg-interactive-secondary p-0 shadow-2xl ring-foreground/8",
					COMMAND_DIALOG_WIDTH[size],
					className,
				)}
				overlayClassName="bg-overlay-dim"
				showCloseButton={showCloseButton}
				{...props}
			>
				{/* Inside the popup, so it names the dialog and only exists while it is open. */}
				<DialogHeader className="sr-only">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<Command
					label={label}
					value={value}
					onValueChange={onValueChange}
					filter={filter}
					shouldFilter={shouldFilter}
					loop={loop}
					className={cn("min-h-0 rounded-none", COMMAND_DIALOG_SLOT_STYLES[size])}
				>
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
}

/**
 * cmdk republishes the input's `aria-activedescendant` only from inside its own `setState("value")`,
 * and that callback runs in the same flush as the change, before React has moved `aria-selected` in
 * the DOM. So the attribute is empty on open and names a filtered-out row after a query changes.
 * Read the highlighted option back from the list after every render instead.
 */
function useActiveOption(input: React.RefObject<HTMLInputElement | null>) {
	// Subscribing to the highlight is what re-renders this input when another row takes it.
	useCommandState((state) => state.value);
	React.useLayoutEffect(() => {
		const node = input.current;
		const listId = node?.getAttribute("aria-controls");
		if (!node || !listId) return;
		const id = document.getElementById(listId)?.querySelector('[cmdk-item=""][aria-selected="true"]')?.id;
		if (id) node.setAttribute("aria-activedescendant", id);
		else node.removeAttribute("aria-activedescendant");
	});
}

function CommandInput({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
	const input = React.useRef<HTMLInputElement>(null);
	useActiveOption(input);
	return (
		<div
			data-slot="command-input-wrapper"
			className="flex h-9 items-center gap-2 border-b border-overlay-separator px-3 [&_svg]:size-3.5 [&_svg]:text-tertiary-foreground"
		>
			<MagnifyingGlassIcon aria-hidden="true" className="size-4 shrink-0 text-tertiary-foreground" />
			<CommandPrimitive.Input
				ref={useMergedRef(input, ref)}
				data-slot="command-input"
				className={cn(
					"placeholder:text-tertiary-foreground flex h-full w-full bg-transparent text-sm text-foreground outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
			{...props}
		/>
	);
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className={cn("py-6 text-center text-sm text-tertiary-foreground", className)}
			{...props}
		/>
	);
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn(
				"overflow-hidden p-1 text-muted-foreground",
				"[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-1.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-tertiary-foreground [&_[cmdk-group-heading]]:text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			// cmdk renders role="separator" inside the listbox, which a listbox may not contain.
			aria-hidden="true"
			className={cn(overlaySeparatorClassName, "my-0", className)}
			{...props}
		/>
	);
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				overlayItemLayoutClassName,
				"data-[selected=true]:bg-overlay-hover data-[selected=true]:text-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
	return <span data-slot="command-shortcut" className={cn(overlayShortcutClassName, className)} {...props} />;
}

function CommandKbd({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<kbd
			data-slot="command-kbd"
			className={cn(
				"flex h-5 min-w-5 items-center justify-center rounded-[5px] bg-foreground/5 px-1 font-sans text-2xs text-tertiary-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="command-footer"
			className={cn(
				"flex h-10 shrink-0 items-center justify-between border-t border-border bg-foreground/2 px-3.5",
				className,
			)}
			{...props}
		/>
	);
}

function CommandHint({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="command-hint"
			className={cn("flex items-center gap-1 text-xs text-tertiary-foreground", className)}
			{...props}
		/>
	);
}

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandHint,
	CommandInput,
	CommandItem,
	CommandKbd,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
