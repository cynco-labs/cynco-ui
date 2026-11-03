import {
	Context,
	ContextCacheUsage,
	ContextContent,
	ContextContentBody,
	ContextContentFooter,
	ContextContentHeader,
	ContextInputUsage,
	ContextOutputUsage,
	ContextReasoningUsage,
	ContextTrigger,
} from "@cynco-labs/ui/ai";

export default function ContextDemo() {
	return (
		<Context
			defaultOpen
			usedTokens={48200}
			maxTokens={200000}
			usage={{
				inputTokens: 40000,
				inputTokenDetails: {
					noCacheTokens: 28000,
					cacheReadTokens: 12000,
					cacheWriteTokens: undefined,
				},
				outputTokens: 6200,
				outputTokenDetails: { textTokens: 4200, reasoningTokens: 2000 },
				reasoningTokens: 2000,
				cachedInputTokens: 12000,
				totalTokens: 48200,
			}}
			modelId="anthropic:claude-sonnet-4"
		>
			<ContextTrigger />
			<ContextContent align="start">
				<ContextContentHeader />
				<ContextContentBody>
					<ContextInputUsage />
					<ContextOutputUsage />
					<ContextReasoningUsage />
					<ContextCacheUsage />
				</ContextContentBody>
				<ContextContentFooter />
			</ContextContent>
		</Context>
	);
}
