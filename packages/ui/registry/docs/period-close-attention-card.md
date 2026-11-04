# PeriodCloseAttentionCard

A check Cynco could not verify: what is wrong, on which accounts, why it matters, links to fix it, and the closer's note for the close record.

```tsx
import { PeriodCloseAttentionCard } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Inside a Needs attention check of the close checklist (also rendered there automatically).

## Props

card { key, title, accounts?: [{ code, name }], why, risk, fixes?: [{ label }], fallback? }, note? / defaultNote? / onNoteChange?, className? (merged on the root) and native props.

- `card`: `CloseAttentionCard`
- `note?`: `string`. Controlled note.
- `defaultNote?`: `string`. Initial note for uncontrolled use. Default `""`.
- `onNoteChange?`: `(n: string) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Fix links are primary-coloured with the external-link glyph; the note is a Textarea on the shared input surface. Label switches to "Acknowledged. Note for the close record" once a note is typed. Responsive: Text and fix links wrap at any width.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger/period-close.tsx:271-285`.
