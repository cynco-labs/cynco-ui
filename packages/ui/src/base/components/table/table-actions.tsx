import { cn } from "../../lib/utils";

export function TableActions({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("ml-auto flex gap-2.5 items-center", className)} {...props} />;
}
