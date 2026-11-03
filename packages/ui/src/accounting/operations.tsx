"use client";

/**
 * Cynco UI — tax, fixed assets, items/inventory, purchase orders,
 * payroll and LHDN MyInvois e-invoice. Presentational ports of
 * cynco-labs/cynco remix/app/components/{tax,fixed-assets,items,inventory,
 * purchase-orders,payroll-store,invoice}; primitives and tokens only.
 *
 * Every component responds to its own container width (DataList / StatGrid /
 * SectionPanel / ScrollRow / container queries), from 320px up to a full page.
 */
import * as React from "react";
import { parseDate } from "../base/lib/utils";
import {
	Button,
	Badge,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Checkbox,
	Input,
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
	Progress,
	StatusChip,
	StatusChipIcon,
	cn,
	type StatusTone,
	type StatusGlyph,
	useControllableState,
} from "../base";
import {
	ArrowSquareOutIcon,
	ChartLineDownIcon,
	CalendarBlankIcon,
	ListBulletsIcon,
	PackageIcon,
	PlusIcon,
	ReceiptIcon,
	ScalesIcon,
	ShoppingCartIcon,
	TrashIcon,
	TruckIcon,
	SealCheckIcon,
} from "@phosphor-icons/react";
import {
	FieldError,
	formatCurrency,
	formatDate,
	ReportAmount,
	DocStatus,
	SectionLabel,
	DataList,
	StatGrid,
	StatTile,
	SectionPanel,
	ActionBar,
	ScrollRow,
	KeyValueList,
	surfaces,
	negativeClass,
	type DataColumn,
	type StatusEntry,
} from "../lib/shared";
import { fixed, mul, roundToSen } from "../lib/decimal";
import { fromSen, isDecimalString, sumAmounts } from "../lib/money";

/* ------------------------------------------------------------------ helpers */

type Num = number | string | null | undefined;
/** Native div props minus the ones a component defines itself. */
type DivProps<P> = P & Omit<React.ComponentProps<"div">, keyof P>;

