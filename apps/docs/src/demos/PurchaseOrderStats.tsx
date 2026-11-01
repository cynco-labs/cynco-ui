import { PurchaseOrderStats } from "@cynco-labs/ui";

export default function PurchaseOrderStatsDemo() {
	return (
		<PurchaseOrderStats
			stats={[
				{ status: "draft", count: 4, total: "18240.00" },
				{ status: "pending_approval", count: 2, total: "9600.00" },
				{ status: "approved", count: 11, total: "84215.50" },
				{ status: "received", count: 23, total: "162480.00" },
			]}
		/>
	);
}
