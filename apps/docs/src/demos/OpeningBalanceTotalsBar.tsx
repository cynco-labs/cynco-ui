import { OpeningBalanceTotalsBar } from "@cynco-labs/ui";

export default function OpeningBalanceTotalsBarDemo() {
	return (
		<div className="flex flex-col gap-3">
			<OpeningBalanceTotalsBar debit={842310.55} credit={842310.55} filled={38} isDirty />
			<OpeningBalanceTotalsBar
				debit={842310.55}
				credit={839110.55}
				filled={37}
				isDirty
				suspenseLabel="3900-000 Opening Balance Suspense"
				entryStatus="draft"
			/>
			<OpeningBalanceTotalsBar debit={0} credit={0} filled={0} onlySubledger canPost={false} />
		</div>
	);
}
