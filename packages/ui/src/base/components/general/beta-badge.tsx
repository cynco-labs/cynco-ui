import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

export function BetaBadge({ className, ...props }: Omit<React.ComponentProps<typeof Badge>, "children">) {
	return (
		<Badge
			data-slot="beta-badge"
			className={cn("border-primary/20 bg-primary/10 px-1.5 py-0 font-mono text-2xs text-primary shadow-none", className)}
			{...props}
		>
			BETA
		</Badge>
	);
}
