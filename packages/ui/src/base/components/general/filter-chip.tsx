"use client";

import { XIcon } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

/** An active filter shown as `label value ×`, e.g. inside a search bar or toolbar. */
export function FilterChip({
	label,
	value,
	onRemove,
	className,
	...props
}: Omit<React.ComponentProps<"span">, "children"> & {
	label: string;
	value: string;
	onRemove: () => void;
}) {
	return (
		<span
			data-slot="filter-chip"
			className={cn(
				"flex h-5 max-w-56 shrink-0 items-center gap-1 rounded-md bg-active-primary pr-0.5 pl-1.5 text-xs",
				className,
			)}
			{...props}
		>
			<span className="shrink-0 text-subtle">{label}</span>
			<span className="truncate text-foreground">{value}</span>
			<button
				type="button"
				aria-label={`Remove ${label} filter`}
				onClick={onRemove}
				className="relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-tertiary-foreground after:absolute after:-inset-1 hover:bg-primary/10 hover:text-foreground"
			>
				<XIcon aria-hidden="true" size={10} weight="bold" />
			</button>
		</span>
	);
}
