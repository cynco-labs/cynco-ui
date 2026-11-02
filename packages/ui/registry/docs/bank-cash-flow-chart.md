# BankCashFlowChart

Monthly inflow and outflow bars with net as a line across them, with period totals in the legend.

```tsx
import { BankCashFlowChart } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Banking overview / cash-flow lens.

## Props

data [{label, credits, debits, net}], currency, title, className and native props (spread on the root).

- `data`: `BankCashFlowPoint[]`
- `currency?`: `string`. Default `"MYR"`.
- `title?`: `string`. Default `"Cash flow"`.
- Also accepts `ComponentProps<"section">`.

## Notes

Built on SectionPanel: the legend wraps under the title when narrow; chart fills the width.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
