import type { IconProps } from "@phosphor-icons/react";
import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import { cn } from "../../lib/utils";

/**
 * Named "Loading" by default so a spinner shown alone (or inside a busy button) is not silent.
 * Pass `aria-hidden` when visible text beside it already says what is loading.
 */
export function SmallSpinner({
	size = 18,
	className,
	...props
}: Omit<IconProps, "ref">) {
	return (
		<CircleNotchIcon
			role="img"
			aria-label="Loading"
			{...props}
			className={cn("animate-spin", className)}
			size={size}
		/>
	);
}
