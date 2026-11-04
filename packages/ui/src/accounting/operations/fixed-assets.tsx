"use client";

/**
 * Cynco UI — fixed assets: the asset detail page and its depreciation schedule.
 * Presentational port of cynco-labs/cynco remix/app/components/fixed-assets;
 * primitives and tokens only.
 */
import {
	ArrowSquareOutIcon,
	CalendarBlankIcon,
	ChartLineDownIcon,
	ListBulletsIcon,
	ReceiptIcon,
} from "@phosphor-icons/react";
import type * as React from "react";
import { Button, cn, StatusChip, Tabs, TabsContent, TabsList, TabsTrigger, useControllableState } from "../../base";
import {
	ActionBar,
	type DataColumn,
	DataList,
	DocStatus,
	formatDate,
	KeyValueList,
	ReportAmount,
	ScrollRow,
	SectionPanel,
	StatGrid,
	StatTile,
	type StatusEntry,
} from "../../lib/shared";
import { amt, type DivProps, DOT, type Num, OpsEmpty } from "./shared";

/** fixed-assets/shared STATUS_CONFIG. */
const FIXED_ASSET_STATUS: Record<string, StatusEntry> = {
	active: { label: "Active", variant: "success" },
	draft: { label: "Draft", variant: "neutral", glyph: "clock" },
	disposed: { label: "Disposed", variant: "error", glyph: "ban" },
	fully_depreciated: { label: "Fully depreciated", variant: "warning", glyph: "minus" },
	held_for_sale: { label: "Held for sale", variant: "info", glyph: "tag" },
};
const DEP_METHOD: Record<string, string> = {
	straight_line: "Straight line",
	reducing_balance: "Reducing balance",
	rate_on_cost: "Rate on cost",
};

