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
