import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cynco-labs/ui";

export default function SelectDemo() {
	return (
		<div className="max-w-[240px]">
			<Select
				defaultValue="month"
				defaultOpen
				items={[
					{ label: "Monthly", value: "month" },
					{ label: "Quarterly", value: "quarter" },
					{ label: "Yearly", value: "year" },
				]}
			>
				<SelectTrigger className="w-full" aria-label="Billing period">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="month">Monthly</SelectItem>
					<SelectItem value="quarter">Quarterly</SelectItem>
					<SelectItem value="year">Yearly</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
