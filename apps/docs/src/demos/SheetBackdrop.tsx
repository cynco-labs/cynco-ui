import { SheetBackdrop } from "@cynco-labs/ui";

export default function SheetBackdropDemo() {
	return (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-medium text-muted-foreground">Content behind an inline sheet</div>
			<SheetBackdrop isOpen onClose={() => {}} />
		</div>
	);
}
