# TaxComputationSummary

Form C chargeable income build-up (accounting profit → adjusted → statutory business → total → chargeable income) beside the tax computation (SME bands, rebates, s110/bilateral credits, CP204 paid, balance payable).

```tsx
import { TaxComputationSummary } from "@cynco-labs/ui";
```

## Usage

```tsx
import { TaxComputationSummary } from "@cynco-labs/ui";

export default function TaxComputationSummaryDemo() {
	return (
		<TaxComputationSummary
			data={{
				accountingProfit: 486250,
				addBacks: 62480,
				deductions: 18300,
				adjustedIncome: 530430,
				capitalAllowances: 74215,
				balancingCharges: 0,
				balancingAllowances: 2100,
				statutoryBusinessIncome: 454115,
				otherStatutoryIncome: 12840,
				aggregateIncome: 466955,
				currentYearLosses: 0,
				broughtForwardLosses: 35600,
				totalIncome: 431355,
				approvedDonations: 5000,
				chargeableIncome: 426355,
				isSME: true,
				taxOnFirst150k: 22500,
				taxOn150kTo600k: 46980.35,
				taxAbove600k: 0,
				totalTaxCharged: 69480.35,
				taxRebates: 0,
				section110Credit: 1284,
				bilateralCredit: 0,
				cp204Paid: 72000,
				balancePayable: -3803.65,
			}}
		/>
	);
}
```

## Use

Corporate tax return page, Computation tab.

## Props

`data` with every Form C line (numbers or numeric strings, null = 0) and `isSME`; optional `rateExplanation` shown under the Standard 24% chip; optional `className` and native div props on the root.

## Notes

Responsive by container: two panels side by side from 42rem of container width, stacked below.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
