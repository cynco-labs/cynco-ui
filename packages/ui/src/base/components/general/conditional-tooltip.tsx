import type * as React from "react";
import type { ReactElement, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ConditionalTooltipProps extends Omit<React.ComponentProps<typeof TooltipContent>, "children" | "content"> {
	/** When false the child renders alone, with no trigger and no popup. */
	enabled: boolean;
	content: ReactNode;
	/** The element the tooltip describes; it becomes the trigger. */
	children: ReactElement;
}

/**
 * A tooltip that only exists under a condition: a disabled reason, a truncated cell, a keyboard hint.
 * It has no element of its own, so `className` and the rest of the props go to the popup.
 */
export function ConditionalTooltip({ enabled, content, children, ...props }: ConditionalTooltipProps) {
	if (!enabled) return children;

	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent data-slot="conditional-tooltip" {...props}>
				{content}
			</TooltipContent>
		</Tooltip>
	);
}
