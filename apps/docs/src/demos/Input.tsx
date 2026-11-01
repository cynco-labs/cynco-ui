import { Input } from "@cynco-labs/ui";

export default function InputDemo() {
	return (
		<div className="grid grid-cols-2 gap-3 max-w-[520px]">
			<Input placeholder="e.g. Office supplies" />
			<Input defaultValue="INV-2026-0142" />
			<Input variant="destructive" defaultValue="INV 2026 0142" />
			<Input disabled placeholder="Disabled" />
		</div>
	);
}
