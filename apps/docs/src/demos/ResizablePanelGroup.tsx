import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@cynco-labs/ui";

export default function ResizablePanelGroupDemo() {
	return (
		<ResizablePanelGroup
			orientation="horizontal"
			className="max-w-[480px] rounded-lg border min-h-[120px]"
		>
			<ResizablePanel defaultSize="40%">
				<div className="p-3 text-body">Accounts</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize="60%">
				<div className="p-3 text-body">Editor</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
