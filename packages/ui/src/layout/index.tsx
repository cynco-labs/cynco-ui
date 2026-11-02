/**
 * Cynco UI — layout primitives.
 *
 * Every component that shows tabular data, KPI tiles or a toolbar is built from these, so
 * responsiveness and surface styling live in ONE place. All of them respond to the width of
 * their CONTAINER (CSS container queries), not the viewport: the same component works in a
 * full page, a side sheet or a 360px phone.
 */
import * as React from "react";
import { cn, useMergedRef, useShortcutAllowed } from "../base";
import { isMacPlatform, useIsMac } from "../base/lib/utils";

/* ───────────── Surfaces ───────────── */

/** Class names for Cynco UI's table tray: a recessed band holding a raised surface. */
export const surfaces = {
	tray: "rounded-xl border border-table-tray-border bg-table-tray p-1",
	surface: "overflow-hidden rounded-lg border border-table-surface-border bg-table-surface",
	card: "rounded-xl border border-border bg-card",
	/** Negative figures and error text — readable in every theme. */
	negative: "text-error-text",
} as const;

/** Shorthand: `text-error-text` when the condition holds. */
export const negativeClass = (isNegative: boolean) => (isNegative ? surfaces.negative : undefined);

export type SectionPanelProps = Omit<React.ComponentProps<"section">, "title"> & {
	title?: React.ReactNode;
	description?: React.ReactNode;
	/** Rendered at the right of the header; wraps under the title on narrow containers. */
	actions?: React.ReactNode;
	/** Remove body padding (for tables and lists that run edge to edge). */
	flush?: boolean;
};

