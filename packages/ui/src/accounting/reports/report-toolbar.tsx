"use client";

import { CameraIcon, ClockIcon, DownloadSimpleIcon, FilePdfIcon, FileXlsIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	GroupedTabButton,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	useControllableState,
} from "../../base";
import { ActionBar, formatDate, formatRelativeTime } from "../../lib/shared";

/** "2026-05" → "May 2026". */
function periodShort(period: string): string {
	const [y, m] = period.split("-").map(Number);
	if (!y || !m) return period;
	const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return `${MONTHS[m - 1]} ${y}`;
}

/** Group "YYYY-MM" periods under their fiscal year ("FY 2026", "FY 2025/2026"); flat without a FYE. */
function groupPeriodsByFY(
	periods: string[],
	fiscalYearEnd?: string | null,
): { label: string | null; periods: string[] }[] {
	if (!fiscalYearEnd) return [{ label: null, periods }];
	const endMonth = parseInt(fiscalYearEnd.split("-")[0]!, 10);
	const map = new Map<string, string[]>();
	for (const p of periods) {
		const [y, m] = p.split("-").map(Number) as [number, number];
		const label = endMonth === 12 ? `FY ${y}` : m > endMonth ? `FY ${y}/${y + 1}` : `FY ${y - 1}/${y}`;
		if (!map.has(label)) map.set(label, []);
		map.get(label)!.push(p);
	}
	return [...map.entries()].map(([label, ps]) => ({ label, periods: ps }));
}

export type ReportFreshness = { mode: "live"; lastPostingAt: string } | { mode: "snapshot"; takenAt: string };

/**
 * The report page header (cynco ReportShell › WorkbenchHeader) with its controls
 * (ReportControls + ExportDropdown): period, view, compare, snapshot, freshness
 * and export. Both rows wrap rather than overflow.
 */
