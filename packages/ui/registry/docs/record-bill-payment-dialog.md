# RecordBillPaymentDialog

Record payment button and right-side sheet: bill total / outstanding summary, Payment Amount (validated against outstanding), date, method, Bank / Cash Account, reference and notes, with Confirm payment.

```tsx
import { RecordBillPaymentDialog } from "@cynco-labs/ui";
```

## Usage

```tsx
import { RecordBillPaymentDialog } from "@cynco-labs/ui";

export default function RecordBillPaymentDialogDemo() {
	return (
		<RecordBillPaymentDialog
			billAmount={8450}
			paidAmount={3000}
			currency="MYR"
			defaultDate="2026-10-30"
			bankAccounts={[
				{ id: "acc_1", accountCode: "1000-001", accountName: "Maybank Current Account" },
				{ id: "acc_2", accountCode: "1000-002", accountName: "CIMB Business Account" },
				{ id: "acc_3", accountCode: "1010-001", accountName: "Petty Cash" },
			]}
		/>
	);
}
```

## Use

Recording a full or partial payment against an approved bill.

## Props

billAmount, paidAmount, currency, bankAccounts {id, accountCode, accountName}, defaultOpen, defaultDate, disabled, onSubmit; className (trigger button), contentClassName (sheet panel).

- `billAmount`: `Amount`
- `bankAccounts`: `CyncoBankAccount[]`
- `paidAmount?`: `Amount`. Default `0`.
- `currency?`: `string`. Default `"MYR"`.
- `defaultOpen?`: `boolean`. Default `false`.
- `defaultDate?`: `string`. YYYY-MM-DD; defaults to today.
- `disabled?`: `boolean`
- `onSubmit?`: `(data: { paymentDate: string; paymentAmount: string; paymentMethod?: string; paymentReference?: string; bankAccountId: string; notes?: string }) => void`
- `contentClassName?`: `string`. Classes for the sheet panel.

## Notes

Fields use text-form-label with Input, Select and Textarea, and a ShortcutButton (⌘/Ctrl ↵) submits, following the long-form-in-a-Sheet rule. Account codes show in mono inside the select. Responsive: the sheet goes full width on phones; the summary uses KeyValueList.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
