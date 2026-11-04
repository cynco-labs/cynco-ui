# BankTransactionTimeline

The glass-box reasoning trail for one bank line — rule match, AI suggestion, policy hold, user action — newest first.

```tsx
import { BankTransactionTimeline } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankTransactionTimeline, type BankTxEvent } from "@cynco-labs/ui";

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
			<BankTransactionTimeline events={EVENTS.concat([{ actor: "user", action: "post", at: "2026-10-29" }])} />
		</div>
	);
}
```

## Use

In the review card, import review and ledger detail, so the explanation reads the same everywhere.

## Props

events [{actor: rule|ai|policy|system|user, action, at, reasoning, confidence, ruleStats, policy}], className and native props (spread on the root).

- `events`: `BankTxEvent[]`
- Also accepts `ComponentProps<"ul">`.

## Notes

Actor icons are Phosphor at 14px; AI uses text-primary, others the text steps; dates via formatDate. Responsive by container: below 24rem the date moves under each event.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/timeline.tsx:45-89`.
