import { PartyTimeline } from "@cynco-labs/ui";

export default function PartyTimelineDemo() {
	return (
		<div className="max-w-[620px]">
			<PartyTimeline
				party="customer"
				events={[
					{
						id: "e1",
						kind: "payment",
						date: "2026-10-28",
						title: "DuitNow transfer",
						reference: "INV-2026-0142",
						amount: "-8500.00",
						status: "completed",
					},
					{
						id: "e2",
						kind: "document",
						date: "2026-10-21",
						title: "INV-2026-0156",
						reference: "PO-MESRA-3381",
						dueDate: "2026-11-20",
						amount: "12480.50",
						status: "finalized",
					},
					{
						id: "e3",
						kind: "document",
						date: "2026-10-06",
						title: "INV-2026-0149",
						dueDate: "2026-11-05",
						amount: "3450.00",
						currency: "SGD",
						baseAmount: "11316.00",
						status: "finalized",
					},
					{
						id: "e4",
						kind: "document",
						date: "2026-09-15",
						title: "INV-2026-0131",
						reference: "PO-MESRA-3302",
						dueDate: "2026-10-15",
						amount: "6680.00",
						status: "overdue",
						overdue: true,
					},
					{
						id: "e5",
						kind: "bank",
						date: "2026-09-09",
						title: "Maybank · IBG MESRA SDN BHD",
						amount: "-4200.00",
					},
					{
						id: "e6",
						kind: "payment",
						date: "2026-09-02",
						title: "Cheque 004512",
						reference: "INV-2026-0117",
						amount: "-6000.00",
						status: "completed",
					},
				]}
			/>
		</div>
	);
}
