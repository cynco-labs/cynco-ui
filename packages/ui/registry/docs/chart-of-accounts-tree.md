# ChartOfAccountsTree

The nested Chart of Accounts: expandable header accounts, category dot, mono code, name, type and balance, with inactive accounts marked.

```tsx
import { ChartOfAccountsTree } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ChartOfAccountsTree, type CoaTreeNode } from "@cynco-labs/ui";

function n(
	id: string,
	code: string,
	name: string,
	type: string,
	bal: number,
	kids?: CoaTreeNode[] | null,
	extra?: Partial<CoaTreeNode>,
): CoaTreeNode {
	return Object.assign(
		{
			id,
			accountCode: code,
			accountName: name,
			accountType: type,
			balance: bal,
			isActive: true,
			isHeaderAccount: !!kids,
			children: kids || [],
		},
		extra || {},
	);
}

const TREE = [
	n("1000", "1000", "Current Assets", "asset", 0, [
		n("1000-001", "1000-001", "Maybank Current Account", "asset", 248315.4),
		n("1000-002", "1000-002", "CIMB Business Account", "asset", 61204.15),
		n("1100-000", "1100-000", "Petty Cash", "asset", 850),
		n("1200-001", "1200-001", "Trade Receivables", "asset", 134780.0),
	]),
	n("1500", "1500", "Property, Plant & Equipment", "asset", 0, [
		n("1500-000", "1500-000", "Office Equipment", "asset", 42600),
		n("1510-000", "1510-000", "Accumulated Depreciation – Office Equipment", "contra_asset", -14200),
	]),
	n("2000", "2000", "Current Liabilities", "liability", 0, [
		n("2000-001", "2000-001", "Trade Payables", "liability", 58320.75),
		n("2200-000", "2200-000", "SST Payable", "liability", 9640.0),
		n("2300-001", "2300-001", "EPF Payable", "liability", 4440.0),
		n("2400-000", "2400-000", "Director Loan (legacy)", "liability", 0, null, { isActive: false }),
	]),
	n("3000", "3000", "Equity", "equity", 0, [n("3100-000", "3100-000", "Retained Earnings", "equity", 286400.0)]),
	n("4000", "4000", "Revenue", "revenue", 0, [
		n("4000-001", "4000-001", "Sales – Consulting Services", "revenue", 512300.0),
	]),
];

export default function ChartOfAccountsTreeDemo() {
	return (
		<ChartOfAccountsTree
			nodes={TREE}
			currency="MYR"
			defaultSelectedId="1000-001"
			defaultExpandedIds={["1000", "1500", "2000"]}
		/>
	);
}
```

## Use

The Chart of Accounts page's main list; pair with CoaAccountPanel for the selected account.

## Props

nodes [{ id, accountCode, accountName, accountType, balance?, isHeaderAccount?, isActive?, children? }], currency?, expandedIds? / defaultExpandedIds? / onExpandedChange?, selectedId?, onSelect?, className? (merged on the root) and native props.

- `nodes`: `CoaTreeNode[]`
- `currency?`: `string`. Default `"MYR"`.
- `expandedIds?`: `string[]`. Controlled set of expanded node ids.
- `defaultExpandedIds?`: `string[]`. Which nodes start expanded for uncontrolled use; the top level by default.
- `onExpandedChange?`: `(ids: string[]) => void`
- `selectedId?`: `string`. Controlled selection.
- `defaultSelectedId?`: `string`. Initial selection for uncontrolled use.
- `onSelect?`: `(id: string) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Keeps the ARIA tree (role=treeitem, aria-level/expanded/selected, Enter/Space/Arrow keys). Header accounts show "—", negatives in text-destructive, Inactive as a neutral StatusChip. Responsive: Container-responsive: below 28rem the code sits above the name, below 36rem the Type column is dropped; headers reuse the row layout so they always line up.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger/coa-tree.tsx:203-323`.
