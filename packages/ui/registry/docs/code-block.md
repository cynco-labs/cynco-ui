# CodeBlock

Syntax-highlighted code (Shiki, one-light / one-dark-pro) with line numbers and a copy button.

```tsx
import { CodeBlock } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
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
```

## Use

Code in assistant replies and tool output.

## Props

`code`, `language`, `showLineNumbers`; `CodeBlockCopyButton` child.

- `code`: `string`
- `language`: `BundledLanguage`
- `showLineNumbers?`: `boolean`. Default `false`.
- Also accepts `HTMLAttributes<HTMLDivElement>`.

## Notes

The bundle carries Shiki grammars for TypeScript, TSX, JavaScript, JSX, JSON, Bash, Python, CSS, HTML, Markdown, YAML, SQL and Go; other languages render as plain text.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/code-block.tsx`.
