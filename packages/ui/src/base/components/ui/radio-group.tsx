import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type * as React from "react";
import { cn } from "../../lib/utils";

function RadioGroup({ ref, className, ...props }: RadioGroupPrimitive.Props & { ref?: React.Ref<HTMLDivElement> }) {
	return <RadioGroupPrimitive data-slot="radio-group" className={cn("grid gap-2", className)} {...props} ref={ref} />;
}
function RadioGroupItem({
	ref,
	className,
	style,
	...props
}: Radio.Root.Props & { ref?: React.Ref<HTMLButtonElement> }) {
	return (
		<Radio.Root
			ref={ref}
			data-slot="radio-group-item"
			style={{ cursor: "pointer", ...style }}
			className={cn(
				"w-[13px] h-[13px] px-0.5 py-[3px] rounded-xl inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden transition-none outline-none focus-ring disabled:cursor-not-allowed disabled:opacity-50",

				"bg-interactive-secondary shadow-hairline border-[0.70px] border border-input",
				"data-checked:bg-primary data-checked:shadow-none data-checked:border-none",

				"hover:bg-interactive-secondary-hover hover:border-primary hover:border-[1px]",
				className,
			)}
			{...props}
		>
			<Radio.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center">
				<div className="w-1 h-1 bg-primary-foreground rounded-full" />
			</Radio.Indicator>
		</Radio.Root>
	);
}

export { RadioGroup, RadioGroupItem };
