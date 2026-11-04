# MarkAsPaidDialog

Records a manual payment against an invoice: a fact block (customer, invoice, amount, balance to record), payment date, payment method chips, the 'Deposited to' bank account, a note, an offline-payment warning and confirm, plus a 'Payment recorded' success state.

```tsx
import { MarkAsPaidDialog } from "@cynco-labs/ui";
```

## Usage

```tsx
import { MarkAsPaidDialog } from "@cynco-labs/ui";

export default function MarkAsPaidDialogDemo() {
	return (
		<MarkAsPaidDialog
			defaultOpen
			modal={false}
			invoice={{
				invoiceNumber: "INV-2026-0139",
				customerName: "Nusantara Logistik Bhd",
				total: "28400.00",
				paidAmount: "10000.00",
				currency: "MYR",
			}}
			paymentDate="2026-10-30"
			defaultPaymentMethod="bank_transfer"
			defaultBankAccount="1000-001"
			bankAccounts={[
				{ accountCode: "1000-001", accountName: "Maybank Current Account" },
				{ accountCode: "1000-002", accountName: "CIMB Business Account" },
			]}
		/>
	);
}
```

## Use

From an invoice's Mark as paid action, for payments received offline.

## Props

open, defaultOpen, modal, onOpenChange, invoice ({invoiceNumber, customerName, total, paidAmount, currency}), paymentDate, paymentMethod / defaultPaymentMethod / onPaymentMethodChange, bankAccounts ({accountCode, accountName}), bankAccount / defaultBankAccount / onBankAccountChange, note / defaultNote / onNoteChange, isSubmitting, showSuccess, onConfirm; className (merged onto the dialog panel).

- `invoice`: `{ invoiceNumber: string; customerName: string; total: Amount; currency?: string; paidAmount?: Amount }`
- `open?`: `boolean`
- `defaultOpen?`: `boolean`
- `modal?`: `boolean`. Default `true`.
- `onOpenChange?`: `(open: boolean) => void`
- `paymentDate?`: `string`
- `paymentMethod?`: `"card" | "other" | "bank_transfer" | "cash" | "cheque" | "e_wallet"`. The chosen payment method. Pass it to control the chips.
- `defaultPaymentMethod?`: `"card" | "other" | "bank_transfer" | "cash" | "cheque" | "e_wallet"`. Default `"bank_transfer"`.
- `onPaymentMethodChange?`: `(method: PaymentMethod) => void`
- `bankAccounts?`: `SalesBankAccount[]`. Default `[]`.
- `bankAccount?`: `string | null`. The account code the payment lands in, or null for none chosen. Pass it to control the select.
- `defaultBankAccount?`: `string | null`. Default `null`.
- `onBankAccountChange?`: `(accountCode: string | null) => void`
- `note?`: `string`. The note on the payment. Pass it to control the field.
- `defaultNote?`: `string`. Default `""`.
- `onNoteChange?`: `(note: string) => void`
- `showSuccess?`: `boolean`. Default `false`.
- `isSubmitting?`: `boolean`. Default `false`.
- `onConfirm?`: `(p: { method: PaymentMethod; bankAccount: string | null; note: string }) => void`

## Notes

Dialog and DialogContent, with the fact block on bg-table-tray and sections divided by table-row-divider. The warning is Alert variant="warning", and bank accounts show their mono account code. Confirm is the primary Button, and it is disabled with no date or when a bank account is required but not chosen. Responsive: The fact block stacks its labels above the values in a narrow dialog, the method chips wrap, and the panel scrolls within the viewport.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/invoice-actions.tsx:113-363`.
