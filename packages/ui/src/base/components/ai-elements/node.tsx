"use client";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { cn } from "../../lib/utils";
import { Handle, Position } from "@xyflow/react";
import type { ComponentProps, KeyboardEvent } from "react";

export type NodeProps = ComponentProps<typeof Card> & {
	handles: {
		target: boolean;
		source: boolean;
	};
};

/**
 * Handles are tab stops: Enter or Space runs React Flow's click-to-connect (press it on an output, then on
 * an input), so edges can be made without dragging (WCAG 2.1.1, 2.5.7).
 */
const connectFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
	if (event.key !== "Enter" && event.key !== " ") return;
	event.preventDefault();
	event.stopPropagation();
	event.currentTarget.click();
};
const HANDLE_FOCUS = "focus-ring";

export const Node = ({ handles, className, ...props }: NodeProps) => (
	<Card
		className={cn(
			"node-container relative size-full h-auto w-sm gap-0 rounded-md p-0",
			className,
		)}
		{...props}
	>
		{handles.target && (
			<Handle
				aria-label="Connect here (input)"
				className={HANDLE_FOCUS}
				onKeyDown={connectFromKeyboard}
				position={Position.Left}
				role="button"
				tabIndex={0}
				type="target"
			/>
		)}
		{handles.source && (
			<Handle
				aria-label="Start a connection (output)"
				className={HANDLE_FOCUS}
				onKeyDown={connectFromKeyboard}
				position={Position.Right}
				role="button"
				tabIndex={0}
				type="source"
			/>
		)}
		{props.children}
	</Card>
);

export type NodeHeaderProps = ComponentProps<typeof CardHeader>;

export const NodeHeader = ({ className, ...props }: NodeHeaderProps) => (
	<CardHeader
		className={cn("gap-0.5 rounded-t-md border-b bg-secondary p-3!", className)}
		{...props}
	/>
);

export type NodeTitleProps = ComponentProps<typeof CardTitle>;

export const NodeTitle = (props: NodeTitleProps) => <CardTitle {...props} />;

export type NodeDescriptionProps = ComponentProps<typeof CardDescription>;

export const NodeDescription = (props: NodeDescriptionProps) => (
	<CardDescription {...props} />
);

export type NodeActionProps = ComponentProps<typeof CardAction>;

export const NodeAction = (props: NodeActionProps) => <CardAction {...props} />;

export type NodeContentProps = ComponentProps<typeof CardContent>;

export const NodeContent = ({ className, ...props }: NodeContentProps) => (
	<CardContent className={cn("p-3", className)} {...props} />
);

export type NodeFooterProps = ComponentProps<typeof CardFooter>;

export const NodeFooter = ({ className, ...props }: NodeFooterProps) => (
	<CardFooter
		className={cn("rounded-b-md border-t bg-secondary p-3!", className)}
		{...props}
	/>
);
