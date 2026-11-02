import { SmallSpinner } from "./small-spinner";
import { cn } from "../../lib/utils";

interface LoadingShimmerTextProps {
	text: string;
	className?: string;
}

export function LoadingShimmerText({
	text,
	className,
}: LoadingShimmerTextProps) {
	return (
		<div
			role="status"
			className={cn("flex items-center justify-start gap-2", className)}
		>
			<SmallSpinner
				size={12}
				aria-hidden="true"
				className="text-tertiary-foreground"
			/>
			<span className="text-sm shimmer">{text}</span>
		</div>
	);
}