function num(v: Num): number {
	if (v === null || v === undefined || v === "") return 0;
	const n = typeof v === "string" ? parseFloat(v) : v;
	return Number.isFinite(n) ? n : 0;
}
/** cynco formatAmount: "1,234.00", "—" for null. */
function amt(v: Num): string {
	if (v === null || v === undefined || v === "") return "—";
	const f = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	if (typeof v === "number") return Number.isFinite(v) ? f.format(v) : "—";
	// Decimal strings format exactly; Intl takes them without a float round-trip.
	const s = v.trim();
	return isDecimalString(s) ? f.format(s) : "—";
}
function qty4(v: Num): string {
	return num(v).toFixed(4);
}
function humanize(v: string | null | undefined): string {
	if (!v) return "—";
	return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
/** Payroll amounts arrive as integer sen (payroll-store/format.ts formatSen). */
function sen(v: number): string {
	return formatCurrency(v / 100);
}

/** cynco KpiTile accents → status dot colours. */
const DOT = {
	success: "var(--status-green)",
	error: "var(--status-red)",
	warning: "var(--status-amber)",
	violet: "var(--status-purple)",
} as const;


function MutedBadge({ children }: { children: React.ReactNode }) {
	return <Badge variant="muted" size="sm" className="shrink-0 text-tertiary-foreground">{children}</Badge>;
}

function OpsEmpty({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
	return (
		<div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-6 py-8 text-center">
			{icon && <span className="text-subtle">{icon}</span>}
			<div className="text-sm text-foreground">{title}</div>
			{description && <div className="text-sm font-normal text-tertiary-foreground">{description}</div>}
		</div>
	);
}

/** Totals line that sits on the tray under a DataList: label left, figures right, wrapping when narrow. */
function TrayTotals({ label, items }: { label: React.ReactNode; items: { label?: string; value: React.ReactNode }[] }) {
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold text-foreground">
			<span>{label}</span>
			<span className="flex flex-wrap items-baseline justify-end gap-x-4 gap-y-0.5">
				{items.map((it, i) => (
					<span key={i} className="whitespace-nowrap tabular-nums">
						{it.label && <span className="mr-1.5 text-xs font-normal text-tertiary-foreground">{it.label}</span>}
						{it.value}
					</span>
				))}
			</span>
		</div>
	);
}

/** Row-level icon action (delete etc.). */
function RowIconButton({ label, onClick, disabled, ...props }: { label: string; onClick?: () => void; disabled?: boolean } & Omit<React.ComponentProps<"button">, "onClick" | "disabled">) {
	return (
		<Button variant="skeleton" size="icon" aria-label={label} disabled={disabled} focusableWhenDisabled onClick={onClick} className="text-tertiary-foreground hover:text-error-text!" {...props}>
			<TrashIcon size={14} aria-hidden="true" />
		</Button>
	);
}

/* ====================================================================== TAX */

/** tax/ReturnRow: label + report figure; bold subtotals, highlighted totals. */
function TaxReturnLine({ label, amount, bold, highlight }: { label: string; amount: number; bold?: boolean; highlight?: boolean }) {
	const tone = bold ? "font-semibold text-foreground" : "text-muted-foreground";
	return (
		<div className={cn("flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-1 text-sm", highlight && "bg-muted")}>
			<span className={cn("min-w-0", tone)}>{label}</span>
			<ReportAmount amount={amount} className={cn("shrink-0", bold && "font-semibold", amount >= 0 && tone)} />
		</div>
	);
}
function TaxRule() {
	return <div className="mx-2.5 my-1.5 border-t border-table-row-divider" />;
}

export interface TaxComputationData {
	accountingProfit: Num; addBacks: Num; deductions: Num; adjustedIncome: Num;
	capitalAllowances: Num; balancingCharges: Num; balancingAllowances: Num; statutoryBusinessIncome: Num;
	otherStatutoryIncome: Num; aggregateIncome: Num; currentYearLosses: Num; broughtForwardLosses: Num;
	totalIncome: Num; approvedDonations: Num; chargeableIncome: Num;
	isSME: boolean | null;
	taxOnFirst150k: Num; taxOn150kTo600k: Num; taxAbove600k: Num; totalTaxCharged: Num;
	taxRebates: Num; section110Credit: Num; bilateralCredit: Num; cp204Paid: Num; balancePayable: Num;
}

/** Form C: chargeable income build-up and the tax computation beside it (stacked when narrow). */
export function TaxComputationSummary({ data, rateExplanation, className, ...props }: DivProps<{ data: TaxComputationData; rateExplanation?: string }>) {
	const d = data;
	return (
		<div className={cn("@container min-w-0", className)} {...props}>
			<div className="grid gap-3 @2xl:grid-cols-2">
				<SectionPanel title="Chargeable income" className="shadow-sm [&>div]:px-1.5 [&>div]:pt-2">
					<TaxReturnLine label="Accounting profit" amount={num(d.accountingProfit)} />
					<TaxReturnLine label="Add-backs" amount={num(d.addBacks)} />
					<TaxReturnLine label="Deductions" amount={-num(d.deductions)} />
					<TaxReturnLine label="Adjusted income" amount={num(d.adjustedIncome)} bold />
					<TaxRule />
					<TaxReturnLine label="Capital allowances" amount={-num(d.capitalAllowances)} />
					<TaxReturnLine label="Balancing charges" amount={num(d.balancingCharges)} />
					<TaxReturnLine label="Balancing allowances" amount={-num(d.balancingAllowances)} />
					<TaxReturnLine label="Statutory business income" amount={num(d.statutoryBusinessIncome)} bold />
					<TaxRule />
					<TaxReturnLine label="Other statutory income" amount={num(d.otherStatutoryIncome)} />
					<TaxReturnLine label="Aggregate income" amount={num(d.aggregateIncome)} />
					<TaxReturnLine label="Current year losses" amount={-num(d.currentYearLosses)} />
					<TaxReturnLine label="Brought forward losses" amount={-num(d.broughtForwardLosses)} />
					<TaxReturnLine label="Total income" amount={num(d.totalIncome)} />
					<TaxReturnLine label="Approved donations" amount={-num(d.approvedDonations)} />
					<TaxReturnLine label="Chargeable income" amount={num(d.chargeableIncome)} bold highlight />
				</SectionPanel>
				<SectionPanel
					title="Tax computation"
					description={
						<span className="mt-1 flex flex-col items-start gap-1.5">
							{d.isSME ? <StatusChip tone="blue" glyph="check">SME Rates</StatusChip> : <StatusChip tone="neutral" glyph="minus">Standard 24%</StatusChip>}
							{!d.isSME && rateExplanation && <span>{rateExplanation}</span>}
						</span>
					}
					className="self-start shadow-sm [&>div]:px-1.5 [&>div]:pt-2"
				>
					{d.isSME && (
						<>
							<TaxReturnLine label="Tax on first RM150k (15%)" amount={num(d.taxOnFirst150k)} />
							<TaxReturnLine label="Tax on RM150k-600k (17%)" amount={num(d.taxOn150kTo600k)} />
							<TaxReturnLine label="Tax above RM600k (24%)" amount={num(d.taxAbove600k)} />
						</>
					)}
					<TaxReturnLine label="Total tax charged" amount={num(d.totalTaxCharged)} bold />
					<TaxRule />
					<TaxReturnLine label="Tax rebates" amount={-num(d.taxRebates)} />
					<TaxReturnLine label="Section 110 credit" amount={-num(d.section110Credit)} />
					<TaxReturnLine label="Bilateral credit" amount={-num(d.bilateralCredit)} />
					<TaxReturnLine label="CP204 paid" amount={-num(d.cp204Paid)} />
					<TaxRule />
					<TaxReturnLine label="Balance payable / (refundable)" amount={num(d.balancePayable)} bold highlight />
				</SectionPanel>
			</div>
		</div>
	);
}

/** tax/InstallmentSchedule INSTALLMENT_STATUSES. */
const CP204_STATUS: Record<string, StatusEntry> = {
	paid: { label: "Paid", variant: "success" },
	pending: { label: "Pending", variant: "neutral", glyph: "clock" },
	partial: { label: "Partial", variant: "warning" },
	overdue: { label: "Overdue", variant: "error" },
};

export interface CP204Installment { id: string; installmentNumber: number | null; dueDate: string | null; amount: Num; paidAmount: Num; status: string | null }

/** CP204 monthly instalment table with Mark paid on pending rows. */
export function TaxInstallmentSchedule({ installments, totalDue, totalPaid, isSubmitting = false, onMarkPaid, description = "12 monthly installments, due 15th of each month", className, ...props }: DivProps<{ installments: CP204Installment[]; totalDue: number; totalPaid: number; isSubmitting?: boolean; onMarkPaid?: (id: string) => void; description?: React.ReactNode }>) {
	const pct = totalDue > 0 ? Math.min(100, (totalPaid / totalDue) * 100) : 0;
	const columns: DataColumn<CP204Installment>[] = [
		{ key: "n", header: "#", className: "w-12", mobile: "hidden", cell: (i) => <span className="font-mono text-2xs font-medium text-tertiary-foreground">{i.installmentNumber ?? "—"}</span> },
		{ key: "due", header: "Due date", mobile: "title", cell: (i) => <span className="text-muted-foreground">{i.dueDate ? formatDate(i.dueDate) : "—"}</span> },
		{ key: "amount", header: "Amount (RM)", align: "right", mobile: "value", cell: (i) => <ReportAmount amount={num(i.amount)} /> },
		{ key: "paid", header: "Paid (RM)", align: "right", cell: (i) => (i.paidAmount ? <ReportAmount amount={num(i.paidAmount)} className="text-muted-foreground" /> : <span className="text-tertiary-foreground">—</span>) },
		{ key: "status", header: "Status", mobile: "badge", cell: (i) => <DocStatus status={i.status ?? "pending"} config={CP204_STATUS} /> },
	];
	return (
		<div className={cn("min-w-0", className)} {...props}>
			<SectionPanel
				title="Installment schedule"
				description={description}
				className="shadow-sm"
				actions={
					<div className="flex w-40 max-w-full flex-col items-end gap-1.5">
						<span className="text-2xs text-tertiary-foreground tabular-nums">{pct.toFixed(0)}% paid</span>
						<Progress value={pct} aria-label="Installments paid" className="w-full" />
					</div>
				}
			>
				<DataList
					columns={columns}
					rows={installments}
					getKey={(i) => i.id}
					caption="CP204 installment schedule"
					dense
					trailing={(i) =>
						i.status === "pending" ? (
							<Button variant="skeleton" size="sm" disabled={isSubmitting} focusableWhenDisabled onClick={() => onMarkPaid?.(i.id)} className="whitespace-nowrap">
								Mark paid
								<span className="sr-only">{`, installment${i.installmentNumber != null ? ` ${i.installmentNumber}` : ""}${i.dueDate ? ` due ${formatDate(i.dueDate)}` : ""}`}</span>
							</Button>
						) : null
					}
					footer={<TrayTotals label="Total" items={[{ label: "Due", value: amt(totalDue) }, { label: "Paid", value: amt(totalPaid) }]} />}
				/>
			</SectionPanel>
		</div>
	);
}

const ADJ_SOURCE: Record<string, { label: string; tone: StatusTone; glyph: StatusGlyph }> = {
	auto_gl: { label: "Auto (GL)", tone: "neutral", glyph: "refresh" },
	manual: { label: "Manual", tone: "blue", glyph: "pencil" },
	ai_suggested: { label: "AI", tone: "amber", glyph: "cpu" },
};

export interface TaxAdjustment { id: string; category: string; itemCode: string; description: string; amount: Num; source: string; accountCode: string | null }

/** Add-backs / deductions / reliefs for a tax computation, with source chips. */
export function TaxAdjustmentsTable({ title, adjustments, category, readOnly = false, isSubmitting = false, onAdd, onDelete, className, ...props }: DivProps<{ title: string; adjustments: TaxAdjustment[]; category: "add_back" | "deduction" | "relief"; readOnly?: boolean; isSubmitting?: boolean; onAdd?: () => void; onDelete?: (id: string) => void }>) {
	const rows = adjustments.filter((a) => a.category === category);
	const total = rows.reduce((s, a) => s + num(a.amount), 0);
	const noun = category === "add_back" ? "add-backs" : category === "deduction" ? "deductions" : "reliefs";
	const columns: DataColumn<TaxAdjustment>[] = [
		{ key: "code", header: "Code", className: "w-24", cell: (a) => <span className="font-mono text-2xs font-medium text-muted-foreground">{a.itemCode}</span> },
		{
			key: "desc",
			header: "Description",
			mobile: "title",
			cell: (a) => (
				<span className="text-muted-foreground">
					{a.description || "—"}
					{a.accountCode && <span className="ml-1.5 font-mono text-2xs font-medium text-tertiary-foreground">({a.accountCode})</span>}
				</span>
			),
		},
		{
			key: "source",
			header: "Source",
			mobile: "badge",
			cell: (a) => {
				const src = ADJ_SOURCE[a.source] ?? { label: a.source, tone: "neutral" as StatusTone, glyph: "minus" as StatusGlyph };
				return <StatusChip tone={src.tone} glyph={src.glyph}>{src.label}</StatusChip>;
			},
		},
		{ key: "amount", header: "Amount (RM)", align: "right", mobile: "value", cell: (a) => <ReportAmount amount={num(a.amount)} /> },
	];
	return (
		<div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			<ActionBar className="justify-between">
				<h3 className="text-md font-semibold text-foreground">{title}</h3>
				{!readOnly && (
					<Button variant="secondary" size="sm" disabled={isSubmitting} focusableWhenDisabled onClick={() => onAdd?.()}>
						<PlusIcon size={12} weight="bold" aria-hidden="true" />
						Add
						<span className="sr-only"> to {title}</span>
					</Button>
				)}
			</ActionBar>
			{rows.length === 0 ? (
				<p className="px-3 py-3 text-sm font-normal text-tertiary-foreground">No {noun} recorded.</p>
			) : (
				<DataList
					columns={columns}
					rows={rows}
					getKey={(a) => a.id}
					caption={title}
					dense
					trailing={readOnly ? undefined : (a) => <RowIconButton label={`Delete ${a.itemCode}`} disabled={isSubmitting} onClick={() => onDelete?.(a.id)} />}
					footer={<TrayTotals label="Total" items={[{ value: amt(total) }]} />}
				/>
			)}
		</div>
	);
}

/** tax/FilingWorkflowBar TAX_RETURN_STATUSES. */
const TAX_RETURN_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral" },
	reviewed: { label: "Reviewed", variant: "warning" },
	filed: { label: "Filed", variant: "success" },
	amended: { label: "Amended", variant: "info", glyph: "pencil" },
};
const FILING_STEPS = ["draft", "reviewed", "filed"] as const;

