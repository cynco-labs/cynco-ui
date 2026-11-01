import { Suggestion, Suggestions } from "@cynco-labs/ui/ai";

export default function SuggestionDemo() {
	return (
		<Suggestions>
			{["Who owes us money?", "Record a bill", "Explain my P&L"].map((t) => (
				<Suggestion key={t} suggestion={t} />
			))}
		</Suggestions>
	);
}
