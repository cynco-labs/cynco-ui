import { Separator } from "@cynco-labs/ui";

export default function SeparatorDemo() {
	return (
		<div className="flex flex-col gap-3 max-w-[360px] text-sm font-medium text-muted-foreground">
			Above
			<Separator />
			<div className="flex items-center gap-3 h-5">
				Left
				<Separator orientation="vertical" />
				Right
			</div>
		</div>
	);
}