/** Draft → Reviewed → Filed stepper for a tax return, with the next action. */
export function TaxFilingWorkflow({ status, readOnly = false, isSubmitting = false, filingReference, reviewedAt, filedAt, onReview, onFile, className, ...props }: DivProps<{ status: string; readOnly?: boolean; isSubmitting?: boolean; filingReference?: string | null; reviewedAt?: string | null; filedAt?: string | null; onReview?: () => void; onFile?: () => void }>) {
	const idx = Math.max(0, FILING_STEPS.indexOf(status as (typeof FILING_STEPS)[number]));
	const amended = status === "amended";
	const cur = amended || status === "filed" ? FILING_STEPS.length : idx;
	return (
		<div className={cn("@container min-w-0 rounded-xl border bg-card px-4 py-3 shadow-sm", className)} {...props}>
			<div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
				<ScrollRow aria-label="Filing workflow" role="list">
					{FILING_STEPS.map((step, i) => {
						const complete = cur > i;
						const current = cur === i;
						const label = TAX_RETURN_STATUS[step]!.label;
						return (
							<div key={step} role="listitem" className="flex shrink-0 items-center gap-2">
								{i > 0 && <span aria-hidden="true" className={cn("h-px w-6", complete || current ? "bg-primary" : "bg-border")} />}
								{complete ? (
									<StatusChip tone="green" glyph="check">{label}</StatusChip>
								) : current ? (
									<StatusChip tone="neutral" glyph="dashed" aria-current="step" className="border-primary/40 bg-active-primary dark:border-primary/40 dark:bg-active-primary">{label}</StatusChip>
								) : (
									<span className="px-1.5 text-2xs text-tertiary-foreground">{label}</span>
								)}
								<span className="sr-only">{complete ? ", done" : current ? ", current step" : ", not started"}</span>
							</div>
						);
					})}
					{amended && (
						<div role="listitem" className="flex shrink-0 items-center gap-2">
							<span aria-hidden="true" className="h-px w-6 bg-border" />
							<DocStatus status="amended" config={TAX_RETURN_STATUS} />
						</div>
					)}
				</ScrollRow>
				<ActionBar className="gap-x-3">
					{filingReference && <span className="text-2xs text-tertiary-foreground">Ref: <span className="font-mono font-medium text-muted-foreground">{filingReference}</span></span>}
					{reviewedAt && status !== "draft" && <span className="text-2xs text-tertiary-foreground">Reviewed: {parseDate(reviewedAt).toLocaleDateString("en-MY", { day: "2-digit", month: "short" })}</span>}
					{filedAt && <span className="text-2xs text-tertiary-foreground">Filed: {formatDate(filedAt)}</span>}
					{!readOnly && status === "draft" && <Button variant="secondary" size="sm" disabled={isSubmitting} focusableWhenDisabled onClick={() => onReview?.()}>Mark reviewed</Button>}
					{!readOnly && status === "reviewed" && <Button variant="primary" size="sm" disabled={isSubmitting} focusableWhenDisabled onClick={() => onFile?.()}>Mark filed</Button>}
				</ActionBar>
			</div>
		</div>
	);
}

/* ============================================================ FIXED ASSETS */

/** fixed-assets/shared STATUS_CONFIG. */
const FIXED_ASSET_STATUS: Record<string, StatusEntry> = {
	active: { label: "Active", variant: "success" },
	draft: { label: "Draft", variant: "neutral", glyph: "clock" },
	disposed: { label: "Disposed", variant: "error", glyph: "ban" },
	fully_depreciated: { label: "Fully depreciated", variant: "warning", glyph: "minus" },
	held_for_sale: { label: "Held for sale", variant: "info", glyph: "tag" },
};
const DEP_METHOD: Record<string, string> = { straight_line: "Straight line", reducing_balance: "Reducing balance", rate_on_cost: "Rate on cost" };

export interface FixedAssetData {
	assetCode: string; name: string; status: string; categoryName: string | null; description: string | null;
	purchaseDate: string | null; totalCost: Num; accumulatedDepreciation: Num; netBookValue: Num; qualifyingExpenditure: Num;
	residualValue: Num; depreciationMethod: string | null; usefulLifeMonths: number | null; depreciationRate: string | null;
	serialNumber: string | null; location: string | null; department: string | null; custodian: string | null; invoiceReference: string | null;
	measurementModel: string; sourceType: string; caClass: string | null; iaRate: string | null; aaRate: string | null;
	iaClaimed: Num; cumulativeAaClaimed: Num; residualExpenditure: Num;
	disposalDate?: string | null; disposalMethod?: string | null; disposalProceeds?: Num; gainLossOnDisposal?: Num;
}

function AssetFact({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex min-w-0 items-baseline gap-1.5">
			<span className="text-2xs text-tertiary-foreground">{label}</span>
			<span className="min-w-0 text-sm text-foreground">{value || "—"}</span>
		</div>
	);
}
const mono = (v: string | null | undefined) => (v ? <span className="font-mono text-2xs font-medium break-all">{v}</span> : "—");
const orDash = (v: React.ReactNode) => (v === null || v === undefined || v === "" ? "—" : v);

/** Fixed-asset detail page: KPI tiles (cost, accumulated depreciation, NBV, QE), facts, tabs and the overview cards. */
export function FixedAssetOverview({ asset, schedule, defaultTab = "overview", className, ...props }: DivProps<{ asset: FixedAssetData; schedule?: AssetDepreciationEntry[]; defaultTab?: string }>) {
	const a = asset;
	const myr = (v: Num) => (amt(v) === "—" ? "—" : <>{amt(v)} <span className="text-2xs font-medium text-tertiary-foreground">MYR</span></>);
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3", className)} {...props}>
			<ActionBar>
				<h2 className="text-lg font-semibold text-foreground">{a.name}</h2>
				<DocStatus status={a.status} config={FIXED_ASSET_STATUS} />
			</ActionBar>
			<StatGrid min="sm">
				<StatTile className="shadow-sm" label="Total cost" value={myr(a.totalCost)} />
				<StatTile className="shadow-sm" label="Accum. depreciation" value={myr(a.accumulatedDepreciation)} dot={DOT.error} />
				<StatTile className="shadow-sm" label="Net book value" value={myr(a.netBookValue)} dot={DOT.success} />
				<StatTile className="shadow-sm" label="Qualifying expenditure" value={myr(a.qualifyingExpenditure)} dot={DOT.violet} />
			</StatGrid>
			<Tabs defaultValue={defaultTab} className="min-w-0 gap-3">
				<div className="flex flex-col gap-2 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-6">
					<ScrollRow>
						<TabsList className="shrink-0">
							<TabsTrigger value="overview" className="gap-1.5"><ListBulletsIcon size={14} aria-hidden="true" />Overview</TabsTrigger>
							<TabsTrigger value="depreciation" className="gap-1.5"><ChartLineDownIcon size={14} aria-hidden="true" />Depreciation</TabsTrigger>
							<TabsTrigger value="tax" className="gap-1.5"><ReceiptIcon size={14} aria-hidden="true" />Capital allowances</TabsTrigger>
							<TabsTrigger value="history" className="gap-1.5"><CalendarBlankIcon size={14} aria-hidden="true" />Revaluations</TabsTrigger>
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
									{ label: "Method", value: (a.depreciationMethod && DEP_METHOD[a.depreciationMethod]) || humanize(a.depreciationMethod) },
									a.depreciationMethod === "rate_on_cost"
										? { label: "Annual rate", value: a.depreciationRate ? `${a.depreciationRate}% of cost` : "—" }
										: { label: "Useful life", value: a.usefulLifeMonths ? `${a.usefulLifeMonths}mo (${(a.usefulLifeMonths / 12).toFixed(1)}yr)` : "—" },
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
							<SectionPanel title={<span className="text-sm text-error-text">Disposal details</span>} className="shadow-sm @2xl:col-span-2 [&>div]:pt-1">
								<div className="grid gap-x-6 @xl:grid-cols-2">
									<KeyValueList items={[{ label: "Disposal date", value: a.disposalDate ? formatDate(a.disposalDate) : "—" }, { label: "Method", value: humanize(a.disposalMethod) }]} />
									<KeyValueList items={[{ label: "Proceeds", value: amt(a.disposalProceeds) }, { label: "Gain / (Loss)", value: <ReportAmount amount={num(a.gainLossOnDisposal)} /> }]} />
								</div>
							</SectionPanel>
						)}
					</div>
				</TabsContent>
				<TabsContent value="depreciation">{schedule ? <AssetDepreciationSchedule entries={schedule} /> : null}</TabsContent>
				<TabsContent value="tax"><OpsEmpty title="Capital allowance claims by year of assessment" description="IA and AA claimed per YA show here." /></TabsContent>
				<TabsContent value="history"><OpsEmpty title="No revaluations" description="Revaluations apply to assets on the revaluation model." /></TabsContent>
			</Tabs>
		</div>
	);
}

export interface AssetDepreciationEntry { id: string; period: string; depreciationAmount: Num; accumulatedToDate: Num; netBookValueAfter: Num; isPosted: boolean; journalEntryId: string | null }

/** Depreciation schedule: period, charge, accumulated, NBV after, posted/draft. */
export function AssetDepreciationSchedule({ entries, onOpenJournal, className, ...props }: DivProps<{ entries: AssetDepreciationEntry[]; onOpenJournal?: (journalEntryId: string) => void }>) {
	const columns: DataColumn<AssetDepreciationEntry>[] = [
		{ key: "period", header: "Period", mobile: "title", cell: (e) => <span className="font-mono text-2xs font-medium text-muted-foreground">{e.period || "—"}</span> },
		{ key: "dep", header: "Depreciation", align: "right", cell: (e) => <span className="text-muted-foreground">{amt(e.depreciationAmount)}</span> },
		{ key: "acc", header: "Accumulated", align: "right", cell: (e) => <span className="text-tertiary-foreground">{amt(e.accumulatedToDate)}</span> },
		{ key: "nbv", header: "NBV after", align: "right", mobile: "value", cell: (e) => <span className="font-medium">{amt(e.netBookValueAfter)}</span> },
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			className: "w-32",
			cell: (e) =>
				e.isPosted && e.journalEntryId ? (
					<Button variant="skeleton" size="sm" aria-label="Posted, open journal entry" onClick={() => onOpenJournal?.(e.journalEntryId!)} className="h-auto border-0 p-0 hover:opacity-80">
						<StatusChip tone="green" glyph="check">
							<span className="inline-flex items-center gap-1">Posted<ArrowSquareOutIcon size={12} aria-hidden="true" className="text-tertiary-foreground" /></span>
						</StatusChip>
					</Button>
				) : e.isPosted ? (
					<StatusChip tone="green" glyph="check">Posted</StatusChip>
				) : (
					<StatusChip tone="neutral" glyph="clock" dashed>Draft</StatusChip>
				),
		},
	];
	return (
		<div className={cn("min-w-0", className)} {...props}>
			{entries.length === 0 ? (
				<OpsEmpty icon={<ChartLineDownIcon size={20} weight="fill" aria-hidden="true" />} title="No depreciation entries" description="Depreciation entries will appear after a depreciation run" />
			) : (
				<DataList columns={columns} rows={entries} getKey={(e) => e.id} caption="Depreciation schedule" dense />
			)}
		</div>
	);
}

