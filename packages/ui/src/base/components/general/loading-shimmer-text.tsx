import { SmallSpinner } from "./small-spinner";
import { cn } from "../../lib/utils";

type LoadingShimmerTextProps = Omit<React.ComponentProps<"div">, "children"> & {
	text: string;
};

export function LoadingShimmerText({ text, className, ...props }: LoadingShimmerTextProps) {
	return (
		<div role="status" className={cn("flex items-center justify-start gap-2", className)} {...props}>
			<SmallSpinner size={12} aria-hidden="true" className="text-tertiary-foreground" />
			<span className="text-sm shimmer">{text}</span>
		</div>
	);
}
