import { CustomerStatementMetrics } from "@cynco-labs/ui";

export default function CustomerStatementMetricsDemo() {
	return (
		<CustomerStatementMetrics
			metrics={{
				totalTransactions: 14,
				invoicedAmount: "64246.50",
				collectionRate: 62.4,
				amountReceived: "40096.10",
				creditedAmount: "10746.00",
				debitedAmount: "1250.00",
				balanceDue: "48250.40",
			}}
		/>
	);
}
