import { BankMonthProof } from "@cynco-labs/ui";

export default function BankMonthProofDemo() {
	return (
		<div className="flex flex-col gap-6">
			<BankMonthProof
				monthName="September"
				asOf="30 Sep"
				statementClosing={207985.25}
				unpostedNet={3120.4}
				inTransit={{ count: 2, net: -1500 }}
				ledger={206364.85}
				link={{ kind: "linked", code: "1000-001", name: "Maybank Current" }}
			/>
			<BankMonthProof
				monthName="June"
				asOf="30 Jun 2026"
				statementClosing={96210}
				unpostedNet={0}
				ledger={96710}
				link={{ kind: "linked", code: "1000-002", name: "CIMB Business" }}
			/>
		</div>
	);
}
