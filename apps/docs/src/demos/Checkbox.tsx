import { useState } from "react";
import { Checkbox } from "@cynco-labs/ui";

export default function CheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Checkbox size="sm" checked={s} onCheckedChange={setS} />
			<Checkbox size="md" defaultChecked />
			<Checkbox size="lg" />
			<Checkbox disabled />
			<Checkbox disabled checked />
		</div>
	);
}
