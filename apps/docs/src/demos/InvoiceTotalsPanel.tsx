import { buildSalesTotals, InvoiceTotalsPanel } from "@cynco-labs/ui";

export default function InvoiceTotalsPanelDemo() {
	const rows = buildSalesTotals({
		subtotal: "12000.00",
		discount: "600.00",
		discountPercent: "5.00",
		taxes: [{ label: "SST (8%)", amount: "912.00" }],
		deposit: "3000.00",
	});
	return (
		<div className="max-w-[340px] ml-auto">
			<InvoiceTotalsPanel rows={rows} currency="MYR" />
		</div>
	);
}
