import { useState } from "react";
import { Calendar } from "@cynco-labs/ui";

export default function CalendarDemo() {
	const [s, setS] = useState<Date | undefined>(new Date(2026, 9, 29));
	return (
		<Calendar
			mode="single"
			selected={s}
			onSelect={setS}
			defaultMonth={new Date(2026, 9, 1)}
			className="w-fit rounded-lg border bg-interactive-secondary"
		/>
	);
}
