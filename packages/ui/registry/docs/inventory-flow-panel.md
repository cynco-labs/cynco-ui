# InventoryFlowPanel

Stock lifecycle in five steps (set up items, order and receive, record bill, dispatch goods, reconcile) with the GL reconciled / review state.

```tsx
import { InventoryFlowPanel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InventoryFlowPanel } from "@cynco-labs/ui";

export default function InventoryFlowPanelDemo() {
	return <InventoryFlowPanel trackedItems={42} isReconciled={false} />;
}
```

## Use

Top of the inventory workspace.

## Props

`trackedItems` count and `isReconciled`; optional `className` and native section props on the root.

- `trackedItems`: `number`
- `isReconciled`: `boolean`
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive by container: steps 1 / 2 / 3 / 5 per row by container width.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/inventory.tsx:15-90`.
