# Controls

React Flow zoom/fit/lock controls styled for Cynco.

```tsx
import { Controls } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import {
	Canvas,
	Controls,
	Edge,
	Node,
	NodeContent,
	NodeDescription,
	NodeHeader,
	NodeTitle,
} from "@cynco-labs/ui/ai";

const NT = {
	card: ({ data }: { data: { title: string; sub: string; body: string } }) => (
		<Node handles={{ target: true, source: true }}>
			<NodeHeader>
				<NodeTitle>{data.title}</NodeTitle>
				<NodeDescription>{data.sub}</NodeDescription>
			</NodeHeader>
			<NodeContent className="text-body">{data.body}</NodeContent>
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

export default function ControlsDemo() {
	return (
		<div style={{ height: 200 }} className="rounded-lg border">
			<Canvas nodes={nodes} edges={edges} nodeTypes={NT} edgeTypes={ET} fitView>
				<Controls />
			</Canvas>
		</div>
	);
}
```

## Use

Inside a Canvas.

## Props

React Flow Controls props.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/controls.tsx`.
