"use client";

import { DotsThreeIcon, XIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
	LiveStatus,
	toAriaKeyShortcuts,
	useShortcutAllowed,
} from "../../base";
import { useIsMac } from "../../base/hooks/use-platform";
import { isTypingTarget, matchesCombo } from "../../lib/keyboard";
import { formatCurrency, Kbd } from "../../lib/shared";

/**
 * Remember where focus came from when it enters an element; if the element unmounts while it
 * holds focus (the bar disappears, the toast expires), send focus back there instead of <body>.
 */
function useFocusReturn<T extends HTMLElement>() {
	const ref = React.useRef<T>(null);
	const back = React.useRef<HTMLElement | null>(null);
	const onFocusCapture = React.useCallback((e: React.FocusEvent) => {
		const from = e.relatedTarget as HTMLElement | null;
		if (from && ref.current && !ref.current.contains(from)) back.current = from;
	}, []);
	React.useLayoutEffect(() => {
		const node = ref.current;
		return () => {
			const target = back.current;
			if (node && target && node.contains(document.activeElement)) {
				requestAnimationFrame(() => {
					if (target.isConnected) target.focus();
				});
			}
		};
	}, []);
	return { ref, onFocusCapture };
}

export type BulkAction = {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onSelect: () => void;
	/** Red label; lives at the end of the overflow menu unless there's room. */
	destructive?: boolean;
	/** "p", "shift+v", "mod+e" — active while rows are selected (single keys are ignored while typing). */
	shortcut?: string;
	disabled?: boolean;
	/** Always put this action in the ⋯ menu. */
	overflow?: boolean;
};

export type BulkActionBarProps = Omit<React.ComponentProps<"div">, "children"> & {
	/** Selected rows. The bar renders nothing at 0. */
	count: number;
	/** Sum of the selected rows' money field, as a decimal string (use `sumAmounts`). */
	total?: string;
	currency?: string;
	/** Rows in the whole list — shows "Select all N" while only some are selected. */
	totalCount?: number;
	onSelectAll?: () => void;
	/** Clear the selection (also Esc). */
	onClear: () => void;
	actions: BulkAction[];
	/** Buttons shown before the rest go into the ⋯ menu. Default 3. */
	maxVisible?: number;
	/** Stick to the bottom of the scrolling container. Default true. */
	sticky?: boolean;
	/** Accessible name of the toolbar. */
	label?: string;
};

/** Floating toolbar for ticked rows: "3 selected · RM 34,890.00", Select all / Clear, actions and a ⋯ menu. */
export function BulkActionBar(props: BulkActionBarProps) {
	const { count, total, currency = "MYR" } = props;
	// Stays mounted at 0 so the first "1 selected" is announced; a live region inserted with its text often isn't.
	const status = count > 0 ? `${count} selected${total != null ? `, ${formatCurrency(total, currency)}` : ""}` : "";
	return (
		<>
			<LiveStatus>{status}</LiveStatus>
			{count > 0 && <BulkActionBarInner {...props} />}
		</>
	);
}

