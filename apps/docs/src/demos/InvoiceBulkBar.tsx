import { InvoiceBulkBar } from "@cynco-labs/ui";

export default function InvoiceBulkBarDemo() {
	return (
		<div className="flex flex-col gap-3">
			<InvoiceBulkBar
				selected={[
					{ id: "1", status: "finalized" },
					{ id: "2", status: "overdue" },
					{ id: "3", status: "finalized" },
				]}
			/>
			<InvoiceBulkBar
				selected={[
					{ id: "4", status: "draft" },
					{ id: "5", status: "paid" },
				]}
			/>
		</div>
	);
}
