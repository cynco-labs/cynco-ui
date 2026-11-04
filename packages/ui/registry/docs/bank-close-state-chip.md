# BankCloseStateChip

A month's close state as a status chip: Closed, Ready to close, Needs work, No statement, Covered, In progress, Not started.

```tsx
import { BankCloseStateChip } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankCloseStateChip } from "@cynco-labs/ui";

const STATES = ["closed", "ready", "needs_work", "no_statement", "covered", "in_progress", "future"] as const;

export default function BankCloseStateChipDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			{STATES.map((s) => (
				<BankCloseStateChip key={s} state={s} />
			))}
		</div>
	);
}
```

## Use

On the selected month heading and anywhere a month's close state is listed.

## Props

state, className and native props (spread on the root).

- `state`: `BankCloseMonthState`
- Also accepts `ComponentProps<"span">`.

## Notes

Inline at any width.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/year-strip.tsx:80-92`.
