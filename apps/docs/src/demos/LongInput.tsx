import { LongInput } from "@cynco-labs/ui";

export default function LongInputDemo() {
	return (
		<div className="max-w-[420px]">
			<LongInput defaultValue={'{\n  "branch": "Shah Alam",\n  "costCentre": "OPS-02"\n}'} />
		</div>
	);
}
