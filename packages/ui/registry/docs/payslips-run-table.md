# PayslipsRunTable

A payroll run's payslips: employee and reference, gross, statutory, other deductions, net, employer cost and Paid/Unpaid, with run totals.

```tsx
import { PayslipsRunTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PayslipsRunTable } from "@cynco-labs/ui";

export default function PayslipsRunTableDemo() {
	function p(id, n, r, g, st, o, ec, paid) {
		return {
			id,
			employeeName: n,
			reference: r,
			gross: g,
			statutoryDeductions: st,
			otherDeductions: o,
			net: g - st - o,
			employerCost: ec,
			paymentStatus: paid ? "paid" : "unpaid",
			paymentReference: null,
			lines: [],
			contributions: [],
		};
	}
	return (
		<PayslipsRunTable
			payslips={[
				p("1", "Nurul Aisyah binti Hassan", "EMP-0042", 685000, 107790, 15000, 788505, false),
				p("2", "Tan Wei Jie", "EMP-0017", 920000, 168420, 0, 1047300, true),
				p("3", "Rajesh a/l Subramaniam", "EMP-0023", 480000, 58140, 0, 553980, true),
				p("4", "Siti Mariam binti Osman", "EMP-0051", 350000, 39480, 5000, 404750, false),
			]}
		/>
	);
}
```

## Use

Payroll run page.

## Props

`payslips` (PayslipSummary shape, sen); optional `payable` (false for correction runs), `onOpen(id)`; optional `className` and native div props on the root.

- `payslips`: `PayslipData[]`
- `payable?`: `boolean`. Default `true`.
- `onOpen?`: `(id: string) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: DataList: table when wide, employee/net cards when narrow; totals wrap.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
