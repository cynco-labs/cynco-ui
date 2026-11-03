import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

export function BetaBadge({ className, ...props }: Omit<React.ComponentProps<typeof Badge>, "children">) {
	return (
		<Badge
			className={cn(
				"bg-primary/10! text-primary! border-primary/20! shadow-none! font-mono text-2xs! px-1.5 py-0",
				className,
			)}
			{...props}
		>
			BETA
		</Badge>
	);
}
