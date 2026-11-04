# Toolbar

A node toolbar that floats above a selected Node.

```tsx
import { Toolbar } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Button } from "@cynco-labs/ui";
import { Canvas, Node, NodeHeader, NodeTitle, Position, Toolbar } from "@cynco-labs/ui/ai";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";

const NT2 = {
	card: (_p: { data: Record<string, unknown> }) => (
		<div>
			<Toolbar isVisible position={Position.Top}>
				<Button variant="skeleton" size="icon" aria-label="Edit step">
					<PencilSimpleIcon size={14} />
				</Button>
				<Button variant="skeleton" size="icon" aria-label="Delete step">
					<TrashIcon size={14} />
				</Button>
			</Toolbar>
			<Node handles={{ target: false, source: false }}>
				<NodeHeader>
					<NodeTitle>Approve bill</NodeTitle>
				</NodeHeader>
			</Node>
		</div>
	),
};

export default function ToolbarDemo() {
	return (
		<div style={{ height: 220 }} className="rounded-lg border">
			<Canvas nodes={[{ id: "a", type: "card", position: { x: 0, y: 0 }, data: {} }]} edges={[]} nodeTypes={NT2} fitView />
		</div>
	);
}
```

## Use

Edit/delete actions on a node.

## Props

React Flow NodeToolbar props: `isVisible`, `position`; children buttons.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/toolbar.tsx:9-15`.
