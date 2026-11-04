"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";

const TRIGGER_BASE =
	"inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium transition-[background-color,color,box-shadow] cursor-pointer outline-none focus-ring disabled:pointer-events-none disabled:opacity-50 data-[active]:text-primary data-[active]:bg-interactive-secondary data-[active]:shadow-sm hover:bg-interactive-secondary-hover dark:data-[active]:bg-background dark:data-[active]:text-foreground";

const tabsListVariants = cva("", {
	variants: {
		variant: {
			default:
				"inline-flex h-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground dark:bg-muted px-1",
			underline: "flex w-full items-center gap-5 border-b border-border",
		},
	},
	defaultVariants: { variant: "default" },
});

const tabsTriggerVariants = cva("", {
	variants: {
		variant: {
			default: TRIGGER_BASE,
			onboarding: cn(TRIGGER_BASE, "data-[active]:bg-muted data-[active]:text-foreground data-[active]:font-medium"),
			underline:
				"-mb-px inline-flex items-center whitespace-nowrap border-b-2 border-transparent pb-2 text-sm font-medium text-tertiary-foreground outline-none focus-ring transition-colors cursor-pointer hover:text-foreground focus-visible:text-foreground data-[active]:border-foreground data-[active]:text-foreground",
		},
	},
	defaultVariants: { variant: "default" },
});

function Tabs({ ...props }: TabsPrimitive.Root.Props) {
	return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
	ref,
	className,
	variant,
	...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants> & { ref?: React.Ref<HTMLDivElement> }) {
	return (
		<TabsPrimitive.List
			ref={ref}
			data-slot="tabs-list"
			className={cn(tabsListVariants({ variant }), className)}
			{...props}
		/>
	);
}
function TabsTrigger({
	ref,
	className,
	variant,
	...props
}: TabsPrimitive.Tab.Props & VariantProps<typeof tabsTriggerVariants> & { ref?: React.Ref<HTMLButtonElement> }) {
	return (
		<TabsPrimitive.Tab
			ref={ref}
			data-slot="tabs-trigger"
			className={cn(tabsTriggerVariants({ variant }), className)}
			{...props}
		/>
	);
}
function TabsContent({ ref, className, ...props }: TabsPrimitive.Panel.Props & { ref?: React.Ref<HTMLDivElement> }) {
	return (
		<TabsPrimitive.Panel
			ref={ref}
			data-slot="tabs-content"
			className={cn("mt-2 mb-4 outline-none focus-ring", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
