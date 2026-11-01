# Pagination

Minimal pagination containers (nav › list › item).

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
					<Button variant="secondary" size="mini">
						Previous
					</Button>
				</PaginationItem>
				<PaginationItem>
					<span className="text-body px-2">Page 2 of 8</span>
				</PaginationItem>
				<PaginationItem>
					<Button variant="secondary" size="mini">
						Next
					</Button>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
```

## Use

Wrapping your own previous/next Buttons. Tables use the DataTable pagination parts.

## Props

Children; `PaginationContent`, `PaginationItem`.

Category: Components · Navigation. Source: `packages/ui/src/base/components/ui/pagination.tsx`.
