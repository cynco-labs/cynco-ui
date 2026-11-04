"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import { Button, type ButtonProps } from "../ui/button";

/** The overflow button on a row or a card: a 20px glyph with a 24px hit area. */
export function ToolbarButton(props: ButtonProps) {
	return (
		<Button
			data-slot="toolbar-button"
			variant="skeleton"
			size="icon"
			aria-label="More actions"
			{...props}
			// After the spread so a caller's className merges instead of replacing these.
			className={cn("h-5 w-5 rounded-lg p-0 after:absolute after:-inset-0.5", props?.className)}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				props.onClick?.(e);
			}}
		>
			<DotsThreeVerticalIcon size={12} />
		</Button>
	);
}
