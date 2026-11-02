import { useState } from "react";
import { TagInput } from "@cynco-labs/ui";

export default function TagInputDemo() {
	const [s, setS] = useState(["finance@nusantara.my", "ap@nusantara.my"]);
	return (
		<div className="max-w-[360px]">
			<TagInput value={s} onChange={setS} placeholder="Add an email" aria-label="Invoice recipients" />
		</div>
	);
}
