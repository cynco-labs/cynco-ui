import { cn } from "../../lib/utils";

export const TableHeading = ({ className, ...props }: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="table-heading"
			className={cn("font-medium text-foreground text-md py-0 px-2 rounded-lg flex gap-2 items-center", className)}
			{...props}
		/>
	);
};
