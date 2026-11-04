"use client";

import * as React from "react";
import { cn } from "../base";
import { type Density, ROW_PAD, useDensity } from "./density";
import { useNeedsScrollStop } from "./scroll-stop";
import { SCROLL_STOP_RING, surfaces } from "./surfaces";

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

/**
 * Both layouts go into the markup and a container query shows one. Switching in JavaScript instead,
 * on a measured width, was tried and reverted: `useContainerWidth` re-renders twice before it has a
 * width, so 500 rows x 4 columns cost 10,000 cell renders before the first paint against 4,000 here,
 * and only updates after that got cheaper (2,000). The hidden layout costs DOM nodes, not layout or
 * paint, so it is the cheaper half of the trade.
 */
const SHOW_TABLE = {
	sm: "hidden @sm:block",
	md: "hidden @md:block",
	lg: "hidden @lg:block",
	xl: "hidden @xl:block",
	"2xl": "hidden @2xl:block",
	"3xl": "hidden @3xl:block",
	never: "block",
} as const;
const SHOW_LIST = {
	sm: "@sm:hidden",
	md: "@md:hidden",
	lg: "@lg:hidden",
	xl: "@xl:hidden",
	"2xl": "@2xl:hidden",
	"3xl": "@3xl:hidden",
	never: "hidden",
} as const;
const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;
/** Controls a click on a table row must leave alone (they act on their own). */
const ROW_CONTROLS =
	"a[href],button,input,select,textarea,label,summary,[role=button],[role=checkbox],[role=switch],[role=menuitem],[role=link],[contenteditable=true]";
/** The stacked title button: its ::after covers the row so the whole row stays clickable, and carries the focus ring. */
const STRETCHED_TARGET =
	"cursor-pointer text-left outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus-ring";
/** Lifts controls rendered inside stacked cells above that ::after, so they stay clickable. */
const ABOVE_STRETCHED =
	"[&_:is(a[href],button,input,select,textarea,summary,[role=button],[role=checkbox],[role=switch],[role=link]):not([data-row-title])]:relative [&_:is(a[href],button,input,select,textarea,summary,[role=button],[role=checkbox],[role=switch],[role=link]):not([data-row-title])]:z-10";

/**
 * The one way to show rows of records. Wide container: Cynco UI's tray table. Narrow container:
 * each row becomes a stacked card (title + value, badge, then "label value" lines), so nothing
 * scrolls sideways or overlaps on a phone or in a side sheet.
 */
