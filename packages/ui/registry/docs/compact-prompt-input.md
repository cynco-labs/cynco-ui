# CompactPromptInput

A one-line prompt field with the submit button inline.

```tsx
import { CompactPromptInput } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { useState } from "react";
import { CompactPromptInput } from "@cynco-labs/ui/ai";

export default function CompactPromptInputDemo() {
	const [s, setS] = useState("");
	return (
		<div className="max-w-[460px]">
			<CompactPromptInput
				value={s}
				onChange={setS}
				onSubmit={() => {}}
				placeholder="Ask about your books…"
			/>
		</div>
	);
}
```

## Use

Small "ask about this" boxes without attachments.

## Props

`value`, `onChange`, `onSubmit`, `placeholder`, `isLoading`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/compact-prompt-input.tsx`.
