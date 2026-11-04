# PartyRail

The facts rail of a party page: available credit (customers), Position with Books tie / Needs review, the Aging stacked bar and buckets, the 12-month billed/spend bar chart and the contacts list.

```tsx
import { PartyRail } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PartyRail } from "@cynco-labs/ui";

export default function PartyRailDemo() {
	return (
		<PartyRail
			onSetPrimaryContact={() => {}}
			onEditContact={() => {}}
			onAddContact={() => {}}
			party="customer"
			className="max-w-[640px]"
			ledgerBalance={"48250.40"}
			openItemsTotal={"48250.40"}
			aging={{ current: "21470.40", days1to30: "14100.00", days31to60: "8180.00", days61plus: "4500.00" }}
			credits={[{ currency: "MYR", amount: "1200.00", count: 2 }]}
			creditNotesHref="/sales/credit-notes?customer=tropika-kopi"
			trend={[
				{ month: "2025-11", total: "12400.00" },
				{ month: "2025-12", total: "18900.00" },
				{ month: "2026-01", total: "9800.00" },
				{ month: "2026-02", total: "14200.00" },
				{ month: "2026-03", total: "16750.00" },
				{ month: "2026-04", total: "11300.00" },
				{ month: "2026-05", total: "20450.00" },
				{ month: "2026-06", total: "15800.00" },
				{ month: "2026-07", total: "17200.00" },
				{ month: "2026-08", total: "13900.00" },
				{ month: "2026-09", total: "19100.00" },
				{ month: "2026-10", total: "16620.75" },
			]}
			contacts={[
				{
					id: "c1",
					name: "Nurul Aisyah Rahman",
					role: "billing",
					email: "aisyah@mesra.com.my",
					phone: "+60 12-345 6789",
					isPrimary: true,
				},
				{
					id: "c2",
					name: "Tan Wei Ming",
					role: "purchasing",
					email: "weiming@mesra.com.my",
					phone: "+60 3-7728 1100",
				},
			]}
		/>
	);
}
```

## Use

Right column of customer and vendor pages.

## Props

party, currency, ledgerBalance, openItemsTotal, aging {current, days1to30, days31to60, days61plus}, trend [{month, total}], credits [{currency, amount, count}], contacts [{name, party, email, phone, isPrimary}], className (e.g. grid-cols-2); className and native aside props.

- `party`: `"customer" | "vendor"`
- `ledgerBalance`: `Amount`. Subledger balance (ground truth).
- `openItemsTotal`: `Amount`. Sum of open bills / invoices — ties out against the ledger.
- `aging`: `PartyAging`
- `currency?`: `string`. Default `"MYR"`.
- `trend?`: `Array<{ month: string; total: Amount }>`. Last 12 months: { month: "2026-10", total }.
- `credits?`: `Array<{ currency: string; amount: Amount; count: number }>`. Unused credit notes per currency (customers only).
- `creditNotesHref?`: `string`. Where "View credit notes" goes; renders it as a real link.
- `onViewCreditNotes?`: `() => void`. In-app handler for "View credit notes" when there is no URL; renders it as a button. Without either, the action is hidden.
- `contacts?`: `PartyContact[]`
- `onSetPrimaryContact?`: `(contact: PartyContact) => void`. Called from a contact's star button; omit to hide it.
- `onEditContact?`: `(contact: PartyContact) => void`. Called from a contact's edit button; omit to hide it.
- `onAddContact?`: `() => void`. Called from "Add contact"; omit to hide it.
- Also accepts `ComponentProps<"aside">`.

## Notes

Responsive by container: one column as a rail, two from a 36rem container, three from 64rem.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties/party-rail.tsx:85-344`.
