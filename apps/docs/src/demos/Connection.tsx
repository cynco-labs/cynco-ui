import {
	Canvas,
	Connection,
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
			<NodeContent className="text-sm font-medium text-muted-foreground">{p.data.body}</NodeContent>
		</Node>
	),
};

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

export default function ConnectionDemo() {
	return (
		<div style={{ height: 180 }} className="rounded-lg border">
			<Canvas nodes={nodes} edges={[]} nodeTypes={NT} connectionLineComponent={Connection} fitView>
				<Panel position="top-left">
					<span className="text-sm text-subtle px-1">Drag from a handle to draw a connection</span>
				</Panel>
			</Canvas>
		</div>
	);
}
