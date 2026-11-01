import { useState } from "react";
import { SearchableSelect } from "@cynco-labs/ui";

const opts = [
	{ id: "1000-001", name: "1000-001 · Cash in hand" },
	{ id: "1010-001", name: "1010-001 · Maybank Current" },
	{ id: "1200-001", name: "1200-001 · Trade Receivables" },
	{ id: "2100-001", name: "2100-001 · Trade Payables" },
];

export default function SearchableSelectDemo() {
	const [s, setS] = useState("1010-001");
	return (
		<div className="max-w-[260px]">
			<SearchableSelect
				value={s}
				onValueChange={setS}
				options={opts}
				getOptionValue={(o) => o.id}
				getOptionLabel={(o) => o.name}
				placeholder="Select an account"
				searchPlaceholder="Search accounts…"
				defaultOpen
				triggerClassName="w-full"
			/>
		</div>
	);
}
