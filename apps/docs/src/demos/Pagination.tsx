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
