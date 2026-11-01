# BalanceSheetStatement

Balance sheet: the Total assets / liabilities / equity strip, an out-of-balance callout, and the Assets / Liabilities / Equity ladder with a Balanced chip.

```tsx
import { BalanceSheetStatement } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BalanceSheetStatement } from "@cynco-labs/ui";

function r(kind, key, label, vals, o) {
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
			totals={{ assets: 280820.4, liabilities: 51240.6, equity: 229579.8 }}
		/>
	);
}
```

## Use

The balance sheet report as at a period end, single or comparative.

## Props

asAt, rows (StatementRow ladder, see ProfitLossStatement), totals {assets, liabilities, equity}; optional priorPeriod, equityLabel (legal-form wording), showTotalsStrip, balanced, description, currency; plus className and native element props (spread on the root).

## Notes

Responsive: totals in an auto-fit StatGrid; same container-query ladder as the P&L.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports.tsx`.
