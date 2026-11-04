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
				The receipt of RM 12,720.00 equals INV-2026-0142 and quotes its number, so it settles that invoice rather than
				counting as revenue.
			</ReasoningContent>
		</Reasoning>
	);
}
```

## Use

Reasoning models' thinking text.

## Props

`isStreaming`, `duration`, `defaultOpen`; `ReasoningTrigger` (`getThinkingMessage`), `ReasoningContent` (string, Markdown).

- `open?`: `boolean`. Whether the collapsible panel is currently open. To render an uncontrolled collapsible, use the `defaultOpen` prop instead.
- `defaultOpen?`: `boolean`. Whether the collapsible panel is initially open. To render a controlled collapsible, use the `open` prop instead. Default `false`.
- `onOpenChange?`: `(open: boolean) => void`. Event handler called when the panel is opened or closed.
- `asChild?`: `boolean`
- `isStreaming?`: `boolean`. Default `false`.
- `duration?`: `number`
- Also accepts `CollapsiblePrimitive.Root.Props`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/reasoning.tsx:40-116`.
