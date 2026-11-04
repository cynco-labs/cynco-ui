import { PartyRail } from "@cynco-labs/ui";

export default function PartyRailDemo() {
	return (
		<PartyRail
			onSetPrimaryContact={() => {}}
			onEditContact={() => {}}
			onAddContact={() => {}}
			party="customer"
			className="max-w-[640px]"
			ledgerBalance={"48250.40"}
			openItemsTotal={"48250.40"}
			aging={{ current: "21470.40", days1to30: "14100.00", days31to60: "8180.00", days61plus: "4500.00" }}
			credits={[{ currency: "MYR", amount: "1200.00", count: 2 }]}
			creditNotesHref="/sales/credit-notes?customer=tropika-kopi"
			trend={[
				{ month: "2025-11", total: "12400.00" },
				{ month: "2025-12", total: "18900.00" },
				{ month: "2026-01", total: "9800.00" },
				{ month: "2026-02", total: "14200.00" },
				{ month: "2026-03", total: "16750.00" },
				{ month: "2026-04", total: "11300.00" },
				{ month: "2026-05", total: "20450.00" },
				{ month: "2026-06", total: "15800.00" },
				{ month: "2026-07", total: "17200.00" },
				{ month: "2026-08", total: "13900.00" },
				{ month: "2026-09", total: "19100.00" },
				{ month: "2026-10", total: "16620.75" },
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
