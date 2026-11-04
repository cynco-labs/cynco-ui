"use client";

/**
 * Cynco UI — payroll: one payslip, a run's payslips, and what the run owes the
 * agencies. Amounts arrive as integer sen (payroll-store/format.ts formatSen).
 * Presentational port of cynco-labs/cynco remix/app/components/payroll-store;
 * primitives and tokens only.
 */
import { ReceiptIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button, cn, Input, StatusChip } from "../../base";
import { fromSen } from "../../lib/money";
import {
	ActionBar,
	type DataColumn,
	DataList,
	formatCurrency,
	SectionLabel,
	SectionPanel,
	StatGrid,
	StatTile,
} from "../../lib/shared";
import { amt, type DivProps, DOT, OpsEmpty, TrayTotals } from "./shared";

/** Payroll amounts arrive as integer sen (payroll-store/format.ts formatSen): 123456 → "1234.56". */
const senAmount = (v: number): `${number}` => fromSen(BigInt(Math.round(v)));
function sen(v: number): string {
	return formatCurrency(senAmount(v));
}

export interface PayslipData {
	id: string;
	employeeName: string;
	reference: string;
	gross: number;
	statutoryDeductions: number;
	otherDeductions: number;
	net: number;
	employerCost: number;
	paymentStatus: "unpaid" | "paid";
	paymentReference: string | null;
	lines: { kind: string; code: string; label: string; amount: number }[];
	contributions: { code: string; label: string; employeeAmount: number; employerAmount: number; verified: boolean }[];
}

type PayslipContribution = PayslipData["contributions"][number];

function PaymentChip({ status }: { status: "unpaid" | "paid" }) {
	return status === "paid" ? (
		<StatusChip tone="green" glyph="check">
			Paid
		</StatusChip>
	) : (
		<StatusChip tone="neutral" glyph="clock">
			Unpaid
		</StatusChip>
	);
}

/** One payslip: gross → statutory (EPF/SOCSO/EIS/PCB) → net, pay lines, employee/employer contributions and payment. Amounts in sen. */
export function PayslipSummary({
	payslip,
	month,
	canMarkPaid = false,
	onMarkPaid,
	className,
	...props
}: Omit<React.ComponentProps<"section">, "title" | "children"> & {
	payslip: PayslipData;
	month?: string;
	canMarkPaid?: boolean;
	onMarkPaid?: (reference: string) => void;
}) {
	const p = payslip;
	const [ref, setRef] = React.useState("");
	const employeeTotal = p.contributions.reduce((s, c) => s + c.employeeAmount, 0);
	const employerTotal = p.contributions.reduce((s, c) => s + c.employerAmount, 0);
	const contributionColumns: DataColumn<PayslipContribution>[] = [
		{
			key: "scheme",
			header: "Scheme",
			mobile: "title",
			cell: (c) => (
				<span className="inline-flex flex-wrap items-center gap-1.5 text-muted-foreground">
					{c.label}
					{!c.verified && (
						<StatusChip tone="amber" glyph="alert">
							Unverified
						</StatusChip>
					)}
				</span>
			),
		},
		{ key: "employee", header: "Employee", align: "right", cell: (c) => sen(c.employeeAmount) },
		{ key: "employer", header: "Employer", align: "right", cell: (c) => sen(c.employerAmount) },
	];
	return (
		<SectionPanel
			title={<span className="text-lg">{p.employeeName}</span>}
			description={
				<>
					<span className="font-mono font-medium">{p.reference}</span>
					{month && <> · {month}</>} · net {sen(p.net)}
				</>
			}
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
								<li
									key={`${l.kind}-${l.code}`}
									className="flex items-baseline justify-between gap-3 border-b border-table-row-divider py-1.5 text-sm last:border-b-0"
								>
									<span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-muted-foreground">
										<span>{l.label}</span>
										{l.code.toUpperCase() !== l.label.toUpperCase() && (
											<span className="font-mono text-2xs font-medium text-subtle">{l.code}</span>
										)}
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
						<DataList
							columns={contributionColumns}
							rows={p.contributions}
							getKey={(c) => c.code}
							caption="Employee and employer contributions"
							stackBelow="never"
							dense
							totals={{ label: "Total", employee: sen(employeeTotal), employer: sen(employerTotal) }}
						/>
					</section>
				</div>
				{p.paymentStatus === "paid" ? (
					<p className="text-sm font-normal text-tertiary-foreground">
						Paid{p.paymentReference ? `, reference ${p.paymentReference}` : ""}.
					</p>
				) : canMarkPaid && p.net > 0 ? (
					<ActionBar className="items-end border-t border-table-row-divider pt-3">
						<label className="flex min-w-48 flex-1 flex-col gap-1">
							<span className="text-2xs text-tertiary-foreground">Payment reference</span>
							<Input
								value={ref}
								onChange={(e) => setRef(e.target.value)}
								placeholder="Optional, such as the bank transfer reference"
							/>
						</label>
						<Button variant="primary" onClick={() => onMarkPaid?.(ref)}>
							Mark paid
						</Button>
					</ActionBar>
				) : null}
			</div>
		</SectionPanel>
	);
}

