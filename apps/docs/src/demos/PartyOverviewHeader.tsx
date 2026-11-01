import { PartyOverviewHeader } from "@cynco-labs/ui";

export default function PartyOverviewHeaderDemo() {
	return (
		<PartyOverviewHeader
			role="customer"
			name="Kedai Runcit Mesra Sdn Bhd"
			balance={48250.4}
			overdue={12680}
			overdueSince="2026-08-15"
			openCount={7}
			trendTotal={186420.75}
			paymentTerms="Net 30"
			category="Retail"
			since="2024-03-11"
		/>
	);
}
