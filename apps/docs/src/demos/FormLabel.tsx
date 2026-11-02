import { FormLabel, Input } from "@cynco-labs/ui";

export default function FormLabelDemo() {
	return (
		<div className="grid grid-cols-2 gap-3 max-w-[520px]">
			<div>
				<FormLabel htmlFor="form-label-price">Unit price</FormLabel>
				<Input id="form-label-price" inputMode="decimal" defaultValue="120.00" />
			</div>
			<div>
				<FormLabel htmlFor="form-label-locked" disabled>
					Disabled label
				</FormLabel>
				<Input id="form-label-locked" disabled placeholder="Locked" />
			</div>
		</div>
	);
}