/* =================================================================== ITEMS */

export interface CatalogItem {
	id: string; name: string; description?: string | null; isArchived?: boolean;
	unitPrice: Num; unitCost?: Num; costingMode?: "none" | "fixed" | "inventory" | null; targetMarginPercent?: Num;
	trackInventory?: boolean; unitOfMeasure?: string | null; reorderPoint?: Num; taxRate?: Num; discountRate?: Num;
}
export interface ItemInventoryInfo { onHandQuantity: Num; weightedAvgCost?: Num }
export interface ItemRealized { marginPercent: number | null; belowCostLineCount: number }

function itemMargin(item: CatalogItem, inv?: ItemInventoryInfo) {
	if (!item.costingMode || item.costingMode === "none") return null;
	let cost: number;
	if (item.costingMode === "inventory") {
		cost = num(inv?.weightedAvgCost);
		if (cost <= 0) return null;
	} else cost = num(item.unitCost);
	const price = num(item.unitPrice);
	const percent = price > 0 ? ((price - cost) / price) * 100 : null;
	const target = item.targetMarginPercent != null && item.targetMarginPercent !== "" ? num(item.targetMarginPercent) : null;
	const health = percent == null ? "unknown" : percent < 0 ? "loss" : target != null && percent < target ? "below" : "healthy";
	return { percent, cost, health };
}
const fmtQty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** Items catalogue: name, unit price, profit (margin vs cost), inventory, tax and discount. */
export function ItemsListTable({ items, inventoryByItem = {}, realizedByItem = {}, selectedItems = [], onToggle, onToggleAll, className, ...props }: DivProps<{ items: CatalogItem[]; inventoryByItem?: Record<string, ItemInventoryInfo>; realizedByItem?: Record<string, ItemRealized>; selectedItems?: string[]; onToggle?: (id: string) => void; onToggleAll?: (all: boolean) => void }>) {
	const sel = new Set(selectedItems);
	const all = items.length > 0 && items.every((i) => sel.has(i.id));
	const columns: DataColumn<CatalogItem>[] = [
		{
			key: "name",
			header: "Name",
			mobile: "title",
			cell: (item) => (
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-medium text-foreground">{item.name || "Untitled"}</span>
						{item.isArchived && <MutedBadge>Archived</MutedBadge>}
					</div>
					{item.description && <div className="line-clamp-1 text-2xs font-normal text-tertiary-foreground">{item.description}</div>}
				</div>
			),
		},
		{ key: "price", header: "Unit price", align: "right", mobile: "value", cell: (item) => <span className="font-medium">{num(item.unitPrice).toFixed(2)}</span> },
		{
			key: "profit",
			header: "Profit",
			cell: (item) => {
				const m = itemMargin(item, inventoryByItem[item.id]);
				if (!m) return <span className="text-tertiary-foreground">—</span>;
				const realized = realizedByItem[item.id];
				return (
					<div className="flex flex-col leading-tight">
						<span className={cn("inline-flex items-center gap-1 text-xs font-medium tabular-nums text-foreground", negativeClass(m.health === "loss" || m.health === "below"))}>
							{(m.health === "loss" || m.health === "below") && <StatusChipIcon tone="red" glyph="alert" className="size-3" />}
							{m.percent != null ? `${m.percent.toFixed(1)}%` : "—"}
							{m.health === "loss" && <span className="sr-only">, selling at a loss</span>}
							{m.health === "below" && <span className="sr-only">, below target margin</span>}
						</span>
						{realized && realized.marginPercent != null ? (
							<span className={cn("text-2xs tabular-nums text-tertiary-foreground", negativeClass(realized.belowCostLineCount > 0))}>
								Est. {realized.marginPercent.toFixed(1)}% on sales{realized.belowCostLineCount > 0 && " · below cost"}
							</span>
						) : (
							<span className="text-2xs tabular-nums text-tertiary-foreground">Cost {m.cost.toFixed(2)}</span>
						)}
					</div>
				);
			},
		},
		{
			key: "inventory",
			header: "Inventory",
			cell: (item) => {
				const tracked = item.trackInventory === true;
				const onHand = num(inventoryByItem[item.id]?.onHandQuantity);
				const rp = num(item.reorderPoint);
				const low = tracked && rp > 0 && onHand <= rp;
				return (
					<div className="flex flex-col leading-tight">
						<span className={cn("text-xs font-medium tabular-nums", tracked ? "text-foreground" : "text-tertiary-foreground")}>{tracked ? `${fmtQty(onHand)} ${item.unitOfMeasure || "unit"}` : "Service"}</span>
						{tracked && (
							<span className="inline-flex items-center gap-1 text-2xs tabular-nums text-tertiary-foreground">
								{low && <StatusChipIcon tone="amber" glyph="alert" className="size-3" />}
								{low ? "At reorder point" : rp > 0 ? `Reorder ${fmtQty(rp)}` : "Tracked stock"}
							</span>
						)}
					</div>
				);
			},
		},
		{ key: "tax", header: "Tax rate", align: "right", cell: (item) => <span className="text-tertiary-foreground">{num(item.taxRate).toFixed(2)}%</span> },
		{ key: "disc", header: "Discount", align: "right", cell: (item) => <span className="text-tertiary-foreground">{num(item.discountRate).toFixed(2)}%</span> },
	];
	if (items.length === 0) {
		return (
			<div className={cn("min-w-0", className)} {...props}>
				<OpsEmpty icon={<PackageIcon size={20} weight="fill" aria-hidden="true" />} title="Invoice faster with saved items" description="Save the products and services you sell with their price and tax. Pick them when you write an invoice or quote instead of typing them again." />
			</div>
		);
	}
	return (
		<div className={cn("min-w-0", className)} {...props}>
			<DataList
				columns={columns}
				rows={items}
				getKey={(i) => i.id}
				caption="Items"
				stackBelow="2xl"
				isRowSelected={(i) => sel.has(i.id)}
				leadingHeader={<Checkbox aria-label="Select all items" checked={all} onCheckedChange={(c) => onToggleAll?.(!!c)} />}
				leading={(item) => <Checkbox aria-label={`Select ${item.name}`} checked={sel.has(item.id)} onCheckedChange={() => onToggle?.(item.id)} />}
			/>
		</div>
	);
}

/** Items page KPI row: margin, average revenue per item, top earner, most sold (trailing window). */
export function ItemStatsRow({ stats, realizedMargins, currency = "MYR", windowDays = 30, className, ...props }: DivProps<{ stats: { avgProfitMargin: number | null; avgRevenuePerItem: number | null; highestEarningItem: { name: string; revenue: number } | null; mostSoldItem: { name: string; quantity: number } | null }; realizedMargins?: { marginPercent: number | null; lineCount: number; belowCostItemCount: number }; currency?: string; windowDays?: number }>) {
	const win = `Last ${windowDays} days`;
	const r = realizedMargins;
	const useRealized = r && r.lineCount > 0 && r.marginPercent != null;
	return (
		<StatGrid min="md" aria-label="Item statistics" className={className} {...props}>
			{useRealized ? (
				<StatTile
					className="shadow-sm"
					label="Estimated margin on sales"
					value={`${r!.marginPercent!.toFixed(2)}%`}
					dot={DOT.success}
					sub={r!.belowCostItemCount > 0 ? <StatusChip tone="red" glyph="alert" className="whitespace-normal">{`${win} · ${r!.belowCostItemCount} below cost`}</StatusChip> : win}
				/>
			) : (
				<StatTile className="shadow-sm" label="Avg. profit margin" value={stats.avgProfitMargin != null ? `${stats.avgProfitMargin.toFixed(2)}%` : "—"} dot={DOT.success} sub={stats.avgProfitMargin == null ? "add costs to items" : win} />
			)}
			<StatTile className="shadow-sm" label="Avg. revenue per item" value={stats.avgRevenuePerItem != null ? formatCurrency(stats.avgRevenuePerItem, currency) : "N/A"} />
			<StatTile className="shadow-sm" label="Highest earning item" value={stats.highestEarningItem?.name ?? "N/A"} dot={DOT.warning} sub={win} />
			<StatTile className="shadow-sm" label="Most sold item" value={stats.mostSoldItem?.name ?? "N/A"} dot={DOT.violet} sub={win} />
		</StatGrid>
	);
}

/* =============================================================== INVENTORY */

