import { InfoTooltip } from "./info-tooltip";
import { cn } from "../../lib/utils";
import type React from "react";

interface FieldLabelProps extends React.ComponentProps<"label"> {
	/** Hint under the label. Rendered outside the `<label>`, so it never joins the control's name. */
	description?: string;
	/** Id for the description, so the control can point `aria-describedby` at it. */
	descriptionId?: string;
	/** Render an aria-hidden spacer the height of a label, to align fields that have none. */
	empty?: boolean;
	/** Info tooltip beside the description (or the label, without one). Kept outside the `<label>`. */
	tooltip?: string;
}

/**
 * A native `<label>`: bind it with `htmlFor` (or wrap the control). Native label props go on the
 * `<label>`; `className` goes on the outer element, which is the label itself unless a
 * `description` or `tooltip` adds a wrapper.
 */
export function FieldLabel({
	children,
	className,
	description,
	descriptionId,
	empty = false,
	tooltip,
	...props
}: FieldLabelProps) {
	if (empty) {
		return (
			<div aria-hidden="true" className={cn("text-sm mb-2", className)}>
				{"\u00A0"}
			</div>
		);
	}

	const labelClassName = "block text-tertiary-foreground text-sm";

	if (!description && !tooltip) {
		return (
			<label {...props} className={cn(labelClassName, "mb-2", className)}>
				{children}
			</label>
		);
	}

	return (
		<div className={cn("mb-2", className)}>
			<div className="flex items-center gap-2">
				<label {...props} className={labelClassName}>
					{children}
				</label>
				{tooltip && !description && <InfoTooltip>{tooltip}</InfoTooltip>}
			</div>
			{description && (
				<div className="flex items-center gap-2">
					<p id={descriptionId} className="text-tertiary-foreground text-xs">
						{description}
					</p>
					{tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
				</div>
			)}
		</div>
	);
}
