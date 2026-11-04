# PayslipSummary

One payslip: gross, statutory deductions, net pay, employer cost; pay lines (earnings and EPF/SOCSO/EIS/PCB deductions); employee and employer contributions per scheme with Unverified flags; payment state and Mark paid.

```tsx
import { PayslipSummary } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PayslipSummary } from "@cynco-labs/ui";

export default function PayslipSummaryDemo() {
	return (
		<PayslipSummary
			month="October 2026"
			canMarkPaid
			payslip={{
				id: "p1",
				employeeName: "Nurul Aisyah binti Hassan",
				reference: "EMP-0042",
				gross: 685000,
				statutoryDeductions: 107790,
				otherDeductions: 15000,
				net: 562210,
				employerCost: 788505,
				paymentStatus: "unpaid",
				paymentReference: null,
				lines: [
					{ kind: "earning", code: "BASIC", label: "Basic salary", amount: 640000 },
					{ kind: "earning", code: "ALW_TRV", label: "Travel allowance", amount: 45000 },
					{ kind: "deduction", code: "EPF", label: "EPF", amount: -75350 },
					{ kind: "deduction", code: "SOCSO", label: "SOCSO", amount: -2475 },
					{ kind: "deduction", code: "EIS", label: "EIS", amount: -1190 },
					{ kind: "deduction", code: "PCB", label: "PCB", amount: -28775 },
					{ kind: "deduction", code: "ADV", label: "Salary advance", amount: -15000 },
				],
				contributions: [
					{
						code: "EPF",
						label: "EPF",
						employeeAmount: 75350,
						employerAmount: 89050,
						verified: true,
					},
					{
						code: "SOCSO",
						label: "SOCSO",
						employeeAmount: 2475,
						employerAmount: 8665,
						verified: true,
					},
					{ code: "EIS", label: "EIS", employeeAmount: 1190, employerAmount: 1190, verified: true },
					{ code: "PCB", label: "PCB", employeeAmount: 28775, employerAmount: 0, verified: false },
					{
						code: "HRDF",
						label: "HRD Corp levy",
						employeeAmount: 0,
						employerAmount: 4600,
						verified: true,
					},
				],
			}}
		/>
	);
}
```

## Use

Payslip drawer or detail on a payroll run.

## Props

`payslip` {employeeName, reference, gross, statutoryDeductions, otherDeductions, net, employerCost, paymentStatus, paymentReference, lines, contributions} in integer sen; optional `month`, `canMarkPaid`, `onMarkPaid(reference)`; optional `className` and native section props on the root.

- `payslip`: `PayslipData`
- `month?`: `string`
- `canMarkPaid?`: `boolean`. Default `false`.
- `onMarkPaid?`: `(reference: string) => void`
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive by container: StatGrid tiles wrap; pay lines and contributions sit side by side from 42rem; the contributions are a DataList on the library's tray surface.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/payroll.tsx:60-179`.
