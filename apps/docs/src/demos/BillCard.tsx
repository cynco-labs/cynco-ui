import { BillCard } from "@cynco-labs/ui";
import { useState } from "react";

export default function BillCardDemo() {
	const [selected, setSelected] = useState<string[]>(["b4"]);
	const pick = (id: string) => (on: boolean) => setSelected((ids) => (on ? [...ids, id] : ids.filter((x) => x !== id)));
	return (
		<div className="grid gap-3 sm:grid-cols-2 max-w-[600px]">
			<BillCard
				bill={{
					id: "b1",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					totalAmount: "1284.60",
					currency: "MYR",
					dueDate: "2026-10-24",
					status: "awaiting_payment",
					category: "Utilities",
					overdue: true,
					postedToGl: true,
					aiConfidence: 96,
				}}
				selected={selected.includes("b1")}
				onSelectedChange={pick("b1")}
			/>
			<BillCard
				bill={{
					id: "b2",
					vendorName: "Syarikat Logistik Pantas Sdn Bhd",
					billNumber: "SLP/INV/2026/0918",
					totalAmount: "8450.00",
					paidAmount: "3000.00",
					currency: "MYR",
					dueDate: "2026-11-12",
					status: "partially_paid",
					category: "Freight & delivery",
					postedToGl: true,
				}}
				showStatus
			/>
			<BillCard
				bill={{
					id: "b3",
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					totalAmount: "612.30",
					currency: "MYR",
					dueDate: "2026-11-05",
					status: "in_review",
					category: "Office supplies",
					isDuplicate: true,
					aiConfidence: 71,
				}}
			/>
			<BillCard
				bill={{
					id: "b4",
					vendorName: "Amazon Web Services",
					billNumber: "EUINMY26-1189034",
					totalAmount: "742.18",
					currency: "USD",
					dueDate: "2026-11-02",
					status: "approved",
					category: "Software & hosting",
					postedToGl: false,
				}}
				showStatus
				selected={selected.includes("b4")}
				onSelectedChange={pick("b4")}
			/>
		</div>
	);
}
