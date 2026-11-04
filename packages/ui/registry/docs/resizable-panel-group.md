# ResizablePanelGroup

Resizable split panes (react-resizable-panels 4).

```tsx
import { ResizablePanelGroup } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@cynco-labs/ui";

export default function ResizablePanelGroupDemo() {
	return (
		<ResizablePanelGroup orientation="horizontal" className="max-w-[480px] rounded-lg border min-h-[120px]">
			<ResizablePanel defaultSize="40%">
				<div className="p-3 text-sm font-medium text-muted-foreground">Accounts</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize="60%">
				<div className="p-3 text-sm font-medium text-muted-foreground">Editor</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
```

## Use

Editor layouts with a sidebar and canvas.

## Props

`orientation`, `ResizablePanel defaultSize`, `ResizableHandle withHandle`.

Category: Components · Layout. Source: `packages/ui/src/base/components/ui/resizable.tsx:6-14`.
