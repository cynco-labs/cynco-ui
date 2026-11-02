import { useState } from "react";
import { Label, Switch, SwitchSizeProvider } from "@cynco-labs/ui";

export default function SwitchDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-4">
			<Label>
				<Switch checked={s} onCheckedChange={setS} />
				Email receipts
			</Label>
			<Label>
				<Switch />
				Auto-reconcile
			</Label>
			<SwitchSizeProvider size="sm">
				<Label>
					<Switch defaultChecked />
					Compact
				</Label>
			</SwitchSizeProvider>
			<Label>
				<Switch disabled />
				Locked
			</Label>
		</div>
	);
}
