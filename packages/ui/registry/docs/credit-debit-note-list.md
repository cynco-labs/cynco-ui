# CreditDebitNoteList

The credit and debit notes list: Note, Type, Customer, Amount, Status, Date and a row menu.

```tsx
import { CreditDebitNoteList } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CreditDebitNoteList } from "@cynco-labs/ui";

export default function CreditDebitNoteListDemo() {
	return (
		<CreditDebitNoteList
			onRowAction={() => {}}
			notes={[
				{
					id: "1",
					noteNumber: "CN-2026-0018",
					noteType: "credit",
					customerName: "Tropika Kopi Enterprise",
					totalAmount: "1620.00",
					status: "partially_applied",
					date: "2026-10-21",
				},
				{
					id: "2",
					noteNumber: "DN-2026-0007",
					noteType: "debit",
					customerName: "Nusantara Logistik Bhd",
					totalAmount: "864.00",
					status: "partially_paid",
					date: "2026-10-18",
				},
				{
					id: "3",
					noteNumber: "CN-2026-0017",
					noteType: "credit",
					customerName: "Bayu Dental Clinic",
					totalAmount: "350.00",
					status: "fully_applied",
					date: "2026-10-09",
				},
				{
					id: "4",
					noteNumber: null,
					noteType: "credit",
					customerName: "Kedai Runcit Pak Ali",
					totalAmount: "48.60",
					status: "draft",
					date: "2026-10-29",
				},
			]}
		/>
	);
}
```

## Use

The Credit & Debit Notes page.

## Props

notes ({id, noteNumber, noteType, customerName, totalAmount, currency, status, date}) and onRowClick(note); className.

- `notes`: `SalesNoteRow[]`
- `onRowClick?`: `(note: SalesNoteRow) => void`. Called with the whole note when its row is opened; omit to leave rows inert.
- `onRowAction?`: `(note: SalesNoteRow) => void`. Called from a row's actions button; omit to hide the button.
- Also accepts `ComponentProps<"div">`.

## Notes

On the table tray, with statuses shown through DocStatus. The note type is a neutral tag with a coloured square: hue goes in the square, never the label. A draft note shows 'Draft' in place of its number. Responsive: built on DataList: a table from 48rem of container width, a stacked card per note below (note number and amount, then type and status, then customer and date).

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/credit-debit-notes.tsx:157-231`.
