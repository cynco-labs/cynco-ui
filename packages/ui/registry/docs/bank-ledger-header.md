# BankLedgerHeader

The header over a bank account's ledger: account name, number and linked GL code, the statement tie-out, book vs statement balance, the month stepper and the month's totals.

```tsx
import { BankLedgerHeader } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankLedgerHeader } from "@cynco-labs/ui";

export default function BankLedgerHeaderDemo() {
	return (
		<BankLedgerHeader
			account={{
				name: "Maybank Current Account",
				number: "•••• 4417",
				glCode: "1000-001",
				institutionName: "Malayan Banking Berhad",
				currency: "MYR",
			}}
			month="2026-10"
			tieOut={{ status: "off", difference: "-1240.00" }}
			bookBalance={"198465.00"}
			statement={{ date: "2026-10-28", balance: "197225.00", unreconciledDifference: "-1240.00" }}
			notCounted={[
				{
					label: "2 USD lines not counted",
					title: "2 lines in USD this month carry no MYR amount, so the balance leaves them out.",
				},
			]}
			transactionCount={48}
			credits={"96420.00"}
			debits={"80355.00"}
			canNext={false}
		/>
	);
}
```

## Use

Above the bank/GL register for one bank account and month.

## Props

account { name, number?, glCode?, institutionName?, currency }, month (YYYY-MM), tieOut ({status:'tied',statementClosing} | {status:'off',difference} | {status:'none',basis}), bookBalance, statement?, notCounted?, transactionCount, credits, debits, canPrev?, canNext?, onMonthChange?, onDownload?, className? (merged on the root) and native props.

- `account`: `{ name: string; number?: string; glCode?: string; institutionName?: string; currency: string }`
- `month`: `string`. "2026-10"
- `tieOut`: `{ status: "tied"; statementClosing: Amount } | { status: "off"; difference: Amount } | { status: "none"; basis: "statement" | "unverified" }`
- `bookBalance`: `Amount`
- `transactionCount`: `number`
- `credits`: `Amount`
- `debits`: `Amount`
- `statement?`: `{ date: string; balance: Amount; unreconciledDifference: Amount } | null`
- `notCounted?`: `{ label: string; title?: string }[]`. Default `[]`.
- `canPrev?`: `boolean`. Default `true`.
- `canNext?`: `boolean`. Default `true`.
- `onMonthChange?`: `(dir: -1 | 1) => void`
- `onDownload?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

The GL code sits in a mono tag. Credits and debits are neutral figures; an unreconciled gap gets an amber warning glyph rather than coloured text. CSV export is a skeleton icon button (wire onExport yourself). Responsive: balances, the tie-out chip and the month stepper all wrap on narrow containers.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger/bank-ledger-header.tsx:38-163`.
