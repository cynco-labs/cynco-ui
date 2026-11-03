"use client";

import { IconButton } from "./icon-button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

export function IconTooltipButton({
	tooltip,
	icon,
	className,
	...props
}: Omit<React.ComponentProps<typeof IconButton>, "icon" | "children"> & {
	tooltip: string;
	icon: ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<IconButton
					variant="secondary"
					size="icon"
					iconOrientation="center"
					aria-label={tooltip}
					{...props}
					icon={icon}
					className={cn("shrink-0 text-tertiary-foreground", className)}
				/>
			</TooltipTrigger>
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	);
}
