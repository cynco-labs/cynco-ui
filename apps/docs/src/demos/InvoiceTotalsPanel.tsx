import { InvoiceTotalsPanel, buildSalesTotals } from "@cynco-labs/ui";

export default function InvoiceTotalsPanelDemo() {
	const rows = buildSalesTotals({
		subtotal: 12000,
		discount: 600,
		discountPercent: 5,
		taxes: [{ label: "SST (8%)", amount: 912 }],
		deposit: 3000,
	});
	return (
		<div className="max-w-[340px] ml-auto">
			<InvoiceTotalsPanel rows={rows} currency="MYR" />
		</div>
	);
}
