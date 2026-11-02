# RecurringTemplateTable

The recurring invoice templates list: Customer with email, Frequency, Next generation, Amount, Generated count and Status.

```tsx
import { RecurringTemplateTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { RecurringTemplateTable } from "@cynco-labs/ui";

export default function RecurringTemplateTableDemo() {
	return (
		<RecurringTemplateTable
			templates={[
				{
					id: "1",
					customerName: "Bayu Dental Clinic",
					customerEmail: "admin@bayudental.my",
					frequency: "monthly",
					nextGenerationDate: "2026-11-01",
					totalAmount: 1890,
					totalGenerated: 14,
					status: "active",
				},
				{
					id: "2",
					customerName: "Syarikat Maju Jaya Sdn Bhd",
					customerEmail: "finance@majujaya.com.my",
					frequency: "quarterly",
					nextGenerationDate: "2027-01-01",
					totalAmount: 10800,
					totalGenerated: 5,
					status: "active",
				},
				{
					id: "3",
					customerName: "Tropika Kopi Enterprise",
					customerEmail: "hello@tropikakopi.my",
					frequency: "weekly",
					nextGenerationDate: null,
					totalAmount: 420,
					totalGenerated: 31,
					status: "paused",
				},
				{
					id: "4",
					customerName: "Rimba Hijau Landscaping",
					customerEmail: "ops@rimbahijau.my",
					frequency: "annually",
					nextGenerationDate: "2027-03-15",
					totalAmount: null,
					totalGenerated: 0,
					status: "draft",
				},
			]}
		/>
	);
}
```

## Use

The Recurring Invoices page.

## Props

templates ({id, customerName, customerEmail, frequency, nextGenerationDate, totalAmount, currency, totalGenerated, status}); className.

- `templates`: `SalesRecurringTemplate[]`

## Notes

Frequencies read Weekly through Annually; the lifecycle status is a DocStatus chip, with Paused on the pause glyph. Missing values show an em dash. Responsive: built on DataList: a table from 36rem of container width, stacked cards below.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
