import { Button, InvoiceCreateSteps } from "@cynco-labs/ui";

export default function InvoiceCreateStepsDemo() {
	return (
		<div className="max-w-[420px]">
			<InvoiceCreateSteps
				currentStep={2}
				children={{
					1: (
						<div className="text-[13px] text-tertiary-foreground">
							Tropika Kopi Enterprise · accounts@tropikakopi.my
						</div>
					),
					2: (
						<div className="flex gap-2">
							<Button variant="secondary">Add item</Button>
							<Button variant="secondary">Browse library</Button>
						</div>
					),
				}}
			/>
		</div>
	);
}
