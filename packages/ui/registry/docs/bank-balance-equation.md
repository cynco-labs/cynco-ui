# BankBalanceEquation

Opening + money in − money out = result, set against a check balance with a verdict: Ties, Off by RM x, or why it can't be verified; pending terms shimmer.

```tsx
import { BankBalanceEquation } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankBalanceEquation } from "@cynco-labs/ui";
import type { ReactNode } from "react";

export default function BankBalanceEquationDemo() {
	const sec = (t: ReactNode) => (
		<div className="text-tiny uppercase tracking-[0.04em] text-tertiary-foreground">{t}</div>
	);
	return (
		<div className="flex flex-col gap-4">
			{sec("Ties")}
			<BankBalanceEquation
				resultLabel="Closing"
				terms={[
					{ label: "Opening", amount: 184520.4 },
					{ label: "Money in", amount: 96310.0, op: "plus", hint: "52 lines" },
					{ label: "Money out", amount: 72845.15, op: "minus", hint: "131 lines" },
				]}
				check={{ label: "Statement closing", amount: 207985.25 }}
				tiesLabel="Ties to the statement"
			/>
			{sec("Off")}
			<BankBalanceEquation
				size="sm"
				resultLabel="Closing"
				terms={[
					{ label: "Opening", amount: 42100 },
					{ label: "Money in", amount: 18250, op: "plus" },
					{ label: "Money out", amount: 20412.6, op: "minus" },
				]}
				check={{ label: "Statement closing", amount: 39887.4 }}
			/>
			{sec("Pending")}
			<BankBalanceEquation
				size="sm"
				resultLabel="Closing"
				terms={[
					{ label: "Opening", amount: 42100 },
					{ label: "Money in", amount: undefined, op: "plus" },
					{ label: "Money out", amount: undefined, op: "minus" },
				]}
				check={{ label: "Statement closing", amount: undefined }}
			/>
		</div>
	);
}
```

## Use

Any proof in banking: a statement, a month end, a month's cash.

## Props

terms [{label, amount (number | null unknown | undefined pending), op, hint}], resultLabel, check {label, amount}, currency, tiesLabel, unknownLabel, size, className and native props (spread on the root).

- `terms`: `readonly BankEquationTerm[]`
- `resultLabel`: `string`
- `check?`: `BankEquationCheck`
- `currency?`: `string`. Default `"MYR"`.
- `tiesLabel?`: `string`. Default `"Ties"`.
- `unknownLabel?`: `string`. Default `"Can't verify"`.
- `size?`: `"sm" | "md"`. Default `"md"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Terms wrap onto new lines; verdict chips wrap their label instead of truncating.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
