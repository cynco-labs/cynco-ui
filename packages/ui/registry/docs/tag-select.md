# TagSelect

A multi-select shown as removable tags in a select-style field.

```tsx
import { TagSelect } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { FormLabel, TagSelect } from "@cynco-labs/ui";

export default function TagSelectDemo() {
	const [s, setS] = useState(["sa", "kl"]);
	return (
		<div className="max-w-[360px]">
			<FormLabel htmlFor="tag-select-branches">Branches</FormLabel>
			<TagSelect
				id="tag-select-branches"
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

`value`, `onChange`, `options` [{value,label}], `placeholder`, optional `formatTag`, `renderContent`, `className` (the field box). Label it with `id` + a `<label htmlFor>` (FormLabel, FieldLabel), or `aria-label` / `aria-labelledby`; `aria-describedby` and `aria-invalid` also go on the trigger.

## Notes

The trigger fills the field from behind and announces "{n} selected"; the tags sit beside it, not inside it, so each "Remove {label}" button is its own tab stop. Removing a tag moves focus to the next tag, or back to the trigger.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/tag-select.tsx`.
