# Edge

Two edge styles for the Canvas: `Edge.Animated` (a dot travels the path) and `Edge.Temporary` (dashed).

```tsx
import { Edge } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Canvas, Edge, Node, NodeContent, NodeDescription, NodeHeader, NodeTitle } from "@cynco-labs/ui/ai";

const NT = {
	card: (p: { data: { title: string; sub: string; body: string } }) => (
		<Node handles={{ target: true, source: true }}>
			<NodeHeader>
				<NodeTitle>{p.data.title}</NodeTitle>
				<NodeDescription>{p.data.sub}</NodeDescription>
			</NodeHeader>
			<NodeContent className="text-sm font-medium text-muted-foreground">{p.data.body}</NodeContent>
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

export default function EdgeDemo() {
	return (
		<div style={{ height: 200 }} className="rounded-lg border">
			<Canvas
				nodes={nodes}
				edges={[{ id: "e", source: "a", target: "b", type: "temporary" }]}
				nodeTypes={NT}
				edgeTypes={ET}
				fitView
			/>
		</div>
	);
}
```

## Use

Connections between Nodes; Temporary for proposed links.

## Props

Register as `edgeTypes={{animated: Edge.Animated, temporary: Edge.Temporary}}` and set each edge's `type`.

## Notes

Stroke uses `ring`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/edge.tsx:126-129`.
