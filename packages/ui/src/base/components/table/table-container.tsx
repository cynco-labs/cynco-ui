import { cn } from "../../lib/utils";

export function TableContainer({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="table-container" className={cn("flex flex-col", className)} {...props} />;
}
