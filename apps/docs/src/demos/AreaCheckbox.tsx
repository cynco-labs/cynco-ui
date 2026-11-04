import { AreaCheckbox } from "@cynco-labs/ui";
import { useState } from "react";

export default function AreaCheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="max-w-[420px]">
			<AreaCheckbox
				title="Auto-number invoices"
				description="Give each new invoice the next number in the series, e.g. INV-2026-0143."
				checked={s}
				onCheckedChange={setS}
			/>
		</div>
	);
}
