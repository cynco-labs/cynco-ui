import { ScrollArea } from "@cynco-labs/ui";

export default function ScrollAreaDemo() {
	return (
		<ScrollArea className="h-32 w-64 rounded-lg border bg-card">
			<div className="p-3 flex flex-col gap-2">
				{Array.from({ length: 14 }, (_, i) => (
					<div key={i} className="text-body">
						{"Event #" + (1040 + i)}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
