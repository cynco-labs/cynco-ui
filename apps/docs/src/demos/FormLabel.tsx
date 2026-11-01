import { FormLabel } from "@cynco-labs/ui";

export default function FormLabelDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<FormLabel>Unit price</FormLabel>
			<FormLabel disabled>Disabled label</FormLabel>
		</div>
	);
}
