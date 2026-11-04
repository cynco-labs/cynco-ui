# BankMonthProof

The month-end proof: statement closing − lines not yet in the ledger − lines dated on another day = expected ledger, checked against the linked GL account, with any difference explained in words.

```tsx
import { BankMonthProof } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankMonthProof } from "@cynco-labs/ui";

export default function BankMonthProofDemo() {
	return (
		<div className="flex flex-col gap-6">
			<BankMonthProof
				monthName="September"
				asOf="30 Sep"
				statementClosing={207985.25}
				unpostedNet={3120.4}
				inTransit={{ count: 2, net: -1500 }}
				ledger={206364.85}
				link={{ kind: "linked", code: "1000-001", name: "Maybank Current" }}
				onUploadStatement={() => {}}
			/>
			<BankMonthProof
				monthName="June"
				asOf="30 Jun 2026"
				statementClosing={96210}
				unpostedNet={0}
				ledger={96710}
				link={{ kind: "linked", code: "1000-002", name: "CIMB Business" }}
			/>
		</div>
	);
}
```

## Use

The Reconcile lens for the selected month.

## Props

monthName, asOf, statementClosing (null = no statement), unpostedNet, inTransit {count, net}, ledger, link (linked {code, name} | unlinked | foreign_currency | missing_account), currency, state, className and native props (spread on the root).

- `monthName`: `string`
- `asOf`: `string`. "31 Mar"
- `statementClosing`: `number | null`. null = no statement ends in the month.
- `unpostedNet`: `number`
- `ledger`: `number | null`. Ledger balance on the day; null when there is nothing to compare with.
- `link`: `BankLedgerLink`
- `inTransit?`: `{ count: number; net: number }`
- `currency?`: `string`. Default `"MYR"`.
- `state?`: `"no_statement" | "in_progress" | "covered" | "needs_work" | "ready" | "closed"`
- `onUploadStatement?`: `() => void`. Called when the user clicks "Upload statement"; omit to hide the button.
- `onLinkLedgerAccount?`: `() => void`. Called when the user clicks "Link a ledger account"; omit to hide the button.
- Also accepts `ComponentProps<"section">`.

## Notes

Inherits the equation's wrapping; prose is max-w-prose.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/month-proof.tsx:20-168`.
