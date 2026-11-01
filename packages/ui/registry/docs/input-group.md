# InputGroup

An input with addons — icons, text, buttons — inside one bordered field.

```tsx
import { InputGroup } from "@cynco-labs/ui";
```

## Usage

```tsx
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@cynco-labs/ui";

export default function InputGroupDemo() {
	return (
		<div className="max-w-[320px]">
			<InputGroup>
				<InputGroupAddon>
					<MagnifyingGlassIcon size={14} />
				</InputGroupAddon>
				<InputGroupInput placeholder="Search invoices" />
				<InputGroupAddon align="inline-end">
					<InputGroupText>⌘K</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
}
```

## Use

Search fields, inputs with units or prefixes, inline submit buttons.

## Props

`InputGroupAddon` (`align` inline-start · inline-end · block-start · block-end) holding `InputGroupText` or `InputGroupButton`, plus `InputGroupInput` or `InputGroupTextarea`.

## Notes

Uses `input-state-focus-within`.

Category: Components · Inputs. Source: `packages/ui/src/base/components/ui/input-group.tsx`.
