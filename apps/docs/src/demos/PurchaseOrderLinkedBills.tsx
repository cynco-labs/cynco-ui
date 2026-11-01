import { PurchaseOrderLinkedBills } from "@cynco-labs/ui";

export default function PurchaseOrderLinkedBillsDemo() {
	return (
		<div className="max-w-[460px]">
			<PurchaseOrderLinkedBills
				bills={[
					{
						id: "b1",
						billNumber: "BILL-2026-0311",
						status: "paid",
						totalAmount: "5520.00",
						issueDate: "2026-10-02",
					},
					{
						id: "b2",
						billNumber: "BILL-2026-0327",
						status: "awaiting_payment",
						totalAmount: "1802.00",
						issueDate: "2026-10-19",
					},
					{ id: "b3", billNumber: null, status: "draft", totalAmount: null, issueDate: null },
				]}
			/>
		</div>
	);
}
