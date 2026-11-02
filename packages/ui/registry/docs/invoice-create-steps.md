# InvoiceCreateSteps

The invoice builder's vertical three-step rail (Customer Information, Line Items, Invoice Summary) with numbered and checked step markers and a connecting line.

```tsx
import { InvoiceCreateSteps } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, InvoiceCreateSteps } from "@cynco-labs/ui";

export default function InvoiceCreateStepsDemo() {
	return (
		<div className="max-w-[420px]">
			<InvoiceCreateSteps
				currentStep={2}
				children={{
					1: (
						<div className="text-[13px] text-tertiary-foreground">
							Tropika Kopi Enterprise · accounts@tropikakopi.my
						</div>
					),
					2: (
						<div className="flex gap-2">
							<Button variant="secondary">Add item</Button>
							<Button variant="secondary">Browse library</Button>
						</div>
					),
				}}
			/>
		</div>
	);
}
```

## Use

Left side of the create-invoice flow, wrapping each step's form content.

## Props

currentStep (1–3), optional completed step numbers, and children keyed by step number for each step's content; className and native ol props.

- `currentStep`: `1 | 2 | 3`
- `completed?`: `number[]`. Default `[]`.
- `children?`: `Partial<Record<1 | 2 | 3, ReactNode>>`
- Also accepts `ComponentProps<"ol">`.

## Notes

Responsive: A vertical ordered list that works at any width.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
