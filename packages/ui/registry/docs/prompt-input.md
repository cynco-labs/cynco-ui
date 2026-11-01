# PromptInput

The full chat composer: textarea, attachments, tools, model select, speech and submit with status.

```tsx
import { PromptInput } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { PlusIcon } from "@phosphor-icons/react";
import {
	PromptInput,
	PromptInputBody,
	PromptInputButton,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@cynco-labs/ui/ai";

export default function PromptInputDemo() {
	return (
		<div className="max-w-[560px]">
			<PromptInput onSubmit={() => {}}>
				<PromptInputBody>
					<PromptInputTextarea placeholder="Ask Cynco to record, find or explain anything…" />
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools>
						<PromptInputButton>
							<PlusIcon size={14} />
						</PromptInputButton>
					</PromptInputTools>
					<PromptInputSubmit status="ready" />
				</PromptInputFooter>
			</PromptInput>
		</div>
	);
}
```

## Use

The main chat input.

## Props

`onSubmit(message)`, `accept`, `multiple`, `maxFiles`; `PromptInputBody` › `PromptInputTextarea`; `PromptInputFooter` › `PromptInputTools` (buttons, `PromptInputActionMenu`, `PromptInputSelect`, `PromptInputSpeechButton`) + `PromptInputSubmit status`; optional `PromptInputProvider` to control it from outside.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/prompt-input.tsx`.
