import { useState } from "react";
import { Switch, SwitchSizeProvider } from "@cynco-labs/ui";

export default function SwitchDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Switch checked={s} onCheckedChange={setS} />
			<Switch />
			<SwitchSizeProvider size="sm">
				<Switch defaultChecked />
			</SwitchSizeProvider>
			<Switch disabled />
		</div>
	);
}
