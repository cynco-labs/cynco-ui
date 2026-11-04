# TagInput

A free-text input that turns entries into removable tags.

```tsx
import { TagInput } from "@cynco-labs/ui";
```

## Usage

```tsx
import { TagInput } from "@cynco-labs/ui";
import { useState } from "react";

export default function TagInputDemo() {
	const [s, setS] = useState(["finance@nusantara.my", "ap@nusantara.my"]);
	return (
		<div className="max-w-[360px]">
			<TagInput value={s} onValueChange={setS} placeholder="Add an email" aria-label="Invoice recipients" />
		</div>
	);
}
```

## Use

Lists of IDs or emails typed by the user.

## Props

`value` string[], `onChange`, optional controlled `inputValue`.

- `value?`: `string[]`. Controlled tags.
- `defaultValue?`: `string[]`. Initial tags for uncontrolled use. Default `[]`.
- `onValueChange?`: `(tags: string[]) => void`
- `inputValue?`: `string`
- `onInputChange?`: `(value: string) => void`
- `placeholder?`: `string`. Default `"Add a tag..."`.
- `onTagAdd?`: `() => void`
- `onTagRemove?`: `(index: number) => void`
- Also accepts `ComponentProps<"input">`.

## Accessibility

| Key | Does |
| --- | --- |
| Enter | Commits what is typed as a tag. |
| Backspace | On an empty field, removes the last tag. |
| Space | Ends the word being typed and commits it as a tag. |

Tags change without focus moving, so every add and remove is announced through a role="status" region that stays mounted and only swaps its text, saying "{tag} added" or "{tag} removed". A paste of several words is announced as one list. Each tag's remove button is labelled "Remove {tag}", and because that button unmounts on use, focus is handed back to the text field.

## Notes

Enter or comma adds a tag; Backspace on empty removes the last.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/tag-input.tsx:24-187`.
