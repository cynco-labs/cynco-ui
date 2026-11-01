import { useState } from "react";
import { TimePickerInput } from "@cynco-labs/ui";

export default function TimePickerInputDemo() {
	const [s, setS] = useState(new Date(2026, 9, 29, 9, 30));
	return (
		<div className="flex flex-wrap items-center gap-2">
			<TimePickerInput picker="hours" date={s} setDate={setS} />
			<span className="text-tertiary-foreground">:</span>
			<TimePickerInput picker="minutes" date={s} setDate={setS} />
		</div>
	);
}
