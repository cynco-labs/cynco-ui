# Table

Plain table primitives (table, header, row, head, cell, footer, caption).

```tsx
import { Table } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@cynco-labs/ui";

export default function TableDemo() {
	return (
		<div className="max-w-[560px] rounded-lg border bg-table-surface">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Customer</TableHead>
						<TableHead>Invoice</TableHead>
						<TableHead className="text-right">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{[
						["Nusantara Logistik Bhd", "INV-2026-0142", "RM 12,720.00"],
						["TechNova Solutions Sdn Bhd", "INV-2026-0141", "RM 3,180.00"],
						["Kedai Runcit Maju Jaya", "INV-2026-0140", "RM 486.50"],
					].map((r) => (
						<TableRow key={r[0]}>
							<TableCell>{r[0]}</TableCell>
							<TableCell>{r[1]}</TableCell>
							<TableCell className="text-right">{r[2]}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
```

## Use

Small static tables. For data lists use DataTable.

## Props

Native table element props; `flexibleTableColumns` on `Table`.

- `flexibleTableColumns?`: `boolean`
- Also accepts `ComponentProps<"table">`.

Category: Components · Data display. Source: `packages/ui/src/base/components/table/index.tsx`.