/** Stock lifecycle: items → PO/GRN → bill → delivery order → GL reconcile. */
export function InventoryFlowPanel({ trackedItems, isReconciled, className, ...props }: Omit<React.ComponentProps<"section">, "children"> & { trackedItems: number; isReconciled: boolean }) {
	const steps = [
		{ label: "Set up items", detail: `${trackedItems} tracked SKU${trackedItems === 1 ? "" : "s"}`, icon: PackageIcon, badge: "Stock tracked" },
		{ label: "Order and receive", detail: "Accepted GRNs receive stock", icon: ShoppingCartIcon, badge: "Inventory in" },
		{ label: "Record bill", detail: "Linked bills clear received-not-billed", icon: ReceiptIcon, badge: "GRNI clears" },
		{ label: "Dispatch goods", detail: "Delivery orders move stock out", icon: TruckIcon, badge: "COGS posts" },
		{ label: "Reconcile", detail: isReconciled ? "Subledger matches GL" : "Inventory and GL need review", icon: ScalesIcon, badge: isReconciled ? "Balanced" : "Mismatch" },
	];
	return (
		<section className={cn("@container min-w-0 rounded-xl border bg-card p-4 shadow-sm", className)} {...props}>
			<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
				<div className="min-w-0 flex-1 basis-64">
					<h2 className="text-md font-semibold text-foreground">Stock lifecycle</h2>
					<p className="mt-1 max-w-xl text-sm font-normal text-tertiary-foreground">
						Normal purchasing flows through purchase orders and goods receiving. Sales stock leaves through delivery orders, so invoices stay focused on revenue.
					</p>
				</div>
				{isReconciled ? <StatusChip tone="green" glyph="check" className="shrink-0">GL reconciled</StatusChip> : <StatusChip tone="amber" glyph="alert" className="shrink-0">Review GL</StatusChip>}
			</div>
			<ol className="mt-4 grid gap-2 @md:grid-cols-2 @xl:grid-cols-3 @[40rem]:grid-cols-5">
				{steps.map((s, i) => {
					const Icon = s.icon;
					return (
						<li key={s.label} className="group flex min-w-0 flex-col rounded-lg border bg-background p-3 transition-colors hover:border-primary/40">
							<div className="flex items-start justify-between gap-2">
								<span className="rounded-md bg-muted p-1.5 text-tertiary-foreground group-hover:text-foreground"><Icon size={16} weight="duotone" aria-hidden="true" /></span>
								<span className="text-2xs font-medium tabular-nums text-subtle">{String(i + 1).padStart(2, "0")}</span>
							</div>
							<div className="mt-2.5 text-sm font-medium text-foreground">{s.label}</div>
							<p className="mt-0.5 min-h-8 text-2xs text-tertiary-foreground">{s.detail}</p>
							<div className="mt-2.5">{s.badge === "Mismatch" ? <StatusChip tone="amber" glyph="alert">{s.badge}</StatusChip> : <MutedBadge>{s.badge}</MutedBadge>}</div>
						</li>
					);
				})}
			</ol>
		</section>
	);
}

export interface StockBalanceRow { itemId: string; itemName: string; locationName: string; quantity: Num; unitOfMeasure?: string | null; weightedAvgCost: Num; value: Num; reorderPoint?: Num }

function BalanceStatus({ row }: { row: StockBalanceRow }) {
	const q = num(row.quantity);
	const rp = num(row.reorderPoint);
	if (q < 0) return <StatusChip tone="red" glyph="x">Negative</StatusChip>;
	if (rp > 0 && q <= rp) return <StatusChip tone="amber" glyph="alert">Low</StatusChip>;
	return <StatusChip tone="neutral" glyph="check">Healthy</StatusChip>;
}

/** Stock balances (on hand, WAC, value, status) with the GL reconciliation strip under them. */
export function StockBalancesReport({ balances, reconciliation, period, className, ...props }: Omit<React.ComponentProps<"section">, "children"> & { balances: StockBalanceRow[]; reconciliation: { glBalance: Num; subledgerBalance: Num; difference: Num; isReconciled: boolean }; period?: string }) {
	const r = reconciliation;
	const columns: DataColumn<StockBalanceRow>[] = [
		{ key: "item", header: "Item", mobile: "title", cell: (b) => <span className="font-medium">{b.itemName}</span> },
		{ key: "loc", header: "Location", cell: (b) => <span className="text-muted-foreground">{b.locationName}</span> },
		{ key: "onhand", header: "On hand", align: "right", cell: (b) => <span className="text-muted-foreground">{qty4(b.quantity)} <span className="text-tertiary-foreground">{b.unitOfMeasure ?? "unit"}</span></span> },
		{ key: "wac", header: "WAC", align: "right", cell: (b) => <span className="text-muted-foreground">{qty4(b.weightedAvgCost)}</span> },
		{ key: "value", header: "Value", align: "right", mobile: "value", cell: (b) => formatCurrency(num(b.value)) },
		{ key: "status", header: "Status", mobile: "badge", className: "w-28", cell: (b) => <BalanceStatus row={b} /> },
	];
	return (
		<section className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			<ActionBar className="justify-between">
				<h2 className="text-md font-semibold text-foreground">Stock balances</h2>
				{period && <span className="text-2xs text-tertiary-foreground">{period}</span>}
			</ActionBar>
			{balances.length === 0 ? (
				<OpsEmpty title="Stock on hand shows here once you receive a stock-tracked item." />
			) : (
				<DataList columns={columns} rows={balances} getKey={(b) => b.itemId + b.locationName} caption="Stock balances" dense />
			)}
			<div className="flex flex-col gap-2 rounded-xl border bg-card px-3.5 py-2.5 shadow-sm">
				<ActionBar className="justify-between">
					<div className="flex items-center gap-1.5 text-sm font-medium text-foreground"><ScalesIcon size={14} className="text-tertiary-foreground" aria-hidden="true" />GL reconciliation</div>
					{r.isReconciled ? <StatusChip tone="green" glyph="check">Reconciled</StatusChip> : <StatusChip tone="red" glyph="x">Mismatch</StatusChip>}
				</ActionBar>
				<ActionBar className="gap-x-6 gap-y-1">
					{([["GL inventory", r.glBalance], ["Stock ledger", r.subledgerBalance], ["Difference", r.difference]] as [string, Num][]).map(([l, v]) => (
						<div key={l} className="flex items-baseline gap-1.5 text-sm">
							<span className="text-tertiary-foreground">{l}</span>
							<span className={cn("tabular-nums text-foreground", l === "Difference" && negativeClass(num(v) !== 0))}>{formatCurrency(num(v))}</span>
						</div>
					))}
				</ActionBar>
			</div>
		</section>
	);
}

/* ========================================================= PURCHASE ORDERS */

/** PO list KPI row: total POs, drafts, approved total. */
export function PurchaseOrderStats({ stats, currency = "MYR", className, ...props }: DivProps<{ stats: { status: string; count: number; total: Num }[]; currency?: string }>) {
	const total = stats.reduce((s, x) => s + x.count, 0);
	const drafts = stats.find((s) => s.status === "draft")?.count ?? 0;
	const approved = num(stats.find((s) => s.status === "approved")?.total);
	return (
		<StatGrid min="sm" aria-label="Purchase order statistics" className={className} {...props}>
			<StatTile className="shadow-sm" label="Total POs" value={String(total)} />
			<StatTile className="shadow-sm" label="Drafts" value={String(drafts)} dot={DOT.warning} />
			<StatTile className="shadow-sm" label="Approved total" value={formatCurrency(approved, currency)} dot={DOT.success} />
		</StatGrid>
	);
}

export interface POLine { id: string; description: string; quantity: number; unitPrice: number | null; amount: number | null }
const fmt2 = (n: number | null) => (n != null ? new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : "");

/** Wide: one grid row per line. Narrow: each line becomes a card with labelled fields. */
const PO_GRID = "@xl:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_7.5rem_1.75rem]";

