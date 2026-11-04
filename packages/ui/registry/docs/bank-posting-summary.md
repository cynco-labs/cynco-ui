# BankPostingSummary

'Waiting to post, by account': what To post will put in the ledger per account and direction, with line counts and signed totals.

```tsx
import { BankPostingSummary } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankPostingSummary } from "@cynco-labs/ui";

export default function BankPostingSummaryDemo() {
	return (
		<BankPostingSummary
			defaultActiveKey="6210|debit"
			totals={[
				{
					accountCode: "4000",
					accountName: "Sales Revenue",
					type: "credit",
					count: 38,
					total: "84250.00",
				},
				{
					accountCode: "1200-001",
					accountName: "Trade Receivables",
					type: "credit",
					count: 12,
					total: "46980.50",
				},
				{ accountCode: "6210", accountName: "Utilities", type: "debit", count: 4, total: "2316.80" },
				{
					accountCode: "6120",
					accountName: "EPF Contributions",
					type: "debit",
					count: 1,
					total: "6842.00",
				},
				{ accountCode: "6130", accountName: "SOCSO & EIS", type: "debit", count: 1, total: "1187.60" },
				{ accountCode: null, accountName: null, type: "debit", count: 2, total: "310.00" },
			]}
		/>
	);
}
```

## Use

Above the feed when filtered to To post, so a miscoding shows as a total on the wrong account.

## Props

totals [{accountCode, accountName, type, count, total, currency}], activeKey / defaultActiveKey ('code|type'), onActiveKeyChange(key | null), className and native props (spread on the root).

- `totals`: `BankPostingTotal[]`
- `activeKey?`: `string | null`. The row the feed is filtered to, as `accountCode|type` (controlled); `null` for none.
- `defaultActiveKey?`: `string | null`. The row filtered to on first render, when uncontrolled. Default `null`.
- `onActiveKeyChange?`: `(key: string | null) => void`. Called with the new active row, or `null` when the active one is clicked again.
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive: built on DataList: a tray table from 32rem, stacked rows (account and total, then direction and line count) below.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/posting-summary.tsx:23-124`.
