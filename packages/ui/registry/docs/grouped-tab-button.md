# GroupedTabButton

A segmented tab control: equal-width options in a single pill track.

```tsx
import { GroupedTabButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { GroupedTabButton } from "@cynco-labs/ui";

export default function GroupedTabButtonDemo() {
	const [s, setS] = useState("month");
	return (
		<div className="max-w-[360px]">
			<GroupedTabButton
				value={s}
				onValueChange={setS}
				options={[
					{ value: "month", label: "Month" },
					{ value: "quarter", label: "Quarter" },
					{ value: "year", label: "Year" },
				]}
			/>
		</div>
	);
}
```

## Use

Switching a small set of mutually exclusive modes (period, chart range).

## Props

`value`, `onValueChange`, `options` [{value, label?, icon?, disabled?}].

## Notes

Fills its container width; constrain the parent.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/grouped-tab-button.tsx`.
