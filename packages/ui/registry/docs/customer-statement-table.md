# CustomerStatementTable

Statement of account lines: Date, Transactions, Details, Currency, Amount (debit), Payment (credit) and running Balance, with a Balance Due footer.

```tsx
import { CustomerStatementTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CustomerStatementTable } from "@cynco-labs/ui";

export default function CustomerStatementTableDemo() {
	return (
		<CustomerStatementTable
			balanceDue={48250.4}
			transactions={[
				{
					date: "2026-09-01",
					transactionType: "Opening Balance",
					details: "Balance brought forward",
					currency: "MYR",
					amount: 0,
					payment: 0,
					balance: 41769.9,
				},
				{
					date: "2026-09-02",
					transactionType: "Payment",
					details: "RCPT-2026-0388 · Cheque 004512",
					currency: "MYR",
					amount: 0,
					payment: 6000,
					balance: 35769.9,
				},
				{
					date: "2026-09-15",
					transactionType: "Invoice",
					details: "INV-2026-0131 · Monthly supply Sep",
					currency: "MYR",
					amount: 6680,
					payment: 0,
					balance: 42449.9,
				},
				{
					date: "2026-10-06",
					transactionType: "Invoice",
					details: "INV-2026-0149 · Export order SG",
					currency: "MYR",
					amount: 11316,
					payment: 0,
					balance: 53765.9,
				},
				{
					date: "2026-10-09",
					transactionType: "Debit Note",
					details: "DN-2026-0007 · Late delivery surcharge",
					currency: "MYR",
					amount: 1250,
					payment: 0,
					balance: 55015.9,
				},
				{
					date: "2026-10-14",
					transactionType: "Credit Note",
					details: "CN-2026-0021 · Returned goods",
					currency: "MYR",
					amount: 0,
					payment: 10746,
					balance: 44269.9,
				},
				{
					date: "2026-10-21",
					transactionType: "Invoice",
					details: "INV-2026-0156 · Monthly supply Oct",
					currency: "MYR",
					amount: 12480.5,
					payment: 0,
					balance: 56750.4,
				},
				{
					date: "2026-10-28",
					transactionType: "Payment",
					details: "RCPT-2026-0412 · DuitNow",
					currency: "MYR",
					amount: 0,
					payment: 8500,
					balance: 48250.4,
				},
			]}
		/>
	);
}
```

## Use

Customer statement of account page and its send/print preview.

## Props

transactions [{date, transactionType, details, currency, amount, payment, balance}], currency, isSingleCurrency, balanceDue, page, totalPages; className.

- `transactions`: `StatementTransaction[]`
- `currency?`: `string`. Default `"MYR"`.
- `isSingleCurrency?`: `boolean`. Default `true`.
- `balanceDue?`: `number`. Shown on the last page in single-currency mode.
- `page?`: `number`
- `totalPages?`: `number`

## Notes

A tray table: zero debits and credits render as em dashes (ReportAmount) and balances are bracketed when negative; Balance Due and the page count sit on the tray footer; the currency code is mono. Responsive: built on DataList: each line becomes a stacked card with its running balance below a 42rem container.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
