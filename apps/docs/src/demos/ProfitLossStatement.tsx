import { ProfitLossStatement, type StatementRow, type StatementRowKind } from "@cynco-labs/ui";

function r(
	kind: StatementRowKind,
	key: string,
	label: string,
	vals?: number[],
	o: Partial<StatementRow> = {},
): StatementRow {
	return { kind, key, label, values: vals, ...o };
}

const rows: StatementRow[] = [
	r("section-header", "rev", "Revenue"),
	r("account", "4000", "Sales – services", [52400, 47850], { accountCode: "4000-001" }),
	r("account", "4010", "Sales – products", [18250, 21300], { accountCode: "4010-001" }),
	r("section-total", "revT", "Total Revenue", [70650, 69150]),
	r("section-header", "cos", "Cost of sales", undefined, { negate: true }),
	r("account", "5000", "Cost of goods sold", [24180, 26040], {
		accountCode: "5000-001",
		negate: true,
	}),
	r("section-total", "cosT", "Total Cost of sales", [24180, 26040], { negate: true }),
	r("subtotal", "gp", "Gross profit", [46470, 43110]),
	r("section-header", "opex", "Operating expenses", undefined, { negate: true }),
	r("account", "6100", "Salaries & wages", [18600, 17900], {
		accountCode: "6100-001",
		negate: true,
	}),
	r("account", "6110", "EPF, SOCSO & EIS contributions", [2790, 2685], {
		accountCode: "6110-001",
		negate: true,
	}),
	r("section-total", "opexT", "Total Operating expenses", [21390, 20585], { negate: true }),
	r("subtotal", "op", "Operating profit", [25080, 22525]),
	r("grand-total", "ni", "Net Income", [25080, 22525]),
];

export default function ProfitLossStatementDemo() {
	return <ProfitLossStatement period="Oct 2026" priorPeriod="Sep 2026" rows={rows} />;
}
