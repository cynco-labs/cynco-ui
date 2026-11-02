import { cn } from "../../lib/utils";
import type * as React from "react";

/** A native <label>: wrap the control, or pass htmlFor, so clicking the text focuses it and it names the control. */
function Label({ className, ...props }: React.ComponentProps<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: association comes from the consumer (htmlFor or a wrapped control).
		<label
			data-slot="label"
			className={cn(
				"flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
