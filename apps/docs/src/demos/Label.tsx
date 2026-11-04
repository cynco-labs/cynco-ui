import { Input, Label } from "@cynco-labs/ui";

export default function LabelDemo() {
	return (
		<div className="flex max-w-[280px] flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="payment-terms">Payment terms</Label>
				<Input id="payment-terms" defaultValue="Net 30" />
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="tax-number" required>
					Tax identification number
				</Label>
				<Input id="tax-number" placeholder="e.g. C25718364020" />
			</div>
		</div>
	);
}
