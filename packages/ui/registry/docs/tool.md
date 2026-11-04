# Tool

A collapsible card for a tool call: name, status badge, parameters and result as highlighted JSON.

```tsx
import { Tool } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@cynco-labs/ui/ai";

export default function ToolDemo() {
	return (
		<Tool defaultOpen className="max-w-[560px]">
			<ToolHeader type="tool-find_invoice" state="output-available" title="find_invoice" />
			<ToolContent>
				<ToolInput input={{ reference: "INV-2026-0142" }} />
				<ToolOutput output={{ number: "INV-2026-0142", status: "sent", balanceDue: "12720.00" }} errorText={undefined} />
			</ToolContent>
		</Tool>
	);
}
```

## Use

Every tool call in a transcript.

## Props

`ToolHeader` (`type`, `state`, `title`), `ToolContent` › `ToolInput input`, `ToolOutput output errorText`.

- `asChild?`: `boolean`
- Also accepts `CollapsiblePrimitive.Root.Props`.

## Notes

States: input-streaming, input-available, approval-requested, output-available, output-error, output-denied.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/tool.tsx:14-16`.
