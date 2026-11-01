import {
	OpenIn,
	OpenInChatGPT,
	OpenInClaude,
	OpenInContent,
	OpenInCursor,
	OpenInT3,
	OpenInTrigger,
	OpenInv0,
} from "@cynco-labs/ui/ai";

export default function OpenInDemo() {
	return (
		<OpenIn query="Explain this trial balance" defaultOpen modal={false}>
			<OpenInTrigger />
			<OpenInContent>
				<OpenInChatGPT />
				<OpenInClaude />
				<OpenInCursor />
				<OpenInT3 />
				<OpenInv0 />
			</OpenInContent>
		</OpenIn>
	);
}
