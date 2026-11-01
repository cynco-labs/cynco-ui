import { useState } from "react";
import { ItemsListTable } from "@cynco-labs/ui";

export default function ItemsListTableDemo() {
	const [s, setS] = useState(["i3"]);
	return (
		<ItemsListTable
			selectedItems={s}
			onToggle={(id) => {
				setS(s.indexOf(id) >= 0 ? s.filter((x) => x !== id) : s.concat([id]));
			}}
			onToggleAll={(all) => {
				setS(all ? ["i1", "i2", "i3", "i4", "i5"] : []);
			}}
			items={[
				{
					id: "i1",
					name: "Kopi O Kaw 1kg",
					description: "Robusta blend, roasted in Ipoh",
					unitPrice: 48,
					costingMode: "inventory",
					trackInventory: true,
					unitOfMeasure: "pack",
					reorderPoint: 40,
					taxRate: 5,
					discountRate: 0,
				},
				{
					id: "i2",
					name: "Cold brew bottle 250ml",
					description: "Glass, printed label",
					unitPrice: 3.2,
					unitCost: 3.45,
					costingMode: "fixed",
					trackInventory: true,
					unitOfMeasure: "pcs",
					reorderPoint: 500,
					taxRate: 10,
					discountRate: 0,
				},
				{
					id: "i3",
					name: "Barista training (half day)",
					description: "On-site at customer outlet",
					unitPrice: 850,
					unitCost: 320,
					costingMode: "fixed",
					targetMarginPercent: 50,
					taxRate: 8,
					discountRate: 5,
				},
				{
					id: "i4",
					name: "Espresso machine service",
					unitPrice: 280,
					costingMode: "none",
					taxRate: 8,
					discountRate: 0,
				},
				{
					id: "i5",
					name: "Paper cup 12oz (carton)",
					description: "1,000 cups per carton",
					unitPrice: 210,
					costingMode: "inventory",
					trackInventory: true,
					unitOfMeasure: "ctn",
					reorderPoint: 10,
					taxRate: 10,
					discountRate: 2.5,
					isArchived: true,
				},
			]}
			inventoryByItem={{
				i1: { onHandQuantity: 126, weightedAvgCost: 29.4 },
				i2: { onHandQuantity: 420 },
				i5: { onHandQuantity: 18, weightedAvgCost: 162 },
			}}
			realizedByItem={{
				i1: { marginPercent: 37.2, belowCostLineCount: 0 },
				i2: { marginPercent: -6.1, belowCostLineCount: 3 },
			}}
		/>
	);
}
