# PageHeader

Page title row: icon + title (+ accessory) on the left, actions on the right.

```tsx
import { PageHeader } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ReceiptIcon } from "@phosphor-icons/react";
import { Badge, Button, PageHeader } from "@cynco-labs/ui";

export default function PageHeaderDemo() {
	return (
		<PageHeader
			icon={<ReceiptIcon size={16} weight="fill" className="text-subtle" />}
			title="Invoices"
			titleAccessory={<Badge variant="muted">128</Badge>}
		>
			<Button variant="primary">Create invoice</Button>
		</PageHeader>
	);
}
```

## Use

Top of every list page; matches DataTable.Toolbar.

## Props

`icon` (16px Phosphor fill in `subtle`), `title`, optional `titleAccessory`, actions as children.

Category: Components · Layout. Source: `packages/ui/src/base/components/general/page-header.tsx`.
