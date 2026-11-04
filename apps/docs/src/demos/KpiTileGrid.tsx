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
					sparkline: ["58200.00", "61400.00", "64800.00", "63100.00", "69150.00", "70650.00"],
					accent: "brand",
					sub: "vs RM 69,150.00 in Sep",
					subTone: "up",
				},
				{
					label: "Net profit",
					value: "RM 25,080.00",
					delta: 11.3,
					sparkline: ["16200.00", "18900.00", "17400.00", "20100.00", "22525.00", "25080.00"],
					accent: "success",
					sub: "35.5% margin",
				},
				{
					label: "Receivables",
					value: "RM 96,300.00",
					badge: "7 overdue",
					badgeTone: "amber",
					sparkline: ["71000.00", "78400.00", "82100.00", "88900.00", "91200.00", "96300.00"],
					accent: "warning",
					sub: "RM 31,450.00 overdue",
					subTone: "warn",
				},
				{
					label: "Payables",
					value: "RM 51,240.60",
					delta: -4.6,
					sparkline: ["60100.00", "57800.00", "55200.00", "54900.00", "53700.00", "51240.00"],
					accent: "error",
					sub: "Nothing due this week",
				},
			]}
		/>
	);
}
