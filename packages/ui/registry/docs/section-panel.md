# SectionPanel

A titled card whose header actions wrap under the title when the container is narrow.

```tsx
import { SectionPanel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, KeyValueList, SectionPanel, formatCurrency } from "@cynco-labs/ui";

function P() {
	return (
		<SectionPanel
			title="Payment received"
			description="RCPT-2026-0412 · Maybank Current Account"
			actions={[
				<Button key="a" variant="secondary" size="sm">
					Download receipt
				</Button>,
				<Button key="b" variant="primary" size="sm">
					Apply to invoice
				</Button>,
			]}
		>
			<KeyValueList
				items={[
					{ label: "Date", value: "28 Oct 2026" },
					{ label: "Customer", value: "Syarikat Maju Jaya Sdn Bhd" },
					{ label: "Amount", value: formatCurrency(12850), strong: true },
				]}
			/>
		</SectionPanel>
	);
}

export default function SectionPanelDemo() {
	return (
		<div className="flex flex-col gap-3">
			<P />
			<div className="w-full max-w-[340px] rounded-xl border border-dashed border-border p-2">
				<P />
			</div>
		</div>
	);
}
```

## Use

Grouping a chart, a detail list or a small table under a heading with actions. Use flush for content that runs edge to edge (tables).

## Props

title, description, actions, flush, className, children and any section props.

## Notes

Named SectionPanel so it never collides with the AI kit's flow-canvas Panel.

Category: Layout · Primitives. Source: `packages/ui/src/layout/index.tsx`.
