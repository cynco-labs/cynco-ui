import { useState } from "react";
import { PurchaseOrderLines } from "@cynco-labs/ui";

export default function PurchaseOrderLinesDemo() {
	const [s, setS] = useState([
		{
			id: "l1",
			description: "Arabica green beans, Sabah Highland (60kg sack)",
			quantity: 4,
			unitPrice: 1380,
			amount: 5520,
		},
		{
			id: "l2",
			description: "Kraft valve bags 1kg, printed",
			quantity: 2000,
			unitPrice: 0.85,
			amount: 1700,
		},
		{
			id: "l3",
			description: "Delivery to Shah Alam warehouse",
			quantity: 1,
			unitPrice: 180,
			amount: 180,
		},
	]);
	return <PurchaseOrderLines lineItems={s} onChange={setS} taxAmount={462} />;
}
