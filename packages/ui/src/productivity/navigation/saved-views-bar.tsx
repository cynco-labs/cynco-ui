"use client";

import {
	ArrowCounterClockwiseIcon,
	CopyIcon,
	DotsThreeIcon,
	LockSimpleIcon,
	PencilSimpleIcon,
	PlusIcon,
	TrashIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import {
	Button,
	Checkbox,
	cn,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	FilterChip,
	IconButton,
	Input,
	LiveStatus,
	useControllableState,
} from "../../base";
import { ActionBar, FieldError, ScrollRow } from "../../lib/shared";

export type SavedViewFilter = { id: string; field: string; label: string; value: string };
export type SavedView = {
	id: string;
	name: string;
	filters: SavedViewFilter[];
	/** Rows matching the view (or pass `counts`). */
	count?: number;
	/** Shared with the team (true) or personal. */
	shared?: boolean;
	/** Built-in: can't be renamed, overwritten or deleted (still duplicable). */
	locked?: boolean;
};

const filterKey = (f: SavedViewFilter) => `${f.field}\u0000${f.value}`;
const sameFilters = (a: SavedViewFilter[], b: SavedViewFilter[]) => {
	if (a.length !== b.length) return false;
	const s = new Set(a.map(filterKey));
	return b.every((f) => s.has(filterKey(f)));
};

export type SavedViewsBarProps = Omit<React.ComponentProps<"div">, "children" | "defaultValue"> & {
	views?: SavedView[];
	defaultViews?: SavedView[];
	onViewsChange?: (views: SavedView[]) => void;
	activeViewId?: string;
	defaultActiveViewId?: string;
	onActiveViewChange?: (id: string) => void;
	/** Filters applied to the list right now. Uncontrolled default: the active view's filters. */
	filters?: SavedViewFilter[];
	defaultFilters?: SavedViewFilter[];
	onFiltersChange?: (filters: SavedViewFilter[]) => void;
	/** Row counts per view id (overrides `view.count`). */
	counts?: Record<string, number>;
	/** Your "Add filter" control, shown after the chips. */
	addFilter?: React.ReactNode;
	/** Accessible name of the view switcher. Default "Saved views". */
	label?: string;
};

type NameDialogState = { mode: "create" | "rename"; viewId?: string; name: string; shared: boolean } | null;

/**
 * Saved views for any list: a scrolling row of view tabs with counts, the active filters as
 * removable chips, and Save / Save as new / Reset once the filters drift from the view. Rename,
 * duplicate, share and delete live in the active view's menu.
 */
export function SavedViewsBar({
	views: viewsProp,
	defaultViews = [],
	onViewsChange,
	activeViewId: activeProp,
	defaultActiveViewId,
	onActiveViewChange,
	filters: filtersProp,
	defaultFilters,
	onFiltersChange,
	counts,
	addFilter,
	label = "Saved views",
	className,
	...props
}: SavedViewsBarProps) {
	const [views, setViews] = useControllableState({
		prop: viewsProp,
		defaultProp: defaultViews,
		onChange: onViewsChange,
	});
	const initialActive = defaultActiveViewId ?? (viewsProp ?? defaultViews)[0]?.id ?? "";
	const [activeId, setActiveId] = useControllableState({
		prop: activeProp,
		defaultProp: initialActive,
		onChange: onActiveViewChange,
	});
	const active = views.find((v) => v.id === activeId) ?? views[0];
	const [filters, setFilters] = useControllableState({
		prop: filtersProp,
		defaultProp: defaultFilters ?? active?.filters ?? [],
		onChange: onFiltersChange,
	});
	const [dialog, setDialog] = React.useState<NameDialogState>(null);
	/** Where focus lands when the name dialog closes: the view just saved or renamed, else the active view. */
	const returnTo = React.useRef<string | null>(null);
	const activeRef = React.useRef<string | undefined>(undefined);
	const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());
	const focusTab = (id: string | undefined) => id && requestAnimationFrame(() => tabRefs.current.get(id)?.focus());

	const modified = !!active && !sameFilters(filters, active.filters);
	activeRef.current = active?.id;

	const selectView = (v: SavedView) => {
		setActiveId(v.id);
		setFilters(v.filters.map((f) => ({ ...f })));
	};
	const update = (id: string, patch: Partial<SavedView>) =>
		setViews(views.map((v) => (v.id === id ? { ...v, ...patch } : v)));
	const remove = (id: string) => {
		const rest = views.filter((v) => v.id !== id);
		setViews(rest);
		if (id === active?.id && rest[0]) {
			selectView(rest[0]);
			focusTab(rest[0].id);
		}
	};
	const duplicate = (v: SavedView) => {
		const copy: SavedView = {
			...v,
			id: `view-${Date.now().toString(36)}`,
			name: `${v.name} copy`,
			locked: false,
			shared: false,
			filters: v.filters.map((f) => ({ ...f })),
		};
		setViews([...views, copy]);
		selectView(copy);
		focusTab(copy.id);
	};
	const [nameError, setNameError] = React.useState(false);
	const nameInput = React.useRef<HTMLInputElement>(null);
	const nameErrorId = React.useId();
	const submitDialog = () => {
		if (!dialog) return;
		const name = dialog.name.trim();
		// Validate on submit (the button stays enabled): mark the field and move focus to it.
		if (!name) {
			setNameError(true);
			nameInput.current?.focus();
			return;
		}
		setNameError(false);
		if (dialog.mode === "rename" && dialog.viewId) {
			update(dialog.viewId, { name, shared: dialog.shared });
			returnTo.current = dialog.viewId;
		} else {
			const v: SavedView = {
				id: `view-${Date.now().toString(36)}`,
				name,
				shared: dialog.shared,
				filters: filters.map((f) => ({ ...f })),
			};
			setViews([...views, v]);
			setActiveId(v.id);
			returnTo.current = v.id;
		}
		setDialog(null);
	};

	/** Arrow keys move between views (Home/End to the ends); Enter or Space opens one. */
	const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
		const last = views.length - 1;
		const next =
			e.key === "ArrowRight"
				? Math.min(last, index + 1)
				: e.key === "ArrowLeft"
					? Math.max(0, index - 1)
					: e.key === "Home"
						? 0
						: e.key === "End"
							? last
							: -1;
		if (next < 0) return;
		e.preventDefault();
		const el = tabRefs.current.get(views[next].id);
		el?.focus();
		el?.scrollIntoView({ block: "nearest", inline: "nearest" });
	};
	const [focusIndex, setFocusIndex] = React.useState<number | null>(null);
	const rovingIndex =
		focusIndex ??
		Math.max(
			0,
			views.findIndex((v) => v.id === active?.id),
		);

	return (
		<div data-slot="cy-saved-views" className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			<div className="flex min-w-0 items-center gap-2">
				<ScrollRow
					role="group"
					aria-label={label}
					className="relative flex-1 gap-0.5 rounded-lg border border-table-tray-border bg-table-tray p-0.5"
				>
					{views.map((v, i) => {
						const isActive = v.id === active?.id;
						const count = counts?.[v.id] ?? v.count;
						return (
							<div
								key={v.id}
								className={cn(
									"flex shrink-0 items-center rounded-md border border-transparent",
									isActive && "border-table-surface-border bg-table-surface shadow-segment",
								)}
							>
								<button
									ref={(el) => {
										if (el) tabRefs.current.set(v.id, el);
										else tabRefs.current.delete(v.id);
									}}
									type="button"
									aria-pressed={isActive}
									tabIndex={i === rovingIndex ? 0 : -1}
									onFocus={() => setFocusIndex(i)}
									onBlur={() => setFocusIndex(null)}
									onClick={() => selectView(v)}
									onKeyDown={(e) => onTabKeyDown(e, i)}
									className={cn(
										"relative flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-medium whitespace-nowrap text-tertiary-foreground outline-none transition-colors",
										"hover:text-foreground focus-ring-inset",
										isActive && "text-foreground",
									)}
								>
									{v.shared ? (
										<UsersThreeIcon aria-hidden="true" className="size-3.5 shrink-0 text-tertiary-foreground" />
									) : !v.locked ? (
										<LockSimpleIcon aria-hidden="true" className="size-3 shrink-0 text-tertiary-foreground" />
									) : null}
									<span>{v.name}</span>
									<span className="sr-only">{v.shared ? ", shared with team" : !v.locked ? ", personal" : ""}</span>
									{count != null && (
										<span className="rounded-md bg-muted px-1 text-2xs leading-4 font-normal tabular-nums text-muted-foreground">
											<span className="sr-only">, </span>
											{count}
											<span className="sr-only"> rows</span>
										</span>
									)}
									{isActive && modified && (
										<>
											<span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
											<span className="sr-only">, modified</span>
										</>
									)}
								</button>
								{isActive && (
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button
													variant="skeleton"
													size="icon"
													aria-label={`Options for ${v.name} view`}
													className="mx-0.5 size-5 justify-center p-0 text-tertiary-foreground focus-ring after:absolute after:-inset-0.5"
												/>
											}
										>
											<DotsThreeIcon weight="bold" className="size-3.5" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="min-w-48">
											<DropdownMenuItem
												disabled={v.locked}
												onClick={() => setDialog({ mode: "rename", viewId: v.id, name: v.name, shared: !!v.shared })}
											>
												<PencilSimpleIcon /> Rename…
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => duplicate(v)}>
												<CopyIcon /> Duplicate
											</DropdownMenuItem>
											<DropdownMenuItem disabled={v.locked} onClick={() => update(v.id, { shared: !v.shared })}>
												{v.shared ? <LockSimpleIcon /> : <UsersThreeIcon />} {v.shared ? "Make personal" : "Share with team"}
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem variant="destructive" disabled={v.locked || views.length < 2} onClick={() => remove(v.id)}>
												<TrashIcon /> Delete view
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						);
					})}
				</ScrollRow>
				<IconButton
					variant="secondary"
					size="icon"
					iconOrientation="center"
					icon={<PlusIcon />}
					aria-label="New view from current filters"
					title="New view from current filters"
					className="size-7 shrink-0"
					onClick={() => setDialog({ mode: "create", name: "", shared: false })}
				/>
			</div>

			<ActionBar className="min-h-6">
				{filters.length === 0 && <span className="text-xs text-tertiary-foreground">No filters</span>}
				{filters.map((f) => (
					<FilterChip
						key={f.id}
						label={f.label}
						value={f.value}
						onRemove={() => setFilters(filters.filter((x) => x.id !== f.id))}
					/>
				))}
				{addFilter}
				{filters.length > 1 && (
					<Button variant="skeleton" size="sm" onClick={() => setFilters([])}>
						Clear all
					</Button>
				)}
				{/* Mounted before it has text, so the change is announced reliably. */}
				<LiveStatus>{modified ? `View “${active?.name}” has unsaved changes` : ""}</LiveStatus>
				{modified && (
					// biome-ignore lint/a11y/useSemanticElements: a labelled group of buttons is not a <fieldset>
					<div className="ml-auto flex flex-wrap items-center gap-1.5" role="group" aria-label="Unsaved view changes">
						<IconButton
							variant="skeleton"
							size="sm"
							icon={<ArrowCounterClockwiseIcon />}
							onClick={() => active && selectView(active)}
						>
							Reset
						</IconButton>
						<Button variant="secondary" size="sm" onClick={() => setDialog({ mode: "create", name: "", shared: false })}>
							Save as new
						</Button>
						{!active?.locked && (
							<Button
								variant="primary"
								size="sm"
								onClick={() => active && update(active.id, { filters: filters.map((f) => ({ ...f })) })}
							>
								Save view
							</Button>
						)}
					</div>
				)}
			</ActionBar>

			<Dialog
				open={!!dialog}
				onOpenChange={(o) => {
					if (o) return;
					setDialog(null);
					setNameError(false);
				}}
			>
				<DialogContent
					finalFocus={() => {
						const id = returnTo.current ?? activeRef.current;
						returnTo.current = null;
						return (id && tabRefs.current.get(id)) || true;
					}}
				>
					<form
						className="flex flex-col gap-3"
						onSubmit={(e) => {
							e.preventDefault();
							submitDialog();
						}}
					>
						<DialogHeader>
							<DialogTitle>{dialog?.mode === "rename" ? "Rename view" : "Save as new view"}</DialogTitle>
							<DialogDescription>
								{dialog?.mode === "rename"
									? "Views keep their filters; only the name changes."
									: `Saves the ${filters.length || "no"} filter${filters.length === 1 ? "" : "s"} applied now.`}
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-1">
							<Input
								ref={nameInput}
								autoFocus
								aria-label="View name"
								aria-invalid={nameError || undefined}
								aria-describedby={nameError ? nameErrorId : undefined}
								variant={nameError ? "destructive" : "default"}
								placeholder="e.g. Overdue over RM 10k"
								value={dialog?.name ?? ""}
								onChange={(e) => {
									const name = e.target.value;
									setDialog((d) => (d ? { ...d, name } : d));
									if (name.trim()) setNameError(false);
								}}
							/>
							{nameError && (
								<FieldError id={nameErrorId} className="text-xs">
									Enter a name for the view.
								</FieldError>
							)}
						</div>
						<label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
							<Checkbox
								checked={!!dialog?.shared}
								onCheckedChange={(c) => setDialog((d) => (d ? { ...d, shared: !!c } : d))}
							/>
							Share with team
							<span className="text-xs text-tertiary-foreground">(everyone in the company sees it)</span>
						</label>
						<DialogFooter>
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setDialog(null);
									setNameError(false);
								}}
							>
								Cancel
							</Button>
							<Button type="submit" variant="primary">
								{dialog?.mode === "rename" ? "Rename" : "Save view"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
