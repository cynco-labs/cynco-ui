"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { LiveStatus } from "./live-status";
import { Button, type ButtonProps } from "../ui/button";
import { cn, copyToClipboard } from "../../lib/utils";
import type React from "react";
import { useEffect, useState } from "react";

export function CopyTextButton({
	text,
	className,
	children,
	copySize,
	variant = "secondary",
	icon,
}: {
	text: string;
	className?: string;
	children?: React.ReactNode;
	copySize?: number;
	variant?: string;
	icon?: React.ReactNode;
}) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 1000);
		return () => clearTimeout(timer);
	}, [copied]);

	return (
		<>
			<Button
				variant={variant as ButtonProps["variant"]}
				size="icon"
				aria-label={children ? undefined : "Copy"}
				className={cn(
					"h-6 px-2 text-muted-foreground w-fit font-mono rounded-md truncate justify-start",
					className,
				)}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void copyToClipboard(text).then(setCopied);
				}}
			>
				{children && <span className="truncate block">{children}</span>}
				<div className="flex items-center justify-center">
					{copied ? (
						<CheckIcon size={copySize || 13} className="text-foreground" />
					) : (
						(icon ?? <CopyIcon size={copySize || 13} />)
					)}
				</div>
			</Button>
			<LiveStatus>
				{copied ? "Copied" : ""}
			</LiveStatus>
		</>
	);
}
