# BankMatchReview

Proposed matches of a bank line to an invoice or bill: target and mono reference, match % or Confirmed, evidence, what accepting does, and Accept / Reject.

```tsx
import { BankMatchReview } from "@cynco-labs/ui";
```

## Usage

```tsx
import { type BankMatch, BankMatchReview } from "@cynco-labs/ui";

const MATCH_INV: BankMatch = {
	id: "m1",
	targetLabel: "Invoice · TechNova Solutions Sdn Bhd",
	targetReference: "INV-2026-0142",
	confidence: 0.94,
	status: "proposed",
	evidence: [
		"Amount equal (RM 12,720.00)",
		"Reference INV-2026-0142 in description",
		"Paid 2 days after due date",
	],
	consequence:
		"Accepting records the receipt against INV-2026-0142 and marks it Paid. The line posts to 1200-001 Trade Receivables instead of a revenue account.",
};

const MATCH_BILL: BankMatch = {
	id: "m2",
	targetLabel: "Bill · Tenaga Nasional Berhad",
	targetReference: "BILL-2026-0088",
	confidence: 0.81,
	status: "proposed",
	evidence: ["Amount equal (RM 1,184.30)", "Payee matches supplier", "Within 3 days of bill date"],
	consequence: "Accepting settles BILL-2026-0088 and posts the line to 2100-001 Trade Payables.",
};

export default function BankMatchReviewDemo() {
	return (
		<div className="flex flex-col gap-3">
			<BankMatchReview
				line={{
					date: "2026-10-29",
					payee: "TechNova Solutions Sdn Bhd",
					description: "IBG CR INV-2026-0142",
					amount: 12720,
					type: "credit",
				}}
				matches={[
					MATCH_INV,
					Object.assign({}, MATCH_BILL, {
						id: "m3",
						targetLabel: "Invoice · TechNova Solutions Sdn Bhd",
						targetReference: "INV-2026-0139",
						confidence: 0.61,
						evidence: ["Amount within RM 5.00", "Same customer"],
						consequence: "Accepting records the receipt against INV-2026-0139.",
					}),
				]}
				pendingId={null}
			/>
			<BankMatchReview
				matches={[Object.assign({}, MATCH_BILL, { status: "confirmed" })]}
				error="INV-2026-0139 was voided after this match was proposed. Refresh the feed and try again."
			/>
		</div>
	);
}
```

## Use

Under a feed row with matches, or standalone with the bank line as its header.

## Props

matches [{id, targetLabel, targetReference, confidence, status, evidence[], consequence}], line? {date, payee, description, amount, type}, pendingId, error, onAccept, onReject, className and native props (spread on the root).

- `matches`: `BankMatch[]`
- `line?`: `BankLineSummary`
- `pendingId?`: `string | null`
- `error?`: `string | null`
- `onAccept?`: `(id: string) => void`
- `onReject?`: `(id: string) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: Accept / Reject drop under the evidence below 28rem; the bank-line header wraps.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
