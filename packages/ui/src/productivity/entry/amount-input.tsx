"use client";

import * as React from "react";
import { cn, Input, InputGroup, InputGroupAddon, InputGroupInput } from "../../base";
import { hasModKey } from "../../lib/keyboard";
import { parseAmount, surfaces } from "../../lib/shared";
import { currencySymbol, formatAccounting, money, sameAmount } from "./format";

/** Cynco UI's destructive input styling, kept visible after blur (the form CSS only colours hover/focus). */
const INVALID_INPUT = "border-destructive";
const INVALID_GROUP = "border-destructive focus-within:shadow-input-destructive";

export type AmountInputProps = Omit<
	React.ComponentProps<"input">,
	"value" | "defaultValue" | "onChange" | "type" | "ref"
> & {
	/** Controlled value: a decimal string ("1296.00") or "" for empty. */
	value?: string;
	/** Uncontrolled initial value. */
	defaultValue?: string;
	/** Fires with the evaluated decimal string when the figure is committed (blur or Enter) and changed. */
	onValueChange?: (value: string) => void;
	/** ISO code (e.g. "MYR"): shows the symbol as a prefix and in the live result hint. */
	currency?: string;
	/** Accept negatives ("-500", "(500)"). Default false. */
	allowNegative?: boolean;
	/** Force the error styling (e.g. server-side validation). */
	invalid?: boolean;
	/** Message shown with `invalid`. */
	errorMessage?: React.ReactNode;
	/** Where the hint/error appear: in flow under the field (forms) or floating over the next row (grids). */
	messages?: "below" | "overlay";
	/**
	 * Typing `=` alone then Enter calls this; return a decimal string to commit it (e.g. the figure that
	 * balances a journal), or nothing if you've handled it yourself.
	 */
	onAutoFill?: () => string | void;
	/** Called when a commit is refused because the text isn't a valid amount. */
	onParseError?: (message: string, text: string) => void;
	/** Classes for the <input> itself (`className` goes on the root). */
	inputClassName?: string;
};

/**
 * The money field accountants type into. Focused: the raw text you typed. Blurred / Enter: the
 * evaluated figure, formatted and right-aligned. Formulas show their live result as a hint; an
 * invalid entry keeps its text, shows the error and is not committed. Esc reverts.
 */
