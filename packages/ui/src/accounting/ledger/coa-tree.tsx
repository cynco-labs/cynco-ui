"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — the Chart of Accounts tree.
 *
 * It sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import * as React from "react";
import { cn, IconButton, StatusChip, useControllableState } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { formatCurrency, negativeClass, surfaces } from "../../lib/shared";
import { TypeDot, typeLabel } from "./shared";

export type CoaTreeNode = {
	id: string;
	accountCode: string;
	accountName: string;
	accountType: string;
	balance?: Amount;
	isHeaderAccount?: boolean;
	isActive?: boolean;
	children?: CoaTreeNode[];
};

/**
 * One row's cells. Wide container: caret · dot · code · name · type · balance on one line.
 * Narrow container: the code sits above the name and the type column is dropped.
 */
function CoaCells({
	caret,
	dot,
	code,
	name,
	extra,
	type,
	balance,
}: {
	caret: React.ReactNode;
	dot: React.ReactNode;
	code: React.ReactNode;
	name: React.ReactNode;
	extra?: React.ReactNode;
	type: React.ReactNode;
	balance: React.ReactNode;
}) {
	return (
		<>
			{caret}
			{dot}
			<span className="flex min-w-0 flex-1 flex-col @md:flex-row @md:items-center @md:gap-2">
				<span className="shrink-0 font-mono text-2xs font-medium text-tertiary-foreground @md:w-16">{code}</span>
				<span className="flex min-w-0 flex-1 items-center gap-2">{name}</span>
			</span>
			{extra}
			<span className="hidden w-28 shrink-0 truncate text-2xs text-tertiary-foreground @xl:inline">{type}</span>
			<span className="shrink-0 text-right tabular-nums @md:w-32">{balance}</span>
		</>
	);
}

function CoaRow({
	node,
	level,
	expanded,
	selectedId,
	tabId,
	currency,
	onToggle,
	onSelect,
	onFocusItem,
}: {
	node: CoaTreeNode;
	level: number;
	expanded: Set<string>;
	selectedId?: string;
	/** The one treeitem in the tab order (roving tabindex). */
	tabId?: string;
	currency: string;
	onToggle: (id: string) => void;
	onSelect: (id: string) => void;
	onFocusItem: (id: string) => void;
}) {
	const kids = node.children ?? [];
	const open = expanded.has(node.id);
	const selected = selectedId === node.id;
	const balance = node.isHeaderAccount ? null : formatCurrency(node.balance ?? 0, currency);
	return (
		<>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: arrow-key handling lives on the role=tree root, which owns the roving tabindex */}
			<div
				role="treeitem"
				data-tree-id={node.id}
				tabIndex={tabId === node.id ? 0 : -1}
				aria-level={level}
				aria-expanded={kids.length ? open : undefined}
				aria-selected={selected}
				aria-label={[
					`${node.accountCode} ${node.accountName}`,
					typeLabel(node.accountType),
					balance,
					node.isActive === false && "inactive",
				]
					.filter(Boolean)
					.join(", ")}
				onClick={() => onSelect(node.id)}
				onFocus={(e) => e.target === e.currentTarget && onFocusItem(node.id)}
				className={cn(
					"group flex min-h-8 cursor-pointer items-center gap-2 rounded-md py-1 pr-2 text-sm outline-none transition-colors hover:bg-table-row-hover focus-ring",
					selected && "bg-active-primary hover:bg-active-primary",
				)}
				// Indent is data-driven: one step per tree level.
				style={{ paddingLeft: `${0.25 + (level - 1) * 1.125}rem` }}
			>
				<CoaCells
					caret={
						kids.length ? (
							<IconButton
								variant="skeleton"
								size="icon"
								tabIndex={-1}
								aria-label={open ? `Collapse ${node.accountName}` : `Expand ${node.accountName}`}
								className="size-5 shrink-0 p-0 after:absolute after:-inset-0.5"
								onClick={(e) => {
									e.stopPropagation();
									onToggle(node.id);
								}}
								icon={
									<CaretRightIcon
										weight="bold"
										className={cn("size-3 text-tertiary-foreground transition-transform", open && "rotate-90")}
									/>
								}
							/>
						) : (
							<span className="size-5 shrink-0" aria-hidden="true" />
						)
					}
					dot={<TypeDot type={node.accountType} />}
					code={node.accountCode}
					name={
						<>
							<span
								className={cn(
									"min-w-0 truncate text-foreground",
									node.isHeaderAccount && "font-semibold",
									node.isActive === false && "text-tertiary-foreground",
								)}
							>
								{node.accountName}
							</span>
							{node.isActive === false && <StatusChip className="h-5 shrink-0 text-2xs">Inactive</StatusChip>}
						</>
					}
					type={typeLabel(node.accountType)}
					balance={
						<span
							className={cn(
								balance ? "text-foreground" : "text-tertiary-foreground",
								negativeClass(toSen(node.balance) < 0n && !node.isHeaderAccount),
							)}
						>
							{balance ?? "—"}
						</span>
					}
				/>
			</div>
			{open &&
				kids.map((c) => (
					<CoaRow
						key={c.id}
						node={c}
						level={level + 1}
						expanded={expanded}
						selectedId={selectedId}
						tabId={tabId}
						currency={currency}
						onToggle={onToggle}
						onSelect={onSelect}
						onFocusItem={onFocusItem}
					/>
				))}
		</>
	);
}

export type ChartOfAccountsTreeProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
	nodes: CoaTreeNode[];
	currency?: string;
	/** Controlled set of expanded node ids. */
	expandedIds?: string[];
	/** Which nodes start expanded for uncontrolled use; the top level by default. */
	defaultExpandedIds?: string[];
	onExpandedChange?: (ids: string[]) => void;
	/** Controlled selection. */
	selectedId?: string;
	/** Initial selection for uncontrolled use. */
	defaultSelectedId?: string;
	onSelect?: (id: string) => void;
};

/** CoaAccountTreeRow.tsx — the nested Chart of Accounts with codes, type and balance. */
export function ChartOfAccountsTree({
	nodes,
	currency = "MYR",
	expandedIds,
	defaultExpandedIds,
	onExpandedChange,
	selectedId: selectedIdProp,
	defaultSelectedId,
	onSelect,
	className,
	...props
}: ChartOfAccountsTreeProps) {
	const [openIds = [], setOpenIds] = useControllableState<string[]>({
		prop: expandedIds,
		defaultProp: defaultExpandedIds ?? nodes.map((n) => n.id),
		onChange: onExpandedChange,
	});
	const expanded = new Set(openIds);
	const [selectedId, setSelected] = useControllableState({ prop: selectedIdProp, defaultProp: defaultSelectedId });
	const toggle = (id: string) =>
		setOpenIds(expanded.has(id) ? openIds.filter((other) => other !== id) : [...openIds, id]);
	const select = (id: string) => {
		setSelected(id);
		onSelect?.(id);
	};
	/** Visible rows in order, with their parents: what the arrow keys move through. */
	const visible: { id: string; parentId: string | null; hasKids: boolean }[] = [];
	const walk = (list: CoaTreeNode[], parentId: string | null) => {
		for (const n of list) {
			const hasKids = (n.children?.length ?? 0) > 0;
			visible.push({ id: n.id, parentId, hasKids });
			if (hasKids && expanded.has(n.id)) walk(n.children!, n.id);
		}
	};
	walk(nodes, null);
	const [focusId, setFocusId] = React.useState<string | undefined>(undefined);
	const isVisible = (id?: string) => !!id && visible.some((v) => v.id === id);
	// Exactly one row is tabbable: the last one focused, else the selected one, else the first.
	const tabId = isVisible(focusId) ? focusId : isVisible(selectedId) ? selectedId : visible[0]?.id;
	const treeRef = React.useRef<HTMLDivElement>(null);
	const focusRow = (id: string) => {
		setFocusId(id);
		treeRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)?.focus();
	};
	/** APG tree keys: Up/Down/Home/End move, Right opens or enters, Left closes or climbs, Enter/Space select. */
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const id = (e.target as HTMLElement).dataset.treeId;
		const i = visible.findIndex((v) => v.id === id);
		const row = visible[i];
		if (!id || !row) return;
		let next: string | null | undefined;
		switch (e.key) {
			case "ArrowDown":
				next = visible[i + 1]?.id;
				break;
			case "ArrowUp":
				next = visible[i - 1]?.id;
				break;
			case "Home":
				next = visible[0]?.id;
				break;
			case "End":
				next = visible[visible.length - 1]?.id;
				break;
			case "ArrowRight":
				if (row.hasKids && !expanded.has(id)) toggle(id);
				else if (row.hasKids) next = visible[i + 1]?.id;
				break;
			case "ArrowLeft":
				if (row.hasKids && expanded.has(id)) toggle(id);
				else next = row.parentId;
				break;
			case "Enter":
			case " ":
				select(id);
				break;
			default:
				return;
		}
		e.preventDefault();
		if (next) focusRow(next);
	};
	return (
		<div className={cn("@container min-w-0", surfaces.tray, className)} {...props}>
			{/* Column headers reuse the row's cell layout so they line up at every width. */}
			<div aria-hidden="true" className="flex h-7 items-center gap-2 py-1 pr-3 pl-2 text-xs text-tertiary-foreground">
				<CoaCells
					caret={<span className="size-5 shrink-0" />}
					dot={<span className="size-1.5 shrink-0" />}
					code="Code"
					name="Account"
					type="Type"
					balance="Balance"
				/>
			</div>
			<div
				ref={treeRef}
				role="tree"
				aria-label="Chart of accounts"
				onKeyDown={onKeyDown}
				className={cn(surfaces.surface, "p-1")}
			>
				{nodes.map((n) => (
					<CoaRow
						key={n.id}
						node={n}
						level={1}
						expanded={expanded}
						selectedId={selectedId}
						tabId={tabId}
						currency={currency}
						onToggle={toggle}
						onSelect={select}
						onFocusItem={setFocusId}
					/>
				))}
			</div>
		</div>
	);
}
