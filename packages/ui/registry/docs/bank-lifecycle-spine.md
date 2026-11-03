# BankLifecycleSpine

Four stacked dots encoding imported → categorized → posted → reconciled; green when settled, hollow when excluded.

```tsx
import { BankLifecycleSpine } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankLifecycleSpine, type BankFeedStatus } from "@cynco-labs/ui";

const STEPS: [BankFeedStatus, string][] = [
	["imported", "Imported: needs a category"],
	["categorized", "Categorized: ready to post"],
	["posted", "Posted to GL: ready to reconcile"],
	["reconciled", "Reconciled"],
	["excluded", "Excluded"],
];

export default function BankLifecycleSpineDemo() {
	return (
		<ul className="flex flex-col gap-2.5">
			{STEPS.map(([status, label]) => (
				<li key={status} className="flex items-center gap-3">
					<BankLifecycleSpine status={status} />
					<span className="text-sm text-foreground">{label}</span>
				</li>
			))}
		</ul>
	);
}
```

## Use

At the start of every feed row; its horizontal aggregate is the settled meter in the account rail.

## Props

status ('imported' | 'categorized' | 'posted' | 'reconciled' | 'excluded'), className and native props (spread on the root).

- `status`: `"posted" | "imported" | "categorized" | "reconciled" | "excluded"`
- Also accepts `ComponentProps<"span">`.

## Notes

Fixed 4×4px glyph, width-independent.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