/** A titled card. The header wraps its actions under the title when space runs out. */
export function SectionPanel({ title, description, actions, flush, className, children, ...props }: SectionPanelProps) {
	return (
		<section data-slot="cy-panel" className={cn("@container min-w-0", surfaces.card, className)} {...props}>
			{(title || actions) && (
				<header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4">
					<div className="min-w-0">
						{title && <h3 className="text-md font-semibold text-foreground">{title}</h3>}
						{description && <p className="mt-0.5 text-xs text-tertiary-foreground">{description}</p>}
					</div>
					{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
				</header>
			)}
			<div className={cn(flush ? "pt-3" : "p-4", !title && !actions && !flush && "pt-4")}>{children}</div>
		</section>
	);
}

/* ───────────── Density ───────────── */

export type Density = "compact" | "default" | "comfortable";
const DensityContext = React.createContext<Density>("default");

/** Sets row density for every DataList (and anything reading useDensity) inside it. */
export function DensityProvider({ density, children }: { density: Density; children: React.ReactNode }) {
	return <DensityContext.Provider value={density}>{children}</DensityContext.Provider>;
}
/** The density set by the nearest DensityProvider ("default" outside one). */
export const useDensity = () => React.useContext(DensityContext);
const ROW_PAD: Record<Density, string> = { compact: "py-1", default: "py-2.5", comfortable: "py-3.5" };

/* ───────────── Keyboard ───────────── */

/** Spoken names for keycap glyphs: screen readers read "⌘" or "↵" as symbol names, or skip them. */
const KEY_NAME: Record<string, string> = { "⌘": "Command", "⌥": "Option", "⇧": "Shift", "↵": "Enter", "↑": "Up arrow", "↓": "Down arrow", "←": "Left arrow", "→": "Right arrow", "⌫": "Backspace" };

/** A keycap. `mod` renders ⌘ on Mac and Ctrl elsewhere. */
export function Kbd({ keys, className, ...props }: Omit<React.ComponentProps<"kbd">, "children"> & { keys: string | string[] }) {
	const mac = useIsMac();
	const list = (Array.isArray(keys) ? keys : keys.split("+")).map((k) => {
		const l = k.toLowerCase();
		if (l === "mod") return mac ? "⌘" : "Ctrl";
		if (l === "alt") return mac ? "⌥" : "Alt";
		if (l === "shift") return "⇧";
		if (l === "enter") return "↵";
		if (l === "esc" || l === "escape") return "Esc";
		if (l === "up") return "↑";
		if (l === "down") return "↓";
		if (l === "left") return "←";
		if (l === "right") return "→";
		return k.length === 1 ? k.toUpperCase() : k;
	});
	return (
		<kbd data-slot="cy-kbd" className={cn("inline-flex items-center gap-0.5 font-sans", className)} {...props}>
			{list.map((k, i) => (
				<React.Fragment key={i}>
					<span aria-hidden={KEY_NAME[k] ? true : undefined} className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-border bg-interactive-secondary px-1 text-2xs font-medium text-muted-foreground shadow-[0_1px_0_var(--border)]">
						{k}
					</span>
					{KEY_NAME[k] && <span className="sr-only">{KEY_NAME[k]}</span>}
				</React.Fragment>
			))}
		</kbd>
	);
}

/**
 * Run `handler` when a shortcut is pressed anywhere on the page: "mod+k", "?", "alt+b", "shift+enter", "esc".
 * Ignored while typing in an input/textarea/contenteditable unless `allowInInputs` (or the combo uses mod).
 */
export function useHotkey(combo: string | string[], handler: (e: KeyboardEvent) => void, opts: { enabled?: boolean; allowInInputs?: boolean } = {}) {
	const ref = React.useRef(handler);
	ref.current = handler;
	const allowed = useShortcutAllowed();
	const combos = (Array.isArray(combo) ? combo : [combo])
		// Printable-only keys honour the user's "Single-key shortcuts" switch (WCAG 2.1.4).
		.filter(allowed)
		.join("|");
	React.useEffect(() => {
		if (opts.enabled === false || !combos) return;
		const list = combos.split("|").map((c) => {
			const parts = c.toLowerCase().split("+");
			const key = parts.pop() as string;
			return { key: key === "esc" ? "escape" : key, mod: parts.includes("mod"), alt: parts.includes("alt"), shift: parts.includes("shift") };
		});
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement | null;
			const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
			for (const c of list) {
				const mod = isMacPlatform() ? e.metaKey : e.ctrlKey;
				if (e.key.toLowerCase() !== c.key || mod !== c.mod || e.altKey !== c.alt) continue;
				if (c.shift && !e.shiftKey) continue;
				if (typing && !c.mod && !opts.allowInInputs) continue;
				e.preventDefault();
				ref.current(e);
				return;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [combos, opts.enabled, opts.allowInInputs]);
}

/* ───────────── Toolbars and rows ───────────── */

/** A row of controls that wraps instead of overflowing. */
export function ActionBar({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="cy-action-bar" className={cn("flex min-w-0 flex-wrap items-center gap-2", className)} {...props} />;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
const SCROLL_STOP_RING = "outline-none focus-ring-inset";

/**
 * True while `ref` overflows and holds nothing focusable. Such a scroller needs its own tab stop,
 * or keyboard users (Safari, older Chrome) can't scroll to the hidden part. Re-checked when the
 * scroller resizes or its content is added or removed, not on every render.
 */
export function useNeedsScrollStop<E extends HTMLElement>(ref: React.RefObject<E | null>) {
	const [needs, setNeeds] = React.useState(false);
	React.useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const check = () => {
			const overflows = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
			setNeeds(overflows && !el.querySelector(FOCUSABLE));
		};
		check();
		const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(check);
		resize?.observe(el);
		const content = new MutationObserver(check);
		content.observe(el, { childList: true, subtree: true });
		return () => {
			resize?.disconnect();
			content.disconnect();
		};
	}, [ref]);
	return needs;
}

/**
 * A single row that scrolls sideways when it doesn't fit (tabs, chips, steppers). When it overflows
 * with nothing focusable inside, it becomes a tab stop so the keyboard can scroll it — pass
 * `aria-label` so that stop has a name.
 */
export function ScrollRow({ className, ref, role, tabIndex, ...props }: React.ComponentProps<"div">) {
	const inner = React.useRef<HTMLDivElement>(null);
	const setRef = useMergedRef(inner, ref);
	const needsStop = useNeedsScrollStop(inner);
	const named = props["aria-label"] != null || props["aria-labelledby"] != null;
	return (
		<div
			ref={setRef}
			data-slot="cy-scroll-row"
			role={role ?? (needsStop && named ? "group" : undefined)}
			tabIndex={tabIndex ?? (needsStop ? 0 : undefined)}
			className={cn("flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", SCROLL_STOP_RING, className)}
			{...props}
		/>
	);
}

/* ───────────── Stats ───────────── */

export type StatGridProps = React.ComponentProps<"div"> & {
	/** Smallest tile width before tiles wrap to a new row. */
	min?: "sm" | "md" | "lg";
	/**
	 * `fit` (default): tiles stretch to fill the row, so 3 tiles fill a wide page.
	 * `fill`: keep empty tracks so tiles line up with other grids above/below.
	 */
	mode?: "fit" | "fill";
};
const STAT_MIN = {
	fit: { sm: "grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]", md: "grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]", lg: "grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]" },
	fill: { sm: "grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]", md: "grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]", lg: "grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]" },
} as const;

/** Tiles that fill the row and wrap — 4-up on a page, 2-up in a sheet, 1-up on a phone. */
export function StatGrid({ min = "md", mode = "fit", className, role, ...props }: StatGridProps) {
	// A labelled grid is announced as a named group of figures.
	const named = props["aria-label"] != null || props["aria-labelledby"] != null;
	return <div data-slot="cy-stat-grid" role={role ?? (named ? "group" : undefined)} className={cn("grid gap-3", STAT_MIN[mode][min], className)} {...props} />;
}

export type StatusToneName = "green" | "blue" | "red" | "orange" | "amber" | "yellow" | "purple" | "pink" | "fuchsia" | "neutral";
/** Background class for each status tone (dots, bars, legend keys). */
export const toneBg: Record<StatusToneName, string> = {
	green: "bg-status-green", blue: "bg-status-blue", red: "bg-status-red", orange: "bg-status-orange", amber: "bg-status-amber",
	yellow: "bg-status-yellow", purple: "bg-status-purple", pink: "bg-status-pink", fuchsia: "bg-status-fuchsia", neutral: "bg-status-neutral",
};

export type ToneDotProps = Omit<React.ComponentProps<"span">, "children"> & {
	tone: StatusToneName;
	/** Square corners (StatusChip style) instead of a round dot. */
	square?: boolean;
};

/** A 6px status dot in a status tone. Decorative: put the meaning in nearby text or a title. */
export function ToneDot({ tone, square, className, ...props }: ToneDotProps) {
	return <span aria-hidden="true" data-slot="cy-tone-dot" className={cn("inline-block size-1.5 shrink-0", square ? "rounded-[2px]" : "rounded-full", toneBg[tone], className)} {...props} />;
}

export type StatTileProps = Omit<React.ComponentProps<"div">, "title"> & {
	label: React.ReactNode;
	value: React.ReactNode;
	/** Small suffix after the value, e.g. "MYR" or "days". */
	unit?: React.ReactNode;
	/** Small line under the value. */
	sub?: React.ReactNode;
	/** Chip or delta at the top right. */
	badge?: React.ReactNode;
	/** Leading status dot, by status tone. */
	tone?: StatusToneName;
	/** Leading status dot as any CSS colour or var() (prefer `tone`). */
	dot?: string;
	/** Paint the value as negative/error text. */
	negative?: boolean;
};

/** One KPI. The value wraps only between words (e.g. after "RM"), never mid-number, and never truncates. */
export function StatTile({ label, value, unit, sub, badge, tone, dot, negative, className, children, ...props }: StatTileProps) {
	return (
		<div data-slot="cy-stat" className={cn("@container flex min-w-0 flex-col gap-1.5 p-3.5", surfaces.card, className)} {...props}>
			<div className="flex items-start justify-between gap-2">
				<span className="flex min-w-0 items-center gap-1.5 text-xs text-tertiary-foreground">
					{tone && <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", toneBg[tone])} />}
					{!tone && dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: dot }} />}
					<span className="min-w-0">{label}</span>
				</span>
				{badge && <span className="shrink-0">{badge}</span>}
			</div>
			<div className={cn("text-lg font-semibold leading-tight tabular-nums text-foreground @[13rem]:text-xl", negative && surfaces.negative)}>
				{value}
				{unit && <span className="ml-1 text-xs font-normal text-tertiary-foreground">{unit}</span>}
			</div>
			{sub && <div className="text-xs text-tertiary-foreground">{sub}</div>}
			{children}
		</div>
	);
}

/* ───────────── Data list: table on wide containers, stacked rows on narrow ───────────── */

export type DataColumn<T> = {
	key: string;
	header: React.ReactNode;
	cell: (row: T, index: number) => React.ReactNode;
	align?: "left" | "right" | "center";
	/** Classes for the table column (width etc.). */
	className?: string;
	/**
	 * Role in the stacked (narrow) layout:
	 * - `title`: the row's heading (first one wins)
	 * - `value`: the figure shown at the right of the heading (e.g. amount)
	 * - `badge`: shown under the heading (e.g. status)
	 * - `meta`: a "label value" line (default)
	 * - `hidden` / `table`: table only
	 * - `stacked`: stacked layout only (never a table column) — combine with title/value via `stackedAs`
	 */
	mobile?: "title" | "value" | "badge" | "meta" | "hidden" | "table" | "stacked";
	/** For `mobile: "stacked"`: which stacked slot it fills. Default `meta`. */
	stackedAs?: "title" | "value" | "badge" | "meta";
	/** Keep the cell on one line in the table (IDs, document numbers, dates, money). Right-aligned columns always are. */
	nowrap?: boolean;
	/** Render differently in the stacked layout (e.g. "Dr 1,200.00" instead of two columns). */
	stackedCell?: (row: T, index: number) => React.ReactNode;
	/** Label for the stacked "label value" line, when the table header is interactive (e.g. a sort button). */
	stackedLabel?: React.ReactNode;
	/**
	 * The column that names the row: rendered as its row header (`<th scope="row">`) and, with
	 * `onRowClick`, as the row's button. Default: the first table column. The stacked layout uses
	 * the `title` column instead.
	 */
	primary?: boolean;
	/** The list's current sort on this column, announced as `aria-sort` on its header. DataList doesn't sort; set it on the sorted column only. */
	sortDirection?: "ascending" | "descending" | "none";
};

export type DataListProps<T> = {
	columns: DataColumn<T>[];
	rows: T[];
	getKey: (row: T, index: number) => string;
	/** Container width below which rows stack. Default `xl` (36rem). `never` keeps the table (it scrolls sideways). */
	stackBelow?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "never";
	/**
	 * Opens a row. The primary cell (table) or title (stacked) becomes a real button, so the row is
	 * reachable with Tab and announced as actionable; a click anywhere else on the row does the same.
	 */
	onRowClick?: (row: T) => void;
	isRowSelected?: (row: T) => boolean;
	/** Extra classes per row, in both layouts (e.g. dim inactive rows). */
	rowClassName?: (row: T) => string | undefined;
	/** Leading cell per row (e.g. a checkbox) — shown in both layouts. */
	leading?: (row: T) => React.ReactNode;
	leadingHeader?: React.ReactNode;
	/** Trailing cell per row (e.g. a row menu) — shown in both layouts. */
	trailing?: (row: T) => React.ReactNode;
	/**
	 * A totals row, keyed by column key. Renders column-aligned in the table (`tfoot`) and as a
	 * bold summary card in the stacked layout. Use `label` for the first cell's text.
	 */
	totals?: { label?: React.ReactNode } & Record<string, React.ReactNode>;
	/** Free footer under the table / list, inside the tray. */
	footer?: React.ReactNode;
	empty?: React.ReactNode;
	caption?: string;
	/** Compact rows. Defaults from the nearest DensityProvider. */
	dense?: boolean;
	/** Row density (overrides `dense` and DensityProvider). */
	density?: Density;
	/** Keep the column headers (and totals) in view while the rows scroll. Needs `maxHeight`. */
	stickyHeader?: boolean;
	/** Scroll the rows inside this height (any CSS length, e.g. "24rem"); headers and totals stay put when `stickyHeader`. */
	maxHeight?: string;
	className?: string;
} & Omit<React.ComponentProps<"div">, "children">;

const SHOW_TABLE = { sm: "hidden @sm:block", md: "hidden @md:block", lg: "hidden @lg:block", xl: "hidden @xl:block", "2xl": "hidden @2xl:block", "3xl": "hidden @3xl:block", never: "block" } as const;
const SHOW_LIST = { sm: "@sm:hidden", md: "@md:hidden", lg: "@lg:hidden", xl: "@xl:hidden", "2xl": "@2xl:hidden", "3xl": "@3xl:hidden", never: "hidden" } as const;
const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;
/** Controls a click on a table row must leave alone (they act on their own). */
const ROW_CONTROLS = "a[href],button,input,select,textarea,label,summary,[role=button],[role=checkbox],[role=switch],[role=menuitem],[role=link],[contenteditable=true]";
/** The stacked title button: its ::after covers the row so the whole row stays clickable, and carries the focus ring. */
const STRETCHED_TARGET = "cursor-pointer text-left outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus-ring";
/** Lifts controls rendered inside stacked cells above that ::after, so they stay clickable. */
const ABOVE_STRETCHED = "[&_:is(a[href],button,input,select,textarea,summary,[role=button],[role=checkbox],[role=switch],[role=link]):not([data-row-title])]:relative [&_:is(a[href],button,input,select,textarea,summary,[role=button],[role=checkbox],[role=switch],[role=link]):not([data-row-title])]:z-10";

/**
 * The one way to show rows of records. Wide container: Cynco UI's tray table. Narrow container:
 * each row becomes a stacked card (title + value, badge, then "label value" lines), so nothing
 * scrolls sideways or overlaps on a phone or in a side sheet.
 */
export function DataList<T>({
	columns, rows, getKey, stackBelow = "xl", onRowClick, isRowSelected, rowClassName, leading, leadingHeader, trailing, totals, footer, empty, caption, dense, density: densityProp, stickyHeader, maxHeight, className, ...props
}: DataListProps<T>) {
	const ctxDensity = useDensity();
	const density: Density = densityProp ?? (dense ? "compact" : ctxDensity);
	const stick = stickyHeader && maxHeight;
	const tableCols = columns.filter((c) => c.mobile !== "stacked");
	const stackedCols = columns.filter((c) => c.mobile !== "hidden" && c.mobile !== "table");
	const slot = (c: DataColumn<T>) => (c.mobile === "stacked" ? c.stackedAs ?? "meta" : c.mobile ?? "meta");
	const title = stackedCols.find((c) => slot(c) === "title") ?? stackedCols[0];
	const value = stackedCols.find((c) => slot(c) === "value");
	const badges = stackedCols.filter((c) => slot(c) === "badge");
	const metas = stackedCols.filter((c) => c !== title && c !== value && !badges.includes(c));
	const stackedRender = (c: DataColumn<T>, r: T, i: number) => (c.stackedCell ?? c.cell)(r, i);
	/**
	 * A clickable row is never itself the focus stop (it holds other controls). Its primary cell
	 * renders a real button for keyboard and screen-reader users; in the table, a click elsewhere on
	 * the row is a mouse shortcut to the same thing, skipped when it lands on a control in the row.
	 */
	const openFromRow = (e: React.MouseEvent<HTMLTableRowElement>, r: T) => {
		if (e.target instanceof Element && e.target.closest(ROW_CONTROLS)) return;
		onRowClick?.(r);
	};
	/**
	 * Selection without a leading checkbox is otherwise only a tint: expose it as the current row
	 * (on the row's button when it has one) and add a bar at the row's start so it doesn't rest on
	 * colour alone.
	 */
	const markCurrent = !!isRowSelected && !leading;
	// One isRowSelected call per row per render; both layouts and both attributes read the set.
	const selected = isRowSelected ? new Set(rows.filter(isRowSelected)) : null;
	const isSelected = (r: T) => !!selected?.has(r);
	const current = (r: T) => (markCurrent && isSelected(r) ? ("true" as const) : undefined);
	const rowPad = ROW_PAD[density];
	const firstKey = tableCols[0]?.key;
	const primaryKey = (tableCols.find((c) => c.primary) ?? tableCols[0])?.key;
	const tableScroll = React.useRef<HTMLDivElement>(null);
	const listScroll = React.useRef<HTMLUListElement>(null);
	const tableStop = useNeedsScrollStop(tableScroll);
	const listStop = useNeedsScrollStop(listScroll);

	return (
		<div data-slot="cy-data-list" className={cn("@container min-w-0", className)} {...props}>
			<div className={surfaces.tray}>
				{/* Table */}
				<div className={SHOW_TABLE[stackBelow]}>
					<div
						ref={tableScroll}
						role={tableStop && caption ? "group" : undefined}
						aria-label={tableStop ? caption : undefined}
						tabIndex={tableStop ? 0 : undefined}
						className={cn(surfaces.surface, SCROLL_STOP_RING, maxHeight ? "overflow-auto overscroll-contain" : "overflow-x-auto", stick && "scroll-pt-10", stick && totals && "scroll-pb-11")}
						style={maxHeight ? { maxHeight } : undefined}
					>
						<table className="w-full border-collapse text-sm">
							{caption && <caption className="sr-only">{caption}</caption>}
							<thead>
								<tr className={cn("border-b border-table-row-divider", stick && "[&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-table-surface [&>th]:shadow-[inset_0_-1px_0_var(--table-row-divider)]")}>
									{leading && <th scope="col" className="w-9 py-2 pl-3 text-left font-normal">{leadingHeader}</th>}
									{tableCols.map((c) => (
										<th key={c.key} scope="col" aria-sort={c.sortDirection} className={cn("px-3 py-2 text-xs font-medium whitespace-nowrap text-tertiary-foreground", ALIGN[c.align ?? "left"], c.className)}>
											{c.header}
										</th>
									))}
									{trailing && <th scope="col" className="w-10"><span className="sr-only">Actions</span></th>}
								</tr>
							</thead>
							<tbody>
								{rows.map((r, i) => (
									<tr
										key={getKey(r, i)}
										onClick={onRowClick ? (e) => openFromRow(e, r) : undefined}
										data-selected={isSelected(r) || undefined}
										aria-current={onRowClick ? undefined : current(r)}
										className={cn("border-b border-table-row-divider last:border-0 hover:bg-table-row-hover data-[selected]:bg-active-primary", markCurrent && "data-[selected]:[&>:first-child]:shadow-[inset_2px_0_0_var(--color-primary)]", onRowClick && "cursor-pointer has-[:focus-visible]:bg-table-row-hover", rowClassName?.(r))}
									>
										{leading && <td className={cn("pl-3 align-middle", rowPad)} onClick={(e) => e.stopPropagation()}><div className="flex items-center">{leading(r)}</div></td>}
										{tableCols.map((c) => {
											const align = ALIGN[c.align ?? "left"];
											const text = cn("text-foreground", align, (c.align === "right" || c.nowrap) && "whitespace-nowrap", c.align === "right" && "tabular-nums");
											if (c.key !== primaryKey) {
												return <td key={c.key} className={cn("px-3", rowPad, text, c.className)}>{c.cell(r, i)}</td>;
											}
											return (
												<th key={c.key} scope="row" className={cn("font-normal", !onRowClick && ["px-3", rowPad], text, c.className)}>
													{onRowClick ? (
														<button type="button" aria-current={current(r)} onClick={() => onRowClick(r)} className={cn("block w-full cursor-pointer px-3 outline-none focus-ring-inset", rowPad, align)}>
															{c.cell(r, i)}
														</button>
													) : (
														c.cell(r, i)
													)}
												</th>
											);
										})}
										{trailing && <td className={cn("pr-2 text-right", rowPad)} onClick={(e) => e.stopPropagation()}>{trailing(r)}</td>}
									</tr>
								))}
							</tbody>
							{totals && (
								<tfoot>
									<tr className={cn("border-t border-table-surface-border font-semibold", stick && "[&>td]:sticky [&>td]:bottom-0 [&>td]:z-10 [&>td]:bg-table-surface [&>td]:shadow-[inset_0_1px_0_var(--table-surface-border)]")}>
										{leading && <td />}
										{tableCols.map((c) => (
											<td key={c.key} className={cn("px-3 py-2.5 text-foreground", ALIGN[c.align ?? "left"], c.align === "right" && "tabular-nums whitespace-nowrap", c.className)}>
												{c.key in totals ? totals[c.key] : c.key === firstKey ? totals.label ?? "Total" : null}
											</td>
										))}
										{trailing && <td />}
									</tr>
								</tfoot>
							)}
						</table>
						{rows.length === 0 && empty && <div className="px-4 py-8 text-center text-sm text-tertiary-foreground">{empty}</div>}
					</div>
				</div>

				{/* Stacked list */}
				<ul
					ref={listScroll}
					tabIndex={listStop ? 0 : undefined}
					className={cn(SHOW_LIST[stackBelow], surfaces.surface, SCROLL_STOP_RING, "divide-y divide-table-row-divider", maxHeight && "overflow-y-auto overscroll-contain")}
					style={maxHeight ? { maxHeight } : undefined}
					aria-label={caption}
				>
					{rows.map((r, i) => (
						<li
							key={getKey(r, i)}
							data-selected={isSelected(r) || undefined}
							aria-current={onRowClick ? undefined : current(r)}
							className={cn("flex gap-3 px-3 data-[selected]:bg-active-primary", markCurrent && "data-[selected]:shadow-[inset_2px_0_0_var(--color-primary)]", density === "compact" ? "py-2" : density === "comfortable" ? "py-4" : "py-3", onRowClick && ["relative isolate has-[:focus-visible]:bg-table-row-hover", ABOVE_STRETCHED], rowClassName?.(r))}
						>
							{/* Above the title button's stretched ::after, so they stay operable. */}
							{leading && <div className={cn("flex shrink-0 items-start pt-0.5", onRowClick && "relative z-10")} onClick={(e) => e.stopPropagation()}>{leading(r)}</div>}
							<div className="min-w-0 flex-1">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 text-sm font-medium text-foreground">
										{onRowClick ? (
											<button type="button" data-row-title="" aria-current={current(r)} onClick={() => onRowClick(r)} className={STRETCHED_TARGET}>
												{stackedRender(title, r, i)}
											</button>
										) : (
											stackedRender(title, r, i)
										)}
									</div>
									{value && <div className="shrink-0 text-sm font-medium tabular-nums text-foreground">{stackedRender(value, r, i)}</div>}
								</div>
								{badges.length > 0 && <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{badges.map((c) => <React.Fragment key={c.key}>{stackedRender(c, r, i)}</React.Fragment>)}</div>}
								{metas.length > 0 && (
									<dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
										{metas.map((c) => (
											<React.Fragment key={c.key}>
												<dt className="text-tertiary-foreground">{c.stackedLabel ?? c.header}</dt>
												<dd className={cn("min-w-0 text-muted-foreground", c.align === "right" && "tabular-nums")}>{stackedRender(c, r, i)}</dd>
											</React.Fragment>
										))}
									</dl>
								)}
							</div>
							{trailing && <div className={cn("-mr-1", onRowClick && "relative z-10")} onClick={(e) => e.stopPropagation()}>{trailing(r)}</div>}
						</li>
					))}
					{rows.length === 0 && empty && <li className="px-4 py-8 text-center text-sm text-tertiary-foreground">{empty}</li>}
					{totals && (
						<li className={cn("flex flex-col gap-1 bg-table-tray px-3 py-3 text-sm", stick && "sticky bottom-0")}>
							<div className="font-semibold text-foreground">{totals.label ?? "Total"}</div>
							<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
								{tableCols.filter((c) => c.key in totals && c.key !== "label").map((c) => (
									<React.Fragment key={c.key}>
										<dt className="text-tertiary-foreground">{c.stackedLabel ?? c.header}</dt>
										<dd className="font-semibold tabular-nums text-foreground">{totals[c.key]}</dd>
									</React.Fragment>
								))}
							</dl>
						</li>
					)}
				</ul>

				{footer && <div className="px-3 pt-2 pb-1.5 text-sm">{footer}</div>}
			</div>
		</div>
	);
}

/* ───────────── Key / value ───────────── */

/** A label/value list that stacks the label above the value on narrow containers. */
export function KeyValueList({ items, className }: { items: Array<{ label: React.ReactNode; value: React.ReactNode; negative?: boolean; strong?: boolean }>; className?: string }) {
	return (
		<dl data-slot="cy-kv" className={cn("@container divide-y divide-table-row-divider text-sm", className)}>
			{items.map((it, i) => (
				<div key={i} className="flex flex-col gap-0.5 py-2 @[16rem]:flex-row @[16rem]:items-baseline @[16rem]:justify-between @[16rem]:gap-4">
					<dt className={cn("text-tertiary-foreground", it.strong && "font-medium text-foreground")}>{it.label}</dt>
					<dd className={cn("tabular-nums text-foreground @[16rem]:text-right", it.strong && "font-semibold", it.negative && surfaces.negative)}>{it.value}</dd>
				</div>
			))}
		</dl>
	);
}
