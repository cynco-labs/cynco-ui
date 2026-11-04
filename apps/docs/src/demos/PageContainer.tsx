import { PageContainer, PageHeader } from "@cynco-labs/ui";
import { UsersIcon } from "@phosphor-icons/react";

export default function PageContainerDemo() {
	return (
		<div className="bg-outer-background p-2">
			<PageContainer>
				<PageHeader icon={<UsersIcon size={16} weight="fill" className="text-subtle" />} title="Customers" />
				<div className="text-sm font-medium text-muted-foreground p-3">Page content</div>
			</PageContainer>
		</div>
	);
}
