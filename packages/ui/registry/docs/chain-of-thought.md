# ChainOfThought

A collapsible list of the assistant's reasoning steps with status, results and images.

```tsx
import { ChainOfThought } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import {
	ChainOfThought,
	ChainOfThoughtContent,
	ChainOfThoughtHeader,
	ChainOfThoughtSearchResult,
	ChainOfThoughtSearchResults,
	ChainOfThoughtStep,
} from "@cynco-labs/ui/ai";

export default function ChainOfThoughtDemo() {
	return (
		<ChainOfThought defaultOpen className="max-w-[520px]">
			<ChainOfThoughtHeader>Reconciling October</ChainOfThoughtHeader>
			<ChainOfThoughtContent>
				<ChainOfThoughtStep label="Read the bank statement" description="142 lines, Maybank Current" status="complete" />
				<ChainOfThoughtStep label="Match open invoices" status="active">
					<ChainOfThoughtSearchResults>
						<ChainOfThoughtSearchResult>INV-2026-0142</ChainOfThoughtSearchResult>
						<ChainOfThoughtSearchResult>BILL-2026-0088</ChainOfThoughtSearchResult>
					</ChainOfThoughtSearchResults>
				</ChainOfThoughtStep>
				<ChainOfThoughtStep label="Draft the closing journal" status="pending" />
			</ChainOfThoughtContent>
		</ChainOfThought>
	);
}
```

## Use

Showing how an answer was reached.

## Props

`open`/`defaultOpen`; `ChainOfThoughtHeader`, `ChainOfThoughtContent` › `ChainOfThoughtStep` (`label`, `description`, `status` complete · active · pending, `icon`), `ChainOfThoughtSearchResults` › `ChainOfThoughtSearchResult`, `ChainOfThoughtImage caption`.

- `open?`: `boolean`
- `defaultOpen?`: `boolean`. Default `false`.
- `onOpenChange?`: `(open: boolean) => void`
- Also accepts `ComponentProps<"div">`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/chain-of-thought.tsx:32-57`.
