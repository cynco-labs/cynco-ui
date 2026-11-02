import { cn } from "../../lib/utils";
import { LucideLoaderCircle, type LucideProps } from "lucide-react";

/**
 * Named "Loading" by default so a spinner shown alone (or inside a busy button) is not silent.
 * Pass `aria-hidden` when visible text beside it already says what is loading.
 */
export function SmallSpinner({
	size = 18,
	className,
	...props
}: Omit<LucideProps, "ref">) {
	return (
		<LucideLoaderCircle
			role="img"
			aria-label="Loading"
			{...props}
			className={cn("animate-spin", className)}
			size={size}
		/>
	);
}
