"use client";

import { ArrowBendDownLeftIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { InputGroupButton } from "../ui/input-group";
import { cn } from "../../lib/utils";
import type { FormEvent, KeyboardEvent } from "react";

/**
 * Compact inline prompt input with submit button on the same line.
 * Designed for simple text input without attachments.
 */
export function CompactPromptInput({
	value,
	onChange,
	onSubmit,
	placeholder = "Describe changes...",
	isLoading,
	className,
}: {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	placeholder?: string;
	isLoading?: boolean;
	className?: string;
}) {
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (value.trim() && !isLoading) onSubmit();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey && value.trim() && !isLoading) {
			e.preventDefault();
			onSubmit();
		}
	};

	return (
		<form onSubmit={handleSubmit} className={cn("w-full", className)}>
			{/* The input drops its outline, so the frame shows focus instead. */}
			<div className="flex items-center gap-2 rounded-xl border bg-interactive-secondary dark:bg-card px-3 py-2 dark:border-foreground/15 shadow-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring">
				<input
					type="text"
					aria-label="Message"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					// readOnly, not disabled: disabling the focused input drops focus to <body>.
					readOnly={isLoading}
					aria-busy={isLoading || undefined}
					className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
				/>
				<InputGroupButton
					type="submit"
					variant="primary"
					size="icon-sm"
					aria-label={isLoading ? "Submitting" : "Submit"}
					disabled={!value.trim() || isLoading}
				>
					{isLoading ? (
						<SpinnerGapIcon className="size-4 animate-spin" />
					) : (
						<ArrowBendDownLeftIcon className="size-4" />
					)}
				</InputGroupButton>
			</div>
		</form>
	);
}
