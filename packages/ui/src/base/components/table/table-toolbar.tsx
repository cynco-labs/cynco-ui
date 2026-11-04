import { cn } from "../../lib/utils";

export function TableToolbar({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="table-toolbar"
			className={cn("@container flex flex-wrap items-center gap-2 min-h-10 pb-4", className)}
			{...props}
		/>
	);
}
