import {
	ChainOfThought,
	ChainOfThoughtContent,
	ChainOfThoughtHeader,
	ChainOfThoughtSearchResult,
	ChainOfThoughtSearchResults,
	ChainOfThoughtStep,
} from "@cynco-labs/ui/ai";

export default function ChainOfThoughtDemo() {
	return (
		<ChainOfThought defaultOpen className="max-w-[520px]">
			<ChainOfThoughtHeader>Reconciling October</ChainOfThoughtHeader>
			<ChainOfThoughtContent>
				<ChainOfThoughtStep label="Read the bank statement" description="142 lines, Maybank Current" status="complete" />
				<ChainOfThoughtStep label="Match open invoices" status="active">
					<ChainOfThoughtSearchResults>
						<ChainOfThoughtSearchResult>INV-2026-0142</ChainOfThoughtSearchResult>
						<ChainOfThoughtSearchResult>BILL-2026-0088</ChainOfThoughtSearchResult>
					</ChainOfThoughtSearchResults>
				</ChainOfThoughtStep>
				<ChainOfThoughtStep label="Draft the closing journal" status="pending" />
			</ChainOfThoughtContent>
		</ChainOfThought>
	);
}
