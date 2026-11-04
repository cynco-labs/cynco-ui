"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { type ShortcutEntry, useMenuShortcuts } from "../../hooks/use-dropdown-shortcut";
import { useMergedRef } from "../../hooks/use-merged-ref";
import {
	overlayItemClassName,
	overlayItemHighlightClassName,
	overlayItemIndicatorClassName,
	overlayLabelClassName,
	overlayMotionClassName,
	overlaySeparatorClassName,
	overlayShortcutClassName,
	overlaySurfaceClassName,
} from "../../lib/overlay-classes";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";
import { SmallSpinner } from "../general/small-spinner";

const DropdownMenuContext = React.createContext<{
	isOpen: boolean;
	shortcuts: React.RefObject<ShortcutEntry[]>;
	close: () => void;
}>({
	isOpen: false,
	shortcuts: { current: [] },
	close: () => {},
});

const dropdownMenuItemVariants = cva(cn("group/dropdown-menu-item", overlayItemClassName), {
	variants: {
		variant: {
			default: overlayItemHighlightClassName,
			destructive:
				"text-error-text focus:bg-destructive/10 focus:text-error-text [&_svg:not([class*='text-'])]:text-current",
		},
		inset: {
			true: "pl-8",
			false: "",
		},
	},
	defaultVariants: {
		variant: "default",
		inset: false,
	},
});

type DropdownMenuItemVariantProps = VariantProps<typeof dropdownMenuItemVariants>;

function DropdownMenu({ actionsRef: actionsRefProp, onOpenChange, ...props }: MenuPrimitive.Root.Props) {
	// Track open state for uncontrolled menus too, so item shortcuts work either way.
	const [openState, setOpenState] = React.useState(props.defaultOpen ?? false);
	const isOpen = props.open ?? openState;
	const localActions = React.useRef<MenuPrimitive.Root.Actions | null>(null);
	const actionsRef = actionsRefProp ?? localActions;
	// Base UI closes the menu and reports it through onOpenChange with real event details.
	const close = React.useCallback(() => actionsRef.current?.close(), [actionsRef]);
	const handleOpenChange = React.useCallback<NonNullable<MenuPrimitive.Root.Props["onOpenChange"]>>(
		(open, details) => {
			setOpenState(open);
			onOpenChange?.(open, details);
		},
		[onOpenChange],
	);
	const { shortcuts } = useMenuShortcuts(isOpen, close);

	const ctx = React.useMemo(() => ({ isOpen, shortcuts, close }), [isOpen, shortcuts, close]);

	return (
		<DropdownMenuContext.Provider value={ctx}>
			<MenuPrimitive.Root data-slot="dropdown-menu" actionsRef={actionsRef} onOpenChange={handleOpenChange} {...props} />
		</DropdownMenuContext.Provider>
	);
}

