import { TaxAdjustmentsTable } from "@cynco-labs/ui";

export default function TaxAdjustmentsTableDemo() {
	return (
		<TaxAdjustmentsTable
			title="Add-backs"
			category="add_back"
			adjustments={[
				{
					id: "a1",
					category: "add_back",
					itemCode: "S39(1)(b)",
					description: "Entertainment — client dinners (50%)",
					amount: 8420,
					source: "auto_gl",
					accountCode: "6240-002",
				},
				{
					id: "a2",
					category: "add_back",
					itemCode: "S33(1)",
					description: "Depreciation per accounts",
					amount: 48610,
					source: "auto_gl",
					accountCode: "6800-001",
				},
				{
					id: "a3",
					category: "add_back",
					itemCode: "S39(1)(a)",
					description: "Penalties and fines — JPJ summons",
					amount: 1250,
					source: "manual",
					accountCode: null,
				},
				{
					id: "a4",
					category: "add_back",
					itemCode: "S39(1)(f)",
					description: "Unapproved donation, Persatuan Belia Setia",
					amount: 4200,
					source: "ai_suggested",
					accountCode: "6950-000",
				},
			]}
		/>
	);
}
