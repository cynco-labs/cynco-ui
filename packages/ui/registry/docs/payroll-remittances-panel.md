# PayrollRemittancesPanel

Owed to agencies: employee and employer shares a run remits per creditor (KWSP/EPF, PERKESO SOCSO and EIS, LHDN PCB, HRD Corp).

```tsx
import { PayrollRemittancesPanel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PayrollRemittancesPanel } from "@cynco-labs/ui";

export default function PayrollRemittancesPanelDemo() {
	return (
		<PayrollRemittancesPanel
			remittances={[
				{ payable: "epf", label: "KWSP (EPF)", employee: 269870, employer: 318390 },
				{ payable: "socso", label: "PERKESO (SOCSO)", employee: 8900, employer: 31150 },
				{ payable: "eis", label: "PERKESO (EIS)", employee: 4280, employer: 4280 },
				{ payable: "pcb", label: "LHDN (PCB)", employee: 94315, employer: 0 },
				{ payable: "hrdf", label: "HRD Corp levy", employee: 0, employer: 24350 },
			]}
		/>
	);
}
```

## Use

Payroll run page, after compute.

## Props

`remittances` [{payable, label, employee, employer}] in sen; optional `className` and native section props on the root.

- `remittances`: `{ payable: string; label: string; employee: number; employer: number }[]`
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive by container: DataList stacks below 24rem; totals wrap.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
