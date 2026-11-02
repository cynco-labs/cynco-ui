import { FieldLabel, Input } from "@cynco-labs/ui";

export default function FieldLabelDemo() {
	return (
		<div className="flex flex-col gap-3 max-w-[320px]">
			<div>
				<FieldLabel htmlFor="field-label-code" tooltip="Unique within your chart of accounts">
					Account code
				</FieldLabel>
				<Input id="field-label-code" placeholder="e.g. 4000" />
			</div>
			<div>
				<FieldLabel
					htmlFor="field-label-name"
					description="Optional"
					descriptionId="field-label-name-hint"
				>
					Display name
				</FieldLabel>
				<Input id="field-label-name" aria-describedby="field-label-name-hint" />
			</div>
		</div>
	);
}
