# Context

A token-usage meter with a hover card breaking down input, output, reasoning and cache tokens and cost.

```tsx
import { Context } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import {
	Context,
	ContextCacheUsage,
	ContextContent,
	ContextContentBody,
	ContextContentFooter,
	ContextContentHeader,
	ContextInputUsage,
	ContextOutputUsage,
	ContextReasoningUsage,
	ContextTrigger,
} from "@cynco-labs/ui/ai";

export default function ContextDemo() {
	return (
		<Context
			defaultOpen
			usedTokens={48200}
			maxTokens={200000}
			usage={{
				inputTokens: 40000,
				outputTokens: 6200,
				reasoningTokens: 2000,
				cachedInputTokens: 12000,
				totalTokens: 48200,
			}}
			modelId="anthropic:claude-sonnet-4"
		>
			<ContextTrigger />
			<ContextContent align="start">
				<ContextContentHeader />
				<ContextContentBody>
					<ContextInputUsage />
					<ContextOutputUsage />
					<ContextReasoningUsage />
					<ContextCacheUsage />
				</ContextContentBody>
				<ContextContentFooter />
			</ContextContent>
		</Context>
	);
}
```

## Use

Showing how much of the model's context window is used.

## Props

`usedTokens`, `maxTokens`, `usage`, `modelId`; `ContextTrigger`, `ContextContent` › `ContextContentHeader`, `ContextContentBody` (usage rows), `ContextContentFooter`.

- `usedTokens`: `number`
- `maxTokens`: `number`
- `usage?`: `LanguageModelUsage`
- `modelId?`: `ModelId`
- Also accepts `PopoverPrimitive.Root.Props`.

## Notes

Cost uses tokenlens model prices.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/context.tsx`.
