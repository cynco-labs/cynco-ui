"use client";

import { CheckIcon, CopyIcon, type IconProps } from "@phosphor-icons/react";
import { cn, copyToClipboard } from "../../lib/utils";
import { LiveStatus } from "./live-status";
import { CopyButton } from "./copy-button";
import React from "react";

export function CopyablePre({ text, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { text: string }) {
	return (
		<div className={cn("relative w-full min-w-0", className)} {...props}>
			<pre className="text-sm bg-muted/50 p-4 rounded-lg overflow-auto border w-full h-full">
				<CopyButton
					text={text}
					aria-label="Copy"
					className="absolute top-2 right-2 z-10"
				>
					<></>
				</CopyButton>
				<code className="text-sm block w-full whitespace-pre-wrap [overflow-wrap:anywhere]">
					{text}
				</code>
			</pre>
		</div>
	);
}

// A compact, inline version for use in places like badges or small UI elements.
export function CopyableSpan({
	text,
	className = "",
	copySize = 20,
	copyProps = {},
}: {
	text: string;
	className?: string;
	copySize?: number;
	copyProps?: IconProps;
}) {
	const [copied, setCopied] = React.useState(false);

	React.useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 1000);
		return () => clearTimeout(timer);
	}, [copied]);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		void copyToClipboard(text).then(setCopied);
	};

	return (
		<>
			<button
				type="button"
				className={`inline-flex items-center rounded-xl bg-muted/50 pl-3 py-1 text-md font-mono text-muted-foreground relative font-normal gap-1 cursor-pointer transition-opacity ${
					copied ? "opacity-30" : ""
				}${className ? ` ${className}` : ""}`}
				onClick={handleClick}
			>
				<span className="pr-2">{text}</span>
				<span className="ml-1 p-0.5 rounded-md transition bg-transparent size-6 z-[1] static bg-none shadow-none border-none flex items-center justify-center">
					{copied ? (
						<CheckIcon size={copySize} className="text-muted-foreground" />
					) : (
						<CopyIcon size={copySize} className="text-muted-foreground" />
					)}
				</span>
			</button>
			<LiveStatus>
				{copied ? "Copied" : ""}
			</LiveStatus>
		</>
	);
}
