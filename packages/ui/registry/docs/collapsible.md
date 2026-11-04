# Collapsible

Show/hide a region with a trigger.

```tsx
import { Collapsible } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@cynco-labs/ui";
import { CaretDownIcon } from "@phosphor-icons/react";

export default function CollapsibleDemo() {
	return (
		<Collapsible defaultOpen className="max-w-[360px] flex flex-col gap-2">
			<CollapsibleTrigger render={<Button variant="skeleton" />}>
				<CaretDownIcon size={12} />
				Advanced settings
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="text-sm font-medium text-muted-foreground rounded-lg border bg-card p-3">
					Auto-number invoices from INV-2026-0001.
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
```

## Use

"Advanced settings" and similar disclosures.

## Props

`open`/`defaultOpen`, `CollapsibleTrigger` (with `render`), `CollapsibleContent`.

- `asChild?`: `boolean`
- Also accepts `CollapsiblePrimitive.Root.Props`.

## Accessibility

The component is a thin pass-through to the Base UI collapsible, with data-slot names on the root, trigger and panel and no aria, label or sr-only text of its own. The trigger's own content is therefore its accessible name.

Category: Components · Navigation. Source: `packages/ui/src/base/components/ui/collapsible.tsx:4-14`.
