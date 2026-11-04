# ModelSelector

A command-palette dialog for choosing a model, with provider logos.

```tsx
import { ModelSelector } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
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
```

## Use

Model pickers in chat inputs.

## Props

Dialog props; `ModelSelectorTrigger`, `ModelSelectorContent title` › `ModelSelectorInput`, `ModelSelectorList` › `ModelSelectorGroup heading` › `ModelSelectorItem` › `ModelSelectorLogo provider` + `ModelSelectorName`.

## Notes

Logos load from models.dev at runtime.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/model-selector.tsx:18-18`.