/** PO line items editor (description, qty, unit price, amount auto-calculated) with totals. */
export function PurchaseOrderLines({
	lineItems,
	defaultLineItems = [],
	onChange,
	readOnly = false,
	currency = "MYR",
	taxAmount,
	className,
	...props
}: DivProps<{
	/** Controlled lines. */
	lineItems?: POLine[];
	/** Initial lines for uncontrolled use. */
	defaultLineItems?: POLine[];
	onChange?: (items: POLine[]) => void;
	readOnly?: boolean;
	currency?: string;
	taxAmount?: number;
}>) {
	const [lines = defaultLineItems, set] = useControllableState({ prop: lineItems, defaultProp: defaultLineItems, onChange });
	const update = (i: number, field: keyof POLine, raw: string) => {
		const next = [...lines];
		const it = { ...next[i]! };
		if (field === "description") it.description = raw;
		else if (field === "quantity") it.quantity = parseFloat(raw) || 0;
		else if (field === "unitPrice") it.unitPrice = raw === "" ? null : parseFloat(raw) || 0;
		else if (field === "amount") it.amount = raw === "" ? null : parseFloat(raw) || 0;
		if ((field === "quantity" || field === "unitPrice") && it.unitPrice != null) it.amount = Number(fromSen(roundToSen(mul(fixed(it.quantity), fixed(it.unitPrice)))));
		next[i] = it;
		set(next);
	};
	const subtotal = sumAmounts(lines.map((l) => l.amount));
	const tax = taxAmount ?? 0;
	const input = "min-w-24 text-sm @xl:border-transparent @xl:bg-transparent @xl:shadow-none @xl:hover:border-[var(--color-input)] @xl:focus:border-[var(--color-input)]";
	const fieldLabel = "text-2xs text-tertiary-foreground @xl:sr-only";
	const listRef = React.useRef<HTMLDivElement>(null);
	/** Index of a removed line: its Remove button unmounts, so focus moves to the line that takes its place. */
	const refocus = React.useRef<number | null>(null);
	React.useEffect(() => {
		const i = refocus.current;
		if (i === null) return;
		refocus.current = null;
		// Two Remove buttons per line (narrow / wide); only the displayed one is focusable.
		const items = listRef.current?.querySelectorAll<HTMLElement>('[role="listitem"]');
		const item = items?.[Math.min(i, (items?.length ?? 0) - 1)];
		const target = [...(item?.querySelectorAll<HTMLElement>("[data-line-remove]") ?? [])].find((b) => b.offsetParent !== null);
		(target ?? item?.querySelector<HTMLElement>("input"))?.focus();
	}, [lines]);
	const remove = (i: number) => (
		<RowIconButton
			label={`Remove line ${i + 1}`}
			data-line-remove=""
			onClick={() => {
				refocus.current = i;
				set(lines.filter((_, j) => j !== i));
			}}
		/>
	);
	const line = (i: number) => <span className="sr-only">, line {i + 1}</span>;
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-2", className)} {...props}>
			<div className={surfaces.tray}>
				<div className={cn("hidden gap-2 px-3 py-2 text-xs font-medium text-tertiary-foreground @xl:grid", PO_GRID, readOnly && "@xl:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_7.5rem]")}>
					<span>Description</span>
					<span className="text-right">Qty</span>
					<span className="text-right">Unit price ({currency})</span>
					<span className="text-right">Amount ({currency})</span>
					{!readOnly && <span className="sr-only">Actions</span>}
				</div>
				<div ref={listRef} className={cn(surfaces.surface, "flex flex-col gap-2 p-2 @xl:gap-0 @xl:p-0")} role="list" aria-label="Purchase order lines">
					{lines.map((it, i) => (
						<div
							key={it.id}
							role="listitem"
							className={cn(
								"grid grid-cols-2 items-end gap-2 rounded-lg border border-table-row-divider p-2.5 @sm:grid-cols-3",
								"@xl:items-center @xl:rounded-none @xl:border-0 @xl:border-b @xl:px-3 @xl:py-1.5 @xl:last:border-b-0",
								PO_GRID,
								readOnly && "@xl:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_7.5rem] @xl:py-2",
							)}
						>
							<div className="col-span-full flex items-end gap-2 @xl:col-span-1">
								<label className="flex min-w-0 flex-1 flex-col gap-1">
									<span className={fieldLabel}>Description{line(i)}</span>
									{readOnly ? <span className="text-sm text-foreground">{it.description || "—"}</span> : <Input value={it.description} placeholder="Line item description" onChange={(e) => update(i, "description", e.target.value)} className={input} />}
								</label>
								{!readOnly && <div className="@xl:hidden">{remove(i)}</div>}
							</div>
							<label className="flex min-w-0 flex-col gap-1">
								<span className={fieldLabel}>Qty{line(i)}</span>
								{readOnly ? <span className="text-sm tabular-nums text-muted-foreground @xl:text-right">{it.quantity}</span> : <Input type="number" min={0} step="any" value={it.quantity} onChange={(e) => update(i, "quantity", e.target.value)} className={cn(input, "text-right tabular-nums")} />}
							</label>
							<label className="flex min-w-0 flex-col gap-1">
								<span className={fieldLabel}>Unit price ({currency}){line(i)}</span>
								{readOnly ? <span className="text-sm tabular-nums text-muted-foreground @xl:text-right">{fmt2(it.unitPrice)}</span> : <Input type="number" min={0} step="any" placeholder="0.00" value={it.unitPrice ?? ""} onChange={(e) => update(i, "unitPrice", e.target.value)} className={cn(input, "text-right tabular-nums")} />}
							</label>
							<label className="flex min-w-0 flex-col gap-1">
								<span className={fieldLabel}>Amount ({currency}){line(i)}</span>
								{readOnly ? <span className="text-sm font-medium tabular-nums text-foreground @xl:text-right">{fmt2(it.amount)}</span> : <Input type="number" min={0} step="any" placeholder="0.00" value={it.amount ?? ""} onChange={(e) => update(i, "amount", e.target.value)} className={cn(input, "text-right tabular-nums text-foreground")} />}
							</label>
							{!readOnly && <div className="hidden justify-end @xl:flex">{remove(i)}</div>}
						</div>
					))}
				</div>
			</div>
			<div className="flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
				{!readOnly ? (
					<Button variant="dotted" onClick={() => set([...lines, { id: `new-${lines.length + 1}-${Date.now()}`, description: "", quantity: 1, unitPrice: null, amount: null }])}>
						<PlusIcon size={14} aria-hidden="true" />
						Add line item
					</Button>
				) : <span />}
				<KeyValueList
					className="w-full @md:w-64"
					items={[
						{ label: "Subtotal", value: formatCurrency(subtotal, currency) },
						{ label: "Tax (SST)", value: formatCurrency(tax, currency) },
						{ label: "Total", value: formatCurrency(sumAmounts([subtotal, tax]), currency), strong: true },
					]}
				/>
			</div>
		</div>
	);
}

const BILL_STATUS: Record<string, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral" },
	in_review: { label: "In review", variant: "info" },
	pending_approval: { label: "Pending approval", variant: "warning" },
	approved: { label: "Approved", variant: "info", glyph: "check" },
	awaiting_payment: { label: "Awaiting payment", variant: "warning", glyph: "clock" },
	paid: { label: "Paid", variant: "success" },
	rejected: { label: "Rejected", variant: "error" },
	void: { label: "Void", variant: "neutral", strike: true },
};

/** Bills linked to a purchase order: number, issue date, amount, status. */
export function PurchaseOrderLinkedBills({ bills, currency = "MYR", onOpen, className, ...props }: DivProps<{ bills: { id: string; billNumber: string | null; status: string | null; totalAmount: Num; currency?: string | null; issueDate: string | null }[]; currency?: string; onOpen?: (id: string) => void }>) {
	if (bills.length === 0) return <div className={cn("min-w-0", className)} {...props}><OpsEmpty title="No bills linked to this purchase order" /></div>;
	return (
		<div className={cn("flex min-w-0 flex-col gap-0.5", className)} role="list" {...props}>
			{bills.map((b) => {
				const number = b.billNumber || b.id.slice(0, 12);
				return (
					<div key={b.id} role="listitem" className="flex min-w-0 flex-col">
						<button
							type="button"
							onClick={() => onOpen?.(b.id)}
							className="flex cursor-pointer flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg px-2 py-1.5 text-left outline-none hover:bg-table-row-hover focus-ring"
						>
							<span className="sr-only">Open bill </span>
							<span className="flex min-w-0 items-baseline gap-2">
								<span className="font-mono text-2xs font-medium text-primary">{number}</span>
								{b.issueDate && <span className="text-2xs text-tertiary-foreground">{formatDate(b.issueDate)}</span>}
							</span>
							<span className="ml-auto flex shrink-0 items-center gap-2">
								<span className="text-sm font-medium tabular-nums text-foreground">{b.totalAmount == null || b.totalAmount === "" ? "—" : formatCurrency(num(b.totalAmount), b.currency ?? currency)}</span>
								<DocStatus status={b.status ?? "draft"} config={BILL_STATUS} />
							</span>
						</button>
					</div>
				);
			})}
		</div>
	);
}

/* ================================================================= PAYROLL */

export interface PayslipData {
	id: string; employeeName: string; reference: string;
	gross: number; statutoryDeductions: number; otherDeductions: number; net: number; employerCost: number;
	paymentStatus: "unpaid" | "paid"; paymentReference: string | null;
	lines: { kind: string; code: string; label: string; amount: number }[];
	contributions: { code: string; label: string; employeeAmount: number; employerAmount: number; verified: boolean }[];
}

function PaymentChip({ status }: { status: "unpaid" | "paid" }) {
	return status === "paid" ? <StatusChip tone="green" glyph="check">Paid</StatusChip> : <StatusChip tone="neutral" glyph="clock">Unpaid</StatusChip>;
}

