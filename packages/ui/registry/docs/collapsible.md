# Collapsible

Show/hide a region with a trigger.

```tsx
import { Collapsible } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CaretDownIcon } from "@phosphor-icons/react";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@cynco-labs/ui";

export default function CollapsibleDemo() {
	return (
		<Collapsible defaultOpen className="max-w-[360px] flex flex-col gap-2">
			<CollapsibleTrigger render={<Button variant="skeleton" />}>
				<CaretDownIcon size={12} />
				Advanced settings
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="text-body rounded-lg border bg-card p-3">
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

Category: Components · Navigation. Source: `packages/ui/src/base/components/ui/collapsible.tsx`.
