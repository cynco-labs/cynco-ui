# OpenIn

A dropdown that opens the current query in ChatGPT, Claude, Cursor, T3, Scira or v0.

```tsx
import { OpenIn } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import {
	OpenIn,
	OpenInChatGPT,
	OpenInClaude,
	OpenInContent,
	OpenInCursor,
	OpenInT3,
	OpenInTrigger,
	OpenInv0,
} from "@cynco-labs/ui/ai";

export default function OpenInDemo() {
	return (
		<OpenIn query="Explain this trial balance" defaultOpen modal={false}>
			<OpenInTrigger />
			<OpenInContent>
				<OpenInChatGPT />
				<OpenInClaude />
				<OpenInCursor />
				<OpenInT3 />
				<OpenInv0 />
			</OpenInContent>
		</OpenIn>
	);
}
```

## Use

"Open in…" next to docs or prompts.

## Props

`query`; `OpenInTrigger`, `OpenInContent` › `OpenInChatGPT`, `OpenInClaude`, `OpenInCursor`, `OpenInT3`, `OpenInScira`, `OpenInv0`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/open-in-chat.tsx`.
