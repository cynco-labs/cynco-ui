import { Button, InvoiceSummaryRail, buildSalesTotals } from "@cynco-labs/ui";

export default function InvoiceSummaryRailDemo() {
	const rows = buildSalesTotals({
		subtotal: 4120,
		discount: 206,
		discountPercent: 5,
		taxes: [{ label: "SST (8%)", amount: 313.12 }],
		deposit: 1000,
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
