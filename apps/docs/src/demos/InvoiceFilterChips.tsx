import { InvoiceFilterChips } from "@cynco-labs/ui";
import { useState } from "react";

export default function InvoiceFilterChipsDemo() {
	const [s, setS] = useState([
		{ key: "search", label: "Search", value: "“Tropika”" },
		{ key: "status", label: "Status", value: "Overdue" },
		{ key: "issued", label: "Issued", value: "1 Oct 2026 – 31 Oct 2026" },
		{ key: "amount", label: "Amount", value: "RM 1,000 – RM 10,000" },
		{ key: "currency", label: "Currency", value: "MYR only" },
	]);
	return (
		<InvoiceFilterChips
			chips={s}
			onRemove={(k) => {
				setS(s.filter((c) => c.key !== k));
			}}
			onClearAll={() => {
				setS([]);
			}}
		/>
	);
}
