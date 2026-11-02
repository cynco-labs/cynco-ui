import { Button, type ButtonProps } from "../ui/button";
import { cn } from "../../lib/utils";
import { EllipsisVertical } from "lucide-react";
import { forwardRef } from "react";

export const ToolbarButton = forwardRef<HTMLButtonElement, ButtonProps>(
	(props, ref) => {
		return (
			<Button
				ref={ref}
				variant="skeleton"
				size="icon"
				aria-label="More actions"
				{...props}
				// After the spread so a caller's className merges instead of replacing these.
				// The 20px button gets a 24px hit area from the ::after.
				className={cn(
					"rounded-lg !h-5 !w-5 p-0 transition-all duration-100 after:absolute after:-inset-0.5",
					props?.className,
				)}
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					props.onClick?.(e);
				}}
			>
				<EllipsisVertical size={12} />
			</Button>
		);
	},
);
