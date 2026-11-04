import type * as React from "react";
import {
	inputFocusClassName,
	inputInvalidClassName,
	inputPaddingClassName,
	inputSurfaceClassName,
} from "../../lib/input-classes";
import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex field-sizing-content min-h-16 w-full resize-y selection:bg-primary selection:text-primary-foreground",
				inputSurfaceClassName,
				inputPaddingClassName,
				inputFocusClassName,
				inputInvalidClassName,
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
