import { BillAlerts } from "@cynco-labs/ui";

export default function BillAlertsDemo() {
	return (
		<div className="max-w-[640px]">
			<BillAlerts
				isDuplicate
				duplicateBill={{
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					totalAmount: "612.30",
				}}
				status="rejected"
				rejectionNotes="SST charged at 10% — vendor is not SST-registered. Ask for a corrected invoice."
				unusedCredit={{ amount: "450.00", currency: "MYR" }}
				vendorLoadError
				lineItemsCorrupted
			/>
		</div>
	);
}
