import { useState } from "react";
import { GroupedTabButton } from "@cynco-labs/ui";

export default function GroupedTabButtonDemo() {
	const [s, setS] = useState("month");
	return (
		<div className="max-w-[360px]">
			<GroupedTabButton
				value={s}
				onValueChange={setS}
				options={[
					{ value: "month", label: "Month" },
					{ value: "quarter", label: "Quarter" },
					{ value: "year", label: "Year" },
				]}
			/>
		</div>
	);
}
