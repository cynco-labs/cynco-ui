# Pagination

The landmark around a set of page controls (nav › list › item).

```tsx
import { Pagination } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, Pagination, PaginationContent, PaginationItem } from "@cynco-labs/ui";

export default function PaginationDemo() {
	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<Button variant="secondary" size="sm">
						Previous
					</Button>
				</PaginationItem>
				<PaginationItem>
					<span className="text-sm font-medium text-muted-foreground px-2">Page 2 of 8</span>
				</PaginationItem>
				<PaginationItem>
					<Button variant="secondary" size="sm">
						Next
					</Button>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
```

## Use

Wrapping your own previous and next Buttons. A data table uses `DataTable.Pagination`, which is built on these.

## Props

Children; `PaginationContent`, `PaginationItem`.

## Accessibility

The root is a nav with aria-label "pagination" and its items sit in a ul and li, so the set is announced as one labelled list. The controls inside are yours, so mark the current page with aria-current="page" and label icon-only previous and next buttons yourself.

Category: Components · Navigation. Source: `packages/ui/src/base/components/ui/pagination.tsx:4-14`.