export function ReportToolbar({
	title,
	meta,
	period: periodProp,
	defaultPeriod,
	onPeriodChange,
	periods,
	fiscalYearEnd,
	view: viewProp,
	defaultView,
	onViewChange,
	views,
	compare: compareProp,
	defaultCompare,
	onCompareChange,
	comparePeriod: comparePeriodProp,
	defaultComparePeriod,
	onComparePeriodChange,
	onSaveSnapshot,
	freshness,
	now,
	onExport,
	className,
	...props
}: Omit<React.ComponentProps<"header">, "title"> & {
	title?: React.ReactNode;
	/** Quiet sub-line, e.g. "October 2026 · MYR". */
	meta?: React.ReactNode;
	/** Controlled reporting period (e.g. "2026-03"). */
	period?: string;
	/** Initial period for uncontrolled use. */
	defaultPeriod?: string;
	/** Called when the user changes the reporting period. */
	onPeriodChange?: (period: string) => void;
	periods: string[];
	/** "MM-DD"; groups the period list by fiscal year. */
	fiscalYearEnd?: string | null;
	/** Controlled view (P&L Monthly/YTD, TB Standard/Extended). */
	view?: string;
	/** Initial view for uncontrolled use. */
	defaultView?: string;
	/** Called when the user switches the report view. */
	onViewChange?: (view: string) => void;
	views?: { value: string; label: string }[];
	/** Controlled compare toggle; omit the prop entirely to hide the Compare button. */
	compare?: boolean;
	/** Initial compare value for uncontrolled use. */
	defaultCompare?: boolean;
	/** Called when the user toggles the compare mode. */
	onCompareChange?: (compare: boolean) => void;
	/** Controlled comparison period. */
	comparePeriod?: string;
	/** Initial comparison period for uncontrolled use. */
	defaultComparePeriod?: string;
	/** Called when the user changes the comparison period. */
	onComparePeriodChange?: (period: string) => void;
	/** Called when the user clicks "Save snapshot"; omit to hide the button. */
	onSaveSnapshot?: () => void;
	freshness?: ReportFreshness | null;
	/** Clock for the freshness label (defaults to Date.now()). */
	now?: string | number;
	onExport?: (format: "pdf" | "excel") => void;
}) {
	const [period = "", setPeriod] = useControllableState({
		prop: periodProp,
		defaultProp: defaultPeriod,
		onChange: onPeriodChange,
	});
	const [view, setView] = useControllableState({ prop: viewProp, defaultProp: defaultView, onChange: onViewChange });
	const [compare, setCompare] = useControllableState({
		prop: compareProp,
		defaultProp: defaultCompare,
		onChange: onCompareChange,
	});
	const [comparePeriod, setComparePeriod] = useControllableState({
		prop: comparePeriodProp,
		defaultProp: defaultComparePeriod,
		onChange: onComparePeriodChange,
	});
	const groups = React.useMemo(() => groupPeriodsByFY(periods, fiscalYearEnd), [periods, fiscalYearEnd]);
	const items = React.useMemo(
		() => Object.fromEntries([...periods, period].map((p) => [p, periodShort(p)])),
		[periods, period],
	);
	const clock = now != null ? new Date(now).getTime() : Date.now();
	const fresh = freshness
		? freshness.mode === "snapshot"
			? {
					Icon: CameraIcon,
					label: `Snapshot taken ${formatRelativeTime(freshness.takenAt, { now: clock, maxUnit: "hour" })}`,
					detail: `Snapshot taken ${formatDate(freshness.takenAt)}. Postings after that aren't included.`,
				}
			: {
					Icon: ClockIcon,
					label: `Last posting ${formatRelativeTime(freshness.lastPostingAt, { now: clock, maxUnit: "hour" })}`,
					detail: "Figures are calculated from the ledger each time this page loads.",
				}
		: null;

	const options = (exclude?: string) =>
		groups.map((g) => {
			const list = g.periods
				.filter((p) => p !== exclude)
				.map((p) => (
					<SelectItem key={p} value={p}>
						{periodShort(p)}
					</SelectItem>
				));
			if (!list.length) return null;
			if (g.label === null) return <React.Fragment key="flat">{list}</React.Fragment>;
			return (
				<SelectGroup key={g.label}>
					<SelectLabel>{g.label}</SelectLabel>
					{list}
				</SelectGroup>
			);
		});

	const controls = (
		<ActionBar>
			<Select value={period} items={items} onValueChange={(v) => v && setPeriod(v as string)}>
				<SelectTrigger className="h-7 w-36 max-w-full" aria-label="Reporting period">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{options()}</SelectContent>
			</Select>
			{views && view !== undefined && (
				<GroupedTabButton
					aria-label="Report view"
					className="w-auto"
					value={view}
					onValueChange={setView}
					options={views}
				/>
			)}
			{compare !== undefined && (
				<>
					<Button variant={compare ? "primary" : "secondary"} aria-pressed={compare} onClick={() => setCompare(!compare)}>
						Compare
					</Button>
					{compare && (
						<Select value={comparePeriod ?? ""} items={items} onValueChange={(v) => v && setComparePeriod(v as string)}>
							<SelectTrigger className="h-7 w-36 max-w-full" aria-label="Comparison period">
								<SelectValue placeholder="Compare with…" />
							</SelectTrigger>
							<SelectContent>{options(period)}</SelectContent>
						</Select>
					)}
				</>
			)}
			{onSaveSnapshot && (
				<Button variant="secondary" onClick={onSaveSnapshot}>
					<CameraIcon size={14} aria-hidden="true" />
					Save snapshot
				</Button>
			)}
		</ActionBar>
	);
	const actions = (
		<ActionBar>
			{fresh && (
				<Tooltip>
					<TooltipTrigger render={<Button variant="skeleton" className="text-2xs text-tertiary-foreground tabular-nums" />}>
						<fresh.Icon size={14} aria-hidden="true" />
						{fresh.label}
					</TooltipTrigger>
					<TooltipContent className="max-w-64">{fresh.detail}</TooltipContent>
				</Tooltip>
			)}
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger render={<Button variant="secondary" />}>
					<DownloadSimpleIcon size={14} aria-hidden="true" />
					Export
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-44">
					<DropdownMenuItem onClick={() => onExport?.("pdf")}>
						<FilePdfIcon size={14} aria-hidden="true" />
						Download PDF
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onExport?.("excel")}>
						<FileXlsIcon size={14} aria-hidden="true" />
						Download Excel
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</ActionBar>
	);

	return (
		<header className={cn("flex min-w-0 flex-col gap-3", title && "border-b pb-3", className)} {...props}>
			{title ? (
				<>
					<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
						<div className="min-w-0">
							<h1 className="text-lg font-semibold text-foreground">{title}</h1>
							{meta && <p className="mt-0.5 text-2xs text-tertiary-foreground tabular-nums">{meta}</p>}
						</div>
						{actions}
					</div>
					{controls}
				</>
			) : (
				<ActionBar>
					{controls}
					{actions}
				</ActionBar>
			)}
		</header>
	);
}
