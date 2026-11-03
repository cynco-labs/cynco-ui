# BankRulesTable

Categorisation rules with match, target account, source, priority, times applied and override rate, plus search, All/Active/Inactive filter, 'Apply to unposted lines' and 'New rule'.

```tsx
import { BankRulesTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankRulesTable } from "@cynco-labs/ui";

export default function BankRulesTableDemo() {
	return (
		<BankRulesTable
			onApplyToUnposted={() => {}}
			onNewRule={() => {}}
			onRowAction={() => {}}
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
```

## Use

Banking → Rules.

## Props

rules [{id, matchType, pattern, account {code, name} | null, category, priority, source, isActive, timesApplied, timesOverridden}], search, status, className and native props (spread on the root).

- `rules`: `BankRuleRow[]`
- `query?`: `string`. Controlled search query.
- `defaultQuery?`: `string`. Initial search query for uncontrolled use.
- `onQueryChange?`: `(query: string) => void`. Called when the user types in the search box.
- `status?`: `"all" | "active" | "inactive"`. Controlled status filter.
- `defaultStatus?`: `"all" | "active" | "inactive"`. Initial status filter for uncontrolled use.
- `onStatusChange?`: `(status: "all" | "active" | "inactive") => void`. Called when the user changes the status filter.
- `onApplyToUnposted?`: `() => void`. Called when the user clicks "Apply to unposted lines".
- `onNewRule?`: `() => void`. Called when the user clicks "New rule".
- `onRowAction?`: `(rule: BankRuleRow) => void`. Called when the user triggers the action menu on a rule row.
- Also accepts `ComponentProps<"div">`.

## Notes

Rule sources are StatusChips (You blue, Learned purple, Default neutral); the row menu is a ToolbarButton and the source filter a GroupedTabButton. Responsive: built on DataList: a tray table from 48rem; below that, stacked cards with the source chip, the three figures folded into one line, and the target account.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
