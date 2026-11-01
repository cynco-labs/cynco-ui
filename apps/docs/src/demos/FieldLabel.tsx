import { FieldLabel } from "@cynco-labs/ui";

export default function FieldLabelDemo() {
	return (
		<div className="flex flex-col gap-3">
			<FieldLabel tooltip="Unique within your chart of accounts">Account code</FieldLabel>
			<FieldLabel description="Optional">Display name</FieldLabel>
		</div>
	);
}
