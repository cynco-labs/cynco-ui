import { FixedAssetOverview } from "@cynco-labs/ui";

export default function FixedAssetOverviewDemo() {
	return (
		<FixedAssetOverview
			asset={{
				assetCode: "FA-2024-0031",
				name: "Toyota Hilux 2.4 Double Cab",
				status: "active",
				categoryName: "Motor vehicles",
				description: "Delivery pickup — Shah Alam warehouse",
				purchaseDate: "2024-03-18",
				totalCost: 148900,
				accumulatedDepreciation: 46531.25,
				netBookValue: 102368.75,
				qualifyingExpenditure: 100000,
				residualValue: 20000,
				depreciationMethod: "straight_line",
				usefulLifeMonths: 60,
				depreciationRate: null,
				serialNumber: "MR0HA3CD5P0412887",
				location: "Shah Alam HQ",
				department: "Logistics",
				custodian: "Faizal Rahman",
				invoiceReference: "INV-UMW-240318",
				measurementModel: "cost",
				sourceType: "bill",
				caClass: "motor_vehicle",
				iaRate: "20",
				aaRate: "20",
				iaClaimed: 20000,
				cumulativeAaClaimed: 40000,
				residualExpenditure: 40000,
			}}
		/>
	);
}
