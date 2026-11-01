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
