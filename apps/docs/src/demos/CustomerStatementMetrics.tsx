import { CustomerStatementMetrics } from "@cynco-labs/ui";

export default function CustomerStatementMetricsDemo() {
	return (
		<CustomerStatementMetrics
			metrics={{
				totalTransactions: 14,
				invoicedAmount: 64246.5,
				collectionRate: 62.4,
				amountReceived: 40096.1,
				creditedAmount: 10746,
				debitedAmount: 1250,
				balanceDue: 48250.4,
			}}
		/>
	);
}
