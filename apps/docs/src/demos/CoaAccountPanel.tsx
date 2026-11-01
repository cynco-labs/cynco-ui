import { CoaAccountPanel } from "@cynco-labs/ui";

export default function CoaAccountPanelDemo() {
	return (
		<CoaAccountPanel
			className="max-w-96"
			currency="MYR"
			currentBalance={248315.4}
			transactionCount={86}
			lastTransactionAt="2026-10-28"
			account={{
				accountCode: "1000-001",
				accountName: "Maybank Current Account",
				accountType: "asset",
				normalBalance: "debit",
				isActive: true,
				isBankAccount: true,
				isCashAccount: true,
				currency: "MYR",
				isMonetary: true,
				mappingKeywords: ["maybank", "m2u", "duitnow", "ibg"],
			}}
			balanceHistory={[
				{
					period: "2026-10",
					periodDebit: 96420.0,
					periodCredit: 42885.6,
					closingBalance: 248315.4,
				},
			]}
			transactions={[
				{
					id: "t1",
					date: "2026-10-28",
					description: "Receipt INV-2026-0142",
					type: "debit",
					amount: 12720.0,
					source: "Bank feed",
				},
			]}
		/>
	);
}
