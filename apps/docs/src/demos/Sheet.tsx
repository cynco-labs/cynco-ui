import {
	Button,
	Field,
	FieldControl,
	FieldLabel,
	Input,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@cynco-labs/ui";

export default function SheetDemo() {
	return (
		<Sheet defaultOpen modal={false}>
			<SheetContent side="right" className="w-[360px]">
				<SheetHeader>
					<SheetTitle>New customer</SheetTitle>
					<SheetDescription>Add a customer to invoice and track receivables.</SheetDescription>
				</SheetHeader>
				<div className="px-4 flex flex-col gap-2">
					<Field>
						<FieldLabel>Company name</FieldLabel>
						<FieldControl>
							<Input placeholder="e.g. Nusantara Logistik Bhd" />
						</FieldControl>
					</Field>
				</div>
				<SheetFooter>
					<Button variant="primary">Save customer</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
