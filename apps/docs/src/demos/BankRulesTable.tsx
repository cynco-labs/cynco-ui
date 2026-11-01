import { BankRulesTable } from "@cynco-labs/ui";

export default function BankRulesTableDemo() {
	return (
		<BankRulesTable
			rules={[
				{
					id: "r1",
					matchType: "payee",
					pattern: "Tenaga Nasional",
					account: { code: "6210", name: "Utilities" },
					priority: 10,
					source: "user_created",
					isActive: true,
					timesApplied: 24,
					timesOverridden: 0,
				},
				{
					id: "r2",
					matchType: "contains",
					pattern: "GRAB",
					account: { code: "6510", name: "Travel & Transport" },
					priority: 20,
					source: "ai_learned",
					isActive: true,
					timesApplied: 46,
					timesOverridden: 3,
				},
				{
					id: "r3",
					matchType: "contains",
					pattern: "KWSP",
					account: { code: "6120", name: "EPF Contributions" },
					priority: 5,
					source: "system_default",
					isActive: true,
					timesApplied: 12,
					timesOverridden: 0,
				},
				{
					id: "r5",
					matchType: "regex",
					pattern: "^SC-\\d+",
					account: { code: "6800", name: "Bank Charges" },
					priority: 30,
					source: "user_created",
					isActive: true,
					timesApplied: 0,
					timesOverridden: 0,
				},
				{
					id: "r6",
					matchType: "not_contains",
					pattern: "REFUND",
					account: null,
					category: "Sales Revenue",
					priority: 40,
					source: "ai_learned",
					isActive: false,
					timesApplied: 9,
					timesOverridden: 5,
				},
			]}
		/>
	);
}
