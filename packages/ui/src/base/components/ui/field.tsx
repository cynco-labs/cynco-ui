"use client";

import { WarningCircleIcon } from "@phosphor-icons/react/ssr";
import * as React from "react";
import { renderProp } from "../../lib/render";
import { cn } from "../../lib/utils";
import { InfoTooltip } from "./info-tooltip";
import { Label } from "./label";

interface FieldContextValue {
	controlId: string;
	descriptionId: string;
	errorId: string;
	invalid: boolean;
	hasDescription: boolean;
	setHasDescription: (has: boolean) => void;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** The field's ids, or null when a part is used on its own (an error beside a hand-wired input). */
function useField() {
	return React.useContext(FieldContext);
}

/**
 * One form field: a label, an optional description, the control and an optional error. It owns the ids,
 * so `FieldControl` is the only place the control's `id`, `aria-describedby` and `aria-invalid` are set
 * and the wiring cannot be forgotten.
 */
function Field({ className, invalid = false, ...props }: React.ComponentProps<"div"> & { invalid?: boolean }) {
	const uid = React.useId();
	const [hasDescription, setHasDescription] = React.useState(false);
	const value = React.useMemo(
		() => ({
			controlId: uid,
			descriptionId: `${uid}-description`,
			errorId: `${uid}-error`,
			invalid,
			hasDescription,
			setHasDescription,
		}),
		[uid, invalid, hasDescription],
	);

	return (
		<FieldContext.Provider value={value}>
			<div
				data-slot="field"
				data-invalid={invalid || undefined}
				className={cn("flex flex-col gap-1", className)}
				{...props}
			/>
		</FieldContext.Provider>
	);
}

interface FieldLabelProps extends React.ComponentProps<typeof Label> {
	/** An info tooltip beside the words. It sits outside the `<label>`, so it never joins the control's name. */
	hint?: React.ReactNode;
}

/** The field's label, bound to its control. */
function FieldLabel({ className, hint, htmlFor, ...props }: FieldLabelProps) {
	const field = useField();
	const label = (
		<Label htmlFor={htmlFor ?? field?.controlId} className={cn("text-tertiary-foreground", className)} {...props} />
	);

	if (!hint) return label;

	return (
		<div data-slot="field-label-row" className="flex items-center gap-2">
			{label}
			<InfoTooltip>{hint}</InfoTooltip>
		</div>
	);
}

/** A hint under the label. It describes the control rather than naming it, so it stays outside the `<label>`. */
function FieldDescription({ className, id, ...props }: React.ComponentProps<"p">) {
	const field = useField();
	const setHasDescription = field?.setHasDescription;
	// Registers itself so the control's aria-describedby names an id that exists.
	React.useLayoutEffect(() => {
		setHasDescription?.(true);
		return () => setHasDescription?.(false);
	}, [setHasDescription]);
	return (
		<p
			data-slot="field-description"
			id={id ?? field?.descriptionId}
			className={cn("text-xs text-tertiary-foreground", className)}
			{...props}
		/>
	);
}

/** An inline field error: a warning glyph plus the words, so it never relies on colour. */
function FieldError({ className, children, id, ...props }: React.ComponentProps<"p">) {
	const field = useField();
	return (
		<p
			data-slot="field-error"
			id={id ?? field?.errorId}
			className={cn("flex items-start gap-1 text-2xs text-error-text", className)}
			{...props}
		>
			<WarningCircleIcon size={12} weight="fill" aria-hidden="true" className="mt-px shrink-0" />
			{children}
		</p>
	);
}

type WiredControlProps = {
	id?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean | "true" | "false";
};

/**
 * Wraps the field's control and hands it the ids. Pass the control as `render` (or as the single child
 * with `asChild`); anything the control already sets wins.
 */
function FieldControl({
	asChild = true,
	children,
	render,
}: {
	asChild?: boolean;
	children?: React.ReactNode;
	render?: React.ReactElement;
}) {
	const field = useField();
	const element = renderProp(asChild, children, render);

	if (!React.isValidElement<WiredControlProps>(element)) return <>{children}</>;
	if (!field) return element;

	// Each id is listed only while its element is on screen: the description once one has rendered, the
	// error while the field is invalid.
	const described = [
		field.hasDescription ? field.descriptionId : null,
		field.invalid ? field.errorId : null,
		element.props["aria-describedby"],
	]
		.filter(Boolean)
		.join(" ");

	return React.cloneElement(element, {
		id: element.props.id ?? field.controlId,
		"aria-describedby": described || undefined,
		"aria-invalid": element.props["aria-invalid"] ?? (field.invalid || undefined),
	});
}

/** `aria-invalid` + `aria-describedby` for a field while its error (with id `errorId`) is shown. */
function fieldErrorProps(errorId: string, shown: boolean) {
	return shown ? { "aria-invalid": true, "aria-describedby": errorId } : {};
}

export { Field, FieldControl, FieldDescription, FieldError, FieldLabel, fieldErrorProps };
