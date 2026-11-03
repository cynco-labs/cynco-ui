import { type BankTxEvent, BankTransactionTimeline } from "@cynco-labs/ui";

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

export default function BankTransactionTimelineDemo() {
	return (
		<div className="max-w-[520px] rounded-xl border border-border bg-card p-4">
			<BankTransactionTimeline
				events={EVENTS.concat([{ actor: "user", action: "post", at: "2026-10-29" }])}
			/>
		</div>
	);
}
