# TagInput

A free-text input that turns entries into removable tags.

```tsx
import { TagInput } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { TagInput } from "@cynco-labs/ui";

export default function TagInputDemo() {
	const [s, setS] = useState(["finance@nusantara.my", "ap@nusantara.my"]);
	return (
		<div className="max-w-[360px]">
			<TagInput value={s} onChange={setS} placeholder="Add an email" aria-label="Invoice recipients" />
		</div>
	);
}
```

## Use

Lists of IDs or emails typed by the user.

## Props

`value` string[], `onChange`, optional controlled `inputValue`.

## Notes

Enter or comma adds a tag; Backspace on empty removes the last.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/tag-input.tsx`.
