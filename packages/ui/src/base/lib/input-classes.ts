/**
 * The one input surface. Every text entry, and every control that has to sit beside one in a form row
 * (a select trigger, a tag field, a date field), is this surface plus its own geometry, so radius, border,
 * placeholder colour and focus treatment cannot drift apart between them.
 *
 * Text renders at 16px on coarse pointers. Below that, iOS Safari zooms the whole page when a field takes
 * focus and never zooms back out, so the size is a correctness rule, not a preference.
 */
export const inputSurfaceClassName =
	"rounded-lg border border-input bg-interactive-secondary text-sm touch:text-base font-normal text-muted-foreground outline-none shadow-input transition-[border-color,box-shadow,background-color] duration-100 placeholder:text-placeholder placeholder:select-none data-placeholder:text-placeholder disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50";

/** The standard field height, 28px. A control that grows (a tag field, a textarea) takes `min-h-7` instead. */
export const inputHeightClassName = "h-7";

/** The standard field padding: enough to clear the 1px border at either size of the type. */
export const inputPaddingClassName = "px-2 py-1";

/** Hover and focus for a control that takes focus itself: an input, a textarea. */
export const inputFocusClassName =
	"hover:not-focus:border-input-hover hover:not-focus:shadow-input-hover focus:border-input-focus focus:shadow-input-focus";

/** Hover and focus for a wrapper whose focus lives on a descendant. */
export const inputFocusWithinClassName =
	"hover:not-focus-within:border-input-hover hover:not-focus-within:shadow-input-hover focus-within:border-input-focus focus-within:shadow-input-focus";

/**
 * Hover, focus and open for a control that opens a popup: a select trigger, a combobox, a date field.
 * The open state is drawn as well as the focus one, because focus moves into the popup while it is open.
 */
export const inputPopupClassName =
	"hover:not-focus-visible:not-data-popup-open:border-input-hover hover:not-focus-visible:not-data-popup-open:bg-interactive-secondary-hover hover:not-focus-visible:not-data-popup-open:shadow-input-hover focus-visible:border-input-focus focus-visible:shadow-input-focus data-popup-open:border-input-focus data-popup-open:bg-interactive-secondary-hover data-popup-open:shadow-input-focus";

/**
 * The invalid treatment, keyed on `aria-invalid` so the state is announced as well as drawn, and on
 * `data-invalid` so a Base UI Field can set it. The red border already carries the state without colour
 * alone: the field's error message is what names it.
 */
export const inputInvalidClassName =
	"aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus:border-destructive aria-invalid:focus:shadow-input-destructive aria-invalid:focus-within:border-destructive aria-invalid:focus-within:shadow-input-destructive data-invalid:border-destructive data-invalid:focus-visible:shadow-input-destructive data-invalid:data-popup-open:shadow-input-destructive";
