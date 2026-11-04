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
			billAmount={"8450.00"}
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

billAmount, paidAmount, currency, bankAccounts {id, accountCode, accountName}, open / defaultOpen / onOpenChange, defaultDate, disabled, onSubmit; className (trigger button), contentClassName (sheet panel).

- `billAmount`: `Amount`
- `bankAccounts`: `CyncoBankAccount[]`
- `paidAmount?`: `Amount`. Default `0`.
- `currency?`: `string`. Default `"MYR"`.
- `open?`: `boolean`. Whether the sheet is open (controlled).
- `defaultOpen?`: `boolean`. Whether the sheet starts open when uncontrolled. Default `false`.
- `onOpenChange?`: `(open: boolean) => void`
- `defaultDate?`: `string`. YYYY-MM-DD; defaults to today.
- `disabled?`: `boolean`
- `onSubmit?`: `(data: { paymentDate: string; paymentAmount: string; /** `null` when the method was left unspecified. */ paymentMethod: PaymentMethod | null; paymentReference?: string; bankAccountId: string; notes?: string }) => void`
- `contentClassName?`: `string`. Classes for the sheet panel.

## Notes

Fields use a text-sm font-medium label with Input, Select and Textarea, and a ShortcutButton (⌘/Ctrl ↵) submits, following the long-form-in-a-Sheet rule. Account codes show in mono inside the select. A payment method or bank account that was never chosen is null, not a sentinel string. Responsive: the sheet goes full width on phones; the summary uses KeyValueList.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties/record-payment.tsx:96-308`.
