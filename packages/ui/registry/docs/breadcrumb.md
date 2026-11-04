# Breadcrumb

Breadcrumb trail with chevron separators.

```tsx
import { Breadcrumb } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@cynco-labs/ui";

export default function BreadcrumbDemo() {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Customers</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Nusantara Logistik Bhd</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Invoices</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
```

## Use

Detail pages (Customers › Acme › Invoices).

## Props

`BreadcrumbList` › `BreadcrumbItem` › `BreadcrumbLink` / `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`.

## Notes

Links in `muted-foreground`, current page in `foreground`.

Category: Components · Navigation. Source: `packages/ui/src/base/components/ui/breadcrumb.tsx:10-12`.
