# PageContainer

The main content panel that sits on `outer-background`.

```tsx
import { PageContainer } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Wrapping each page's content.

## Props

Children.

Category: Components · Layout. Source: `packages/ui/src/base/components/general/page-container.tsx:3-15`.