export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
	{
		value,
		defaultValue,
		onValueChange,
		currency,
		allowNegative = false,
		invalid,
		errorMessage,
		messages = "below",
		onAutoFill,
		onParseError,
		placeholder = "0.00",
		className,
		inputClassName,
		disabled,
		onFocus,
		onBlur,
		onKeyDown,
		"aria-describedby": describedBy,
		...props
	},
	forwardedRef,
) {
	const [inner, setInner] = React.useState(defaultValue ?? "");
	const committed = value !== undefined ? value : inner;
	const [focused, setFocused] = React.useState(false);
	/** Non-null while the text differs from the committed figure (typing, or invalid after blur). */
	const [draft, setDraft] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const selectAll = React.useRef(false);
	const msgId = React.useId();

	React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

	// The figure changed from outside (controlled update, auto-balance): drop any stale draft. Derived
	// while rendering, not in an effect, so the stale text is never painted and then replaced.
	const [lastCommitted, setLastCommitted] = React.useState(committed);
	if (lastCommitted !== committed) {
		setLastCommitted(committed);
		setDraft(null);
		setError(null);
	}

	// Select the whole figure on focus, after the formatted text has been swapped for the raw one.
	// (Also after Esc reverts.) Runs every render; the flag makes it a one-shot.
	React.useLayoutEffect(() => {
		if (focused && selectAll.current) {
			selectAll.current = false;
			inputRef.current?.select();
		}
	});

	const set = (v: string) => {
		if (value === undefined) setInner(v);
		// This component moved the figure, so the derivation above must not read it as an outside change.
		setLastCommitted(v);
		onValueChange?.(v);
	};
	const fail = (msg: string, text: string) => {
		setError(msg);
		onParseError?.(msg, text);
		return false;
	};

	/** Evaluate the draft. Returns false (and keeps the text) when it can't be committed. */
	const commit = (): boolean => {
		if (draft == null) return true;
		if (draft.trim() === "=" && onAutoFill) {
			setDraft(null);
			setError(null);
			const v = onAutoFill();
			if (typeof v === "string" && !sameAmount(v, committed)) set(v);
			return true;
		}
		const p = parseAmount(draft);
		if (!p.ok) return fail(p.error === "Incomplete" ? "Incomplete formula" : p.error, draft);
		if (!allowNegative && p.value.startsWith("-")) return fail("Negative amounts aren’t allowed here", draft);
		setDraft(null);
		setError(null);
		if (!sameAmount(p.value, committed)) set(p.value);
		return true;
	};

	const text = draft ?? (focused ? committed : formatAccounting(committed));
	const live = focused && draft != null ? parseAmount(draft) : null;
	const hint: React.ReactNode =
		focused && draft?.trim() === "=" && onAutoFill ? (
			<>
				<span aria-hidden="true">↵</span>
				<span className="sr-only">Enter</span> fills the balancing figure
			</>
		) : live?.ok && live.isExpression && live.value !== "" ? (
			`= ${money(live.value, currency ?? "MYR")}`
		) : null;
	const isInvalid = !!invalid || !!error;
	const message = error ?? (invalid ? errorMessage : null);
	const negative = !focused && draft == null && committed.startsWith("-");
	const negId = React.useId();

	const inputProps = {
		...props,
		ref: inputRef,
		type: "text",
		inputMode: "decimal" as const,
		autoComplete: "off",
		spellCheck: false,
		enterKeyHint: "done" as const,
		placeholder,
		disabled,
		value: text,
		"aria-invalid": isInvalid || undefined,
		// A bracketed figure "(500.00)" is often read without its brackets: describe it as negative.
		"aria-describedby": cn(describedBy, negative && negId, (message || hint) && msgId) || undefined,
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
			setDraft(e.target.value);
			if (error) setError(null);
		},
		onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
			selectAll.current = true;
			setFocused(true);
			onFocus?.(e);
		},
		onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
			setFocused(false);
			commit();
			onBlur?.(e);
		},
		onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && !hasModKey(e) && !e.altKey && !e.nativeEvent.isComposing) {
				if (!commit()) {
					// Stay put so the figure can be fixed; don't let a grid move on.
					e.preventDefault();
					e.stopPropagation();
					return;
				}
			} else if (e.key === "Escape" && (draft != null || error)) {
				e.preventDefault();
				e.stopPropagation();
				setDraft(null);
				setError(null);
				selectAll.current = true;
				return;
			}
			onKeyDown?.(e);
		},
		className: cn("text-right tabular-nums", negative && "text-error-text", inputClassName),
	};

	const overlay = messages === "overlay";
	return (
		<div data-slot="cy-amount-input" className={cn("relative min-w-0", className)}>
			{currency ? (
				<InputGroup data-disabled={disabled || undefined} className={cn(isInvalid && INVALID_GROUP)}>
					<InputGroupAddon align="inline-start" className="pr-0 pl-2.5 text-xs text-tertiary-foreground">
						{currencySymbol(currency)}
					</InputGroupAddon>
					<InputGroupInput {...inputProps} />
				</InputGroup>
			) : (
				<Input
					variant={isInvalid ? "destructive" : "default"}
					{...inputProps}
					className={cn(inputProps.className, isInvalid && INVALID_INPUT)}
				/>
			)}
			{negative && (
				<span id={negId} className="sr-only">
					Negative amount
				</span>
			)}
			<div
				id={msgId}
				aria-live="polite"
				className={cn(
					"text-2xs tabular-nums",
					overlay
						? "pointer-events-none absolute inset-x-0 top-full z-20 mt-1 rounded-md border border-overlay-border bg-overlay px-1.5 py-0.5 text-right shadow-overlay"
						: "mt-1",
					overlay && !(focused && (message || hint)) && "sr-only",
					!overlay && !message && !hint && "sr-only",
					message ? surfaces.negative : "text-tertiary-foreground",
				)}
			>
				{message ?? hint}
			</div>
		</div>
	);
});