export function DataList<T>({
	columns,
	rows,
	getKey,
	stackBelow = "xl",
	onRowClick,
	isRowSelected,
	rowClassName,
	leading,
	leadingHeader,
	trailing,
	totals,
	footer,
	empty,
	caption,
	dense,
	density: densityProp,
	stickyHeader,
	maxHeight,
	className,
	...props
}: DataListProps<T>) {
	const ctxDensity = useDensity();
	const density: Density = densityProp ?? (dense ? "compact" : ctxDensity);
	const stick = stickyHeader && maxHeight;
	const tableCols = columns.filter((c) => c.mobile !== "stacked");
	const stackedCols = columns.filter((c) => c.mobile !== "hidden" && c.mobile !== "table");
	const slot = (c: DataColumn<T>) => (c.mobile === "stacked" ? (c.stackedAs ?? "meta") : (c.mobile ?? "meta"));
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
					{/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role and aria-label are set together on the same condition, which the rule cannot see through */}
					{/* biome-ignore lint/a11y/noNoninteractiveTabindex: an overflowing table must be a tab stop or the keyboard cannot scroll it; the caption names the stop when there is one */}
					<div
						ref={tableScroll}
						role={tableStop && caption ? "group" : undefined}
						aria-label={tableStop && caption ? caption : undefined}
						tabIndex={tableStop ? 0 : undefined}
						className={cn(
							surfaces.surface,
							SCROLL_STOP_RING,
							maxHeight ? "overflow-auto overscroll-contain" : "overflow-x-auto",
							stick && "scroll-pt-10",
							stick && totals && "scroll-pb-11",
						)}
						style={maxHeight ? { maxHeight } : undefined}
					>
						<table className="w-full border-collapse text-sm">
							{caption && <caption className="sr-only">{caption}</caption>}
							<thead>
								<tr
									className={cn(
										"border-b border-table-row-divider",
										stick &&
											"[&>*]:sticky [&>*]:top-0 [&>*]:z-10 [&>*]:bg-table-surface [&>*]:shadow-[inset_0_-1px_0_var(--table-row-divider)]",
									)}
								>
									{leading &&
										(leadingHeader == null ? (
											<td className="w-9 py-2 pl-3" />
										) : (
											<th scope="col" className="w-9 py-2 pl-3 text-left font-normal">
												{leadingHeader}
											</th>
										))}
									{tableCols.map((c) => (
										<th
											key={c.key}
											scope="col"
											aria-sort={c.sortDirection}
											className={cn(
												"px-3 py-2 text-xs font-medium whitespace-nowrap text-tertiary-foreground",
												ALIGN[c.align ?? "left"],
												c.className,
											)}
										>
											{c.header}
										</th>
									))}
									{trailing && (
										<th scope="col" className="w-10">
											<span className="sr-only">Actions</span>
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{rows.map((r, i) => (
									<tr
										key={getKey(r, i)}
										onClick={onRowClick ? (e) => openFromRow(e, r) : undefined}
										data-selected={isSelected(r) || undefined}
										aria-current={onRowClick ? undefined : current(r)}
										className={cn(
											"border-b border-table-row-divider last:border-0 hover:bg-table-row-hover data-[selected]:bg-active-primary",
											markCurrent && "data-[selected]:[&>:first-child]:shadow-[inset_2px_0_0_var(--color-primary)]",
											onRowClick && "cursor-pointer has-[:focus-visible]:bg-table-row-hover",
											rowClassName?.(r),
										)}
									>
										{leading && (
											// biome-ignore lint/a11y/useKeyWithClickEvents: the handler only stops the row click reaching the row; the element is not itself operable
											<td className={cn("pl-3 align-middle", rowPad)} onClick={(e) => e.stopPropagation()}>
												<div className="flex items-center">{leading(r)}</div>
											</td>
										)}
										{tableCols.map((c) => {
											const align = ALIGN[c.align ?? "left"];
											const text = cn(
												"text-foreground",
												align,
												(c.align === "right" || c.nowrap) && "whitespace-nowrap",
												c.align === "right" && "tabular-nums",
											);
											if (c.key !== primaryKey) {
												return (
													<td key={c.key} className={cn("px-3", rowPad, text, c.className)}>
														{c.cell(r, i)}
													</td>
												);
											}
											return (
												<th
													key={c.key}
													scope="row"
													className={cn("font-normal", !onRowClick && ["px-3", rowPad], text, c.className)}
												>
													{onRowClick ? (
														<button
															type="button"
															aria-current={current(r)}
															onClick={() => onRowClick(r)}
															className={cn("block w-full cursor-pointer px-3 outline-none focus-ring-inset", rowPad, align)}
														>
															{c.cell(r, i)}
														</button>
													) : (
														c.cell(r, i)
													)}
												</th>
											);
										})}
										{trailing && (
											// biome-ignore lint/a11y/useKeyWithClickEvents: the handler only stops the row click reaching the row; the element is not itself operable
											<td className={cn("pr-2 text-right", rowPad)} onClick={(e) => e.stopPropagation()}>
												{trailing(r)}
											</td>
										)}
									</tr>
								))}
							</tbody>
							{totals && (
								<tfoot>
									<tr
										className={cn(
											"border-t border-table-surface-border font-semibold",
											stick &&
												"[&>td]:sticky [&>td]:bottom-0 [&>td]:z-10 [&>td]:bg-table-surface [&>td]:shadow-[inset_0_1px_0_var(--table-surface-border)]",
										)}
									>
										{leading && <td />}
										{tableCols.map((c) => (
											<td
												key={c.key}
												className={cn(
													"px-3 py-2.5 text-foreground",
													ALIGN[c.align ?? "left"],
													c.align === "right" && "tabular-nums whitespace-nowrap",
													c.className,
												)}
											>
												{c.key in totals ? totals[c.key] : c.key === firstKey ? (totals.label ?? "Total") : null}
											</td>
										))}
										{trailing && <td />}
									</tr>
								</tfoot>
							)}
						</table>
						{rows.length === 0 && empty && (
							<div className="px-4 py-8 text-center text-sm text-tertiary-foreground">{empty}</div>
						)}
					</div>
				</div>

				{/* Stacked list */}
				<ul
					ref={listScroll}
					tabIndex={listStop ? 0 : undefined}
					className={cn(
						SHOW_LIST[stackBelow],
						surfaces.surface,
						SCROLL_STOP_RING,
						"divide-y divide-table-row-divider",
						maxHeight && "overflow-y-auto overscroll-contain",
					)}
					style={maxHeight ? { maxHeight } : undefined}
					aria-label={caption}
				>
					{rows.map((r, i) => (
						<li
							key={getKey(r, i)}
							data-selected={isSelected(r) || undefined}
							aria-current={onRowClick ? undefined : current(r)}
							className={cn(
								"flex gap-3 px-3 data-[selected]:bg-active-primary",
								markCurrent && "data-[selected]:shadow-[inset_2px_0_0_var(--color-primary)]",
								density === "compact" ? "py-2" : density === "comfortable" ? "py-4" : "py-3",
								onRowClick && ["relative isolate has-[:focus-visible]:bg-table-row-hover", ABOVE_STRETCHED],
								rowClassName?.(r),
							)}
						>
							{/* Above the title button's stretched ::after, so they stay operable. */}
							{leading && (
								// biome-ignore lint/a11y/useKeyWithClickEvents: the handler only stops the row click reaching the row; the element is not itself operable
								// biome-ignore lint/a11y/noStaticElementInteractions: the handler only stops the row click reaching the row; the element is not itself operable
								<div
									className={cn("flex shrink-0 items-start pt-0.5", onRowClick && "relative z-10")}
									onClick={(e) => e.stopPropagation()}
								>
									{leading(r)}
								</div>
							)}
							<div className="min-w-0 flex-1">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 text-sm font-medium text-foreground">
										{onRowClick ? (
											<button
												type="button"
												data-row-title=""
												aria-current={current(r)}
												onClick={() => onRowClick(r)}
												className={STRETCHED_TARGET}
											>
												{stackedRender(title, r, i)}
											</button>
										) : (
											stackedRender(title, r, i)
										)}
									</div>
									{value && (
										<div className="shrink-0 text-sm font-medium tabular-nums text-foreground">{stackedRender(value, r, i)}</div>
									)}
								</div>
								{badges.length > 0 && (
									<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
										{badges.map((c) => (
											<React.Fragment key={c.key}>{stackedRender(c, r, i)}</React.Fragment>
										))}
									</div>
								)}
								{metas.length > 0 && (
									<dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
										{metas.map((c) => (
											<React.Fragment key={c.key}>
												<dt className="text-tertiary-foreground">{c.stackedLabel ?? c.header}</dt>
												<dd className={cn("min-w-0 text-muted-foreground", c.align === "right" && "tabular-nums")}>
													{stackedRender(c, r, i)}
												</dd>
											</React.Fragment>
										))}
									</dl>
								)}
							</div>
							{trailing && (
								// biome-ignore lint/a11y/useKeyWithClickEvents: the handler only stops the row click reaching the row; the element is not itself operable
								// biome-ignore lint/a11y/noStaticElementInteractions: the handler only stops the row click reaching the row; the element is not itself operable
								<div className={cn("-mr-1", onRowClick && "relative z-10")} onClick={(e) => e.stopPropagation()}>
									{trailing(r)}
								</div>
							)}
						</li>
					))}
					{rows.length === 0 && empty && <li className="px-4 py-8 text-center text-sm text-tertiary-foreground">{empty}</li>}
					{totals && (
						<li className={cn("flex flex-col gap-1 bg-table-tray px-3 py-3 text-sm", stick && "sticky bottom-0")}>
							<div className="font-semibold text-foreground">{totals.label ?? "Total"}</div>
							<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
								{tableCols
									.filter((c) => c.key in totals && c.key !== "label")
									.map((c) => (
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
