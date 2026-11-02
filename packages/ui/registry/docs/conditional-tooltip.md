# ConditionalTooltip

Wraps an element in a tooltip only when `enabled`.

```tsx
import { ConditionalTooltip } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, ConditionalTooltip } from "@cynco-labs/ui";

export default function ConditionalTooltipDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<ConditionalTooltip enabled content="Connect a bank account first">
				<Button variant="primary" disabled>
					Publish
				</Button>
			</ConditionalTooltip>
			<ConditionalTooltip enabled={false} content="">
				<Button variant="secondary">Save draft</Button>
			</ConditionalTooltip>
		</div>
	);
}
```

## Use

Explaining why a control is disabled.

## Props

`enabled`, `content`, one element child.

- `enabled`: `boolean`
- `content`: `ReactNode`
- `children`: `ReactElement`
- `contentClassName?`: `string`

Category: Components · Overlays. Source: `packages/ui/src/base/components/general/conditional-tooltip.tsx`.
