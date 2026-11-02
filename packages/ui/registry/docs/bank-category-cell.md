# BankCategoryCell

The categorisation affordance in its four states: AI suggestion with confidence, confirmed chip, '+ Assign', locked, plus the account-picker trigger.

```tsx
import { BankCategoryCell } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankCategoryCell } from "@cynco-labs/ui";

export default function BankCategoryCellDemo() {
	function line(label, el) {
		return (
			<div className="flex items-center gap-4">
				<span className="w-28 text-tiny text-tertiary-foreground">{label}</span>
				{el}
			</div>
		);
	}
	return (
		<div className="flex flex-col gap-2.5">
			{line(
				"Suggested",
				<BankCategoryCell
					status="imported"
					suggestion={{ accountName: "Professional Fees", confidence: 0.88 }}
				/>,
			)}
			{line(
				"Confirmed",
				<BankCategoryCell status="categorized" category="6300 Rental of Premises" />,
			)}
			{line("Unassigned", <BankCategoryCell status="imported" />)}
			{line(
				"Locked (posted)",
				<BankCategoryCell status="posted" category="6120 EPF Contributions" />,
			)}
			{line("Picking", <BankCategoryCell status="imported" picking />)}
		</div>
	);
}
```

## Use

Wherever a bank line's chart-of-accounts category is set or accepted.

## Props

status, category, suggestion {accountName, accountCode?, confidence}, picking, onAccept, onPick, className and native props (spread on the root).

- `status`: `"posted" | "imported" | "categorized" | "reconciled" | "excluded"`
- `category?`: `string | null`
- `suggestion?`: `BankCoaSuggestion | null`
- `picking?`: `boolean`. Default `false`.
- `onAccept?`: `() => void`
- `onPick?`: `() => void`
- Also accepts `ComponentProps<"span">`.

## Notes

All states are Buttons (secondary / dotted / skeleton) inside a span root.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
