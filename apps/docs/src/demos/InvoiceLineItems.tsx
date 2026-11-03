import { useState } from "react";
import { InvoiceLineItems, type SalesLineItem } from "@cynco-labs/ui";

export default function InvoiceLineItemsDemo() {
	const [s, setS] = useState<SalesLineItem[]>([
		{
			name: "Website maintenance retainer",
			description: "October 2026 · 20 hours",
			quantity: 1,
			price: 3500,
			discount: 0,
			taxCode: "sst8",
			margin: "healthy",
		},
		{
			name: "A4 brochure printing",
			description: "Art card 157gsm, full colour",
			quantity: 500,
			price: 1.2,
			discount: 10,
			taxCode: "sst8",
			margin: "below_target",
		},
	]);
	return (
		<InvoiceLineItems
			items={s}
			onChange={setS}
			currency="MYR"
			estimatedProfit={{ amount: 1265.4, percent: 28, health: "healthy" }}
		/>
	);
}
