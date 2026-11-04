import { cn } from "../../lib/utils";
import { SmallSpinner } from "./small-spinner";

type LoadingShimmerTextProps = Omit<React.ComponentProps<"div">, "children"> & {
	text: string;
};

export function LoadingShimmerText({ text, className, ...props }: LoadingShimmerTextProps) {
	return (
		<div
			data-slot="loading-shimmer-text"
			role="status"
			className={cn("flex items-center justify-start gap-2", className)}
			{...props}
		>
			<SmallSpinner size={12} aria-hidden="true" className="text-tertiary-foreground" />
			<span className="text-sm shimmer">{text}</span>
		</div>
	);
}
