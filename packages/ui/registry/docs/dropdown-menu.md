# DropdownMenu

Base UI menu: items with icons, shortcuts, checkbox/radio items, submenus and a destructive variant.

```tsx
import { DropdownMenu } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CopyIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
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

## Notes

A `DropdownMenuLabel` must sit inside a `DropdownMenuGroup`. Destructive items go last, after a separator.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/dropdown-menu.tsx`.
