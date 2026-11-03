import { BankCashFlowChart } from "@cynco-labs/ui";

const MONTHS: [string, number, number][] = [
	["May", 96200, 83800],
	["Jun", 78400, 82700],
	["Jul", 112300, 93550],
	["Aug", 88600, 79500],
	["Sep", 91200, 93400],
	["Oct", 104800, 89000],
];

export default function BankCashFlowChartDemo() {
	const d = MONTHS.map(([month, credits, debits]) => ({
		label: month + " 2026",
		credits,
		debits,
		net: credits - debits,
	}));
	return <BankCashFlowChart data={d} />;
}
