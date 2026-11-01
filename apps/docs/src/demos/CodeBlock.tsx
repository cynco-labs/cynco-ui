import { CodeBlock, CodeBlockCopyButton } from "@cynco-labs/ui/ai";

export default function CodeBlockDemo() {
	return (
		<CodeBlock
			className="max-w-[560px]"
			language="typescript"
			showLineNumbers
			code={
				'const invoice = await cynco.invoices.create({\n  customerId: "cus_2Hk9vQ81",\n  lines: [{ itemCode: "SVC-01", quantity: 1 }],\n});'
			}
		>
			<CodeBlockCopyButton />
		</CodeBlock>
	);
}
