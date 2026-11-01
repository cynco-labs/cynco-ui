import { SheetAccordion, SheetAccordionItem } from "@cynco-labs/ui";

export default function SheetAccordionDemo() {
	return (
		<div className="max-w-[420px] rounded-lg border bg-background">
			<SheetAccordion type="multiple" defaultValue={["payment"]} withSeparator>
				<SheetAccordionItem
					value="payment"
					title="Payment"
					description="Terms and how the customer pays"
				>
					<div className="text-body">Net 30 · DuitNow or bank transfer</div>
				</SheetAccordionItem>
				<SheetAccordionItem value="tax" title="Tax">
					<div className="text-body">SST 8% · TIN C10987654320</div>
				</SheetAccordionItem>
			</SheetAccordion>
		</div>
	);
}
