import { useState } from "react";
import { BillsBoard } from "@cynco-labs/ui";

export default function BillsBoardDemo() {
	const [s, setS] = useState(["b5"]);
	return (
		<BillsBoard
			onPaidFilterClick={() => {}}
			columns={["in_review", "awaiting_payment"]}
			selectedIds={s}
			onToggleBill={(id) => {
				setS(s.indexOf(id) >= 0 ? s.filter((x) => x !== id) : s.concat([id]));
			}}
			bills={[
				{
					id: "b1",
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					totalAmount: 612.3,
					dueDate: "2026-11-05",
					status: "in_review",
					category: "Office supplies",
					aiConfidence: 94,
				},
				{
					id: "b2",
					vendorName: "Petronas Dagangan Bhd",
					billNumber: "PDB-FLT-88213",
					totalAmount: 2318.45,
					dueDate: "2026-11-14",
					status: "in_review",
					category: "Fuel",
					aiConfidence: 88,
				},
				{
					id: "b3",
					vendorName: "Kenanga Legal Chambers",
					billNumber: "KLC-2026-047",
					totalAmount: 5800,
					dueDate: "2026-11-20",
					status: "pending_approval",
					category: "Professional fees",
				},
				{
					id: "b4",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					totalAmount: 1284.6,
					dueDate: "2026-10-24",
					status: "awaiting_payment",
					category: "Utilities",
					overdue: true,
					postedToGl: true,
				},
				{
					id: "b5",
					vendorName: "Syarikat Logistik Pantas Sdn Bhd",
					billNumber: "SLP/INV/2026/0918",
					totalAmount: 8450,
					paidAmount: 3000,
					dueDate: "2026-11-12",
					status: "partially_paid",
					category: "Freight & delivery",
					postedToGl: true,
				},
			]}
		/>
	);
}
