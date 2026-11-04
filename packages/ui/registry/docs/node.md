# Node

A Card-styled workflow node with optional connection handles.

```tsx
import { Node } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Badge } from "@cynco-labs/ui";
import { Node, NodeAction, NodeContent, NodeDescription, NodeFooter, NodeHeader, NodeTitle } from "@cynco-labs/ui/ai";

export default function NodeDemo() {
	return (
		<div className="max-w-[300px]">
			<Node handles={{ target: false, source: false }} className="w-full">
				<NodeHeader>
					<NodeTitle>Match bank line</NodeTitle>
					<NodeDescription>AI categorisation</NodeDescription>
					<NodeAction>
						<Badge variant="muted">step 2</Badge>
					</NodeAction>
				</NodeHeader>
				<NodeContent className="text-sm font-medium text-muted-foreground">
					Proposes the invoice this receipt settles, with its evidence.
				</NodeContent>
				<NodeFooter className="text-sm text-subtle">12 ms</NodeFooter>
			</Node>
		</div>
	);
}
```

## Use

Each step on a Canvas.

## Props

`handles` {target, source}; `NodeHeader` › `NodeTitle`, `NodeDescription`, `NodeAction`; `NodeContent`; `NodeFooter`.

- `handles`: `{ target: boolean; source: boolean }`
- Also accepts `ComponentProps<"div">`.

## Notes

Register it in `nodeTypes`; with handles it must render inside a Canvas.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/node.tsx:27-53`.
