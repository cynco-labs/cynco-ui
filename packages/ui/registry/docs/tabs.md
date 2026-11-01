# Tabs

Base UI tabs with `default` (pill) and `underline` list variants.

```tsx
import { Tabs } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Tabs, TabsList, TabsTrigger } from "@cynco-labs/ui";

export default function TabsDemo() {
	return (
		<div className="flex flex-col gap-4">
			<Tabs defaultValue="invoices">
				<TabsList>
					<TabsTrigger value="invoices">Invoices</TabsTrigger>
					<TabsTrigger value="quotations">Quotations</TabsTrigger>
					<TabsTrigger value="credit-notes">Credit notes</TabsTrigger>
				</TabsList>
			</Tabs>
			<Tabs defaultValue="overview">
				<TabsList variant="underline">
					<TabsTrigger variant="underline" value="overview">
						Overview
					</TabsTrigger>
					<TabsTrigger variant="underline" value="events">
						Events
					</TabsTrigger>
					<TabsTrigger variant="underline" value="invoices">
						Invoices
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
}
```

## Use

Switching sections of a page (`underline`) or modes inside a panel (`default`).

## Props

`Tabs value/defaultValue`, `TabsList variant`, `TabsTrigger value variant`, `TabsContent value`.

## Notes

Pass the same `variant` to the list and its triggers.

Category: Components · Navigation. Source: `packages/ui/src/base/components/ui/tabs.tsx`.
