import { BalanceSheetStatement, type StatementRow, type StatementRowKind } from "@cynco-labs/ui";

function r(
	kind: StatementRowKind,
	key: string,
	label: string,
	vals?: number[],
	o?: Partial<Omit<StatementRow, "kind" | "key" | "label" | "values">>,
): StatementRow {
	return Object.assign({ kind, key, label, values: vals }, o || {});
}

const rows = [
	r("heading", "assets", "Assets"),
	r("section-header", "ca", "Current assets"),
	r("account", "1000", "Cash at bank – Maybank", [184520.4], { accountCode: "1000-001" }),
	r("account", "1100", "Trade receivables", [96300], { accountCode: "1100-001" }),
	r("section-total", "caT", "Total Current assets", [280820.4]),
	r("grand-total", "ta", "Total Assets", [280820.4]),
	r("heading", "liab", "Liabilities"),
	r("section-header", "cl", "Current liabilities"),
	r("account", "2000", "Trade payables", [51240.6], { accountCode: "2000-001" }),
	r("section-total", "clT", "Total Current liabilities", [51240.6]),
	r("subtotal", "tl", "Total Liabilities", [51240.6]),
	r("heading", "eq", "Equity"),
	r("account", "3000", "Share capital", [100000], { accountCode: "3000-001" }),
	r("line", "cye", "Current year earnings", [129579.8]),
	r("subtotal", "te", "Total Equity", [229579.8]),
	r("grand-total", "tle", "Total Liabilities & Equity", [280820.4]),
];

export default function BalanceSheetStatementDemo() {
	return (
		<BalanceSheetStatement
			asAt="31 Oct 2026"
			rows={rows}
			showTotalsStrip={false}
			totals={{ assets: "280820.40", liabilities: "51240.60", equity: "229579.80" }}
		/>
	);
}