/** A run's payslips: employee, gross, statutory, other deductions, net, employer cost, payment. Amounts in sen. */
export function PayslipsRunTable({
	payslips,
	payable = true,
	onRowClick,
	className,
	...props
}: DivProps<{ payslips: PayslipData[]; payable?: boolean; onRowClick?: (payslip: PayslipData) => void }>) {
	if (payslips.length === 0)
		return (
			<div className={cn("min-w-0", className)} {...props}>
				<OpsEmpty
					icon={<ReceiptIcon size={20} aria-hidden="true" />}
					title="No payslips yet"
					description="Compute the run to produce them."
				/>
			</div>
		);
	const money = (
		key: string,
		header: string,
		f: (s: PayslipData) => number,
		extra?: Partial<DataColumn<PayslipData>>,
	): DataColumn<PayslipData> => ({
		key,
		header,
		align: "right",
		cell: (s) => (
			<span className={key === "net" ? "font-medium text-foreground" : "text-muted-foreground"}>
				{amt(senAmount(f(s)))}
			</span>
		),
		...extra,
	});
	const columns: DataColumn<PayslipData>[] = [
		{
			key: "emp",
			header: "Employee",
			mobile: "title",
			cell: (s) => (
				// Phrasing content only: with onRowClick, this cell renders inside the row's button.
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
		{
			key: "pay",
			header: "Payment",
			mobile: "badge",
			cell: (s) =>
				payable ? <PaymentChip status={s.paymentStatus} /> : <span className="text-tertiary-foreground">—</span>,
		},
	];
	const sum = (f: (s: PayslipData) => number) =>
		amt(fromSen(payslips.reduce<bigint>((a, s) => a + BigInt(Math.round(f(s))), 0n)));
	return (
		<div className={cn("min-w-0", className)} {...props}>
			<DataList
				columns={columns}
				rows={payslips}
				getKey={(s) => s.id}
				caption="Payslips"
				stackBelow="2xl"
				onRowClick={onRowClick}
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
export function PayrollRemittancesPanel({
	remittances,
	className,
	...props
}: Omit<React.ComponentProps<"section">, "title" | "children"> & {
	remittances: { payable: string; label: string; employee: number; employer: number }[];
}) {
	if (remittances.length === 0) return null;
	type R = (typeof remittances)[number];
	const t = remittances.reduce((a, r) => ({ e: a.e + r.employee, r: a.r + r.employer }), { e: 0, r: 0 });
	const columns: DataColumn<R>[] = [
		{
			key: "c",
			header: "Creditor",
			mobile: "title",
			cell: (r) => <span className="text-muted-foreground">{r.label}</span>,
		},
		{
			key: "e",
			header: "Employee",
			align: "right",
			cell: (r) => <span className="text-muted-foreground">{sen(r.employee)}</span>,
		},
		{
			key: "r",
			header: "Employer",
			align: "right",
			cell: (r) => <span className="text-muted-foreground">{sen(r.employer)}</span>,
		},
		{
			key: "t",
			header: "Total",
			align: "right",
			mobile: "value",
			cell: (r) => <span className="font-medium">{sen(r.employee + r.employer)}</span>,
		},
	];
	return (
		<SectionPanel
			title="Owed to agencies"
			description="Employee and employer shares this run remits, by creditor."
			className={cn("shadow-sm", className)}
			{...props}
		>
			<DataList
				columns={columns}
				rows={remittances}
				getKey={(r) => r.payable}
				caption="Remittances"
				stackBelow="lg"
				dense
				footer={
					<TrayTotals
						label="Total"
						items={[
							{ label: "Employee", value: sen(t.e) },
							{ label: "Employer", value: sen(t.r) },
							{ label: "Total", value: sen(t.e + t.r) },
						]}
					/>
				}
			/>
		</SectionPanel>
	);
}
