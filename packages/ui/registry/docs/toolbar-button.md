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
					className="flex items-center justify-between h-10 px-3 border-b border-table-row-divider last:border-0 text-sm font-medium text-muted-foreground"
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

- `asChild?`: `boolean`. Radix compatibility: render the single child element instead of a `<button>`.
- `isLoading?`: `boolean`. Swaps the label for a spinner and disables the button, while the label stays its accessible name.
- `render?`: `ReactElement`. The element to render instead of a `<button>` (Base UI).
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"primary"`.
- `size?`: `"sm" | "md" | "icon"`. Default `"md"`.
- Also accepts `ComponentProps<"button">`.

## Notes

Always `skeleton`, icon-only; give it an `aria-label`.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/toolbar-button.tsx:7-27`.
