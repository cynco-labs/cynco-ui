# ActionBar

ActionBar is a row of controls that wraps instead of overflowing; ScrollRow is a single row that scrolls sideways (tabs, steppers, chips).

```tsx
import { ActionBar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ActionBar, Button, ScrollRow } from "@cynco-labs/ui";
import { useState } from "react";

const tabs = ["All", "Draft", "Pending", "Partially paid", "Overdue", "Paid", "Voided", "Cancelled", "Refunded"];

export default function ActionBarDemo() {
	const [s, setS] = useState("Overdue");
	return (
		<div className="flex flex-col gap-3">
			<ActionBar>
				<Button variant="primary" size="sm">
					New invoice
				</Button>
				<Button variant="secondary" size="sm">
					Import
				</Button>
				<Button variant="secondary" size="sm">
					Export CSV
				</Button>
				<Button variant="skeleton" size="sm">
					Columns
				</Button>
			</ActionBar>
			<ScrollRow role="group" aria-label="Status">
				{tabs.map((t) => (
					<Button
						key={t}
						aria-pressed={s === t}
						variant={s === t ? "secondary" : "skeleton"}
						size="sm"
						onClick={() => {
							setS(t);
						}}
					>
						{t}
					</Button>
				))}
			</ScrollRow>
		</div>
	);
}
```

## Use

ActionBar for page and card toolbars. ScrollRow when the items must stay on one line in order, like status tabs or a stepper.

## Props

className, children and any div props (both).

## Notes

ScrollRow hides its scrollbar; give it a role (tablist, list) and labels when it carries navigation.

Category: Layout · Primitives. Source: `packages/ui/src/layout/action-bar.tsx:6-11`.
