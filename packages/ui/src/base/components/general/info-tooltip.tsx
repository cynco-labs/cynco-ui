"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";
import { InfoIcon } from "@phosphor-icons/react";
import { useId } from "react";

export const InfoTooltip = ({
	children,
	className,
	...props
}: {
	children: React.ReactNode;
	className?: string;
	side?: "top" | "bottom" | "left" | "right";
	align?: "start" | "center" | "end";
	sideOffset?: number;
}) => {
	const descriptionId = useId();
	return (
		<Tooltip>
			{/* A real button: keyboard focus opens the tooltip, Escape closes it. The tooltip
				popup is not linked to the trigger, so the text is also exposed as its description. */}
			<TooltipTrigger
				type="button"
				aria-label="More information"
				aria-describedby={descriptionId}
				className={cn(
					// 12px icon, 24px hit area.
					"relative inline-flex items-center cursor-pointer after:absolute after:-inset-1.5",
					className,
				)}
			>
				<InfoIcon aria-hidden="true" className="text-tertiary-foreground size-3" />
			</TooltipTrigger>
			<span id={descriptionId} hidden>
				{children}
			</span>
			<TooltipContent sideOffset={10} {...props} className="">
				{children}
			</TooltipContent>
		</Tooltip>
	);
};
