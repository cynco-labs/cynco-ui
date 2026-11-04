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
