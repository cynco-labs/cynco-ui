# Panel

A floating panel pinned to a corner of the Canvas.

```tsx
import { Panel } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Button } from "@cynco-labs/ui";
import { Canvas, Panel } from "@cynco-labs/ui/ai";

export default function PanelDemo() {
	return (
		<div style={{ height: 180 }} className="rounded-lg border">
			<Canvas nodes={[]} edges={[]}>
				<Panel position="top-left">
					<span className="text-body px-1">Workflow · draft</span>
				</Panel>
				<Panel position="bottom-right">
					<Button variant="primary" size="mini">
						Publish
					</Button>
				</Panel>
			</Canvas>
		</div>
	);
}
```

## Use

Canvas titles, run buttons, legends.

## Props

`position` (`top-left` … `bottom-right`), children.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/panel.tsx`.
