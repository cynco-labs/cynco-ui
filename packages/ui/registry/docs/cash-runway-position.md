# CashRunwayPosition

The position band of the CFO figures: cash on hand across accounts, the runway meter (months at the last 3 months' burn) and the implied cash trail.

```tsx
import { CashRunwayPosition } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CashRunwayPosition } from "@cynco-labs/ui";

export default function CashRunwayPositionDemo() {
	return (
		<div className="max-w-[520px]">
			<CashRunwayPosition
				cash={184520.4}
				accounts={3}
				runwayMonths={4.6}
				trail={[
					{ label: "May", cash: 121400 },
					{ label: "Jun", cash: 117700 },
					{ label: "Jul", cash: 133300 },
					{ label: "Aug", cash: 146800 },
					{ label: "Sep", cash: 165620 },
					{ label: "Oct", cash: 184520 },
				]}
			/>
		</div>
	);
}
```

## Use

Top of Cynco numbers panel, answering 'how much cash, how long does it last'.

## Props

cash, runwayMonths (null when unknown); optional accounts, cashPositive, trail [{label, cash}], currency; plus className and native element props (spread on the root).

- `cash`: `number | null`
- `runwayMonths`: `number | null`. Months at the last 3 months' burn; null when it can't be computed.
- `accounts?`: `number | null`
- `cashPositive?`: `boolean`. No burn to divide by — earns a full bar.
- `trail?`: `{ label: string; cash: number }[]`. Implied month-end cash, oldest → newest.
- `currency?`: `string`. Default `"MYR"`.
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive: runway block drops under the cash figure below 28rem; trail caption moves under the chart.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports.tsx`.
