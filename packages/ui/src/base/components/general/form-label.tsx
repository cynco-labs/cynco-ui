import { cn } from "../../lib/utils";
import type React from "react";

/** A native `<label>`: bind it to its control with `htmlFor`, or wrap the control. */
export const FormLabel = ({
	disabled,
	className,
	...props
}: React.ComponentProps<"label"> & {
	/** Dims the label to match a disabled control. */
	disabled?: boolean;
}) => {
	return (
		<label
			{...props}
			className={cn(
				"text-form-label block mb-1",
				disabled && "opacity-50",
				className,
			)}
		/>
	);
};
