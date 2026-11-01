import { BankMonthClose } from "@cynco-labs/ui";

export default function BankMonthCloseDemo() {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<BankMonthClose
				monthName="April"
				state="ready"
				fiscalStatus="open"
				checks={[
					{
						id: "c1",
						label: "Bank reconciliation complete",
						status: "pass",
						text: "Every bank line to 30 Apr is reconciled or excluded.",
					},
					{
						id: "c2",
						label: "Bank ties to the ledger",
						status: "warn",
						text: "Hong Leong Savings is RM 210.00 off 1000-004 at 30 Apr.",
						figures: "Statement 48,210.00 − unposted 0.00 = 48,210.00 · ledger 48,420.00",
					},
				]}
			/>
			<BankMonthClose
				monthName="March"
				state="ready"
				standing="holds"
				signedOffLabel="Signed off by Aisyah Rahman · 3 Apr 2026"
				fiscalStatus="closing"
				checks={[
					{ id: "c1", label: "Bank reconciliation complete", status: "pass" },
					{
						id: "c2",
						label: "Bank ties to the ledger",
						status: "pass",
						text: "All 3 bank accounts tie at 31 Mar.",
					},
				]}
			/>
		</div>
	);
}