function BulkActionBarInner({
	count,
	total,
	currency = "MYR",
	totalCount,
	onSelectAll,
	onClear,
	actions,
	maxVisible = 3,
	sticky = true,
	label = "Bulk actions",
	className,
	...props
}: BulkActionBarProps) {
	const mac = useIsMac();
	const [menuOpen, setMenuOpen] = React.useState(false);
	const { ref, onFocusCapture } = useFocusReturn<HTMLDivElement>();
	const allowed = useShortcutAllowed();
	const latest = React.useRef({ actions, onClear, allowed });
	latest.current = { actions, onClear, allowed };
	/** The shortcut to advertise, or undefined while the user has single-key shortcuts off. */
	const liveShortcut = (k?: string) => (k && allowed(k) ? k : undefined);

	// Esc clears; action shortcuts run. Paused while the ⋯ menu is open (it owns Esc then).
	React.useEffect(() => {
		if (menuOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.defaultPrevented) return;
			const typing = isTypingTarget(e.target);
			if (matchesCombo(e, "esc")) {
				if (typing) return;
				e.preventDefault();
				latest.current.onClear();
				return;
			}
			for (const a of latest.current.actions) {
				if (!a.shortcut || a.disabled || !matchesCombo(e, a.shortcut)) continue;
				// Bare-letter shortcuts honour the user's "Single-key shortcuts" switch (WCAG 2.1.4).
				if (!latest.current.allowed(a.shortcut)) continue;
				if (typing && !a.shortcut.toLowerCase().includes("mod")) return;
				e.preventDefault();
				a.onSelect();
				return;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [menuOpen]);

	const inline = actions.filter((a) => !a.overflow).slice(0, maxVisible);
	const more = actions.filter((a) => !inline.includes(a));
	const canSelectAll = !!onSelectAll && totalCount != null && count < totalCount;

	// ← → Home End move along the toolbar (Tab still works).
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
		const root = e.currentTarget;
		if (!root.contains(e.target as Node)) return; // keys from the portalled menu bubble here in React
		const items = Array.from(root.querySelectorAll<HTMLElement>("button:not([disabled])"));
		const i = items.indexOf(document.activeElement as HTMLElement);
		if (i < 0) return;
		e.preventDefault();
		const next =
			e.key === "Home"
				? 0
				: e.key === "End"
					? items.length - 1
					: (i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
		items[next].focus();
	};

	return (
		<div
			data-slot="cy-bulk-action-bar"
			className={cn(
				"@container pointer-events-none z-30 flex justify-center print:hidden",
				sticky && "sticky bottom-3",
				className,
			)}
			{...props}
		>
			<div
				ref={ref}
				role="toolbar"
				aria-label={label}
				aria-orientation="horizontal"
				onKeyDown={onKeyDown}
				onFocusCapture={onFocusCapture}
				className="pointer-events-auto flex w-full max-w-full flex-wrap items-center gap-x-1 gap-y-1.5 rounded-xl border border-overlay-border bg-overlay p-1.5 shadow-overlay @3xl:w-fit"
			>
				<div className="flex min-w-0 flex-1 basis-full flex-wrap items-center gap-1 @3xl:basis-auto">
					<p className="mr-auto min-w-0 basis-full px-1.5 py-0.5 text-sm @sm:basis-auto @sm:py-0 text-foreground tabular-nums">
						<span className="font-medium whitespace-nowrap">{count} selected</span>
						{total != null && (
							<>
								<span aria-hidden="true" className="px-1.5 text-tertiary-foreground">
									·
								</span>
								<span className="whitespace-nowrap text-muted-foreground">{formatCurrency(total, currency)}</span>
							</>
						)}
					</p>
					{canSelectAll && (
						<Button variant="skeleton" onClick={onSelectAll} className="text-primary">
							Select all {totalCount}
						</Button>
					)}
					<Button variant="skeleton" onClick={onClear} aria-keyshortcuts="Escape" className="gap-1.5">
						<XIcon size={14} aria-hidden="true" />
						Clear
						<Kbd keys="esc" className="hidden @xl:inline-flex" aria-hidden="true" />
					</Button>
				</div>
				<span aria-hidden="true" className="mx-0.5 hidden h-5 w-px bg-overlay-separator @3xl:block" />
				<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 @3xl:flex-none">
					{inline.map((a) => {
						const shortcut = liveShortcut(a.shortcut);
						return (
							<Button
								key={a.id}
								variant="secondary"
								disabled={a.disabled}
								onClick={a.onSelect}
								aria-keyshortcuts={shortcut ? toAriaKeyShortcuts(shortcut, mac) : undefined}
								title={shortcut ? `${a.label} (${shortcut.toUpperCase()})` : undefined}
								className={cn("gap-1.5", a.destructive && "text-error-text hover:text-error-text")}
							>
								{a.icon && (
									<span aria-hidden="true" className="flex size-3.5 items-center justify-center">
										{a.icon}
									</span>
								)}
								{a.label}
								{shortcut && <Kbd keys={shortcut} aria-hidden="true" className="hidden @3xl:inline-flex" />}
							</Button>
						);
					})}
					{more.length > 0 && (
						<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
							<DropdownMenuTrigger render={<Button variant="secondary" aria-label="More actions" className="w-7 px-0" />}>
								<DotsThreeIcon size={16} weight="bold" aria-hidden="true" />
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" align="end" className="w-52">
								{more.map((a) => {
									const shortcut = liveShortcut(a.shortcut);
									return (
										<DropdownMenuItem
											key={a.id}
											disabled={a.disabled}
											onClick={a.onSelect}
											aria-keyshortcuts={shortcut ? toAriaKeyShortcuts(shortcut, mac) : undefined}
											className={cn(
												a.destructive &&
													"text-error-text focus:text-error-text data-highlighted:text-error-text [&_svg]:text-current",
											)}
										>
											{a.icon && (
												<span aria-hidden="true" className="flex size-3.5 items-center justify-center">
													{a.icon}
												</span>
											)}
											{a.label}
											{shortcut && (
												<DropdownMenuShortcut>
													<Kbd keys={shortcut} aria-hidden="true" />
												</DropdownMenuShortcut>
											)}
										</DropdownMenuItem>
									);
								})}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</div>
	);
}
