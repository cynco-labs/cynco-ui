"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { Separator } from "../ui/separator";
import { cn } from "../../lib/utils";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import type * as React from "react";

interface SheetAccordionProps {
	children: React.ReactNode;
	type?: "single" | "multiple";
	defaultValue?: string | string[];
	withSeparator?: boolean;
	collapsible?: boolean;
}

function SheetAccordion({
	children,
	type = "single",
	defaultValue,
	withSeparator = true,
	collapsible = true,
	...props
}: SheetAccordionProps & Omit<AccordionPrimitive.Root.Props<string>, "type" | "defaultValue">) {
	return (
		<>
			<AccordionPrimitive.Root
				multiple={type === "multiple"}
				// Base UI takes an array of open item values; a single value opens that one item.
				defaultValue={defaultValue === undefined ? undefined : Array.isArray(defaultValue) ? defaultValue : [defaultValue]}
				className="w-full"
				{...props}
			>
				{children}
			</AccordionPrimitive.Root>
			{withSeparator && (
				<div className="px-4">
					<Separator />
				</div>
			)}
		</>
	);
}

interface SheetAccordionItemProps {
	value: string;
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	titleClassName?: string;
}

function SheetAccordionItem({
	value,
	title,
	description,
	children,
	className,
	titleClassName,
}: SheetAccordionItemProps) {
	return (
		<AccordionPrimitive.Item value={value} className={cn("", className)}>
			<AccordionPrimitive.Header className="flex">
				<AccordionPrimitive.Trigger className="group flex flex-1 cursor-pointer items-start justify-between gap-4 px-4 py-3 text-left transition-all outline-none focus-ring disabled:pointer-events-none disabled:opacity-50 [&[aria-expanded=true]>svg]:rotate-180">
					{/* Phrasing content only: the trigger is a <button> inside the Header's <h3>. */}
					<span className="flex flex-col gap-1">
						<span
							className={cn(
								"text-sm font-medium text-tertiary-foreground transition-colors group-hover:text-foreground",
								titleClassName,
							)}
						>
							{title}
						</span>
						{description && (
							<span className="text-body-secondary text-sm">{description}</span>
						)}
					</span>
					<CaretDownIcon className="text-tertiary-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-all duration-200 group-hover:text-foreground" />
				</AccordionPrimitive.Trigger>
			</AccordionPrimitive.Header>
			<AccordionPrimitive.Panel className="data-closed:animate-accordion-up data-open:animate-accordion-down overflow-hidden">
				<div className="px-4 pb-4 pt-2">{children}</div>
			</AccordionPrimitive.Panel>
		</AccordionPrimitive.Item>
	);
}

export { SheetAccordion, SheetAccordionItem };
