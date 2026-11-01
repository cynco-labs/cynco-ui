import { LabelInput } from "@cynco-labs/ui";

export default function LabelInputDemo() {
	return (
		<div className="max-w-[320px]">
			<LabelInput
				label="Customer name"
				placeholder="e.g. Pro"
				description="Printed on invoices and statements."
			/>
		</div>
	);
}
