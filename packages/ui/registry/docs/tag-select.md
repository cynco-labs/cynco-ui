# TagSelect

A multi-select shown as tags inside a select-style trigger.

```tsx
import { TagSelect } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { TagSelect } from "@cynco-labs/ui";

export default function TagSelectDemo() {
	const [s, setS] = useState(["sa"]);
	return (
		<div className="max-w-[360px]">
			<TagSelect
				value={s}
				onChange={setS}
				placeholder="Select branches"
				options={[
					{ value: "kl", label: "Kuala Lumpur" },
					{ value: "sa", label: "Shah Alam" },
					{ value: "pg", label: "Penang" },
				]}
			/>
		</div>
	);
}
```

## Use

Choosing several known options (tags, branches, tax codes).

## Props

`value`, `onChange`, `options` [{value,label}], `placeholder`, optional `formatTag`, `renderContent`.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/tag-select.tsx`.
