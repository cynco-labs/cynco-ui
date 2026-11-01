import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@cynco-labs/ui";
import { Canvas, Node, NodeHeader, NodeTitle, Toolbar } from "@cynco-labs/ui/ai";

const NT2 = {
	card: (p) => (
		<div>
			<Toolbar isVisible position="top">
				<Button variant="skeleton" size="icon">
					<PencilSimpleIcon size={14} />
				</Button>
				<Button variant="skeleton" size="icon">
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
			<Canvas
				nodes={[{ id: "a", type: "card", position: { x: 0, y: 0 }, data: {} }]}
				edges={[]}
				nodeTypes={NT2}
				fitView
			/>
		</div>
	);
}
