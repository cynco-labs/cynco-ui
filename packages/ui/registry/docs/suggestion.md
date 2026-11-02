# Suggestion

A horizontal row of suggested prompts as pill buttons.

```tsx
import { Suggestion } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Suggestion, Suggestions } from "@cynco-labs/ui/ai";

export default function SuggestionDemo() {
	return (
		<Suggestions>
			{["Who owes us money?", "Record a bill", "Explain my P&L"].map((t) => (
				<Suggestion key={t} suggestion={t} />
			))}
		</Suggestions>
	);
}
```

## Use

Empty chats and follow-up ideas.

## Props

`Suggestions` › `Suggestion suggestion onClick`.

- `suggestion`: `string`
- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"secondary"`.
- `size?`: `"sm" | "default" | "mini" | "icon"`. Default `"sm"`.
- `asChild?`: `boolean`
- `isLoading?`: `boolean`
- `transition?`: `boolean`
- `disableActive?`: `boolean`
- `hide?`: `boolean`
- `render?`: `ReactElement`
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `onClick?`: `(suggestion: string) => void`
- Also accepts `ComponentProps<"button">`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/suggestion.tsx`.
