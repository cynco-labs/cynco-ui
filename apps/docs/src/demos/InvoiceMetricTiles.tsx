import { InvoiceMetricTiles } from "@cynco-labs/ui";

export default function InvoiceMetricTilesDemo() {
	return (
		<InvoiceMetricTiles
			currency="MYR"
			stats={{
				totalValue: "184520.75",
				paidValue: "126310.40",
				pendingValue: "46890.35",
				overdueValue: "11320.00",
				overdueCount: 3,
			}}
			onShowOverdue={() => {}}
		/>
	);
}
