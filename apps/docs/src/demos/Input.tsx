import { Input, Label } from "@cynco-labs/ui";

export default function InputDemo() {
	return (
		<div className="grid grid-cols-2 gap-3 max-w-[520px]">
			<Label className="flex-col items-start gap-1.5">
				Description
				<Input placeholder="e.g. Office supplies" />
			</Label>
			<Label className="flex-col items-start gap-1.5">
				Invoice number
				<Input defaultValue="INV-2026-0142" />
			</Label>
			<Label className="flex-col items-start gap-1.5">
				Reference
				<Input variant="destructive" defaultValue="INV 2026 0142" aria-invalid />
			</Label>
			<Label className="flex-col items-start gap-1.5">
				Locked field
				<Input disabled placeholder="Disabled" />
			</Label>
		</div>
	);
}
