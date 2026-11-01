import { Reasoning, ReasoningContent, ReasoningTrigger } from "@cynco-labs/ui/ai";

export default function ReasoningDemo() {
	return (
		<Reasoning defaultOpen isStreaming={false} duration={4} className="max-w-[520px]">
			<ReasoningTrigger />
			<ReasoningContent>
				The receipt of RM 12,720.00 equals INV-2026-0142 and quotes its number, so it settles that
				invoice rather than counting as revenue.
			</ReasoningContent>
		</Reasoning>
	);
}
