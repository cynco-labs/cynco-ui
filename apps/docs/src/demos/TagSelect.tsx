import { useState } from "react";
import { TagSelect } from "@cynco-labs/ui";

export default function TagSelectDemo() {
	const [s, setS] = useState(["sa"]);
	return (
		<div className="max-w-[360px]">
			<TagSelect
				value={s}
				onChange={setS}
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
