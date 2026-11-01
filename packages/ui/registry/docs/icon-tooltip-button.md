# IconTooltipButton

An icon-only button that always carries a tooltip label.

```tsx
import { IconTooltipButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ArrowsClockwiseIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { IconTooltipButton } from "@cynco-labs/ui";

export default function IconTooltipButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconTooltipButton tooltip="Edit" icon={<PencilSimpleIcon size={14} />} />
			<IconTooltipButton tooltip="Refresh" icon={<ArrowsClockwiseIcon size={14} />} />
			<IconTooltipButton tooltip="Delete" disabled icon={<TrashIcon size={14} />} />
		</div>
	);
}
```

## Use

Compact toolbars and row actions where the icon alone is not self-explanatory.

## Props

`tooltip` text, `icon`, `onClick`, optional `disabled`.

## Notes

Every icon-only action should use this (or IconButton + Tooltip) so it has an accessible label.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/icon-tooltip-button.tsx`.
