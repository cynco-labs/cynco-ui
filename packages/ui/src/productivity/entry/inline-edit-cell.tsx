"use client";

import { CheckIcon, CircleNotchIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import * as React from "react";
import { cn, Input } from "../../base";
import { surfaces } from "../../lib/shared";
import { AmountInput } from "./amount-input";
import { money, sameAmount } from "./format";

export type InlineEditCellProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
	/** The saved value (text, or a decimal string for `kind="amount"`). */
	value: string;
	/** Persist the new value. Return a promise to show a spinner; reject to revert and show its message. */
	onSave: (value: string) => void | Promise<void>;
	kind?: "text" | "amount";
	/** For amounts: formats the read-out ("RM 1,296.00"). */
	currency?: string;
	placeholder?: string;
	/** For amounts: accept negatives. Default true. */
	allowNegative?: boolean;
	disabled?: boolean;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";
const errorText = (err: unknown) =>
	err instanceof Error ? err.message : typeof err === "string" ? err : "Couldn’t save — try again";

/**
 * Edit a table cell in place: click, Enter or F2 to edit; Enter or Tab saves; Esc cancels. While an
 * async save is pending the new value shows with a spinner; a rejection reverts it and shows why.
 */
export function InlineEditCell({
	value,
	onSave,
	kind = "text",
	currency,
	placeholder,
	allowNegative = true,
	disabled,
	className,
	"aria-label": ariaLabel = "Value",
	...props
}: InlineEditCellProps) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState(value);
	const [pending, setPending] = React.useState<string | null>(null);
	const [status, setStatus] = React.useState<SaveStatus>("idle");
	const [error, setError] = React.useState<string | null>(null);
	const editingRef = React.useRef(false);
	const refocus = React.useRef(false);
	const amountRef = React.useRef(value);
	const amountInvalid = React.useRef(false);
	const buttonRef = React.useRef<HTMLButtonElement>(null);
	const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
	const alive = React.useRef(true);
	const msgId = React.useId();
	React.useEffect(
		() => () => {
			alive.current = false;
			clearTimeout(timer.current);
		},
		[],
	);
	React.useLayoutEffect(() => {
		if (!editing && refocus.current) {
			refocus.current = false;
			buttonRef.current?.focus();
		}
	}, [editing]);

	const shown = pending ?? value;
	const isAmount = kind === "amount";

	const start = () => {
		if (disabled || status === "saving") return;
		clearTimeout(timer.current);
		setError(null);
		setStatus("idle");
		setDraft(shown);
		amountRef.current = shown;
		amountInvalid.current = false;
		editingRef.current = true;
		setEditing(true);
	};
	const cancel = () => {
		editingRef.current = false;
		refocus.current = true;
		setEditing(false);
	};
	const flashSaved = () => {
		setStatus("saved");
		timer.current = setTimeout(() => alive.current && setStatus("idle"), 1600);
	};
	const finish = (next: string, focusBack: boolean) => {
		if (!editingRef.current) return;
		editingRef.current = false;
		refocus.current = focusBack;
		setEditing(false);
		const v = isAmount ? next : next.trim();
		if (isAmount ? sameAmount(v, value) : v === value) return;
		let result: void | Promise<void>;
		try {
			result = onSave(v);
		} catch (err) {
			setStatus("error");
			setError(errorText(err));
			return;
		}
		if (result && typeof (result as Promise<void>).then === "function") {
			setPending(v);
			setStatus("saving");
			(result as Promise<void>).then(
				() => {
					if (!alive.current) return;
					setPending(null);
					flashSaved();
				},
				(err) => {
					if (!alive.current) return;
					setPending(null);
					setStatus("error");
					setError(errorText(err));
				},
			);
		} else flashSaved();
	};

	const readout = isAmount ? (shown === "" ? "" : money(shown, currency)) : shown;
	const negative = isAmount && shown.startsWith("-");

	return (
		<div data-slot="cy-inline-edit" className={cn("min-w-0", className)} {...props}>
			{editing ? (
				// biome-ignore lint/a11y/noStaticElementInteractions: the wrapper scopes Escape and Enter for the control inside it and is not itself operable
				<div
					className="min-w-0"
					onKeyDownCapture={(e) => {
						if (e.key === "Escape") {
							e.preventDefault();
							e.stopPropagation();
							cancel();
						} else if (e.key === "Enter") amountInvalid.current = false;
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.nativeEvent.isComposing) {
							e.preventDefault();
							finish(isAmount ? amountRef.current : draft, true);
						}
					}}
					onBlurCapture={() => {
						amountInvalid.current = false;
					}}
					onBlur={() => {
						if (!amountInvalid.current) finish(isAmount ? amountRef.current : draft, false);
					}}
				>
					{isAmount ? (
						<AmountInput
							autoFocus
							aria-label={ariaLabel}
							defaultValue={shown}
							currency={currency}
							allowNegative={allowNegative}
							placeholder={placeholder}
							messages="overlay"
							onValueChange={(v) => (amountRef.current = v)}
							onParseError={() => (amountInvalid.current = true)}
						/>
					) : (
						<Input
							autoFocus
							aria-label={ariaLabel}
							value={draft}
							placeholder={placeholder}
							onFocus={(e) => e.currentTarget.select()}
							onChange={(e) => setDraft(e.target.value)}
						/>
					)}
				</div>
			) : (
				<button
					ref={buttonRef}
					type="button"
					disabled={disabled}
					aria-label={`${ariaLabel}: ${readout || "empty"}. Edit`}
					aria-describedby={error ? msgId : undefined}
					onClick={start}
					onKeyDown={(e) => {
						if (e.key === "F2") {
							e.preventDefault();
							start();
						}
					}}
					className={cn(
						"group/iec -mx-1.5 flex min-h-7 w-[calc(100%+0.75rem)] min-w-0 py-1 cursor-text items-center gap-1.5 rounded-md px-1.5 text-left text-sm text-foreground outline-none transition-colors",
						"hover:bg-interactive-secondary-hover focus-ring disabled:cursor-default disabled:hover:bg-transparent",
						isAmount && "justify-end text-right",
						status === "error" && "ring-1 ring-destructive/40",
					)}
				>
					<span
						className={cn(
							"min-w-0",
							isAmount ? "whitespace-nowrap tabular-nums" : "break-words whitespace-normal",
							!readout && "text-tertiary-foreground",
							negative && surfaces.negative,
							status === "saving" && "opacity-70",
						)}
					>
						{readout || placeholder || "—"}
					</span>
					<span
						aria-hidden="true"
						className={cn("flex size-3.5 shrink-0 items-center justify-center", isAmount && "order-first")}
					>
						{status === "saving" ? (
							<CircleNotchIcon size={13} className="animate-spin text-tertiary-foreground" />
						) : status === "saved" ? (
							<CheckIcon size={13} weight="bold" className="text-status-green-text" />
						) : (
							!disabled && (
								<PencilSimpleIcon
									size={13}
									className="text-tertiary-foreground opacity-0 transition-opacity group-hover/iec:opacity-100 group-focus-visible/iec:opacity-100 no-hover:opacity-100"
								/>
							)
						)}
					</span>
				</button>
			)}
			<div
				id={msgId}
				aria-live="polite"
				className={cn("text-2xs", error ? cn("mt-0.5", surfaces.negative, isAmount && "text-right") : "sr-only")}
			>
				{error ?? (status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "")}
			</div>
		</div>
	);
}
