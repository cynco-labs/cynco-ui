import { CashFlowOverview } from "@cynco-labs/ui";

const pts = [
	{ label: "May", credits: 61200, debits: 48700, net: 12500 },
	{ label: "Jun", credits: 58400, debits: 62100, net: -3700 },
	{ label: "Jul", credits: 66900, debits: 51300, net: 15600 },
	{ label: "Aug", credits: 72300, debits: 58800, net: 13500 },
	{ label: "Sep", credits: 69150, debits: 60400, net: 8750 },
	{ label: "Oct", credits: 74800, debits: 55900, net: 18900 },
];

export default function CashFlowOverviewDemo() {
	return <CashFlowOverview points={pts} />;
}
