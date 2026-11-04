import { Checkbox, Label } from "@cynco-labs/ui";
import { useState } from "react";

export default function CheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-4">
			<Label>
				<Checkbox size="sm" checked={s} onCheckedChange={setS} />
				Small
			</Label>
			<Label>
				<Checkbox size="md" defaultChecked />
				Medium
			</Label>
			<Label>
				<Checkbox size="lg" />
				Large
			</Label>
			<Label>
				<Checkbox disabled />
				Disabled
			</Label>
			<Label>
				<Checkbox disabled checked />
				Disabled, checked
			</Label>
		</div>
	);
}
