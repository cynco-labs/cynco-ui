import { useState } from "react";
import { DateInputUnix } from "@cynco-labs/ui";

export default function DateInputUnixDemo() {
	const [s, setS] = useState<number | null>(1798761600000);
	return (
		<div className="max-w-[260px]">
			<DateInputUnix unixDate={s} setUnixDate={setS} />
		</div>
	);
}
