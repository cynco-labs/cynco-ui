# Canvas

A React Flow canvas preset for agent workflows: dotted background, pan/zoom, delete keys.

```tsx
import { Canvas } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Button } from "@cynco-labs/ui";
import {
	Canvas,
	Controls,
	Edge,
	Node,
	NodeContent,
	NodeDescription,
	NodeHeader,
	NodeTitle,
	Panel,
} from "@cynco-labs/ui/ai";

const NT = {
	card: (p: { data: { title: string; sub: string; body: string } }) => (
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

export default function CanvasDemo() {
	return (
		<div style={{ height: 260 }} className="rounded-lg border">
			<Canvas nodes={nodes} edges={edges} nodeTypes={NT} edgeTypes={ET} fitView>
				<Controls />
				<Panel position="top-right">
					<Button variant="secondary" size="mini">
						Run
					</Button>
				</Panel>
			</Canvas>
		</div>
	);
}
```

## Use

Visualising multi-step agent or approval workflows.

## Props

React Flow props: `nodes`, `edges`, `nodeTypes` (use Node), `edgeTypes` (use Edge), plus children such as Controls, Panel.

## Notes

Imports `@xyflow/react/dist/style.css`, so your bundler must handle CSS imports (Vite, Next.js and Astro do).

Category: AI. Source: `packages/ui/src/base/components/ai-elements/canvas.tsx`.
