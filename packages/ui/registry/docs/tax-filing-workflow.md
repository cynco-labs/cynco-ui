# TaxFilingWorkflow

Draft → Reviewed → Filed stepper for a tax return with filing reference, reviewed/filed dates and the next action (Mark reviewed / Mark filed).

```tsx
import { TaxFilingWorkflow } from "@cynco-labs/ui";
```

## Usage

```tsx
import { TaxFilingWorkflow } from "@cynco-labs/ui";

export default function TaxFilingWorkflowDemo() {
	return (
		<div className="flex flex-col gap-3">
			<TaxFilingWorkflow status="reviewed" reviewedAt="2026-10-21" />
			<TaxFilingWorkflow status="filed" filingReference="C-2025-0048213" reviewedAt="2026-10-21" filedAt="2026-10-28" />
		</div>
	);
}
```

## Use

Top of a tax return page.

## Props

`status` (draft|reviewed|filed|amended); optional `filingReference`, `reviewedAt`, `filedAt`, `readOnly`, `onReview`, `onFile`; optional `className` and native div props on the root.

- `status`: `string`
- `readOnly?`: `boolean`. Default `false`.
- `isSubmitting?`: `boolean`. Default `false`.
- `filingReference?`: `string | null`
- `reviewedAt?`: `string | null`
- `filedAt?`: `string | null`
- `onReview?`: `() => void`
- `onFile?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Amended shows the DocStatus chip after the steps. Responsive by container: steps in a ScrollRow; actions wrap under the steps below 42rem.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/tax.tsx:406-499`.
