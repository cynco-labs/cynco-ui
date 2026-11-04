# CashFlowOverview

Money movement chart: inflow and outflow bars per month with net as a line, a 3M/6M range toggle and the window's net, or a connect-bank empty state.

```tsx
import { CashFlowOverview } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CashFlowOverview, type CashFlowPoint, type CashFlowRange } from "@cynco-labs/ui";

const pts: CashFlowPoint[] = [
	{ label: "May", credits: "61200", debits: "48700", net: "12500" },
	{ label: "Jun", credits: "58400", debits: "62100", net: "-3700" },
	{ label: "Jul", credits: "66900", debits: "51300", net: "15600" },
	{ label: "Aug", credits: "72300", debits: "58800", net: "13500" },
	{ label: "Sep", credits: "69150", debits: "60400", net: "8750" },
	{ label: "Oct", credits: "74800", debits: "55900", net: "18900" },
];

export const controls = {
	defaultRange: {
		label: "Opening range",
		options: [
			{ value: "6", label: "6 months" },
			{ value: "3", label: "3 months" },
		],
		default: "6",
	},
};

export default function CashFlowOverviewDemo({ defaultRange }: { defaultRange: CashFlowRange }) {
	return <CashFlowOverview points={pts} defaultRange={defaultRange} />;
}
```

## Use

Dashboard overview cash-flow card.

## Props

points [{label, credits, debits, net}] oldest → newest; optional currency, hasActivity, range / defaultRange / onRangeChange; plus className and native element props (spread on the root).

- `points`: `CashFlowPoint[]`. Up to 6 months, oldest → newest.
- `currency?`: `string`. Default `"MYR"`.
- `hasActivity?`: `boolean`. Default `true`.
- `range?`: `"3" | "6"`. Controlled window: how many trailing months the chart shows.
- `defaultRange?`: `"3" | "6"`. Initial window for uncontrolled use. Default `"6"`.
- `onRangeChange?`: `(range: CashFlowRange) => void`. Called when the user switches the window.
- `onConnectBank?`: `() => void`. Called from the empty state's "Connect bank"; omit to hide the button.
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive: SectionPanel header wraps the net figure and range toggle under the title; chart fills the width.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports/cash-flow.tsx:55-211`.
