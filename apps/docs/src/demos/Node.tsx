import { Badge } from "@cynco-labs/ui";
import {
	Node,
	NodeAction,
	NodeContent,
	NodeDescription,
	NodeFooter,
	NodeHeader,
	NodeTitle,
} from "@cynco-labs/ui/ai";

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
				<NodeContent className="text-body">
					Proposes the invoice this receipt settles, with its evidence.
				</NodeContent>
				<NodeFooter className="text-body-secondary">12 ms</NodeFooter>
			</Node>
		</div>
	);
}
