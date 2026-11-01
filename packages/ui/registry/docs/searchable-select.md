# SearchableSelect

A generic select with a search box, built on Popover + Command.

```tsx
import { SearchableSelect } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { SearchableSelect } from "@cynco-labs/ui";

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

## Notes

`emptyText={null}` hides the empty state.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/searchable-select.tsx`.
