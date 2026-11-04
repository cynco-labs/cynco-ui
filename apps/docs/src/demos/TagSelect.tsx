import { Label, TagSelect } from "@cynco-labs/ui";
import { useState } from "react";

export default function TagSelectDemo() {
	const [s, setS] = useState(["sa", "kl"]);
	return (
		<div className="max-w-[360px]">
			<Label htmlFor="tag-select-branches">Branches</Label>
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
