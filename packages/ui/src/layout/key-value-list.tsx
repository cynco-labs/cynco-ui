"use client";

import type * as React from "react";
import { cn } from "../base";
import { surfaces } from "./surfaces";

/** A label/value list that stacks the label above the value on narrow containers. */
export function KeyValueList({
	items,
	className,
	...props
}: Omit<React.ComponentProps<"dl">, "children"> & {
	items: Array<{ label: React.ReactNode; value: React.ReactNode; negative?: boolean; strong?: boolean }>;
}) {
	return (
		<dl data-slot="cy-kv" className={cn("@container divide-y divide-table-row-divider text-sm", className)} {...props}>
			{items.map((it, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: rows are stateless and render in the order given, so position is their identity
					key={i}
					className="flex flex-col gap-0.5 py-2 @[16rem]:flex-row @[16rem]:items-baseline @[16rem]:justify-between @[16rem]:gap-4"
				>
					<dt className={cn("text-tertiary-foreground", it.strong && "font-medium text-foreground")}>{it.label}</dt>
					<dd
						className={cn(
							"tabular-nums text-foreground @[16rem]:text-right",
							it.strong && "font-semibold",
							it.negative && surfaces.negative,
						)}
					>
						{it.value}
					</dd>
				</div>
			))}
		</dl>
	);
}
