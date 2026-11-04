"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { cn, copyToClipboard } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { IconButton, type IconButtonProps } from "./icon-button";
import { LiveStatus } from "./live-status";

/** Copy-to-clipboard with a flash of "Copied" that resets itself. */
function useCopyAnimation(text: string, timeout = 1500) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), timeout);
		return () => clearTimeout(timer);
	}, [copied, timeout]);

	const handleCopy = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			e.stopPropagation();
			void copyToClipboard(text).then(setCopied);
		},
		[text],
	);

	return { copied, handleCopy };
}

/** Crossfades the copy glyph into a check, so the confirmation does not rest on colour. */
function AnimatedCopyIcon({ copied }: { copied: boolean }) {
	return (
		<span aria-hidden="true" className="relative inline-flex size-3.5 items-center justify-center">
			<CopyIcon
				className={cn(
					"absolute size-3.5 transition-[opacity,transform] duration-100",
					copied ? "opacity-0 scale-95" : "opacity-100 scale-100",
				)}
			/>
			<CheckIcon
				className={cn(
					"absolute size-3.5 text-foreground transition-[opacity,transform] duration-100",
					copied ? "opacity-100 scale-100" : "opacity-0 scale-95",
				)}
			/>
		</span>
	);
}

export interface CopyButtonProps
	extends Omit<IconButtonProps, "icon" | "onClick" | "children" | "variant" | "tooltip"> {
	/** The string put on the clipboard. */
	text: string;
	/**
	 * `text` is a labelled chip, `icon` is the glyph alone, and `inline` is mono text whose glyph
	 * appears on hover, focus and every touch screen.
	 */
	variant?: "text" | "icon" | "inline";
	/** Shown instead of `text`; the full `text` is still copied. */
	children?: React.ReactNode;
	/** Which side the "Copied!" tooltip opens on. */
	side?: "top" | "bottom" | "left" | "right";
}

/**
 * One copy affordance in three shapes. Each confirms with the same tooltip and the same polite
 * announcement, so a copy reads and sounds the same wherever it appears.
 */
export function CopyButton({ text, variant = "text", side = "right", className, children, ...props }: CopyButtonProps) {
	const { copied, handleCopy } = useCopyAnimation(text);

	const button = (
		<IconButton
			data-slot="copy-button"
			variant={variant === "text" ? "muted" : "skeleton"}
			size="sm"
			iconOrientation="right"
			aria-label={variant === "text" ? undefined : "Copy"}
			{...props}
			icon={<AnimatedCopyIcon copied={copied} />}
			onClick={handleCopy}
			className={cn(
				variant !== "text" && "relative cursor-pointer px-0 after:absolute after:-inset-x-1 hover:text-foreground",
				variant === "inline" &&
					"opacity-0 group-hover:opacity-100 focus-visible:opacity-100 no-hover:opacity-100 transition-opacity",
				variant === "inline" && copied && "opacity-100",
				className,
			)}
		>
			{variant === "text" && <span className="truncate">{children ?? text}</span>}
		</IconButton>
	);

	const confirmed = (
		<>
			<Tooltip open={copied} onOpenChange={() => {}}>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent side={side} sideOffset={8}>
					Copied!
				</TooltipContent>
			</Tooltip>
			<LiveStatus>{copied ? "Copied" : ""}</LiveStatus>
		</>
	);

	if (variant !== "inline") return confirmed;

	return (
		<span
			data-slot="copy-button-inline"
			className="group flex w-fit max-w-full items-center gap-1 text-tertiary-foreground"
		>
			<span className="w-full truncate font-mono text-2xs font-medium">{children ?? text}</span>
			{confirmed}
		</span>
	);
}
