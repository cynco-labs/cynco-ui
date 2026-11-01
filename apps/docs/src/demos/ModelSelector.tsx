import {
	ModelSelector,
	ModelSelectorContent,
	ModelSelectorEmpty,
	ModelSelectorGroup,
	ModelSelectorInput,
	ModelSelectorItem,
	ModelSelectorList,
	ModelSelectorLogo,
	ModelSelectorName,
} from "@cynco-labs/ui/ai";

export default function ModelSelectorDemo() {
	return (
		<ModelSelector defaultOpen>
			<ModelSelectorContent title="Choose a model">
				<ModelSelectorInput placeholder="Search models…" />
				<ModelSelectorList>
					<ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
					<ModelSelectorGroup heading="Anthropic">
						<ModelSelectorItem>
							<ModelSelectorLogo provider="anthropic" />
							<ModelSelectorName>Claude Sonnet</ModelSelectorName>
						</ModelSelectorItem>
					</ModelSelectorGroup>
					<ModelSelectorGroup heading="OpenAI">
						<ModelSelectorItem>
							<ModelSelectorLogo provider="openai" />
							<ModelSelectorName>GPT</ModelSelectorName>
						</ModelSelectorItem>
					</ModelSelectorGroup>
				</ModelSelectorList>
			</ModelSelectorContent>
		</ModelSelector>
	);
}
