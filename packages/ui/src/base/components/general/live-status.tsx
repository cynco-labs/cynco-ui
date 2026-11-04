import type * as React from "react";
import { cn } from "../../lib/utils";

/**
 * A polite screen-reader announcement. Keep it mounted and change its text: a region that mounts
 * together with its message is often not read. Pass empty children to stay quiet.
 */
export function LiveStatus({ className, ...props }: React.ComponentProps<"span">) {
	return <span data-slot="live-status" role="status" className={cn("sr-only", className)} {...props} />;
}
