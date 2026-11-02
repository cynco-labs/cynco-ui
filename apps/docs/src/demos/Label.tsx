import { Input, Label } from "@cynco-labs/ui";

export default function LabelDemo() {
	return (
		<div className="flex max-w-[280px] flex-col gap-1.5">
			<Label htmlFor="payment-terms">Payment terms</Label>
			<Input id="payment-terms" defaultValue="Net 30" />
		</div>
	);
}
