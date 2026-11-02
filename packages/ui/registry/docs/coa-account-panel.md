# CoaAccountPanel

The detail panel for a selected account: current balance, normal balance and status, flags, balance history, recent transactions and AI mapping keywords, with an inline edit form.

```tsx
import { CoaAccountPanel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CoaAccountPanel } from "@cynco-labs/ui";

export default function CoaAccountPanelDemo() {
	return (
		<CoaAccountPanel
			className="max-w-96"
			currency="MYR"
			currentBalance={248315.4}
			transactionCount={86}
			lastTransactionAt="2026-10-28"
			account={{
				accountCode: "1000-001",
				accountName: "Maybank Current Account",
				accountType: "asset",
				normalBalance: "debit",
				isActive: true,
				isBankAccount: true,
				isCashAccount: true,
				currency: "MYR",
				isMonetary: true,
				mappingKeywords: ["maybank", "m2u", "duitnow", "ibg"],
			}}
			balanceHistory={[
				{
					period: "2026-10",
					periodDebit: 96420.0,
					periodCredit: 42885.6,
					closingBalance: 248315.4,
				},
			]}
			transactions={[
				{
					id: "t1",
					date: "2026-10-28",
					description: "Receipt INV-2026-0142",
					type: "debit",
					amount: 12720.0,
					source: "Bank feed",
				},
			]}
		/>
	);
}
```

## Use

Right-hand panel of the Chart of Accounts page.

## Props

account { accountCode, accountName, accountType, normalBalance, isActive, description?, isSystemAccount?, isBankAccount?, isCashAccount?, isRetainedEarnings?, taxRelated?, currency?, isMonetary?, mappingKeywords? }, currency?, currentBalance, transactionCount, lastTransactionAt?, balanceHistory [{ period, periodDebit, periodCredit, closingBalance }], transactions [{ id, date, description, type, amount, source? }], defaultEditing?, onClose?, className? (merged on the root) and native props.

- `account`: `CoaPanelAccount`
- `currency?`: `string`. Default `"MYR"`.
- `currentBalance?`: `number`. Default `0`.
- `transactionCount?`: `number`. Default `0`.
- `lastTransactionAt?`: `string | null`
- `balanceHistory?`: `BalanceHistoryRow[]`. Default `[]`.
- `transactions?`: `{ id: string; date: string; description: string; type: "debit" | "credit"; amount: number; source?: string }[]`. Default `[]`.
- `defaultEditing?`: `boolean`
- `onClose?`: `() => void`
- Also accepts `ComponentProps<"aside">`.

## Notes

Balance tile is a StatTile on bg-interactive-secondary. Flags and keywords use Badge variant="muted". Responsive: Fills its container (no fixed width); balance tile is a StatTile and balance history a DataList that stacks inside a narrow panel.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger.tsx`.
