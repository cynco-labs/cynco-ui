import { ItemStatsRow } from "@cynco-labs/ui";

export default function ItemStatsRowDemo() {
	return (
		<ItemStatsRow
			stats={{
				avgProfitMargin: 34.5,
				avgRevenuePerItem: 1842.6,
				highestEarningItem: { name: "Kopi O Kaw 1kg", revenue: 28800 },
				mostSoldItem: { name: "Cold brew bottle 250ml", quantity: 4200 },
			}}
			realizedMargins={{ marginPercent: 31.84, lineCount: 212, belowCostItemCount: 2 }}
		/>
	);
}
