# Command

cmdk command palette: search input, grouped items, shortcuts, footer hints.

```tsx
import { Command } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ReceiptIcon, UserIcon } from "@phosphor-icons/react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@cynco-labs/ui";

export default function CommandDemo() {
	return (
		<Command className="max-w-[420px] rounded-lg border">
			<CommandInput placeholder="Search invoices, customers…" />
			<CommandList>
				<CommandEmpty>No results.</CommandEmpty>
				<CommandGroup heading="Invoices">
					<CommandItem>
						<ReceiptIcon size={14} />
						INV-2026-0142
					</CommandItem>
					<CommandItem>
						<ReceiptIcon size={14} />
						INV-2026-0141
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Customers">
					<CommandItem>
						<UserIcon size={14} />
						Nusantara Logistik Bhd<CommandShortcut>↵</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
```

## Use

The ⌘K palette (`CommandDialog`, sizes `default` · `compact`) and searchable lists inside popovers.

## Props

`CommandInput`, `CommandList` › `CommandEmpty`, `CommandGroup heading`, `CommandItem`, `CommandShortcut`, `CommandSeparator`, `CommandFooter`/`CommandHint`/`CommandKbd`.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/command.tsx`.
