# BankReviewCard

One line in the review queue with its AI suggestion and confidence ring, Change / Exclude / Skip, and the why-timeline when active.

```tsx
import { BankReviewCard } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

The keyboard review mode for uncategorised lines.

## Props

tx {payeeName, description, date, type, amount, suggestion}, accountName, active, picking, events, className and native props (spread on the root).

- `tx`: `Pick<BankFeedTransaction, "payeeName" | "description" | "date" | "type" | "amount" | "currency" | "suggestion">`
- `accountName?`: `string`
- `active?`: `boolean`. Default `false`.
- `picking?`: `boolean`. Default `false`.
- `events?`: `BankTxEvent[]`
- `onAcceptSuggestion?`: `() => void`. Called when the user accepts the AI-suggested category.
- `onChooseCategory?`: `() => void`. Called when the user clicks "Choose category".
- `onChangeCategory?`: `() => void`. Called when the user clicks "Change" to pick a different category; omit to hide the button.
- `onExclude?`: `() => void`. Called when the user clicks "Exclude"; omit to hide the button.
- `onSkip?`: `() => void`. Called when the user clicks "Skip"; omit to hide the button.
- Also accepts `ComponentProps<"div">`.

## Notes

Active card gets border-primary/45 on bg-interactive-secondary; inactive cards sit on bg-card. Responsive by container: payee wraps to two lines and actions wrap under the suggestion when narrow.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/review-card.tsx:15-148`.
