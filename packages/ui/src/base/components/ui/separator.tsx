"use client";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cn } from "../../lib/utils";

// A decorative rule is not announced. Base UI always sets aria-orientation, which role="none" does
// not allow, so it is cleared too (Base UI lets an explicit undefined override its own prop).
const DECORATIVE: { role: "none"; "aria-orientation": undefined } = { role: "none", "aria-orientation": undefined };

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	...props
}: SeparatorPrimitive.Props & {
	orientation?: "horizontal" | "vertical";
	decorative?: boolean;
}) {
	return (
		<SeparatorPrimitive
			data-slot="separator-root"
			orientation={orientation}
			data-orientation={orientation}
			// Pass decorative={false} for a semantic separator.
			{...(decorative ? DECORATIVE : {})}
			className={cn(
				"shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
