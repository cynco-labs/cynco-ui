import { BankLedgerHeader } from "@cynco-labs/ui";

export default function BankLedgerHeaderDemo() {
	return (
		<BankLedgerHeader
			account={{
				name: "Maybank Current Account",
				number: "•••• 4417",
				glCode: "1000-001",
				institutionName: "Malayan Banking Berhad",
				currency: "MYR",
			}}
			month="2026-10"
			tieOut={{ status: "off", difference: -1240.0 }}
			bookBalance={198465.0}
			statement={{ date: "2026-10-28", balance: 197225.0, unreconciledDifference: -1240.0 }}
			notCounted={[
				{
					label: "2 USD lines not counted",
					title: "2 lines in USD this month carry no MYR amount, so the balance leaves them out.",
				},
			]}
			transactionCount={48}
			credits={96420.0}
			debits={80355.0}
			canNext={false}
		/>
	);
}
