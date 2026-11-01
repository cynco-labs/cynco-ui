import { Source, Sources, SourcesContent, SourcesTrigger } from "@cynco-labs/ui/ai";

export default function SourcesDemo() {
	return (
		<Sources defaultOpen>
			<SourcesTrigger count={2} />
			<SourcesContent>
				<Source href="https://www.hasil.gov.my" title="LHDN" />
				<Source href="https://github.com/cynco-labs/cynco-ui" title="GitHub" />
			</SourcesContent>
		</Sources>
	);
}
