import { BillDetailHeader } from "@cynco-labs/ui";

export default function BillDetailHeaderDemo() {
	return (
		<div className="flex flex-col gap-8">
			<BillDetailHeader
				bill={{
					id: "b1",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					issueDate: "2026-10-02",
					dueDate: "2026-10-24",
					totalAmount: "1284.60",
					status: "awaiting_payment",
					overdue: true,
				}}
				receivedVia="bills@inbox.cynco.io"
			/>
			<BillDetailHeader
				bill={{
					id: "b2",
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					issueDate: "2026-09-14",
					dueDate: "2026-10-14",
					totalAmount: "612.30",
					status: "paid",
					isArchived: true,
				}}
				onRestore={() => {}}
			/>
		</div>
	);
}
