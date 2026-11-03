# KeyValueList

A label/value list: side by side when there's room, label above value below 16rem.

```tsx
import { KeyValueList } from "@cynco-labs/ui";
```

## Usage

```tsx
import { KeyValueList, formatCurrency } from "@cynco-labs/ui";

const items = [
	{ label: "Subtotal", value: formatCurrency(12000) },
	{ label: "Discount (5%)", value: "−" + formatCurrency(600), negative: true },
	{ label: "SST (8%)", value: formatCurrency(912) },
	{ label: "Total", value: formatCurrency(12312), strong: true },
];

export default function KeyValueListDemo() {
	return (
		<div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
			<div className="rounded-xl border bg-card px-4">
				<KeyValueList items={items} />
			</div>
			<div className="max-w-[200px] rounded-xl border border-dashed px-3">
				<KeyValueList items={items} />
			</div>
		</div>
	);
}
```

## Use

Totals blocks, document detail rails, payment summaries.

## Props

items ({label, value, negative, strong}), className.

- `items`: `Array<{ label: ReactNode; value: ReactNode; negative?: boolean; strong?: boolean }>`
- Also accepts `ComponentProps<"dl">`.

## Notes

Values are tabular-nums and right-aligned; negative uses text-error-text, strong makes a total row.

Category: Layout · Primitives. Source: `packages/ui/src/layout/index.tsx`.
