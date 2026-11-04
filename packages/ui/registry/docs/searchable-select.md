# SearchableSelect

A generic select with a search box, built on Popover + Command.

```tsx
import { SearchableSelect } from "@cynco-labs/ui";
```

## Usage

```tsx
import { SearchableSelect } from "@cynco-labs/ui";
import { useState } from "react";

const opts = [
	{ id: "1000-001", name: "1000-001 · Cash in hand" },
	{ id: "1010-001", name: "1010-001 · Maybank Current" },
	{ id: "1200-001", name: "1200-001 · Trade Receivables" },
	{ id: "2100-001", name: "2100-001 · Trade Payables" },
];

export default function SearchableSelectDemo() {
	const [s, setS] = useState("1010-001");
	return (
		<div className="max-w-[260px]">
			<SearchableSelect
				value={s}
				onValueChange={setS}
				options={opts}
				getOptionValue={(o) => o.id}
				getOptionLabel={(o) => o.name}
				placeholder="Select an account"
				searchPlaceholder="Search accounts…"
				defaultOpen
				triggerClassName="w-full"
			/>
		</div>
	);
}
```

## Use

Choosing an account, item or customer from a long or remote list.

## Props

`value`, `onValueChange`, `options`, `getOptionValue`, `getOptionLabel`; optional `renderOption`, `renderValue`, `onSearchChange` (server search), `header`/`footer`, `trigger`.

- `options`: `T[]`
- `getOptionValue`: `(option: T) => string`
- `getOptionLabel`: `(option: T) => string`
- `disabled?`: `boolean`. Default `false`.
- `value?`: `string | null`. Controlled selection; null for none.
- `defaultValue?`: `string | null`. Initial selection for uncontrolled use. Default `null`.
- `onValueChange?`: `(value: string) => void`
- `getOptionSearchTerms?`: `(option: T) => (string | null | undefined)[]`. Extra strings to match on, alongside the option's label and value.
- `getOptionDisabled?`: `(option: T) => boolean`
- `renderOption?`: `(option: T, isSelected: boolean) => ReactNode`
- `renderValue?`: `(option: T | undefined) => ReactNode`. Renders the trigger's value. Return nothing for no selection and the trigger shows `placeholder`.
- `placeholder?`: `string`. Default `"Select..."`.
- `searchable?`: `boolean`. Default `false`.
- `searchPlaceholder?`: `string`. Default `"Search..."`.
- `emptyText?`: `ReactNode | null`. `null` renders no empty state at all — the search input stands alone. Default `"No results found"`.
- `triggerClassName?`: `string`
- `contentClassName?`: `string`
- `defaultOpen?`: `boolean`. Default `false`.
- `trigger?`: `ReactNode`. Replaces the default value-and-chevron button, e.g. with an icon button.
- `open?`: `boolean`
- `onOpenChange?`: `(open: boolean) => void`
- `header?`: `ReactNode`
- `footer?`: `SearchableSelectFooter`
- `onSearchChange?`: `(search: string) => void`
- `shouldFilter?`: `boolean`. Whether to filter options locally as the user types. Defaults to off when `onSearchChange` is set, since the caller is usually searching server-side. Default `!onSearchChange`.
- `isLoading?`: `boolean`. Default `false`.
- Also accepts `ComponentProps<"button">`.

## Accessibility

The default trigger is a plain button that forwards id, aria-label, aria-labelledby, aria-describedby and aria-invalid from props, and sets no aria-expanded of its own because PopoverTrigger supplies that and aria-haspopup="dialog". The popup is labelled with the placeholder, and the search box is named by passing searchPlaceholder as the Command label, since cmdk always renders that label element and leaves the input unnamed without it. Each row carries aria-current for the chosen value, because cmdk's aria-selected tracks only the highlighted row.

## Notes

`emptyText={null}` hides the empty state.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/searchable-select.tsx:63-244`.
