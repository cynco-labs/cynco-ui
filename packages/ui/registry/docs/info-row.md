# InfoRow

A label/value row with an optional icon.

```tsx
import { InfoRow } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CreditCardIcon, KeyIcon, UserIcon } from "@phosphor-icons/react";
import { InfoRow } from "@cynco-labs/ui";

export default function InfoRowDemo() {
	return (
		<div className="flex flex-col gap-1 max-w-[360px]">
			<InfoRow icon={<UserIcon size={14} />} label="Customer" value="Nusantara Logistik Bhd" />
			<InfoRow icon={<KeyIcon size={14} />} label="TIN" value="C10987654320" mono />
			<InfoRow
				icon={<CreditCardIcon size={14} />}
				label="Terms"
				value="Net 30 · RM 12,720.00 due"
			/>
		</div>
	);
}
```

## Use

Detail panels (customer, invoice).

## Props

`label`, `value`, optional `icon`, `mono` for IDs.

- `label`: `string`
- `value`: `ReactNode`
- `icon?`: `ReactNode`
- `valueClassName?`: `string`. Classes for the value (`className` goes on the row).
- `mono?`: `boolean`
- Also accepts `ComponentProps<"div">`.

Category: Components · Data display. Source: `packages/ui/src/base/components/general/info-row.tsx`.
