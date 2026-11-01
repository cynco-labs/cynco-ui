import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@cynco-labs/ui";

export default function AccordionDemo() {
	return (
		<Accordion defaultValue={["a"]} className="max-w-[460px]">
			<AccordionItem value="a">
				<AccordionTrigger>When is SST charged?</AccordionTrigger>
				<AccordionContent className="text-body">
					When the business is SST-registered and the item carries a taxable tax code.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="b">
				<AccordionTrigger>Can I change a posted invoice?</AccordionTrigger>
				<AccordionContent className="text-body">
					No: raise a credit or debit note against it so the ledger keeps the history.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
