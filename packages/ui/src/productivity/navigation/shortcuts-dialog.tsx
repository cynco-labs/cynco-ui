"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	cn,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Label,
	LiveStatus,
	Switch,
	useCharacterKeyShortcuts,
	useControllableState,
	useShortcutAllowed,
} from "../../base";
import { Kbd, useHotkey } from "../../lib/shared";
import { describeKeys, KeySeq, liveKeys } from "./key-seq";
import { fold } from "./score";

export type ShortcutsDialogItem = {
	/** "mod+k", "g i" (sequence), "?"; an array lists alternatives. */
	keys: string | string[];
	label: string;
	/**
	 * Fires only while its own component has focus (e.g. "=" inside an amount cell), so the
	 * single-key switch doesn't apply and the row is never shown as off.
	 */
	focusScoped?: boolean;
};
export type ShortcutsDialogSection = { title: string; items: ShortcutsDialogItem[] };

export type ShortcutsDialogProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Your shortcuts, grouped. The single-key switch is always shown under them. */
	sections: ShortcutsDialogSection[];
	/** Key that opens the sheet. Default "?" (Shift+/); `false` to bind your own. */
	hotkey?: string | string[] | false;
	title?: string;
} & Omit<React.ComponentProps<typeof DialogContent>, "children" | "title">;

/** The "?" sheet: every keyboard shortcut, grouped and searchable. */
export function ShortcutsDialog({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	sections,
	hotkey = "?",
	title = "Keyboard shortcuts",
	className,
	...props
}: ShortcutsDialogProps) {
	const [open, setOpen] = useControllableState({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange });
	const [query, setQuery] = React.useState("");
	const searchId = React.useId();
	const switchDescId = React.useId();
	const [characterKeys, setCharacterKeys] = useCharacterKeyShortcuts();
	const allowed = useShortcutAllowed();

	useHotkey(hotkey || "?", () => setOpen(true), { enabled: hotkey !== false && !open });

	const q = fold(query.trim());
	const shown = sections
		.map((s) => ({
			...s,
			items: q
				? s.items.filter((it) => {
						const hay = fold(`${it.label} ${describeKeys(it.keys)} ${s.title}`);
						return q.split(/\s+/).every((t) => hay.includes(t));
					})
				: s.items,
		}))
		.filter((s) => s.items.length > 0);
	const shownCount = shown.reduce((n, s) => n + s.items.length, 0);

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setQuery("");
			}}
		>
			<DialogContent
				className={cn("@container flex max-h-[85dvh] max-w-[46rem] flex-col gap-0 p-0", className)}
				{...props}
			>
				<DialogHeader className="px-4 pt-4 pb-3">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Shortcuts never fire while you are typing in a field. Sequences like <Kbd keys="g" /> <Kbd keys="i" /> mean press
						G, then I.
					</DialogDescription>
				</DialogHeader>
				<div className="px-4 pb-3">
					<label htmlFor={searchId} className="sr-only">
						Search shortcuts
					</label>
					<InputGroup>
						<InputGroupAddon align="inline-start" className="pr-0 pl-2.5 text-tertiary-foreground">
							<MagnifyingGlassIcon aria-hidden="true" className="size-3.5" />
						</InputGroupAddon>
						<InputGroupInput
							id={searchId}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search shortcuts…"
							autoComplete="off"
						/>
					</InputGroup>
				</div>
				{/* A short count instead of a live list: re-reading every matching row on each keystroke is noise. */}
				<LiveStatus>
					{q
						? shownCount === 0
							? `No shortcuts match “${query.trim()}”`
							: `${shownCount} ${shownCount === 1 ? "shortcut" : "shortcuts"}`
						: ""}
				</LiveStatus>
				{/* Text only, so it takes a tab stop of its own for keyboard scrolling. */}
				{/* biome-ignore lint/a11y/useSemanticElements: a labelled scroll region is not a <fieldset> */}
				<div
					// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region needs a tab stop so it can be scrolled from the keyboard
					tabIndex={0}
					role="group"
					aria-label={title}
					className="min-h-0 flex-1 overflow-y-auto border-t border-border px-4 pt-3 pb-4 outline-none focus-ring-inset"
				>
					{shown.length === 0 ? (
						<p className="py-8 text-center text-sm text-tertiary-foreground">No shortcuts match “{query.trim()}”.</p>
					) : (
						<div className="gap-x-8 @xl:columns-2">
							{shown.map((s) => (
								<section key={s.title} className="mb-5 min-w-0 break-inside-avoid last:mb-0">
									<h3 className="mb-1 text-xs font-medium text-tertiary-foreground">{s.title}</h3>
									<ul className="divide-y divide-table-row-divider">
										{s.items.map((it) => {
											const live = it.focusScoped ? [it.keys].flat() : liveKeys(it.keys, allowed);
											const off = live.length === 0;
											return (
												<li
													key={it.label + String(it.keys)}
													data-off={off || undefined}
													className={cn(
														"flex items-center justify-between gap-3 py-1.5 text-sm",
														off ? "text-tertiary-foreground" : "text-foreground",
													)}
												>
													<span className="min-w-0">{it.label}</span>
													<span className="flex shrink-0 items-center gap-2">
														{off && <span className="text-2xs">Off</span>}
														<KeySeq keys={off ? it.keys : live} className={cn(off && "opacity-50")} />
													</span>
												</li>
											);
										})}
									</ul>
								</section>
							))}
						</div>
					)}
				</div>
				<div className="border-t border-border px-4 py-3">
					<Label>
						<Switch checked={characterKeys} onCheckedChange={setCharacterKeys} aria-describedby={switchDescId} />
						Single-key shortcuts
					</Label>
					<p id={switchDescId} className="mt-1.5 pl-11 text-xs text-muted-foreground">
						Shortcuts made of letters or symbols alone, like <Kbd keys="?" /> or <Kbd keys="g" /> then <Kbd keys="i" />. Turn
						off if you use speech input or switch control.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
