# BillAlerts

The stack of bill alerts: possible duplicate (with Dismiss), rejection notes, unused vendor credit (Apply vendor credit), vendor list load error and corrupted line items.

```tsx
import { BillAlerts } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BillAlerts } from "@cynco-labs/ui";

export default function BillAlertsDemo() {
	return (
		<div className="max-w-[640px]">
			<BillAlerts
				isDuplicate
				duplicateBill={{
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					totalAmount: 612.3,
				}}
				status="rejected"
				rejectionNotes="SST charged at 10% — vendor is not SST-registered. Ask for a corrected invoice."
				unusedCredit={{ amount: 450, currency: "MYR" }}
				vendorLoadError
				lineItemsCorrupted
			/>
		</div>
	);
}
```

## Use

Above the bill form on the bill detail page.

## Props

isDuplicate, duplicateBill, status, rejectionNotes, unusedCredit {amount, currency}, vendorLoadError, lineItemsCorrupted, onDismissDuplicate, onApplyCredit; className and native div props.

## Notes

Responsive by container: each alert's action drops under its text below a 28rem container.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
