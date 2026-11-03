import { useState } from "react";
import { FormLabel, TagSelect } from "@cynco-labs/ui";

export default function TagSelectDemo() {
	const [s, setS] = useState(["sa", "kl"]);
	return (
		<div className="max-w-[360px]">
			<FormLabel htmlFor="tag-select-branches">Branches</FormLabel>
			<TagSelect
				id="tag-select-branches"
				value={s}
				onValueChange={setS}
				placeholder="Select branches"
				options={[
					{ value: "kl", label: "Kuala Lumpur" },
					{ value: "sa", label: "Shah Alam" },
					{ value: "pg", label: "Penang" },
				]}
			/>
		</div>
	);
}
