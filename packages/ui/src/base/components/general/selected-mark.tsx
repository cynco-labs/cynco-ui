import { Check } from "lucide-react";

/**
 * A small check badge on a control's top-right corner: a shape cue, so a selected or checked state
 * doesn't rest on colour alone (WCAG 1.4.1). Render it inside a `relative` parent while selected.
 */
export function SelectedMark() {
	return (
		<span
			aria-hidden="true"
			className="pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-3 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
		>
			<Check className="size-2" strokeWidth={4} />
		</span>
	);
}
