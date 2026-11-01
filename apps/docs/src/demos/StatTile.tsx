import { StatGrid, StatTile, formatCurrency } from "@cynco-labs/ui";

function Tiles() {
	return (
		<StatGrid min="sm">
			<StatTile label="Sales" value={formatCurrency(184520.75)} tone="green" sub="October 2026" />
			<StatTile label="Pending" value={formatCurrency(46890.35)} tone="blue" />
			<StatTile
				label="Overdue"
				value={formatCurrency(11320)}
				tone="red"
				negative
				badge={<span className="text-xs text-error-text">3 invoices</span>}
			/>
			<StatTile label="Days to pay" value="38" unit="days" sub="DSO, last 90 days" />
		</StatGrid>
	);
}

export default function StatTileDemo() {
	return (
		<div className="flex flex-col gap-3">
			<Tiles />
			<div className="w-full max-w-[340px] rounded-xl border border-dashed border-border p-2">
				<Tiles />
			</div>
		</div>
	);
}
