"use client";

import { Controls as ControlsPrimitive } from "@xyflow/react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export type ControlsProps = ComponentProps<typeof ControlsPrimitive>;

export const Controls = ({ className, ...props }: ControlsProps) => (
	<ControlsPrimitive
		// The shadow, button background and button border come from React Flow's own variables, set
		// on `.react-flow` in theme.css: its stylesheet is unlayered, so a utility never reaches them.
		className={cn("gap-px overflow-hidden rounded-md border bg-card p-1", "[&>button]:rounded-md", className)}
		{...props}
	/>
);
