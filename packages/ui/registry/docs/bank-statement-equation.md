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
					openingBalance: 58210.35,
					closingBalance: 61942.1,
					totalCredits: 31400,
					totalDebits: 27668.25,
					creditLines: 18,
					debitLines: 64,
				}}
			/>
			<BankStatementEquation
				size="sm"
				chainValid={false}
				brokenRows={[3, 16]}
				statement={{
					openingBalance: 12400,
					closingBalance: 9811.2,
					totalCredits: 4200,
					totalDebits: 6588.8,
					creditLines: 1,
					debitLines: 22,
				}}
			/>
			<BankStatementEquation
				size="sm"
				statement={{
					openingBalance: null,
					closingBalance: 20500,
					totalCredits: 8200,
					totalDebits: 3100,
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

## Notes

Built on BankBalanceEquation; the warning line uses an amber StatusChipIcon instead of warning-coloured text. Inherits the equation's wrapping; no overflow at 320px.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
