"use client";

import type * as React from "react";
import {
	inputFocusClassName,
	inputInvalidClassName,
	inputPaddingClassName,
	inputSurfaceClassName,
} from "../../lib/input-classes";
import { cn } from "../../lib/utils";

/** A multi-line field that keeps the input surface but starts taller and can be dragged taller still. */
function LongInput({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"min-h-[70px] w-full min-w-0 resize-y selection:bg-primary selection:text-primary-foreground",
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

export { LongInput };
