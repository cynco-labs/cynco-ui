import { CompactPromptInput } from "@cynco-labs/ui/ai";
import { useState } from "react";

export default function CompactPromptInputDemo() {
	const [s, setS] = useState("");
	return (
		<div className="max-w-[460px]">
			<CompactPromptInput value={s} onChange={setS} onSubmit={() => {}} placeholder="Ask about your books…" />
		</div>
	);
}