/** One payslip: gross → statutory (EPF/SOCSO/EIS/PCB) → net, pay lines, employee/employer contributions and payment. Amounts in sen. */
export function PayslipSummary({ payslip, month, canMarkPaid = false, onMarkPaid, className, ...props }: Omit<React.ComponentProps<"section">, "title" | "children"> & { payslip: PayslipData; month?: string; canMarkPaid?: boolean; onMarkPaid?: (reference: string) => void }) {
	const p = payslip;
	const [ref, setRef] = React.useState("");
	const employeeTotal = p.contributions.reduce((s, c) => s + c.employeeAmount, 0);
	const employerTotal = p.contributions.reduce((s, c) => s + c.employerAmount, 0);
	return (
		<SectionPanel
			title={<span className="text-lg">{p.employeeName}</span>}
			description={<><span className="font-mono font-medium">{p.reference}</span>{month && <> · {month}</>} · net {sen(p.net)}</>}
			actions={<PaymentChip status={p.paymentStatus} />}
			className={cn("shadow-sm", className)}
			{...props}
		>
			<div className="flex flex-col gap-4">
				<StatGrid min="sm">
					<StatTile label="Gross" value={sen(p.gross)} />
					<StatTile label="Statutory" value={sen(p.statutoryDeductions)} dot={DOT.error} />
					<StatTile label="Net pay" value={sen(p.net)} dot={DOT.success} />
					<StatTile label="Employer cost" value={sen(p.employerCost)} dot={DOT.violet} />
				</StatGrid>
				<div className="grid gap-4 @2xl:grid-cols-2">
					<section className="flex min-w-0 flex-col gap-1">
						<SectionLabel className="text-2xs">Pay lines</SectionLabel>
						<ul className="flex flex-col">
							{p.lines.map((l) => (
								<li key={`${l.kind}-${l.code}`} className="flex items-baseline justify-between gap-3 border-b border-table-row-divider py-1.5 text-sm last:border-b-0">
									<span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-muted-foreground">
										<span>{l.label}</span>
										{l.code.toUpperCase() !== l.label.toUpperCase() && <span className="font-mono text-2xs font-medium text-subtle">{l.code}</span>}
									</span>
									<span className={cn("shrink-0 tabular-nums", l.amount < 0 ? "text-muted-foreground" : "text-foreground")}>
										{l.amount < 0 && <span className="sr-only">minus </span>}
										{l.amount < 0 ? `(${sen(-l.amount)})` : sen(l.amount)}
									</span>
								</li>
							))}
							<li className="flex items-baseline justify-between gap-3 border-t border-border pt-2 text-sm font-semibold text-foreground">
								<span>Net pay</span>
								<span className="tabular-nums">{sen(p.net)}</span>
							</li>
						</ul>
					</section>
					<section className="flex min-w-0 flex-col gap-1">
						<SectionLabel className="text-2xs">Contributions</SectionLabel>
						<table className="w-full text-sm">
							<thead>
								<tr className="text-2xs text-tertiary-foreground">
									<th scope="col" className="py-1 text-left font-normal">Scheme</th>
									<th scope="col" className="py-1 pl-2 text-right font-normal">Employee</th>
									<th scope="col" className="py-1 pl-2 text-right font-normal">Employer</th>
								</tr>
							</thead>
							<tbody>
								{p.contributions.map((c) => (
									<tr key={c.code} className="border-b border-table-row-divider">
										<th scope="row" className="py-1.5 text-left font-normal text-muted-foreground">
											<span className="inline-flex flex-wrap items-center gap-1.5">{c.label}{!c.verified && <StatusChip tone="amber" glyph="alert">Unverified</StatusChip>}</span>
										</th>
										<td className="whitespace-nowrap py-1.5 pl-2 text-right tabular-nums text-foreground">{sen(c.employeeAmount)}</td>
										<td className="whitespace-nowrap py-1.5 pl-2 text-right tabular-nums text-foreground">{sen(c.employerAmount)}</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr className="font-semibold text-foreground">
									<th scope="row" className="pt-2 text-left">Total</th>
									<td className="whitespace-nowrap pt-2 pl-2 text-right tabular-nums">{sen(employeeTotal)}</td>
									<td className="whitespace-nowrap pt-2 pl-2 text-right tabular-nums">{sen(employerTotal)}</td>
								</tr>
							</tfoot>
						</table>
					</section>
				</div>
				{p.paymentStatus === "paid" ? (
					<p className="text-sm font-normal text-tertiary-foreground">Paid{p.paymentReference ? `, reference ${p.paymentReference}` : ""}.</p>
				) : canMarkPaid && p.net > 0 ? (
					<ActionBar className="items-end border-t border-table-row-divider pt-3">
						<label className="flex min-w-48 flex-1 flex-col gap-1">
							<span className="text-2xs text-tertiary-foreground">Payment reference</span>
							<Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Optional, such as the bank transfer reference" />
						</label>
						<Button variant="primary" onClick={() => onMarkPaid?.(ref)}>Mark paid</Button>
					</ActionBar>
				) : null}
			</div>
		</SectionPanel>
	);
}

/** A run's payslips: employee, gross, statutory, other deductions, net, employer cost, payment. Amounts in sen. */
export function PayslipsRunTable({ payslips, payable = true, onOpen, className, ...props }: DivProps<{ payslips: PayslipData[]; payable?: boolean; onOpen?: (id: string) => void }>) {
	if (payslips.length === 0) return <div className={cn("min-w-0", className)} {...props}><OpsEmpty icon={<ReceiptIcon size={20} aria-hidden="true" />} title="No payslips yet" description="Compute the run to produce them." /></div>;
	const money = (key: string, header: string, f: (s: PayslipData) => number, extra?: Partial<DataColumn<PayslipData>>): DataColumn<PayslipData> => ({
		key, header, align: "right", cell: (s) => <span className={key === "net" ? "font-medium text-foreground" : "text-muted-foreground"}>{amt(f(s) / 100)}</span>, ...extra,
	});
	const columns: DataColumn<PayslipData>[] = [
		{
			key: "emp",
			header: "Employee",
			mobile: "title",
			cell: (s) => (
				// Phrasing content only: with onOpen, this cell renders inside the row's button.
				<span className="block">
					<span className="block font-medium text-foreground">{s.employeeName}</span>
					<span className="block font-mono text-2xs font-medium text-tertiary-foreground">{s.reference}</span>
				</span>
			),
		},
		money("gross", "Gross", (s) => s.gross),
		money("stat", "Statutory", (s) => s.statutoryDeductions),
		money("other", "Other deductions", (s) => s.otherDeductions),
		money("net", "Net", (s) => s.net, { mobile: "value" }),
		money("cost", "Employer cost", (s) => s.employerCost),
		{ key: "pay", header: "Payment", mobile: "badge", cell: (s) => (payable ? <PaymentChip status={s.paymentStatus} /> : <span className="text-tertiary-foreground">—</span>) },
	];
	const sum = (f: (s: PayslipData) => number) => amt(payslips.reduce((a, s) => a + f(s), 0) / 100);
	return (
		<div className={cn("min-w-0", className)} {...props}>
			<DataList
				columns={columns}
				rows={payslips}
				getKey={(s) => s.id}
				caption="Payslips"
				stackBelow="2xl"
				onRowClick={onOpen ? (s) => onOpen(s.id) : undefined}
				footer={
					<TrayTotals
						label={`Total (RM) · ${payslips.length}`}
						items={[
							{ label: "Gross", value: sum((s) => s.gross) },
							{ label: "Statutory", value: sum((s) => s.statutoryDeductions) },
							{ label: "Net", value: sum((s) => s.net) },
							{ label: "Employer", value: sum((s) => s.employerCost) },
						]}
					/>
				}
			/>
		</div>
	);
}

/** "Owed to agencies": employee and employer shares the run remits, by creditor (KWSP, PERKESO, LHDN, HRD Corp). Amounts in sen. */
export function PayrollRemittancesPanel({ remittances, className, ...props }: Omit<React.ComponentProps<"section">, "title" | "children"> & { remittances: { payable: string; label: string; employee: number; employer: number }[] }) {
	if (remittances.length === 0) return null;
	type R = (typeof remittances)[number];
	const t = remittances.reduce((a, r) => ({ e: a.e + r.employee, r: a.r + r.employer }), { e: 0, r: 0 });
	const columns: DataColumn<R>[] = [
		{ key: "c", header: "Creditor", mobile: "title", cell: (r) => <span className="text-muted-foreground">{r.label}</span> },
		{ key: "e", header: "Employee", align: "right", cell: (r) => <span className="text-muted-foreground">{sen(r.employee)}</span> },
		{ key: "r", header: "Employer", align: "right", cell: (r) => <span className="text-muted-foreground">{sen(r.employer)}</span> },
		{ key: "t", header: "Total", align: "right", mobile: "value", cell: (r) => <span className="font-medium">{sen(r.employee + r.employer)}</span> },
	];
	return (
		<SectionPanel title="Owed to agencies" description="Employee and employer shares this run remits, by creditor." className={cn("shadow-sm", className)} {...props}>
			<DataList
				columns={columns}
				rows={remittances}
				getKey={(r) => r.payable}
				caption="Remittances"
				stackBelow="lg"
				dense
				footer={<TrayTotals label="Total" items={[{ label: "Employee", value: sen(t.e) }, { label: "Employer", value: sen(t.r) }, { label: "Total", value: sen(t.e + t.r) }]} />}
			/>
		</SectionPanel>
	);
}

/* ================================================================ EINVOICE */

type EnvName = "sandbox" | "production";
export interface EInvoiceEnvStatus {
	status: "valid" | "invalid" | "submitted" | "pending" | "failed" | "cancelled" | null;
	documentUuid?: string | null; longId?: string | null; validatedAt?: string | null;
	/** The document's public MyInvois validation link; shown as "View on MyInvois" once valid. */
	validationUrl?: string | null;
	rejectionRequestedAt?: string | null; rejectionReason?: string | null;
	validationErrors?: string[]; unconfirmed?: boolean; withinCancelWindow?: boolean;
}
const ENV_LABEL: Record<EnvName, string> = { sandbox: "Sandbox", production: "Production" };

function einvoiceState(s: EInvoiceEnvStatus | undefined): { label: string; tone: StatusTone; glyph: StatusGlyph } | null {
	if (!s || !s.status) return null;
	switch (s.status) {
		case "valid":
			return s.rejectionRequestedAt ? { label: "Buyer requested rejection", tone: "amber", glyph: "alert" } : { label: "E-invoice valid", tone: "green", glyph: "check" };
		case "invalid":
			return { label: "E-invoice rejected", tone: "red", glyph: "x" };
		case "submitted":
			return { label: "E-invoice pending validation", tone: "blue", glyph: "clock" };
		case "pending":
			return { label: "E-invoice submission in progress", tone: "blue", glyph: "spinner" };
		case "failed":
			return s.unconfirmed ? { label: "E-invoice submission unconfirmed", tone: "amber", glyph: "alert" } : { label: "E-invoice submission failed", tone: "red", glyph: "alert" };
		case "cancelled":
			return { label: "E-invoice cancelled", tone: "neutral", glyph: "ban" };
	}
	return null;
}

const linkClass = "rounded-sm text-primary outline-none hover:underline focus-ring";

/** LHDN MyInvois filing for one invoice or note: validation state per environment, the validated stamp, and the submit / cancel actions. */
export function EInvoiceStatusCard({ credentialEnvironments, byEnvironment, documentLabel = "invoice", hasCorrection = true, credentialsHref, correctionHref, onSubmit, onCancel, onCheck, className, ...props }: DivProps<{
	credentialEnvironments: EnvName[];
	byEnvironment: Partial<Record<EnvName, EInvoiceEnvStatus>>;
	documentLabel?: string;
	hasCorrection?: boolean;
	/** Where MyInvois credentials are set up; links the "not configured" message. */
	credentialsHref?: string;
	/** Where to raise the correcting credit note; links the "window has passed" message. */
	correctionHref?: string;
	onSubmit?: (env: EnvName) => void;
	onCancel?: (env: EnvName, reason: string) => void;
	onCheck?: (env: EnvName) => void;
}>) {
	const [env, setEnv] = React.useState<EnvName>(credentialEnvironments[0] ?? "sandbox");
	const [cancelReason, setCancelReason] = React.useState<string | null>(null);
	const [reasonError, setReasonError] = React.useState(false);
	const reasonId = React.useId();
	const reasonRef = React.useRef<HTMLInputElement>(null);
	const cancelRef = React.useRef<HTMLButtonElement>(null);
	/** Opening or leaving the cancel form unmounts the control that was pressed; move focus to its replacement. */
	const focusNext = React.useRef<"reason" | "cancel" | null>(null);
	const cancelling = cancelReason !== null;
	React.useEffect(() => {
		const target = focusNext.current === "reason" ? reasonRef.current : focusNext.current === "cancel" ? cancelRef.current : null;
		focusNext.current = null;
		target?.focus();
	}, [cancelling]);
	const openCancel = (open: boolean) => {
		focusNext.current = open ? "reason" : "cancel";
		setReasonError(false);
		setCancelReason(open ? "" : null);
	};
	const latest = byEnvironment[env];
	const state = einvoiceState(latest);
	const isValid = latest?.status === "valid";
	const canCancel = latest?.withinCancelWindow ?? false;
	const hasCreds = credentialEnvironments.length > 0;
	const errors = latest?.status === "invalid" ? latest.validationErrors ?? [] : [];
	const envSelect = (
		<Select value={env} onValueChange={(v) => { setEnv(v as EnvName); setCancelReason(null); }} items={credentialEnvironments.map((e) => ({ value: e, label: ENV_LABEL[e] }))} disabled={credentialEnvironments.length < 2}>
			<SelectTrigger aria-label="Environment" className="w-36 max-w-full"><SelectValue /></SelectTrigger>
			<SelectContent>{credentialEnvironments.map((e) => <SelectItem key={e} value={e}>{ENV_LABEL[e]}</SelectItem>)}</SelectContent>
		</Select>
	);
	return (
		<div className={cn("@container flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm", className)} {...props}>
			<ActionBar className="justify-between">
				<h3 className="flex items-center gap-1.5 text-md font-semibold text-foreground"><SealCheckIcon size={16} weight="fill" className="text-subtle" aria-hidden="true" />MyInvois e-invoice</h3>
				{env === "sandbox" && hasCreds && <Badge variant="muted" size="sm" className="text-sandbox-text">Sandbox</Badge>}
			</ActionBar>

			{state && (
				<ActionBar>
					<StatusChip tone={state.tone} glyph={state.glyph}>{state.label}</StatusChip>
					{isValid && latest?.validationUrl && (
						<a href={latest.validationUrl} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-1 text-2xs", linkClass)}>
							View on MyInvois
							<ArrowSquareOutIcon size={12} aria-hidden="true" />
							<span className="sr-only">(opens in a new tab)</span>
						</a>
					)}
				</ActionBar>
			)}

			{isValid && latest?.documentUuid && (
				<div className="rounded-lg bg-muted px-3 py-1">
					<KeyValueList
						className="[&>div]:py-1"
						items={[
							{ label: "UUID", value: <span className="font-mono text-2xs font-medium break-all">{latest.documentUuid}</span> },
							...(latest.longId ? [{ label: "Long ID", value: <span className="font-mono text-2xs font-medium break-all">{latest.longId}</span> }] : []),
							...(latest.validatedAt ? [{ label: "Validated", value: new Date(latest.validatedAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur" }) }] : []),
						]}
					/>
				</div>
			)}

			{isValid && latest?.rejectionRequestedAt && (
				<p className="text-sm font-normal text-tertiary-foreground">
					The buyer asked LHDN to reject this e-invoice on {formatDate(latest.rejectionRequestedAt)}
					{latest.rejectionReason ? ` ("${latest.rejectionReason}")` : ""}. Cancel it within the 72-hour window if they are right, or keep it if not.
				</p>
			)}

			{errors.length > 0 && (
				<ul className="flex list-disc flex-col gap-0.5 pl-4 text-sm font-normal text-error-text">
					{errors.map((line, i) => <li key={i}>{line}</li>)}
				</ul>
			)}

			{!hasCreds ? (
				<p className="text-sm font-normal text-tertiary-foreground">
					MyInvois credentials are not configured. Set them up in {credentialsHref ? <a href={credentialsHref} className={linkClass}>E-Invoice Credentials</a> : "E-Invoice Credentials"}.
				</p>
			) : isValid ? (
				<div className="flex flex-col gap-2">
					{envSelect}
					{!canCancel ? (
						<p className="text-2xs text-tertiary-foreground">
							The 72-hour cancellation window has passed. {hasCorrection ? correctionHref ? <a href={correctionHref} className={linkClass}>Correct this {documentLabel} with a credit note</a> : `Correct this ${documentLabel} with a credit note` : "Correct it with a credit or debit note"}.
						</p>
					) : cancelReason === null ? (
						<Button ref={cancelRef} variant="secondary" size="sm" onClick={() => openCancel(true)}>
							Cancel e-invoice
						</Button>
					) : (
						<div className="flex flex-col gap-2">
							<Input
								ref={reasonRef}
								aria-label="Reason for cancelling"
								placeholder="Reason for cancelling (sent to LHDN)"
								maxLength={300}
								value={cancelReason}
								aria-invalid={reasonError || undefined}
								aria-describedby={reasonError ? reasonId : undefined}
								onChange={(e) => {
									setCancelReason(e.target.value);
									if (e.target.value.trim()) setReasonError(false);
								}}
							/>
							{reasonError && (
								<FieldError id={reasonId}>Enter a reason for cancelling.</FieldError>
							)}
							<ActionBar>
								{/* Validated on press, not by disabling: a disabled button gives no reason and cannot be focused. */}
								<Button
									variant="destructive"
									size="sm"
									onClick={() => {
										if (cancelReason.trim() === "") {
											setReasonError(true);
											reasonRef.current?.focus();
											return;
										}
										onCancel?.(env, cancelReason);
									}}
								>
									Confirm cancellation
								</Button>
								<Button variant="secondary" size="sm" onClick={() => openCancel(false)}>
									Keep it
								</Button>
							</ActionBar>
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{latest?.unconfirmed && (
						<p className="text-2xs text-tertiary-foreground">An earlier submission to MyInvois never got an answer, so MyInvois may hold this e-invoice. Check whether it was received before voiding or submitting again.</p>
					)}
					<ActionBar>
						{envSelect}
						{latest?.unconfirmed && <Button variant="secondary" onClick={() => onCheck?.(env)}>Check with MyInvois</Button>}
						<Button variant="primary" isLoading={latest?.status === "pending"} onClick={() => onSubmit?.(env)}>Submit to MyInvois</Button>
					</ActionBar>
				</div>
			)}
		</div>
	);
}
