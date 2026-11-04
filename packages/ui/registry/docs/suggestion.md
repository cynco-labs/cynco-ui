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
- `size?`: `"sm" | "md" | "icon"`. Default `"sm"`.
- `isLoading?`: `boolean`. Swaps the label for a spinner and disables the button, while the label stays its accessible name.
- `asChild?`: `boolean`. Radix compatibility: render the single child element instead of a `<button>`.
- `render?`: `ReactElement`. The element to render instead of a `<button>` (Base UI).
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `onClick?`: `(suggestion: string) => void`
- Also accepts `ComponentProps<"button">`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/suggestion.tsx:22-47`.
