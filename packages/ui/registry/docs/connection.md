# Connection

The connection line drawn while dragging from a handle.

```tsx
import { Connection } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import {
	Canvas,
	Connection,
	Edge,
	Node,
	NodeContent,
	NodeDescription,
	NodeHeader,
	NodeTitle,
	Panel,
} from "@cynco-labs/ui/ai";

const NT = {
	card: (p) => (
		<Node handles={{ target: true, source: true }}>
			<NodeHeader>
				<NodeTitle>{p.data.title}</NodeTitle>
				<NodeDescription>{p.data.sub}</NodeDescription>
			</NodeHeader>
			<NodeContent className="text-body">{p.data.body}</NodeContent>
		</Node>
	),
};

const ET = { animated: Edge.Animated, temporary: Edge.Temporary };

const nodes = [
	{
		id: "a",
		type: "card",
		position: { x: 0, y: 0 },
		data: { title: "Import statement", sub: "Maybank · Oct 2026", body: "142 lines" },
	},
	{
		id: "b",
		type: "card",
		position: { x: 560, y: 160 },
		data: {
			title: "Match to invoices",
			sub: "AI categorisation",
			body: "128 matched · 14 to review",
		},
	},
];

const edges = [{ id: "e", source: "a", target: "b", type: "animated" }];

export default function ConnectionDemo() {
	return (
		<div style={{ height: 180 }} className="rounded-lg border">
			<Canvas nodes={nodes} edges={[]} nodeTypes={NT} connectionLineComponent={Connection} fitView>
				<Panel position="top-left">
					<span className="text-body-secondary px-1">Drag from a handle to draw a connection</span>
				</Panel>
			</Canvas>
		</div>
	);
}
```

## Use

Pass as the Canvas `connectionLineComponent`.

## Props

Nothing — React Flow supplies the coordinates.

## Notes

Only visible during a drag.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/connection.tsx`.
