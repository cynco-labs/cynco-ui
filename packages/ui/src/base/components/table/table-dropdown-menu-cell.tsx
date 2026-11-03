"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function TableDropdownMenuCell({
	children,
}: {
	children: React.ReactNode;
}) {
	if (!children) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Row actions"
					variant="skeleton"
					size="icon"
					className="p-0 size-4"
					onClick={(e) => e.stopPropagation()}
				>
					<DotsThreeVerticalIcon size={12} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">{children}</DropdownMenuContent>
		</DropdownMenu>
	);
}
