import { cn } from "../../lib/utils";

export const SectionTag = ({ className, ...props }: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="section-tag"
			className={cn("text-xs text-tertiary-foreground font-medium px-2 mb-2 bg-muted w-fit rounded-lg py-0.25", className)}
			{...props}
		/>
	);
};
