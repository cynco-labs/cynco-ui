import { PartyRail } from "@cynco-labs/ui";

export default function PartyRailDemo() {
	return (
		<PartyRail
			role="customer"
			className="max-w-[640px]"
			ledgerBalance={48250.4}
			openItemsTotal={48250.4}
			aging={{ current: 21470.4, days1to30: 14100, days31to60: 8180, days61plus: 4500 }}
			credits={[{ currency: "MYR", amount: 1200, count: 2 }]}
			creditNotesHref="/sales/credit-notes?customer=tropika-kopi"
			trend={[
				{ month: "2025-11", total: 12400 },
				{ month: "2025-12", total: 18900 },
				{ month: "2026-01", total: 9800 },
				{ month: "2026-02", total: 14200 },
				{ month: "2026-03", total: 16750 },
				{ month: "2026-04", total: 11300 },
				{ month: "2026-05", total: 20450 },
				{ month: "2026-06", total: 15800 },
				{ month: "2026-07", total: 17200 },
				{ month: "2026-08", total: 13900 },
				{ month: "2026-09", total: 19100 },
				{ month: "2026-10", total: 16620.75 },
			]}
			contacts={[
				{
					id: "c1",
					name: "Nurul Aisyah Rahman",
					role: "billing",
					email: "aisyah@mesra.com.my",
					phone: "+60 12-345 6789",
					isPrimary: true,
				},
				{
					id: "c2",
					name: "Tan Wei Ming",
					role: "purchasing",
					email: "weiming@mesra.com.my",
					phone: "+60 3-7728 1100",
				},
			]}
		/>
	);
}
