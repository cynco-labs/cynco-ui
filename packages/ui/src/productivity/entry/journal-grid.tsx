"use client";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button, cn, IconButton, Input, StatusChip } from "../../base";
import { useIsMac } from "../../base/hooks/use-platform";
import { hasModKey, hasNoModifiers } from "../../lib/keyboard";
import { formatCurrency, fromSen, Kbd, sumAmounts, surfaces, toSen } from "../../lib/shared";
import { AccountCombobox } from "./account-combobox";
import { AmountInput } from "./amount-input";

export type JournalGridAccount = { id: string; code: string; name: string; type: string };
export type JournalGridLine = { id: string; accountId?: string; description?: string; debit?: string; credit?: string };

type Col = "account" | "description" | "debit" | "credit";
const COLS: Col[] = ["account", "description", "debit", "credit"];

let lineSeq = 0;
const newLine = (): JournalGridLine => ({
	id: `jl-${Date.now().toString(36)}-${++lineSeq}`,
	accountId: undefined,
	description: "",
	debit: "",
	credit: "",
});
/** Zero is stored as "" so an empty cell and 0.00 mean the same thing. */
const normAmount = (v: string) => (v === "" || toSen(v) === 0n ? "" : v);

/** Controlled + uncontrolled lines with a ref that always holds the latest list, so several edits in one keystroke compose. */
function useLines(
	lines: JournalGridLine[] | undefined,
	defaultLines: JournalGridLine[] | undefined,
	onLinesChange?: (l: JournalGridLine[]) => void,
) {
	const [inner, setInner] = React.useState<JournalGridLine[]>(() => defaultLines ?? [newLine(), newLine()]);
	const current = lines ?? inner;
	const ref = React.useRef(current);
	ref.current = current;
	const cb = React.useRef(onLinesChange);
	cb.current = onLinesChange;
	const controlled = lines !== undefined;
	const update = React.useCallback(
		(fn: (prev: JournalGridLine[]) => JournalGridLine[]) => {
			const next = fn(ref.current);
			ref.current = next;
			if (!controlled) setInner(next);
			cb.current?.(next);
		},
		[controlled],
	);
	return [current, update, ref] as const;
}

/** Desktop column template; under @xl each line becomes a card. */
const GRID_COLS =
	"@xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(6.5rem,7.5rem)_minmax(6.5rem,7.5rem)_1.5rem] @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(7rem,9rem)_minmax(7rem,9rem)_1.75rem]";

export type JournalGridProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
	/** Controlled lines. */
	lines?: JournalGridLine[];
	/** Uncontrolled initial lines (default: two blank lines). */
	defaultLines?: JournalGridLine[];
	onLinesChange?: (lines: JournalGridLine[]) => void;
	/** The chart of accounts for the Account picker. */
	accounts: JournalGridAccount[];
	currency?: string;
	/** Fewest lines kept; deleting below this clears the line instead. Default 2 (double entry). */
	minLines?: number;
	/** Show the keyboard legend under the footer. Default true. */
	showShortcuts?: boolean;
};

/**
 * Keyboard-first journal entry. Tab walks Account → Description → Debit → Credit and wraps to the next
 * line; Enter moves down (adding a line at the end); ↑ ↓ move between lines; mod+Enter adds, mod+⌫
 * deletes; Alt+B or `=` then Enter fills the balancing figure. A sticky footer keeps Dr, Cr and the
 * difference in view. Wide containers get a grid; narrow ones a card per line.
 */
