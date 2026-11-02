# Message

A chat message: user bubbles on the right, assistant replies as Markdown, with actions, branches and attachments.

```tsx
import { Message } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { ArrowsClockwiseIcon, CopyIcon } from "@phosphor-icons/react";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageContent,
	MessageResponse,
} from "@cynco-labs/ui/ai";

export default function MessageDemo() {
	return (
		<div className="flex flex-col gap-2 max-w-[560px]">
			<Message from="user">
				<MessageContent>Record a RM 1,184.30 TNB bill for October</MessageContent>
			</Message>
			<Message from="assistant">
				<MessageContent>
					<MessageResponse>
						{
							"Done. **BILL-2026-0088** is recorded:\n\n- Tenaga Nasional Berhad, RM 1,184.30\n- Posted to `6210 Utilities`, due 15 Nov"
						}
					</MessageResponse>
				</MessageContent>
				<MessageActions>
					<MessageAction tooltip="Copy" label="Copy">
						<CopyIcon size={14} />
					</MessageAction>
					<MessageAction tooltip="Retry" label="Retry">
						<ArrowsClockwiseIcon size={14} />
					</MessageAction>
				</MessageActions>
			</Message>
		</div>
	);
}
```

## Use

Every chat turn.

## Props

`from` (`user` · `assistant`); `MessageContent` › `MessageResponse` (Streamdown Markdown) ; `MessageActions` › `MessageAction` (`tooltip`, `label`); `MessageBranch*` for alternative replies; `MessageAttachments` › `MessageAttachment`.

- `from`: `"user" | "system" | "assistant"`
- Also accepts `HTMLAttributes<HTMLDivElement>`.

## Notes

Mermaid diagrams inside Markdown are not bundled and render as nothing.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/message.tsx`.
