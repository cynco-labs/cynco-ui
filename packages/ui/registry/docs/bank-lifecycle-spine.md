# BankLifecycleSpine

Four stacked dots encoding imported → categorized → posted → reconciled; green when settled, hollow when excluded.

```tsx
import { BankLifecycleSpine } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankLifecycleSpine } from "@cynco-labs/ui";

export default function BankLifecycleSpineDemo() {
	const labels = {
		imported: "Imported: needs a category",
		categorized: "Categorized: ready to post",
		posted: "Posted to GL: ready to reconcile",
		reconciled: "Reconciled",
		excluded: "Excluded",
	};
	return (
		<ul className="flex flex-col gap-2.5">
			{Object.keys(labels).map((s) => (
				<li key={s} className="flex items-center gap-3">
					<BankLifecycleSpine status={s} />
					<span className="text-[13px] text-foreground">{labels[s]}</span>
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

## Notes

Fixed 4×4px glyph, width-independent.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