function humanize(v: string | null | undefined): string {
	if (!v) return "—";
	return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface FixedAssetData {
	assetCode: string;
	name: string;
	status: string;
	categoryName: string | null;
	description: string | null;
	purchaseDate: string | null;
	totalCost: Num;
	accumulatedDepreciation: Num;
	netBookValue: Num;
	qualifyingExpenditure: Num;
	residualValue: Num;
	depreciationMethod: string | null;
	usefulLifeMonths: number | null;
	depreciationRate: string | null;
	serialNumber: string | null;
	location: string | null;
	department: string | null;
	custodian: string | null;
	invoiceReference: string | null;
	measurementModel: string;
	sourceType: string;
	caClass: string | null;
	iaRate: string | null;
	aaRate: string | null;
	iaClaimed: Num;
	cumulativeAaClaimed: Num;
	residualExpenditure: Num;
	disposalDate?: string | null;
	disposalMethod?: string | null;
	disposalProceeds?: Num;
	gainLossOnDisposal?: Num;
}

function AssetFact({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex min-w-0 items-baseline gap-1.5">
			<span className="text-2xs text-tertiary-foreground">{label}</span>
			<span className="min-w-0 text-sm text-foreground">{value || "—"}</span>
		</div>
	);
}
const mono = (v: string | null | undefined) =>
	v ? <span className="font-mono text-2xs font-medium break-all">{v}</span> : "—";
const orDash = (v: React.ReactNode) => (v === null || v === undefined || v === "" ? "—" : v);

/** Fixed-asset detail page: KPI tiles (cost, accumulated depreciation, NBV, QE), facts, tabs and the overview cards. */
export function FixedAssetOverview({
	asset,
	schedule,
	tab,
	defaultTab = "overview",
	onTabChange,
	className,
	...props
}: DivProps<{
	asset: FixedAssetData;
	schedule?: AssetDepreciationEntry[];
	/** Controlled open tab. */
	tab?: string;
	/** Tab open on first render when uncontrolled. */
	defaultTab?: string;
	onTabChange?: (tab: string) => void;
}>) {
	const a = asset;
	const [openTab, setOpenTab] = useControllableState({ prop: tab, defaultProp: defaultTab, onChange: onTabChange });
	const myr = (v: Num) =>
		amt(v) === "—" ? (
			"—"
		) : (
			<>
				{amt(v)} <span className="text-2xs font-medium text-tertiary-foreground">MYR</span>
			</>
		);
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<ActionBar>
				<h2 className="text-lg font-semibold text-foreground">{a.name}</h2>
				<DocStatus status={a.status} config={FIXED_ASSET_STATUS} />
			</ActionBar>
			<StatGrid min="sm">
				<StatTile className="shadow-sm" label="Total cost" value={myr(a.totalCost)} />
				<StatTile
					className="shadow-sm"
					label="Accum. depreciation"
					value={myr(a.accumulatedDepreciation)}
					dot={DOT.error}
				/>
				<StatTile className="shadow-sm" label="Net book value" value={myr(a.netBookValue)} dot={DOT.success} />
				<StatTile
					className="shadow-sm"
					label="Qualifying expenditure"
					value={myr(a.qualifyingExpenditure)}
					dot={DOT.violet}
				/>
			</StatGrid>
			<Tabs value={openTab} onValueChange={setOpenTab} className="min-w-0 gap-3">
				<div className="flex flex-col gap-2 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-6">
					<ScrollRow>
						<TabsList className="shrink-0">
							<TabsTrigger value="overview" className="gap-1.5">
								<ListBulletsIcon size={14} aria-hidden="true" />
								Overview
							</TabsTrigger>
							<TabsTrigger value="depreciation" className="gap-1.5">
								<ChartLineDownIcon size={14} aria-hidden="true" />
								Depreciation
							</TabsTrigger>
							<TabsTrigger value="tax" className="gap-1.5">
								<ReceiptIcon size={14} aria-hidden="true" />
								Capital allowances
							</TabsTrigger>
							<TabsTrigger value="history" className="gap-1.5">
								<CalendarBlankIcon size={14} aria-hidden="true" />
								Revaluations
							</TabsTrigger>
						</TabsList>
					</ScrollRow>
					<ActionBar className="gap-x-4 gap-y-1">
						<AssetFact label="Code" value={<span className="font-mono text-2xs font-medium">{a.assetCode}</span>} />
						<AssetFact label="Category" value={a.categoryName} />
						<AssetFact label="Purchased" value={a.purchaseDate && formatDate(a.purchaseDate)} />
					</ActionBar>
				</div>
				<TabsContent value="overview">
					<div className="grid gap-3 @2xl:grid-cols-2">
						<SectionPanel title="Asset details" className="shadow-sm [&>div]:pt-1 [&>header_h3]:text-sm">
							<KeyValueList
								className="[&>div]:py-1"
								items={[
									{ label: "Description", value: orDash(a.description) },
									{ label: "Serial number", value: mono(a.serialNumber) },
									{ label: "Location", value: orDash(a.location) },
									{ label: "Department", value: orDash(a.department) },
									{ label: "Custodian", value: orDash(a.custodian) },
									{ label: "Purchase date", value: a.purchaseDate ? formatDate(a.purchaseDate) : "—" },
									{ label: "Invoice reference", value: mono(a.invoiceReference) },
									{ label: "Source", value: humanize(a.sourceType) },
								]}
							/>
						</SectionPanel>
						<SectionPanel title="Depreciation & Tax" className="shadow-sm [&>div]:pt-1 [&>header_h3]:text-sm">
							<KeyValueList
								className="[&>div]:py-1"
								items={[
									{
										label: "Method",
										value: (a.depreciationMethod && DEP_METHOD[a.depreciationMethod]) || humanize(a.depreciationMethod),
									},
									a.depreciationMethod === "rate_on_cost"
										? { label: "Annual rate", value: a.depreciationRate ? `${a.depreciationRate}% of cost` : "—" }
										: {
												label: "Useful life",
												value: a.usefulLifeMonths ? `${a.usefulLifeMonths}mo (${(a.usefulLifeMonths / 12).toFixed(1)}yr)` : "—",
											},
									{ label: "Residual value", value: amt(a.residualValue) },
									{ label: "Model", value: humanize(a.measurementModel) },
									{ label: "CA class", value: humanize(a.caClass) },
									{ label: "IA rate", value: a.iaRate ? `${a.iaRate}%` : "—" },
									{ label: "AA rate", value: a.aaRate ? `${a.aaRate}%` : "—" },
									{ label: "IA claimed", value: amt(a.iaClaimed) },
									{ label: "Cumulative AA", value: amt(a.cumulativeAaClaimed) },
									{ label: "Residual expenditure", value: amt(a.residualExpenditure) },
								]}
							/>
						</SectionPanel>
						{a.status === "disposed" && (
							<SectionPanel
								title={<span className="text-sm text-error-text">Disposal details</span>}
								className="shadow-sm @2xl:col-span-2 [&>div]:pt-1"
							>
								<div className="grid gap-x-6 @xl:grid-cols-2">
									<KeyValueList
										items={[
											{ label: "Disposal date", value: a.disposalDate ? formatDate(a.disposalDate) : "—" },
											{ label: "Method", value: humanize(a.disposalMethod) },
										]}
									/>
									<KeyValueList
										items={[
											{ label: "Proceeds", value: amt(a.disposalProceeds) },
											{ label: "Gain / (Loss)", value: <ReportAmount amount={a.gainLossOnDisposal ?? 0} /> },
										]}
									/>
								</div>
							</SectionPanel>
						)}
					</div>
				</TabsContent>
				<TabsContent value="depreciation">{schedule ? <AssetDepreciationSchedule entries={schedule} /> : null}</TabsContent>
				<TabsContent value="tax">
					<OpsEmpty
						title="Capital allowance claims by year of assessment"
						description="IA and AA claimed per YA show here."
					/>
				</TabsContent>
				<TabsContent value="history">
					<OpsEmpty title="No revaluations" description="Revaluations apply to assets on the revaluation model." />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export interface AssetDepreciationEntry {
	id: string;
	period: string;
	depreciationAmount: Num;
	accumulatedToDate: Num;
	netBookValueAfter: Num;
	isPosted: boolean;
	journalEntryId: string | null;
}

/** Depreciation schedule: period, charge, accumulated, NBV after, posted/draft. */
export function AssetDepreciationSchedule({
	entries,
	onOpenJournal,
	className,
	...props
}: DivProps<{
	entries: AssetDepreciationEntry[];
	/**
	 * Opens the journal entry a posted row was recorded in — a different record from the row itself,
	 * reached from the Posted chip, so it is not the list's row-open callback.
	 */
	onOpenJournal?: (journalEntryId: string) => void;
}>) {
	const columns: DataColumn<AssetDepreciationEntry>[] = [
		{
			key: "period",
			header: "Period",
			mobile: "title",
			cell: (e) => <span className="font-mono text-2xs font-medium text-muted-foreground">{e.period || "—"}</span>,
		},
		{
			key: "dep",
			header: "Depreciation",
			align: "right",
			cell: (e) => <span className="text-muted-foreground">{amt(e.depreciationAmount)}</span>,
		},
		{
			key: "acc",
			header: "Accumulated",
			align: "right",
			cell: (e) => <span className="text-tertiary-foreground">{amt(e.accumulatedToDate)}</span>,
		},
		{
			key: "nbv",
			header: "NBV after",
			align: "right",
			mobile: "value",
			cell: (e) => <span className="font-medium">{amt(e.netBookValueAfter)}</span>,
		},
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			className: "w-32",
			cell: (e) => {
				const journalEntryId = e.isPosted ? e.journalEntryId : null;
				if (journalEntryId) {
					return (
						<Button
							variant="skeleton"
							size="sm"
							aria-label="Posted, open journal entry"
							onClick={() => onOpenJournal?.(journalEntryId)}
							className="h-auto border-0 p-0 hover:opacity-80"
						>
							<StatusChip tone="green" glyph="check">
								<span className="inline-flex items-center gap-1">
									Posted
									<ArrowSquareOutIcon size={12} aria-hidden="true" className="text-tertiary-foreground" />
								</span>
							</StatusChip>
						</Button>
					);
				}
				return e.isPosted ? (
					<StatusChip tone="green" glyph="check">
						Posted
					</StatusChip>
				) : (
					<StatusChip tone="neutral" glyph="clock" dashed>
						Draft
					</StatusChip>
				);
			},
		},
	];
	return (
		<div className={cn("min-w-0", className)} {...props}>
			{entries.length === 0 ? (
				<OpsEmpty
					icon={<ChartLineDownIcon size={20} weight="fill" aria-hidden="true" />}
					title="No depreciation entries"
					description="Depreciation entries will appear after a depreciation run"
				/>
			) : (
				<DataList columns={columns} rows={entries} getKey={(e) => e.id} caption="Depreciation schedule" dense />
			)}
		</div>
	);
}
