"use client";

/**
 * Cynco UI — corporate tax: the Form C computation, the CP204 instalment schedule,
 * the adjustments that feed the computation, and the filing stepper. Presentational
 * port of cynco-labs/cynco remix/app/components/tax; primitives and tokens only.
 */
import { PlusIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Button, cn, Progress, StatusChip, type StatusGlyph, type StatusTone } from "../../base";
import { parseDate } from "../../base/lib/utils";
import { negateAmount, sumAmounts, toSen } from "../../lib/money";
import {
	ActionBar,
	type DataColumn,
	DataList,
	DocStatus,
	formatDate,
	ReportAmount,
	ScrollRow,
	SectionPanel,
	type StatusEntry,
} from "../../lib/shared";
import { amt, type DivProps, type Num, percentOf, RowIconButton, TrayTotals } from "./shared";

/** tax/ReturnRow: label + report figure; bold subtotals, highlighted totals. */
function TaxReturnLine({
	label,
	amount,
	bold,
	highlight,
}: {
	label: string;
	amount: Num;
	bold?: boolean;
	highlight?: boolean;
}) {
	const tone = bold ? "font-semibold text-foreground" : "text-muted-foreground";
	return (
		<div
			className={cn("flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-1 text-sm", highlight && "bg-muted")}
		>
			<span className={cn("min-w-0", tone)}>{label}</span>
			<ReportAmount
				amount={amount ?? 0}
				className={cn("shrink-0", bold && "font-semibold", toSen(amount) >= 0n && tone)}
			/>
		</div>
	);
}
function TaxRule() {
	return <div className="mx-2.5 my-1.5 border-t border-table-row-divider" />;
}

export interface TaxComputationData {
	accountingProfit: Num;
	addBacks: Num;
	deductions: Num;
	adjustedIncome: Num;
	capitalAllowances: Num;
	balancingCharges: Num;
	balancingAllowances: Num;
	statutoryBusinessIncome: Num;
	otherStatutoryIncome: Num;
	aggregateIncome: Num;
	currentYearLosses: Num;
	broughtForwardLosses: Num;
	totalIncome: Num;
	approvedDonations: Num;
	chargeableIncome: Num;
	isSME: boolean | null;
	taxOnFirst150k: Num;
	taxOn150kTo600k: Num;
	taxAbove600k: Num;
	totalTaxCharged: Num;
	taxRebates: Num;
	section110Credit: Num;
	bilateralCredit: Num;
	cp204Paid: Num;
	balancePayable: Num;
}

