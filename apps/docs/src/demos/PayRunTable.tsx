import { PayRunTable } from "@cynco-labs/ui";

export default function PayRunTableDemo() {
	return (
		<PayRunTable
			today="2026-10-30"
			defaultScheduledDate="2026-11-03"
			defaultSelectedIds={["p1", "p2", "p4"]}
			bankAccounts={[
				{ id: "acc_1", accountCode: "1000-001", accountName: "Maybank Current Account" },
				{ id: "acc_2", accountCode: "1000-002", accountName: "CIMB Business Account" },
			]}
			bills={[
				{
					id: "p1",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					dueDate: "2026-10-24",
					totalAmount: "1284.60",
					status: "awaiting_payment",
					overdue: true,
				},
				{
					id: "p2",
					vendorName: "Kenanga Legal Chambers",
					billNumber: "KLC-2026-047",
					dueDate: "2026-11-20",
					totalAmount: "5800.00",
					status: "approved",
				},
				{
					id: "p3",
					vendorName: "Syarikat Logistik Pantas Sdn Bhd",
					billNumber: "SLP/INV/2026/0918",
					dueDate: "2026-11-12",
					totalAmount: "8450.00",
					paidAmount: "3000.00",
					status: "partially_paid",
				},
				{
					id: "p4",
					vendorName: "Telekom Malaysia Berhad",
					billNumber: "TM-1102938",
					dueDate: "2026-11-08",
					totalAmount: "389.00",
					status: "scheduled",
					scheduledPaymentDate: "2026-11-06",
				},
				{
					id: "p5",
					vendorName: "Petronas Dagangan Bhd",
					billNumber: "PDB-FLT-88213",
					dueDate: "2026-11-14",
					totalAmount: "2318.45",
					status: "awaiting_payment",
				},
			]}
		/>
	);
}
