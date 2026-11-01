import { InvoiceActionsPanel } from "@cynco-labs/ui";

export default function InvoiceActionsPanelDemo() {
	return (
		<div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] max-w-[560px]">
			<InvoiceActionsPanel status="finalized" emailSent />
			<InvoiceActionsPanel status="draft" />
		</div>
	);
}