/** Form C: chargeable income build-up and the tax computation beside it (stacked when narrow). */
export function TaxComputationSummary({
	data,
	rateExplanation,
	className,
	...props
}: DivProps<{ data: TaxComputationData; rateExplanation?: string }>) {
	const d = data;
	return (
		<div className={cn("@container min-w-0", className)} {...props}>
			<div className="grid gap-3 @2xl:grid-cols-2">
				<SectionPanel title="Chargeable income" className="shadow-sm [&>div]:px-1.5 [&>div]:pt-2">
					<TaxReturnLine label="Accounting profit" amount={d.accountingProfit} />
					<TaxReturnLine label="Add-backs" amount={d.addBacks} />
					<TaxReturnLine label="Deductions" amount={negateAmount(d.deductions)} />
					<TaxReturnLine label="Adjusted income" amount={d.adjustedIncome} bold />
					<TaxRule />
					<TaxReturnLine label="Capital allowances" amount={negateAmount(d.capitalAllowances)} />
					<TaxReturnLine label="Balancing charges" amount={d.balancingCharges} />
					<TaxReturnLine label="Balancing allowances" amount={negateAmount(d.balancingAllowances)} />
					<TaxReturnLine label="Statutory business income" amount={d.statutoryBusinessIncome} bold />
					<TaxRule />
					<TaxReturnLine label="Other statutory income" amount={d.otherStatutoryIncome} />
					<TaxReturnLine label="Aggregate income" amount={d.aggregateIncome} />
					<TaxReturnLine label="Current year losses" amount={negateAmount(d.currentYearLosses)} />
					<TaxReturnLine label="Brought forward losses" amount={negateAmount(d.broughtForwardLosses)} />
					<TaxReturnLine label="Total income" amount={d.totalIncome} />
					<TaxReturnLine label="Approved donations" amount={negateAmount(d.approvedDonations)} />
					<TaxReturnLine label="Chargeable income" amount={d.chargeableIncome} bold highlight />
				</SectionPanel>
				<SectionPanel
					title="Tax computation"
					description={
						<span className="mt-1 flex flex-col items-start gap-1.5">
							{d.isSME ? (
								<StatusChip tone="blue" glyph="check">
									SME Rates
								</StatusChip>
							) : (
								<StatusChip tone="neutral" glyph="minus">
									Standard 24%
								</StatusChip>
							)}
							{!d.isSME && rateExplanation && <span>{rateExplanation}</span>}
						</span>
					}
					className="self-start shadow-sm [&>div]:px-1.5 [&>div]:pt-2"
				>
					{d.isSME && (
						<>
							<TaxReturnLine label="Tax on first RM150k (15%)" amount={d.taxOnFirst150k} />
							<TaxReturnLine label="Tax on RM150k-600k (17%)" amount={d.taxOn150kTo600k} />
							<TaxReturnLine label="Tax above RM600k (24%)" amount={d.taxAbove600k} />
						</>
					)}
					<TaxReturnLine label="Total tax charged" amount={d.totalTaxCharged} bold />
					<TaxRule />
					<TaxReturnLine label="Tax rebates" amount={negateAmount(d.taxRebates)} />
					<TaxReturnLine label="Section 110 credit" amount={negateAmount(d.section110Credit)} />
					<TaxReturnLine label="Bilateral credit" amount={negateAmount(d.bilateralCredit)} />
					<TaxReturnLine label="CP204 paid" amount={negateAmount(d.cp204Paid)} />
					<TaxRule />
					<TaxReturnLine label="Balance payable / (refundable)" amount={d.balancePayable} bold highlight />
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

export interface CP204Installment {
	id: string;
	installmentNumber: number | null;
	dueDate: string | null;
	amount: Num;
	paidAmount: Num;
	status: string | null;
}

/** CP204 monthly instalment table with Mark paid on pending rows. */
export function TaxInstallmentSchedule({
	installments,
	totalDue,
	totalPaid,
	isSubmitting = false,
	onMarkPaid,
	description = "12 monthly installments, due 15th of each month",
	className,
	...props
}: DivProps<{
	installments: CP204Installment[];
	totalDue: Num;
	totalPaid: Num;
	isSubmitting?: boolean;
	onMarkPaid?: (id: string) => void;
	description?: React.ReactNode;
}>) {
	const pct = Math.min(100, percentOf(totalPaid, totalDue) ?? 0);
	const columns: DataColumn<CP204Installment>[] = [
		{
			key: "n",
			header: "#",
			className: "w-12",
			mobile: "hidden",
			cell: (i) => (
				<span className="font-mono text-2xs font-medium text-tertiary-foreground">{i.installmentNumber ?? "—"}</span>
			),
		},
		{
			key: "due",
			header: "Due date",
			mobile: "title",
			cell: (i) => <span className="text-muted-foreground">{i.dueDate ? formatDate(i.dueDate) : "—"}</span>,
		},
		{
			key: "amount",
			header: "Amount (RM)",
			align: "right",
			mobile: "value",
			cell: (i) => <ReportAmount amount={i.amount ?? 0} />,
		},
		{
			key: "paid",
			header: "Paid (RM)",
			align: "right",
			cell: (i) =>
				i.paidAmount ? (
					<ReportAmount amount={i.paidAmount ?? 0} className="text-muted-foreground" />
				) : (
					<span className="text-tertiary-foreground">—</span>
				),
		},
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			cell: (i) => <DocStatus status={i.status ?? "pending"} config={CP204_STATUS} />,
		},
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
							<Button
								variant="skeleton"
								size="sm"
								disabled={isSubmitting}
								focusableWhenDisabled
								onClick={() => onMarkPaid?.(i.id)}
								className="whitespace-nowrap"
							>
								Mark paid
								<span className="sr-only">{`, installment${i.installmentNumber != null ? ` ${i.installmentNumber}` : ""}${i.dueDate ? ` due ${formatDate(i.dueDate)}` : ""}`}</span>
							</Button>
						) : null
					}
					footer={
						<TrayTotals
							label="Total"
							items={[
								{ label: "Due", value: amt(totalDue) },
								{ label: "Paid", value: amt(totalPaid) },
							]}
						/>
					}
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

export interface TaxAdjustment {
	id: string;
	category: string;
	itemCode: string;
	description: string;
	amount: Num;
	source: string;
	accountCode: string | null;
}

/** Add-backs / deductions / reliefs for a tax computation, with source chips. */
export function TaxAdjustmentsTable({
	title,
	adjustments,
	category,
	readOnly = false,
	isSubmitting = false,
	onAdd,
	onDelete,
	className,
	...props
}: DivProps<{
	title: string;
	adjustments: TaxAdjustment[];
	category: "add_back" | "deduction" | "relief";
	readOnly?: boolean;
	isSubmitting?: boolean;
	onAdd?: () => void;
	onDelete?: (id: string) => void;
}>) {
	const rows = adjustments.filter((a) => a.category === category);
	const total = sumAmounts(rows.map((a) => a.amount));
	const noun = category === "add_back" ? "add-backs" : category === "deduction" ? "deductions" : "reliefs";
	const columns: DataColumn<TaxAdjustment>[] = [
		{
			key: "code",
			header: "Code",
			className: "w-24",
			cell: (a) => <span className="font-mono text-2xs font-medium text-muted-foreground">{a.itemCode}</span>,
		},
		{
			key: "desc",
			header: "Description",
			mobile: "title",
			cell: (a) => (
				<span className="text-muted-foreground">
					{a.description || "—"}
					{a.accountCode && (
						<span className="ml-1.5 font-mono text-2xs font-medium text-tertiary-foreground">({a.accountCode})</span>
					)}
				</span>
			),
		},
		{
			key: "source",
			header: "Source",
			mobile: "badge",
			cell: (a) => {
				const src = ADJ_SOURCE[a.source] ?? {
					label: a.source,
					tone: "neutral" as StatusTone,
					glyph: "minus" as StatusGlyph,
				};
				return (
					<StatusChip tone={src.tone} glyph={src.glyph}>
						{src.label}
					</StatusChip>
				);
			},
		},
		{
			key: "amount",
			header: "Amount (RM)",
			align: "right",
			mobile: "value",
			cell: (a) => <ReportAmount amount={a.amount ?? 0} />,
		},
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
					trailing={
						readOnly
							? undefined
							: (a) => (
									<RowIconButton label={`Delete ${a.itemCode}`} disabled={isSubmitting} onClick={() => onDelete?.(a.id)} />
								)
					}
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
export function TaxFilingWorkflow({
	status,
	readOnly = false,
	isSubmitting = false,
	filingReference,
	reviewedAt,
	filedAt,
	onReview,
	onFile,
	className,
	...props
}: DivProps<{
	status: string;
	readOnly?: boolean;
	isSubmitting?: boolean;
	filingReference?: string | null;
	reviewedAt?: string | null;
	filedAt?: string | null;
	onReview?: () => void;
	onFile?: () => void;
}>) {
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
						const label = TAX_RETURN_STATUS[step]?.label ?? step;
						return (
							// biome-ignore lint/a11y/useSemanticElements: the steps sit in a ScrollRow, which renders a div; role=listitem is the ARIA equivalent
							<div key={step} role="listitem" className="flex shrink-0 items-center gap-2">
								{i > 0 && (
									<span aria-hidden="true" className={cn("h-px w-6", complete || current ? "bg-primary" : "bg-border")} />
								)}
								{complete ? (
									<StatusChip tone="green" glyph="check">
										{label}
									</StatusChip>
								) : current ? (
									<StatusChip
										tone="neutral"
										glyph="dashed"
										aria-current="step"
										className="border-primary/40 bg-active-primary dark:border-primary/40 dark:bg-active-primary"
									>
										{label}
									</StatusChip>
								) : (
									<span className="px-1.5 text-2xs text-tertiary-foreground">{label}</span>
								)}
								<span className="sr-only">{complete ? ", done" : current ? ", current step" : ", not started"}</span>
							</div>
						);
					})}
					{amended && (
						// biome-ignore lint/a11y/useSemanticElements: the steps sit in a ScrollRow, which renders a div; role=listitem is the ARIA equivalent
						<div role="listitem" className="flex shrink-0 items-center gap-2">
							<span aria-hidden="true" className="h-px w-6 bg-border" />
							<DocStatus status="amended" config={TAX_RETURN_STATUS} />
						</div>
					)}
				</ScrollRow>
				<ActionBar className="gap-x-3">
					{filingReference && (
						<span className="text-2xs text-tertiary-foreground">
							Ref: <span className="font-mono font-medium text-muted-foreground">{filingReference}</span>
						</span>
					)}
					{reviewedAt && status !== "draft" && (
						<span className="text-2xs text-tertiary-foreground">
							Reviewed: {parseDate(reviewedAt).toLocaleDateString("en-MY", { day: "2-digit", month: "short" })}
						</span>
					)}
					{filedAt && <span className="text-2xs text-tertiary-foreground">Filed: {formatDate(filedAt)}</span>}
					{!readOnly && status === "draft" && (
						<Button variant="secondary" size="sm" disabled={isSubmitting} focusableWhenDisabled onClick={() => onReview?.()}>
							Mark reviewed
						</Button>
					)}
					{!readOnly && status === "reviewed" && (
						<Button variant="primary" size="sm" disabled={isSubmitting} focusableWhenDisabled onClick={() => onFile?.()}>
							Mark filed
						</Button>
					)}
				</ActionBar>
			</div>
		</div>
	);
}
