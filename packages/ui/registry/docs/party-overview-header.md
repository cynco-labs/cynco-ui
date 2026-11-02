# PartyOverviewHeader

Top of a customer or vendor page: breadcrumb, name with Inactive chip, Statement and New invoice/New bill actions, the four position KPIs (owes, overdue since, open items, 12-month total) and Activity / Ledger / Details tabs with the terms fact strip.

```tsx
import { PartyOverviewHeader } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PartyOverviewHeader } from "@cynco-labs/ui";

export default function PartyOverviewHeaderDemo() {
	return (
		<PartyOverviewHeader
			role="customer"
			name="Kedai Runcit Mesra Sdn Bhd"
			balance={48250.4}
			overdue={12680}
			overdueSince="2026-08-15"
			openCount={7}
			trendTotal={186420.75}
			paymentTerms="Net 30"
			category="Retail"
			since="2024-03-11"
		/>
	);
}
```

## Use

Customer and vendor party pages (CustomerPartyPage / VendorPartyPage).

## Props

role, name, isActive, balance, overdue, overdueSince, openCount, trendTotal, paymentTerms, category, since, currency, tab, onTabChange; className and native div props.

- `role`: `"customer" | "vendor"`
- `name`: `string`
- `balance`: `number`. Subledger balance: positive = they owe you (customer) / you owe them (vendor).
- `overdue`: `number`
- `openCount`: `number`
- `trendTotal`: `number`. Billed (customer) or spend (vendor), trailing 12 months.
- `isActive?`: `boolean`. Default `true`.
- `overdueSince?`: `string | null`. YYYY-MM-DD of the oldest overdue item.
- `paymentTerms?`: `string | null`
- `category?`: `string | null`
- `since?`: `string | null`. YYYY-MM-DD the party was created.
- `currency?`: `string`. Default `"MYR"`.
- `tab?`: `"activity" | "ledger" | "details"`
- `onTabChange?`: `(tab: string) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: KPIs are a StatGrid (four-up from 48rem, wrapping below); tabs scroll sideways in a ScrollRow.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
