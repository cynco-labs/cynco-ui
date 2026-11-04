import { formatCurrency, KeyValueList } from "@cynco-labs/ui";

const items = [
	{ label: "Subtotal", value: formatCurrency("12000.00") },
	{ label: "Discount (5%)", value: `−${formatCurrency("600.00")}`, negative: true },
	{ label: "SST (8%)", value: formatCurrency("912.00") },
	{ label: "Total", value: formatCurrency("12312.00"), strong: true },
];

export default function KeyValueListDemo() {
	return (
		<div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
			<div className="rounded-xl border bg-card px-4">
				<KeyValueList items={items} />
			</div>
			<div className="max-w-[200px] rounded-xl border border-dashed px-3">
				<KeyValueList items={items} />
			</div>
		</div>
	);
}
