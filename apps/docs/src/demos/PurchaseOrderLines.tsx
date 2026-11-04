import { type POLine, PurchaseOrderLines } from "@cynco-labs/ui";
import { useState } from "react";

export default function PurchaseOrderLinesDemo() {
	const [s, setS] = useState<POLine[]>([
		{
			id: "l1",
			description: "Arabica green beans, Sabah Highland (60kg sack)",
			quantity: "4.00",
			unitPrice: "1380.00",
			amount: "5520.00",
		},
		{
			id: "l2",
			description: "Kraft valve bags 1kg, printed",
			quantity: "2000.00",
			unitPrice: "0.85",
			amount: "1700.00",
		},
		{
			id: "l3",
			description: "Delivery to Shah Alam warehouse",
			quantity: "1.00",
			unitPrice: "180.00",
			amount: "180.00",
		},
	]);
	return <PurchaseOrderLines lineItems={s} onLineItemsChange={setS} taxAmount={462} />;
}