export function JournalGrid({
	lines: linesProp,
	defaultLines,
	onLinesChange,
	accounts,
	currency = "MYR",
	minLines = 2,
	showShortcuts = true,
	className,
	onKeyDown,
	...props
}: JournalGridProps) {
	const [lines, setLines, linesRef] = useLines(linesProp, defaultLines, onLinesChange);
	const mac = useIsMac();
	const rootRef = React.useRef<HTMLDivElement>(null);
	const pendingFocus = React.useRef<{ id: string; col: Col } | null>(null);
	const [announcement, setAnnouncement] = React.useState("");
	const say = (s: string) => setAnnouncement((prev) => (prev === s ? `${s} ` : s));

	const cellEl = (id: string, col: Col) =>
		rootRef.current?.querySelector<HTMLElement>(`[data-jg-line="${CSS.escape(id)}"][data-jg-col="${col}"]`) ?? null;
	const focusCell = (id: string, col: Col) => {
		const el = cellEl(id, col);
		if (el) el.focus();
		else pendingFocus.current = { id, col };
	};
	React.useLayoutEffect(() => {
		const p = pendingFocus.current;
		if (!p) return;
		const el = cellEl(p.id, p.col);
		if (el) {
			pendingFocus.current = null;
			el.focus();
		}
	});

	const patch = (id: string, changes: Partial<JournalGridLine>) =>
		setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));

	/** Commit a figure typed into Dr or Cr: clears the other side; a negative flips to the other side. */
	const setAmount = (id: string, side: "debit" | "credit", raw: string) => {
		const other = side === "debit" ? "credit" : "debit";
		let v = normAmount(raw);
		let target: "debit" | "credit" = side;
		if (v.startsWith("-")) {
			v = v.slice(1);
			target = other;
			say(`Negative figure moved to ${other}`);
		}
		const otherOfTarget = target === "debit" ? "credit" : "debit";
		patch(id, v ? { [target]: v, [otherOfTarget]: "" } : { [side]: "" });
	};

	const addLine = (afterIndex: number, focusCol: Col = "account") => {
		const l = newLine();
		setLines((prev) => [...prev.slice(0, afterIndex + 1), l, ...prev.slice(afterIndex + 1)]);
		pendingFocus.current = { id: l.id, col: focusCol };
		say(`Line ${afterIndex + 2} added`);
	};

	const removeLine = (index: number, col: Col = "account") => {
		const cur = linesRef.current;
		if (cur.length <= minLines) {
			const id = cur[index]!.id;
			setLines((prev) =>
				prev.map((l) => (l.id === id ? { id, accountId: undefined, description: "", debit: "", credit: "" } : l)),
			);
			say(`Line ${index + 1} cleared — an entry needs at least ${minLines} lines`);
			focusCell(id, col);
			return;
		}
		const next = cur[index + 1] ?? cur[index - 1];
		setLines((prev) => prev.filter((_, i) => i !== index));
		say(`Line ${index + 1} deleted`);
		if (next) pendingFocus.current = { id: next.id, col };
	};

	/** The figure (and side) that balances the entry, ignoring line `index`. */
	const balancing = (index: number) => {
		const others = linesRef.current.filter((_, i) => i !== index);
		const diff = toSen(sumAmounts(others.map((l) => l.debit))) - toSen(sumAmounts(others.map((l) => l.credit)));
		if (diff === 0n) return null;
		return { side: (diff > 0n ? "credit" : "debit") as "debit" | "credit", amount: fromSen(diff > 0n ? diff : -diff) };
	};
	/** `viaInput`: called from an AmountInput's "=" Enter, which commits the returned figure itself. */
	const fillBalance = (index: number, fromCol?: Col, viaInput = false): string | void => {
		const line = linesRef.current[index];
		if (!line) return;
		const b = balancing(index);
		if (!b) {
			say("The other lines already balance");
			return;
		}
		say(`Filled ${formatCurrency(b.amount, currency)} ${b.side} to balance`);
		if (viaInput && fromCol === b.side) return b.amount; // the AmountInput commits it (and clears the other side)
		patch(line.id, b.side === "debit" ? { debit: b.amount, credit: "" } : { credit: b.amount, debit: "" });
		focusCell(line.id, b.side);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-jg-col]");
		if (!cell) return;
		const cur = linesRef.current;
		const row = cur.findIndex((l) => l.id === cell.dataset.jgLine);
		const ci = COLS.indexOf(cell.dataset.jgCol as Col);
		if (row < 0 || ci < 0) return;
		const col = COLS[ci]!;
		const at = (r: number, c: number) => {
			e.preventDefault();
			focusCell(cur[r]!.id, COLS[c]!);
		};

		if (e.key === "Tab" && !hasModKey(e) && !e.altKey) {
			const flat = row * COLS.length + ci + (e.shiftKey ? -1 : 1);
			// Past the first/last cell, let Tab leave the grid (no keyboard trap).
			if (flat >= 0 && flat < cur.length * COLS.length) at(Math.floor(flat / COLS.length), flat % COLS.length);
		} else if (e.key === "Enter" && hasModKey(e)) {
			e.preventDefault();
			addLine(row);
		} else if (e.key === "Enter" && hasNoModifiers(e)) {
			if (row < cur.length - 1) at(row + 1, ci);
			else {
				e.preventDefault();
				addLine(row);
			}
		} else if (e.key === "Enter" && e.shiftKey && !hasModKey(e) && !e.altKey) {
			if (row > 0) at(row - 1, ci);
		} else if (e.key === "ArrowDown" && hasNoModifiers(e)) {
			if (row < cur.length - 1) at(row + 1, ci);
		} else if (e.key === "ArrowUp" && hasNoModifiers(e)) {
			if (row > 0) at(row - 1, ci);
		} else if (e.key === "Backspace" && hasModKey(e)) {
			e.preventDefault();
			removeLine(row, col);
		} else if (e.altKey && !hasModKey(e) && e.code === "KeyB") {
			// e.code: on a Mac, Alt+B types "∫".
			e.preventDefault();
			fillBalance(row, col);
		}
	};

	const totalDr = sumAmounts(lines.map((l) => l.debit));
	const totalCr = sumAmounts(lines.map((l) => l.credit));
	const diffSen = toSen(totalDr) - toSen(totalCr);
	const diff = fromSen(diffSen < 0n ? -diffSen : diffSen);
	const hasAmounts = toSen(totalDr) !== 0n || toSen(totalCr) !== 0n;
	const balanced = hasAmounts && diffSen === 0n;
	const missingAccounts = lines.filter((l) => !l.accountId && (l.debit || l.credit)).length;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: the root scopes the grid's shortcuts for the cells inside it and is not itself operable
		<div
			data-slot="cy-journal-grid"
			ref={rootRef}
			className={cn("@container flex min-w-0 flex-col", className)}
			onKeyDown={handleKeyDown}
			{...props}
		>
			{showShortcuts && <JournalGridLegend />}
			{/* scroll-mb: a cell focused by Tab or Enter must not scroll in under the sticky balance footer. */}
			{/* biome-ignore lint/a11y/useSemanticElements: <fieldset> sets its own min-width and would break the grid columns */}
			<div
				role="group"
				aria-label="Journal lines"
				className="flex flex-col gap-2 @xl:gap-0 @xl:rounded-lg @xl:border @xl:border-table-surface-border @xl:bg-table-surface [&_[data-jg-col]]:scroll-mb-28"
			>
				<div
					aria-hidden="true"
					className={cn(
						"hidden gap-2 border-b border-table-row-divider px-2 py-1.5 text-xs font-medium text-tertiary-foreground @xl:grid",
						GRID_COLS,
					)}
				>
					<span>Account</span>
					<span>Description</span>
					<span className="text-right">Debit</span>
					<span className="text-right">Credit</span>
					<span />
				</div>
				{lines.map((line, i) => {
					const n = i + 1;
					const id = (c: Col) => `${line.id}-${c}`;
					const cell = (c: Col) => ({ id: id(c), "data-jg-line": line.id, "data-jg-col": c });
					const del = (
						<IconButton
							variant="skeleton"
							size="icon"
							tabIndex={-1}
							aria-label={lines.length <= minLines ? `Clear line ${n}` : `Delete line ${n}`}
							title={`${lines.length <= minLines ? "Clear" : "Delete"} line (${mac ? "⌘" : "Ctrl"}+Backspace)`}
							icon={<TrashIcon />}
							onClick={() => removeLine(i)}
						/>
					);
					const fieldLabel = "text-2xs text-tertiary-foreground @xl:sr-only";
					return (
						// biome-ignore lint/a11y/useSemanticElements: <fieldset> sets its own min-width and would break the grid columns
						<div
							key={line.id}
							role="group"
							aria-label={`Line ${n}`}
							className={cn(
								"grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-lg border border-border bg-card p-2.5 focus-within:border-focus-ring",
								"@xl:items-center @xl:gap-y-0 @xl:rounded-none @xl:border-0 @xl:border-b @xl:border-table-row-divider @xl:bg-transparent @xl:px-2 @xl:py-1 @xl:last:border-b-0 @xl:focus-within:bg-table-row-hover",
								GRID_COLS,
							)}
						>
							<div className="col-span-2 flex items-center justify-between @xl:hidden">
								<span className="text-xs font-medium text-muted-foreground">Line {n}</span>
								{del}
							</div>
							<div className="col-span-2 flex min-w-0 flex-col gap-1 @xl:col-span-1">
								<label htmlFor={id("account")} className={fieldLabel}>
									Account
								</label>
								<AccountCombobox
									accounts={accounts}
									valueId={line.accountId}
									onSelect={(a) => patch(line.id, { accountId: a.id })}
									inputProps={{ ...cell("account"), "aria-label": `Line ${n} account` }}
								/>
							</div>
							<div className="col-span-2 flex min-w-0 flex-col gap-1 @xl:col-span-1">
								<label htmlFor={id("description")} className={fieldLabel}>
									Description
								</label>
								<Input
									{...cell("description")}
									aria-label={`Line ${n} description`}
									placeholder="Line description…"
									autoComplete="off"
									value={line.description ?? ""}
									onFocus={(e) => e.currentTarget.select()}
									onChange={(e) => patch(line.id, { description: e.target.value })}
								/>
							</div>
							{(["debit", "credit"] as const).map((side) => (
								<div key={side} className="flex min-w-24 flex-col gap-1">
									<label htmlFor={id(side)} className={fieldLabel}>
										{side === "debit" ? "Debit" : "Credit"}
									</label>
									<AmountInput
										{...cell(side)}
										aria-label={`Line ${n} ${side}`}
										value={line[side] ?? ""}
										allowNegative
										messages="overlay"
										placeholder=""
										onValueChange={(v) => setAmount(line.id, side, v)}
										onAutoFill={() => fillBalance(i, side, true)}
									/>
								</div>
							))}
							<div className="hidden justify-center @xl:flex">{del}</div>
						</div>
					);
				})}
			</div>

			<Button variant="dotted" className="mt-2 w-full text-tertiary-foreground" onClick={() => addLine(lines.length - 1)}>
				<PlusIcon size={14} aria-hidden="true" />
				Add line
			</Button>

			{/* Sticky balance footer: stays in view while the lines scroll. */}
			<div className={cn("sticky bottom-0 z-10 mt-2", surfaces.card, "shadow-[0_-6px_12px_-10px_var(--border)]")}>
				<div className={cn("grid grid-cols-2 items-center gap-x-3 gap-y-2 px-3 py-2.5 @xl:gap-x-2 @xl:px-2", GRID_COLS)}>
					<div className="col-span-2 flex min-w-0 flex-wrap items-center gap-2 @xl:col-span-2" aria-live="polite">
						{!hasAmounts ? (
							<StatusChip tone="neutral" glyph="dashed" dashed>
								No amounts yet
							</StatusChip>
						) : balanced ? (
							<StatusChip tone="green" glyph="check">
								Balanced
							</StatusChip>
						) : (
							<StatusChip tone="red" glyph="alert">
								<span className="tabular-nums">Out by {formatCurrency(diff, currency)}</span>
							</StatusChip>
						)}
						{hasAmounts && !balanced && (
							<span className="hidden text-xs text-tertiary-foreground @md:inline">
								{diffSen > 0n ? "Credits short" : "Debits short"} · <Kbd keys="alt+b" className="align-middle" /> on a line to
								fill it
							</span>
						)}
						{missingAccounts > 0 && (
							<span className={cn("text-xs", surfaces.negative)}>
								{missingAccounts} {missingAccounts === 1 ? "line needs" : "lines need"} an account
							</span>
						)}
					</div>
					{(
						[
							["Total Dr", totalDr],
							["Total Cr", totalCr],
						] as const
					).map(([lbl, v]) => (
						<div key={lbl} className="flex min-w-0 flex-col @xl:items-end @xl:pr-2">
							<span className="text-2xs text-tertiary-foreground">{lbl}</span>
							<span className="text-sm font-semibold whitespace-nowrap tabular-nums text-foreground">
								{formatCurrency(v, currency)}
							</span>
						</div>
					))}
					<span className="hidden @xl:block" />
				</div>
			</div>

			<div aria-live="polite" className="sr-only">
				{announcement}
			</div>
		</div>
	);
}

const LEGEND: Array<[string | string[], string]> = [
	["Tab", "next cell"],
	[["Enter"], "down / new line"],
	[["Up", "Down"], "line"],
	["mod+Enter", "add line"],
	[["mod", "⌫"], "delete line"],
	["alt+b", "balance"],
	[["=", "Enter"], "balance cell"],
	["Esc", "revert"],
];

function JournalGridLegend() {
	return (
		<ul
			aria-label="Keyboard shortcuts"
			className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-0.5 text-2xs text-tertiary-foreground"
		>
			{LEGEND.map(([k, label]) => (
				<li key={label} className="flex items-center gap-1">
					<Kbd keys={k} />
					<span>{label}</span>
				</li>
			))}
		</ul>
	);
}
