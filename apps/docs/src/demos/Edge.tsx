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
