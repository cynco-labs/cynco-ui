import { ScrollArea } from "@cynco-labs/ui";

export default function ScrollAreaDemo() {
	return (
		<ScrollArea className="h-32 w-64 rounded-lg border bg-card">
			<div className="p-3 flex flex-col gap-2">
				{Array.from({ length: 14 }, (_, i) => 1040 + i).map((no) => (
					<div key={no} className="text-sm font-medium text-muted-foreground">
						{`Event #${no}`}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
