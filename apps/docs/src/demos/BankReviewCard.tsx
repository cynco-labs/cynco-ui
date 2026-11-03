import { BankReviewCard, type BankTxEvent } from "@cynco-labs/ui";

const EVENTS: BankTxEvent[] = [
	{
		actor: "system",
		action: "import",
		at: "2026-10-28",
		reasoning: "Imported from Maybank statement Oct 2026",
	},
	{
		actor: "rule",
		action: "categorize",
		at: "2026-10-28",
		reasoning: "Rule “GRAB” matched the payee",
		ruleStats: { applied: 46, overridden: 3 },
	},
	{
		actor: "ai",
		action: "categorize",
		at: "2026-10-28",
		reasoning: "Ride-hailing in Kuala Lumpur reads as staff travel",
		confidence: 0.72,
	},
	{
		actor: "policy",
		action: "auto_post",
		at: "2026-10-29",
		reasoning: "Held for review",
		policy: "Auto-post needs 90% confidence; this suggestion is 72%.",
	},
];

export default function BankReviewCardDemo() {
	return (
		<div className="flex flex-col gap-2">
			<BankReviewCard
				onAcceptSuggestion={() => {}}
				onChooseCategory={() => {}}
				onChangeCategory={() => {}}
				onExclude={() => {}}
				onSkip={() => {}}
				active
				accountName="CIMB Business"
				events={EVENTS}
				tx={{
					payeeName: "Grab Malaysia",
					description: "GRABPAY*RIDE KL",
					date: "2026-10-28",
					type: "debit",
					amount: 38.5,
					suggestion: { accountCode: "6510", accountName: "Travel & Transport", confidence: 0.72 },
				}}
			/>
			<BankReviewCard
				onAcceptSuggestion={() => {}}
				onChooseCategory={() => {}}
				onChangeCategory={() => {}}
				onExclude={() => {}}
				onSkip={() => {}}
				accountName="Maybank Current"
				tx={{
					payeeName: "Mydin Mohamed Holdings",
					description: "POS MYDIN USJ",
					date: "2026-10-27",
					type: "debit",
					amount: 412.65,
					suggestion: null,
				}}
			/>
		</div>
	);
}
