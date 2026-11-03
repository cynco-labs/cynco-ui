import { BankAccountRail } from "@cynco-labs/ui";

export default function BankAccountRailDemo() {
	return (
		<BankAccountRail
			className="max-w-60"
			defaultSelectedId="mbb"
			onAddAccount={() => {}}
			onConnectProvider={() => {}}
			net={[{ amount: 270250.75, currency: "MYR" }]}
			cashFlow={[
				{ month: "May", net: 12400 },
				{ month: "Jun", net: -4300 },
				{ month: "Jul", net: 18750 },
				{ month: "Aug", net: 9100 },
				{ month: "Sep", net: -2200 },
				{ month: "Oct", net: 15800 },
			]}
			accounts={[
				{
					id: "mbb",
					accountName: "Maybank Current",
					accountType: "checking",
					balance: 207985.25,
					institution: { name: "Maybank", shortName: "MBB", primaryColor: "#FFC72C" },
					counts: { imported: 12, categorized: 20, posted: 30, reconciled: 180 },
					feed: { health: "ok", summary: "Synced 2h ago" },
				},
				{
					id: "cimb",
					accountName: "CIMB Business",
					accountType: "checking",
					balance: 96210,
					institution: { name: "CIMB Bank", shortName: "CIMB", primaryColor: "#EC1C24" },
					counts: { categorized: 4, posted: 6, reconciled: 88 },
					hasChainIssue: true,
				},
				{
					id: "card",
					accountName: "Maybank Visa Business",
					accountType: "credit_card",
					balance: -8420.5,
					institution: { name: "Maybank", shortName: "MBB", primaryColor: "#FFC72C" },
					counts: { imported: 3, posted: 10, reconciled: 41 },
				},
				{
					id: "pay",
					accountName: "Billplz Collections",
					accountType: "payment_provider",
					balance: -25524,
					counts: { imported: 2, categorized: 5, reconciled: 60 },
					feed: { health: "failed", summary: "Sync failed · 1d ago" },
				},
			]}
		/>
	);
}
