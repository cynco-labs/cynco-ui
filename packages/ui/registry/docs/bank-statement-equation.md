# BankStatementEquation

A statement's own proof — opening, money in (n lines), money out (n lines), closing vs the statement's printed closing — with a broken running-balance warning by row.

```tsx
import { BankStatementEquation } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankStatementEquation } from "@cynco-labs/ui";

export default function BankStatementEquationDemo() {
	return (
		<div className="flex flex-col gap-5">
			<BankStatementEquation
				statement={{
					openingBalance: "58210.35",
					closingBalance: "61942.10",
					totalCredits: "31400.00",
					totalDebits: "27668.25",
					creditLines: 18,
					debitLines: 64,
				}}
			/>
			<BankStatementEquation
				size="sm"
				chainValid={false}
				brokenRows={[3, 16]}
				statement={{
					openingBalance: "12400.00",
					closingBalance: "9811.20",
					totalCredits: "4200.00",
					totalDebits: "6588.80",
					creditLines: 1,
					debitLines: 22,
				}}
			/>
			<BankStatementEquation
				size="sm"
				statement={{
					openingBalance: null,
					closingBalance: "20500.00",
					totalCredits: "8200.00",
					totalDebits: "3100.00",
					creditLines: 5,
					debitLines: 9,
				}}
			/>
		</div>
	);
}
```

## Use

Statement import review and the import done screen.

## Props

statement {openingBalance, closingBalance, totalCredits, totalDebits, creditLines, debitLines} | null while reading, chainValid, brokenRows (0-based), currency, size, className and native props (spread on the root).

- `statement`: `BankParsedStatement | null`
- `chainValid?`: `boolean`. Default `true`.
- `brokenRows?`: `number[]`. Default `[]`.
- `currency?`: `string`. Default `"MYR"`.
- `size?`: `"sm" | "md"`. Default `"md"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Built on BankBalanceEquation; the warning line uses an amber StatusChipIcon instead of warning-coloured text. Inherits the equation's wrapping; no overflow at 320px.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/balance-equation.tsx:232-298`.