function DropdownMenuTrigger({
	ref,
	asChild,
	children,
	render,
	...props
}: MenuPrimitive.Trigger.Props & { asChild?: boolean } & { ref?: React.Ref<HTMLButtonElement> }) {
	const element = renderProp(asChild, children, render);
	return (
		<MenuPrimitive.Trigger
			ref={ref}
			data-slot="dropdown-menu-trigger"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
	return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
	return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
	return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

type DropdownMenuSubTriggerProps = MenuPrimitive.SubmenuTrigger.Props & {
	inset?: boolean;
	withIcon?: boolean;
};

function DropdownMenuSubTrigger({ ref, ...props }: DropdownMenuSubTriggerProps & { ref?: React.Ref<HTMLDivElement> }) {
	const { inset, withIcon = true, className, children, ...rest } = props;
	return (
		<MenuPrimitive.SubmenuTrigger
			ref={ref}
			data-slot="dropdown-menu-sub-trigger"
			className={cn(
				overlayItemClassName,
				overlayItemHighlightClassName,
				"data-popup-open:bg-overlay-hover data-popup-open:text-foreground",
				inset && "pl-8",
				className,
			)}
			{...rest}
		>
			{children}
			{withIcon && <CaretRightIcon className="-mr-0.5 ml-auto size-3.5 text-tertiary-foreground" />}
		</MenuPrimitive.SubmenuTrigger>
	);
}

function DropdownMenuSubContent({
	ref,
	...props
}: MenuPrimitive.Popup.Props & { sideOffset?: number; alignOffset?: number } & { ref?: React.Ref<HTMLDivElement> }) {
	const { className, sideOffset = 6, alignOffset = -4, ...rest } = props;
	return (
		<MenuPrimitive.Portal>
			<MenuPrimitive.Positioner
				sideOffset={sideOffset}
				alignOffset={alignOffset}
				positionMethod="fixed"
				className="isolate z-popover outline-none"
			>
				<MenuPrimitive.Popup
					ref={ref}
					data-slot="dropdown-menu-sub-content"
					className={cn(
						"min-w-40 overflow-x-hidden overflow-y-auto p-1",
						overlaySurfaceClassName,
						overlayMotionClassName,
						className,
					)}
					{...rest}
				/>
			</MenuPrimitive.Positioner>
		</MenuPrimitive.Portal>
	);
}

type DropdownMenuContentProps = MenuPrimitive.Popup.Props & {
	sideOffset?: number;
	side?: "top" | "bottom" | "left" | "right";
	align?: "start" | "center" | "end";
	keepMounted?: boolean;
};

function DropdownMenuContent({ ref, ...props }: DropdownMenuContentProps & { ref?: React.Ref<HTMLDivElement> }) {
	const { className, sideOffset = 4, side = "bottom", align = "start", keepMounted = false, ...rest } = props;
	return (
		<MenuPrimitive.Portal keepMounted={keepMounted}>
			<MenuPrimitive.Positioner
				sideOffset={sideOffset}
				side={side}
				align={align}
				positionMethod="fixed"
				className="isolate z-popover outline-none"
			>
				<MenuPrimitive.Popup
					ref={ref}
					data-slot="dropdown-menu-content"
					className={cn(
						"max-h-(--available-height) min-w-40 overflow-x-hidden overflow-y-auto p-1",
						overlaySurfaceClassName,
						overlayMotionClassName,
						className,
					)}
					{...rest}
				/>
			</MenuPrimitive.Positioner>
		</MenuPrimitive.Portal>
	);
}

type DropdownMenuItemProps = MenuPrimitive.Item.Props &
	DropdownMenuItemVariantProps & {
		isLoading?: boolean;
		shimmer?: boolean;
		shortcut?: string;
		asChild?: boolean;
		closeOnClick?: boolean;
	};

function DropdownMenuItem({ ref, ...props }: DropdownMenuItemProps & { ref?: React.Ref<HTMLDivElement> }) {
	const {
		variant,
		inset,
		shimmer = false,
		isLoading,
		shortcut,
		asChild,
		closeOnClick,
		className,
		children,
		onClick,
		render,
		...rest
	} = props;
	const { shortcuts } = React.useContext(DropdownMenuContext);
	const itemRef = React.useRef<HTMLDivElement | null>(null);
	const setRef = useMergedRef(itemRef, ref);

	React.useEffect(() => {
		if (!shortcut || props.disabled) return;
		// A real click, so onClick gets a genuine event and Base UI runs its own item handling.
		const entry: ShortcutEntry = {
			key: shortcut,
			handler: () => itemRef.current?.click(),
		};
		shortcuts.current.push(entry);
		return () => {
			shortcuts.current = shortcuts.current.filter((e) => e !== entry);
		};
	}, [shortcut, props.disabled, shortcuts]);

	const element = renderProp(asChild, children, render);

	return (
		<MenuPrimitive.Item
			ref={setRef}
			data-slot="dropdown-menu-item"
			render={element}
			closeOnClick={closeOnClick}
			className={cn(dropdownMenuItemVariants({ variant, inset }), shimmer && "shimmer", className)}
			disabled={shimmer || isLoading}
			onClick={onClick}
			{...rest}
		>
			{element ? undefined : isLoading ? (
				<>
					{children}
					<SmallSpinner />
				</>
			) : (
				children
			)}
		</MenuPrimitive.Item>
	);
}

function DropdownMenuCheckboxItem({
	ref,
	...props
}: MenuPrimitive.CheckboxItem.Props & { inset?: boolean } & { ref?: React.Ref<HTMLDivElement> }) {
	const { className, children, inset, ...rest } = props;
	return (
		<MenuPrimitive.CheckboxItem
			ref={ref}
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset}
			closeOnClick={false}
			className={cn(overlayItemClassName, overlayItemHighlightClassName, "pr-8 data-inset:pl-8", className)}
			{...rest}
		>
			{children}
			<span className={overlayItemIndicatorClassName}>
				<MenuPrimitive.CheckboxItemIndicator>
					<CheckIcon className="text-foreground" />
				</MenuPrimitive.CheckboxItemIndicator>
			</span>
		</MenuPrimitive.CheckboxItem>
	);
}

function DropdownMenuRadioItem({
	ref,
	...props
}: MenuPrimitive.RadioItem.Props & { inset?: boolean } & { ref?: React.Ref<HTMLDivElement> }) {
	const { className, children, inset, ...rest } = props;
	return (
		<MenuPrimitive.RadioItem
			ref={ref}
			data-slot="dropdown-menu-radio-item"
			data-inset={inset}
			className={cn(overlayItemClassName, overlayItemHighlightClassName, "pr-8 data-inset:pl-8", className)}
			{...rest}
		>
			<span className={overlayItemIndicatorClassName}>
				<MenuPrimitive.RadioItemIndicator>
					<CheckIcon className="text-foreground" />
				</MenuPrimitive.RadioItemIndicator>
			</span>
			{children}
		</MenuPrimitive.RadioItem>
	);
}

type DropdownMenuLabelProps = MenuPrimitive.GroupLabel.Props & {
	inset?: boolean;
};

function DropdownMenuLabel({ ref, ...props }: DropdownMenuLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
	const { inset, className, ...rest } = props;
	return (
		<MenuPrimitive.GroupLabel
			ref={ref}
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(overlayLabelClassName, "data-inset:pl-8", className)}
			{...rest}
		/>
	);
}

function DropdownMenuSeparator({ ref, ...props }: MenuPrimitive.Separator.Props & { ref?: React.Ref<HTMLDivElement> }) {
	const { className, ...rest } = props;
	return (
		<MenuPrimitive.Separator
			ref={ref}
			data-slot="dropdown-menu-separator"
			className={cn(overlaySeparatorClassName, className)}
			{...rest}
		/>
	);
}

type DropdownMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
	const { className, ...rest } = props;
	return <span data-slot="dropdown-menu-shortcut" className={cn(overlayShortcutClassName, className)} {...rest} />;
}

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
