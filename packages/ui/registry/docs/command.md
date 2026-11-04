# Command

cmdk command palette: search input, grouped items, shortcuts, footer hints.

```tsx
import { Command } from "@cynco-labs/ui";
```

## Usage

```tsx
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
import { ReceiptIcon, UserIcon } from "@phosphor-icons/react";

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

`CommandInput`, `CommandList` › `CommandEmpty`, `CommandGroup heading`, `CommandItem`, `CommandShortcut`, `CommandSeparator`, `CommandFooter`/`CommandHint`/`CommandKbd`. `CommandDialog` takes the dialog's `open` / `defaultOpen` / `onOpenChange` / `modal`, forwards `value`, `onValueChange`, `filter`, `shouldFilter`, `loop` and `label` to the `Command` it owns, and spreads everything else on the dialog panel.

## Accessibility

CommandDialog renders a DialogTitle and DialogDescription sr-only inside the popup, defaulting to Command Palette and Search for a command to run, so the dialog is named for as long as it is open. The list takes that same title as its label. CommandInput points aria-activedescendant at the option the list highlights at every moment, the first render included, so Enter never runs a row that was not read out. The search icon is aria-hidden, and so is every CommandSeparator, because cmdk would otherwise place a separator role inside the listbox.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/command.tsx:15-26`.
