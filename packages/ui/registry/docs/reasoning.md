# Reasoning

The model's reasoning in a collapsible that auto-opens while streaming and reports how long it thought.

```tsx
import { Reasoning } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@cynco-labs/ui/ai";

export default function ReasoningDemo() {
	return (
		<Reasoning defaultOpen isStreaming={false} duration={4} className="max-w-[520px]">
			<ReasoningTrigger />
			<ReasoningContent>
				The receipt of RM 12,720.00 equals INV-2026-0142 and quotes its number, so it settles that
				invoice rather than counting as revenue.
			</ReasoningContent>
		</Reasoning>
	);
}
```

## Use

Reasoning models' thinking text.

## Props

`isStreaming`, `duration`, `defaultOpen`; `ReasoningTrigger` (`getThinkingMessage`), `ReasoningContent` (string, Markdown).

Category: AI. Source: `packages/ui/src/base/components/ai-elements/reasoning.tsx`.
