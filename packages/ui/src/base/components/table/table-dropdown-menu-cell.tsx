"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function TableDropdownMenuCell({ children, className, ...props }: React.ComponentProps<typeof Button>) {
	if (!children) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					data-slot="table-dropdown-menu-cell"
					aria-label="Row actions"
					variant="skeleton"
					size="icon"
					onClick={(e) => e.stopPropagation()}
					{...props}
					className={cn("p-0 size-4", className)}
				>
					<DotsThreeVerticalIcon size={12} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">{children}</DropdownMenuContent>
		</DropdownMenu>
	);
}
