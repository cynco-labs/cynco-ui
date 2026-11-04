# TagSelect

A multi-select shown as removable tags in a select-style field.

```tsx
import { TagSelect } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Label, TagSelect } from "@cynco-labs/ui";
import { useState } from "react";

export default function TagSelectDemo() {
	const [s, setS] = useState(["sa", "kl"]);
	return (
		<div className="max-w-[360px]">
			<Label htmlFor="tag-select-branches">Branches</Label>
			<TagSelect
				id="tag-select-branches"
				value={s}
				onValueChange={setS}
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

`value`, `onChange`, `options` [{value,label}], `placeholder`, optional `formatTag`, `renderContent`, `className` (the field box) and any div props. Label it with `id` + a `Field`, or `aria-label` / `aria-labelledby`; `aria-describedby` and `aria-invalid` also go on the trigger.

- `value`: `string[]`. Default `[]`.
- `onValueChange`: `(values: string[]) => void`
- `options`: `TagSelectOption[]`
- `placeholder?`: `string`. Default `"Select..."`.
- `formatTag?`: `(value: string) => string`
- `renderContent?`: `(setOpen: (open: boolean) => void) => ReactNode`
- `showAllProducts?`: `boolean`. Default `false`.
- Also accepts `ComponentProps<"button">`, `ComponentProps<"div">`.

## Accessibility

| Key | Does |
| --- | --- |
| Tab | Reaches the field's trigger first, then each chip's remove button as its own stop. |

While chips are showing, the trigger holds an sr-only "{n} selected", so the field still reports its state even though the visible chips sit beside the combobox rather than inside it. Each remove button is labelled "Remove {label}" and is a 24 by 24 target, with its icon aria-hidden. Removing a chip moves focus to the neighbouring chip's button, or back to the trigger when no chip is left.

## Notes

The trigger fills the field from behind and announces "{n} selected"; the tags sit beside it, not inside it, so each "Remove {label}" button is its own tab stop. Removing a tag moves focus to the next tag, or back to the trigger.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/tag-select.tsx:34-127`.
