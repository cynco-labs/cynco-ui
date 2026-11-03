import { PeriodCloseAttentionCard } from "@cynco-labs/ui";

export default function PeriodCloseAttentionCardDemo() {
	return (
		<PeriodCloseAttentionCard
			card={{
				key: "k1",
				title: "No bank balance for this period",
				accounts: [{ code: "1000-002", name: "CIMB Business Account" }],
				why: "The feed for CIMB Business Account has no balance dated to this period, so there is no bank figure to compare.",
				risk: "This bank balance was not checked against the ledger.",
				fixes: [{ label: "Upload a statement", href: "/banking/statements" }, { label: "Reconnect the bank feed" }],
			}}
		/>
	);
}
