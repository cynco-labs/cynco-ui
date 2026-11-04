"use client";

import * as React from "react";
import { cn, useControllableState } from "../../base";
import type { Density } from "../../lib/shared";

const DENSITIES: Array<{ value: Density; label: string; lines: number[] }> = [
	{ value: "compact", label: "Compact", lines: [2.5, 5.5, 8.5, 11.5] },
	{ value: "default", label: "Default", lines: [3, 7, 11] },
	{ value: "comfortable", label: "Comfortable", lines: [4, 10] },
];

function DensityGlyph({ lines }: { lines: number[] }) {
	return (
		<svg
			viewBox="0 0 14 14"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			aria-hidden="true"
		>
			{lines.map((y) => (
				<line key={y} x1="2" x2="12" y1={y} y2={y} />
			))}
		</svg>
	);
}

export type DensityToggleProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
	value?: Density;
	defaultValue?: Density;
	onValueChange?: (density: Density) => void;
	/** `auto` hides the words when the nearest @container is under 22rem; `never` = icons only. */
	labels?: "auto" | "always" | "never";
	/** Remember the choice in localStorage under this key (uncontrolled use). */
	storageKey?: string;
	/** Accessible name of the radio group. */
	label?: string;
};

/** Compact / Default / Comfortable as a radio group (← → to change). Feed its value to DensityProvider. */
export function DensityToggle({
	value,
	defaultValue = "default",
	onValueChange,
	labels = "auto",
	storageKey,
	label = "Row density",
	className,
	...props
}: DensityToggleProps) {
	const [current, setCurrent] = useControllableState<Density>({
		prop: value,
		defaultProp: defaultValue,
		onChange: (d) => {
			onValueChange?.(d);
			if (storageKey) {
				try {
					localStorage.setItem(storageKey, d);
				} catch {
					/* storage unavailable */
				}
			}
		},
	});
	const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

	React.useEffect(() => {
		if (!storageKey || value !== undefined) return;
		try {
			const saved = localStorage.getItem(storageKey) as Density | null;
			if (saved && DENSITIES.some((d) => d.value === saved) && saved !== current) setCurrent(saved);
		} catch {
			/* storage unavailable */
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageKey]);

	const onKeyDown = (e: React.KeyboardEvent, i: number) => {
		const step =
			e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
		const next = step
			? (i + step + DENSITIES.length) % DENSITIES.length
			: e.key === "Home"
				? 0
				: e.key === "End"
					? DENSITIES.length - 1
					: -1;
		if (next < 0) return;
		e.preventDefault();
		setCurrent(DENSITIES[next].value);
		refs.current[next]?.focus();
	};

	return (
		<div
			role="radiogroup"
			aria-label={label}
			data-slot="cy-density-toggle"
			className={cn(
				"inline-flex max-w-full items-center gap-0.5 rounded-lg border border-table-tray-border bg-table-tray p-0.5 print:hidden",
				className,
			)}
			{...props}
		>
			{DENSITIES.map((d, i) => {
				const active = current === d.value;
				return (
					// biome-ignore lint/a11y/useSemanticElements: a segmented control is a roving-tabindex radio group of buttons, not <input type=radio>
					<button
						key={d.value}
						ref={(el) => {
							refs.current[i] = el;
						}}
						type="button"
						role="radio"
						aria-checked={active}
						aria-label={d.label}
						title={d.label}
						tabIndex={active ? 0 : -1}
						onClick={() => setCurrent(d.value)}
						onKeyDown={(e) => onKeyDown(e, i)}
						className={cn(
							"flex h-6 min-w-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 text-tertiary-foreground outline-none transition-colors duration-150",
							"hover:text-foreground focus-visible:text-foreground focus-ring",
							active && "border-table-surface-border bg-table-surface text-foreground shadow-segment",
						)}
					>
						<DensityGlyph lines={d.lines} />
						{labels !== "never" && (
							<span className={cn("text-sm font-medium", labels === "auto" && "@max-[22rem]:sr-only")}>{d.label}</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
