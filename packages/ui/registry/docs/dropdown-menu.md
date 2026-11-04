# DropdownMenu

Base UI menu: items with icons, shortcuts, checkbox/radio items, submenus and a destructive variant.

```tsx
import { DropdownMenu } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@cynco-labs/ui";
import { CopyIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";

export default function DropdownMenuDemo() {
	return (
		<DropdownMenu defaultOpen modal={false}>
			<DropdownMenuTrigger render={<Button variant="secondary" />}>Actions</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-52">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Invoice</DropdownMenuLabel>
					<DropdownMenuItem>
						<PencilSimpleIcon size={14} />
						Edit details
					</DropdownMenuItem>
					<DropdownMenuItem shortcut="C">
						<CopyIcon size={14} />
						Copy invoice no.
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">
					<TrashIcon size={14} />
					Delete customer
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
```

## Use

Row actions and overflow menus.

## Props

`DropdownMenuTrigger` (with `render`), `DropdownMenuContent`, `DropdownMenuItem` (`variant`, `shortcut`, `isLoading`), `DropdownMenuGroup` › `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuSub`.

## Accessibility

| Key | Does |
| --- | --- |
| An item's shortcut key | Runs that item and closes the menu, unless focus is in an input, a textarea or a contenteditable element. |
| A to Z | Falls through to the Base UI menu's own typeahead when no item shortcut matches the key. |

Focus returns to the trigger when the menu closes, which is why the Radix onCloseAutoFocus prop is accepted and ignored. Checkbox and radio items draw their state with a check icon from the Base UI indicator, and a DropdownMenuLabel only names its group when it sits inside a DropdownMenuGroup. An item that is loading or shimmering is disabled.

## Notes

A `DropdownMenuLabel` must sit inside a `DropdownMenuGroup`. Destructive items go last, after a separator.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/dropdown-menu.tsx:53-77`.
