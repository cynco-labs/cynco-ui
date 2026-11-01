import { BankCashFlowChart } from "@cynco-labs/ui";

export default function BankCashFlowChartDemo() {
	const d = [
		["May", 96200, 83800],
		["Jun", 78400, 82700],
		["Jul", 112300, 93550],
		["Aug", 88600, 79500],
		["Sep", 91200, 93400],
		["Oct", 104800, 89000],
	].map((r) => ({ label: r[0] + " 2026", credits: r[1], debits: r[2], net: r[1] - r[2] }));
	return <BankCashFlowChart data={d} />;
}
