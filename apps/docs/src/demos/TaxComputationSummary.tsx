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
