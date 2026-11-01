import { KpiTileGrid } from "@cynco-labs/ui";

export default function KpiTileGridDemo() {
	return (
		<KpiTileGrid
			columns={4}
			tiles={[
				{
					label: "Revenue",
					value: "RM 70,650.00",
					delta: 2.2,
					sparkline: [58200, 61400, 64800, 63100, 69150, 70650],
					accent: "brand",
					sub: "vs RM 69,150.00 in Sep",
					subTone: "up",
				},
				{
					label: "Net profit",
					value: "RM 25,080.00",
					delta: 11.3,
					sparkline: [16200, 18900, 17400, 20100, 22525, 25080],
					accent: "success",
					sub: "35.5% margin",
				},
				{
					label: "Receivables",
					value: "RM 96,300.00",
					badge: "7 overdue",
					badgeTone: "amber",
					sparkline: [71000, 78400, 82100, 88900, 91200, 96300],
					accent: "warning",
					sub: "RM 31,450.00 overdue",
					subTone: "warn",
				},
				{
					label: "Payables",
					value: "RM 51,240.60",
					delta: -4.6,
					sparkline: [60100, 57800, 55200, 54900, 53700, 51240],
					accent: "error",
					sub: "Nothing due this week",
				},
			]}
		/>
	);
}
