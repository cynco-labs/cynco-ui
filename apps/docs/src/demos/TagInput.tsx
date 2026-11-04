import { TagInput } from "@cynco-labs/ui";
import { useState } from "react";

export default function TagInputDemo() {
	const [s, setS] = useState(["finance@nusantara.my", "ap@nusantara.my"]);
	return (
		<div className="max-w-[360px]">
			<TagInput value={s} onValueChange={setS} placeholder="Add an email" aria-label="Invoice recipients" />
		</div>
	);
}
