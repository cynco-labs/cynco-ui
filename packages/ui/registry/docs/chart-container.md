# ChartContainer

shadcn chart wrapper for Recharts: maps a config to `--color-<key>` variables and supplies tooltip and legend content.

```tsx
import { ChartContainer } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@cynco-labs/ui";

const data = [
	{ m: "May", v: 320 },
	{ m: "Jun", v: 410 },
	{ m: "Jul", v: 380 },
	{ m: "Aug", v: 520 },
	{ m: "Sep", v: 610 },
	{ m: "Oct", v: 700 },
];

export default function ChartContainerDemo() {
	return (
		<ChartContainer
			config={{ v: { label: "Revenue (RM k)", color: "var(--chart-series-1)" } }}
			className="h-[190px] w-full max-w-[560px]"
		>
			<BarChart data={data}>
				<CartesianGrid vertical={false} stroke="var(--chart-grid-stroke)" />
				<XAxis dataKey="m" tickLine={false} axisLine={false} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<Bar dataKey="v" fill="var(--color-v)" radius={4} />
			</BarChart>
		</ChartContainer>
	);
}
```

## Use

Revenue, expense and cash charts.

## Props

`config` {key: {label, color | theme}} and one Recharts chart as child (import it from `recharts`); `ChartTooltip` + `ChartTooltipContent`, `ChartLegend` + `ChartLegendContent`.

## Notes

Colour series with `chart-series-1…8` in order; grid lines `chart-grid-stroke`.

Category: Components · Data display. Source: `packages/ui/src/base/components/ui/chart.tsx`.
