import { QuotationStats } from "@cynco-labs/ui";

export default function QuotationStatsDemo() {
	return (
		<QuotationStats
			stats={{
				totalQuotedAmount: "248650.00",
				currency: "MYR",
				sentCount: 14,
				acceptedCount: 9,
				conversionRate: 37.5,
			}}
		/>
	);
}
