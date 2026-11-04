import {
	PromptInput,
	PromptInputBody,
	PromptInputButton,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@cynco-labs/ui/ai";
import { PlusIcon } from "@phosphor-icons/react";

export default function PromptInputDemo() {
	return (
		<div className="max-w-[560px]">
			<PromptInput onSubmit={() => {}}>
				<PromptInputBody>
					<PromptInputTextarea placeholder="Ask Cynco to record, find or explain anything…" />
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools>
						<PromptInputButton aria-label="Add attachment">
							<PlusIcon size={14} />
						</PromptInputButton>
					</PromptInputTools>
					<PromptInputSubmit status="ready" />
				</PromptInputFooter>
			</PromptInput>
		</div>
	);
}
