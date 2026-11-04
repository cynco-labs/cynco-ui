"use client";

import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import * as React from "react";
import { cn, Input, LiveStatus, type StatusTone } from "../../base";
import { hasModKey } from "../../lib/keyboard";
import { ToneDot } from "../../lib/shared";
import type { JournalGridAccount } from "./journal-grid";

const TYPE_TONE: Record<string, StatusTone> = {
	asset: "blue",
	liability: "amber",
	equity: "purple",
	revenue: "green",
	income: "green",
	expense: "red",
};
const toneOf = (type: string) =>
	TYPE_TONE[type.replace(/^contra_/, "")] ?? (type.includes("expense") || type.includes("cost") ? "red" : "neutral");

/** Matches on code (with or without the dash) first, then name and type. */
function filterAccounts(accounts: JournalGridAccount[], query: string) {
	const q = query.trim().toLowerCase();
	if (!q) return accounts;
	const qc = q.replace(/-/g, "");
	const byCode = accounts.filter((a) => a.code.toLowerCase().replace(/-/g, "").startsWith(qc));
	const rest = accounts.filter((a) => !byCode.includes(a) && `${a.name} ${a.type} ${a.code}`.toLowerCase().includes(q));
	return [...byCode, ...rest];
}

type AccountComboboxProps = {
	accounts: JournalGridAccount[];
	valueId?: string;
	onSelect: (a: JournalGridAccount) => void;
	inputProps: React.ComponentProps<"input"> & Record<`data-${string}`, string>;
};

/**
 * A searchable account cell: type a code or name and the list filters; ↑ ↓ choose, Enter or Tab
 * takes the highlighted account, Esc closes. With the list closed, arrows and Enter belong to the grid.
 */
export function AccountCombobox({ accounts, valueId, onSelect, inputProps }: AccountComboboxProps) {
	const selected = accounts.find((a) => a.id === valueId);
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState<string | null>(null);
	const [hl, setHl] = React.useState(0);
	const [focused, setFocused] = React.useState(false);
	const listRef = React.useRef<HTMLUListElement>(null);
	const wrapRef = React.useRef<HTMLDivElement>(null);
	const listId = React.useId();
	const results = React.useMemo(() => filterAccounts(accounts, query ?? "").slice(0, 60), [accounts, query]);
	const label = selected ? `${selected.code} · ${selected.name}` : "";

	React.useEffect(() => {
		if (!open) return;
		listRef.current?.querySelector<HTMLElement>(`[data-index="${hl}"]`)?.scrollIntoView({ block: "nearest" });
	}, [hl, open]);

	const close = () => {
		setOpen(false);
		setQuery(null);
	};
	const choose = (a: JournalGridAccount | undefined) => {
		if (a) onSelect(a);
		close();
		// Keep focus in the cell with the new label selected, so typing searches again.
		requestAnimationFrame(() => {
			const el = wrapRef.current?.querySelector("input");
			if (el && document.activeElement === el) el.select();
		});
	};
	const openList = () => {
		setOpen(true);
		setHl(
			Math.max(
				0,
				results.findIndex((a) => a.id === valueId),
			),
		);
	};

	return (
		<div ref={wrapRef} className="relative min-w-0">
			<Input
				{...inputProps}
				role="combobox"
				aria-expanded={open}
				aria-controls={listId}
				aria-autocomplete="list"
				aria-activedescendant={open && results[hl] ? `${listId}-${hl}` : undefined}
				autoComplete="off"
				spellCheck={false}
				placeholder="Code or name…"
				title={label || undefined}
				value={query ?? label}
				className={cn("pr-7", !focused && selected && "text-transparent")}
				onFocus={(e) => {
					setFocused(true);
					e.currentTarget.select();
				}}
				onBlur={() => {
					setFocused(false);
					close();
				}}
				onClick={() => !open && openList()}
				onChange={(e) => {
					setQuery(e.target.value);
					setOpen(true);
					setHl(0);
				}}
				onKeyDown={(e) => {
					const consume = () => {
						e.preventDefault();
						e.stopPropagation();
					};
					if ((e.key === "ArrowDown" && e.altKey) || e.key === "F4") {
						consume();
						if (open) close();
						else openList();
					} else if (open && e.key === "ArrowDown") {
						consume();
						setHl((i) => Math.min(results.length - 1, i + 1));
					} else if (open && e.key === "ArrowUp") {
						consume();
						setHl((i) => Math.max(0, i - 1));
					} else if (open && e.key === "Enter" && !hasModKey(e)) {
						consume();
						choose(results[hl]);
					} else if (open && e.key === "Escape") {
						consume();
						close();
					} else if (open && e.key === "Tab" && query) {
						choose(results[hl]); // then let the grid move on
					}
				}}
			/>
			{/* Styled read-out (mono code + name) over the input when it isn't being edited. */}
			{!focused && selected && (
				<span
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 left-0 right-7 flex min-w-0 items-center gap-1.5 pl-2"
				>
					<span className="shrink-0 font-mono text-2xs font-medium text-tertiary-foreground">{selected.code}</span>
					<span className="min-w-0 truncate text-sm text-foreground">{selected.name}</span>
				</span>
			)}
			<CaretUpDownIcon
				aria-hidden="true"
				size={12}
				className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-tertiary-foreground"
			/>
			{open && (
				<ul
					ref={listRef}
					id={listId}
					// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <ul role=listbox> with <li role=option> is the combobox pattern from the ARIA practices guide
					role="listbox"
					aria-label="Accounts"
					className="absolute top-full left-0 z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-overlay-border bg-overlay p-1 shadow-overlay @xl:w-[max(100%,18rem)]"
				>
					{/* Not an option: hidden from the listbox and announced by the status region below. */}
					{results.length === 0 && (
						<li role="presentation" aria-hidden="true" className="px-2 py-3 text-center text-xs text-tertiary-foreground">
							No account matches “{query}”
						</li>
					)}
					{results.map((a, i) => (
						// biome-ignore lint/a11y/useFocusableInteractive: options are reached through aria-activedescendant from the input, so they take no tab stop
						// biome-ignore lint/a11y/useKeyWithClickEvents: key handling lives on the input, which drives the listbox through aria-activedescendant
						<li
							key={a.id}
							id={`${listId}-${i}`}
							data-index={i}
							// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <ul role=listbox> with <li role=option> is the combobox pattern from the ARIA practices guide
							role="option"
							aria-selected={i === hl}
							onMouseDown={(e) => e.preventDefault()}
							onMouseMove={() => setHl(i)}
							onClick={() => choose(a)}
							className={cn(
								"flex min-h-[30px] cursor-default items-center gap-2 rounded-lg px-2 py-1 text-sm text-muted-foreground",
								i === hl && "bg-overlay-hover text-foreground",
							)}
						>
							<ToneDot tone={toneOf(a.type)} />
							<span className="w-16 shrink-0 font-mono text-2xs font-medium text-tertiary-foreground">{a.code}</span>
							<span className="min-w-0 flex-1 truncate">{a.name}</span>
							{a.id === valueId && <CheckIcon aria-hidden="true" size={12} className="shrink-0 text-tertiary-foreground" />}
						</li>
					))}
				</ul>
			)}
			{/* Always mounted so the "no match" message is announced when the list empties. */}
			<LiveStatus>{open && results.length === 0 ? `No account matches “${query ?? ""}”` : ""}</LiveStatus>
		</div>
	);
}
