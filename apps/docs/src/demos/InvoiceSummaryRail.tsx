import { Button, buildSalesTotals, InvoiceSummaryRail } from "@cynco-labs/ui";

export default function InvoiceSummaryRailDemo() {
	const rows = buildSalesTotals({
		subtotal: "4120.00",
		discount: "206.00",
		discountPercent: "5.00",
		taxes: [{ label: "SST (8%)", amount: "313.12" }],
		deposit: "1000.00",
	});
	return (
		<div className="flex flex-col gap-3">
			<InvoiceSummaryRail
				rows={rows}
				currency="MYR"
				defaultOpen
				actions={<Button variant="primary">Finalize invoice</Button>}
			/>
			<InvoiceSummaryRail
				rows={[]}
				actions={
					<Button variant="secondary" disabled>
						Save draft
					</Button>
				}
			/>
		</div>
	);
}
