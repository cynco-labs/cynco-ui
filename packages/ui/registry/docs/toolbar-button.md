# ToolbarButton

The 20px vertical-ellipsis button that opens a table row's actions menu.

```tsx
import { ToolbarButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ToolbarButton } from "@cynco-labs/ui";

export default function ToolbarButtonDemo() {
	return (
		<div className="max-w-[420px] flex flex-col rounded-lg border bg-table-surface">
			{["Pro", "Enterprise"].map((n) => (
				<div
					key={n}
					className="flex items-center justify-between h-10 px-3 border-b border-table-row-divider last:border-0 text-body"
				>
					{n}
					<ToolbarButton aria-label="Row actions" />
				</div>
			))}
		</div>
	);
}
```

## Use

Last cell of a table row, as the trigger of a DropdownMenu.

## Props

Button props (usually via `DropdownMenuTrigger render`). Clicks stop propagation so the row click does not fire.

## Notes

Always `skeleton`, icon-only; give it an `aria-label`.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/toolbar-button.tsx`.
