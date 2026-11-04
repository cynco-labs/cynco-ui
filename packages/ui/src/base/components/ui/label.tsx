import type * as React from "react";
import { cn } from "../../lib/utils";

interface LabelProps extends React.ComponentProps<"label"> {
	/** Marks the control as required: an asterisk for sighted readers, the word for everyone else. */
	required?: boolean;
}

/** A native <label>: wrap the control, or pass htmlFor, so clicking the text focuses it and it names the control. */
function Label({ className, children, required = false, ...props }: LabelProps) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: association comes from the consumer (htmlFor or a wrapped control).
		<label
			data-slot="label"
			className={cn(
				"flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{children}
			{/* -ml-1.5 pulls the marker back out of the row gap, so it sits against the words. */}
			{required && (
				<span className="-ml-1.5 text-error-text">
					<span aria-hidden="true">*</span>
					<span className="sr-only">(required)</span>
				</span>
			)}
		</label>
	);
}

export { Label };
