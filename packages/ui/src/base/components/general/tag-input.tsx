"use client";

import { XIcon } from "@phosphor-icons/react";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useControllableState } from "../../hooks/use-controllable-state";
import { inputFocusWithinClassName, inputInvalidClassName, inputSurfaceClassName } from "../../lib/input-classes";
import { cn } from "../../lib/utils";
import { LiveStatus } from "./live-status";

interface TagInputProps extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange"> {
	/** Controlled tags. */
	value?: string[];
	/** Initial tags for uncontrolled use. */
	defaultValue?: string[];
	onValueChange?: (tags: string[]) => void;
	inputValue?: string;
	onInputChange?: (value: string) => void;
	placeholder?: string;
	onTagAdd?: () => void;
	onTagRemove?: (index: number) => void;
}

function TagInput({
	className,
	value: valueProp,
	defaultValue = [],
	onValueChange,
	inputValue: controlledInputValue,
	onInputChange,
	placeholder = "Add a tag...",
	onTagAdd,
	onTagRemove,
	...props
}: TagInputProps) {
	const [value = defaultValue, setValue] = useControllableState({
		prop: valueProp,
		defaultProp: defaultValue,
		onChange: onValueChange,
	});
	const [internalInputValue, setInternalInputValue] = React.useState("");
	const [isFocused, setIsFocused] = React.useState(false);
	// Tags change without focus moving (Space, paste, Backspace), so announce them.
	const [announcement, setAnnouncement] = React.useState("");
	const inputRef = React.useRef<HTMLInputElement>(null);

	const inputValue = controlledInputValue !== undefined ? controlledInputValue : internalInputValue;
	const setInputValue = onInputChange || setInternalInputValue;

	const addTag = React.useCallback(() => {
		const trimmedValue = inputValue.trim();
		if (trimmedValue && !value.includes(trimmedValue)) {
			setValue([...value, trimmedValue]);
			setInputValue("");
			setAnnouncement(`${trimmedValue} added`);
			onTagAdd?.();
		}
	}, [inputValue, value, setValue, setInputValue, onTagAdd]);

	const removeTag = React.useCallback(
		(index: number) => {
			const removed = value[index];
			if (removed === undefined) return;
			const newTags = value.filter((_, i) => i !== index);
			setValue(newTags);
			setAnnouncement(`${removed} removed`);
			onTagRemove?.(index);
		},
		[value, setValue, onTagRemove],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		// Check if space was added at the end
		if (newValue.endsWith(" ")) {
			const trimmedValue = newValue.trim();
			if (trimmedValue && !value.includes(trimmedValue)) {
				setValue([...value, trimmedValue]);
				setInputValue("");
				setAnnouncement(`${trimmedValue} added`);
				onTagAdd?.();
			}
		} else {
			setInputValue(newValue);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const pastedText = e.clipboardData.getData("text");

		// Check if pasted text contains spaces (likely multiple tags)
		if (pastedText.includes(" ")) {
			e.preventDefault();

			// Split by whitespace and filter out empty strings
			const newTags = pastedText
				.split(/\s+/)
				.map((tag) => tag.trim())
				.filter((tag) => tag && !value.includes(tag));

			if (newTags.length > 0) {
				setValue([...value, ...newTags]);
				setInputValue("");
				setAnnouncement(`${newTags.join(", ")} added`);
				// Call onTagAdd for each tag added
				if (onTagAdd) {
					for (let i = 0; i < newTags.length; i++) {
						onTagAdd();
					}
				}
			}
		}
		// If no spaces, let default paste behavior happen
	};

	useHotkeys("enter", addTag, {
		enableOnFormTags: ["input"],
		enabled: isFocused,
	});

	useHotkeys("backspace", () => removeTag(value.length - 1), {
		enableOnFormTags: ["input"],
		enabled: isFocused && inputValue === "",
	});

	return (
		// A label, so a click anywhere in the box focuses the field without a handler on a plain div.
		<label
			className={cn(
				"flex w-full min-w-0 cursor-text flex-wrap items-center gap-2 p-2 text-left selection:bg-primary selection:text-primary-foreground",
				inputSurfaceClassName,
				inputFocusWithinClassName,
				inputInvalidClassName,
				"min-h-7",
				className,
			)}
			data-slot="input"
			data-state={isFocused ? "open" : "closed"}
		>
			{value.map((tag, index) => {
				const displayValue = typeof tag === "string" ? tag : String(tag);
				return (
					<div
						key={displayValue}
						className="flex items-center gap-1 border border-border bg-muted rounded-lg pl-3 pr-2 py-1 text-xs"
					>
						<span className="text-2xs">{displayValue}</span>
						<button
							type="button"
							className="relative rounded-sm focus-ring after:absolute after:-inset-y-1.5 after:-right-2 after:-left-1"
							aria-label={`Remove ${displayValue}`}
							onClick={(e) => {
								e.stopPropagation();
								removeTag(index);
								// This button unmounts; keep focus in the field.
								inputRef.current?.focus();
							}}
						>
							<XIcon size={12} className="size-3 text-subtle" />
						</button>
					</div>
				);
			})}
			<input
				{...props}
				ref={inputRef}
				type="text"
				className="min-w-[100px] flex-grow bg-transparent text-sm outline-none touch:text-base"
				placeholder={value.length === 0 ? placeholder : ""}
				value={inputValue}
				onChange={handleInputChange}
				onPaste={handlePaste}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="off"
				spellCheck={false}
				data-1p-ignore
				data-lpignore="true"
				data-bwignore="true"
			/>
			<LiveStatus>{announcement}</LiveStatus>
		</label>
	);
}

export { TagInput };
