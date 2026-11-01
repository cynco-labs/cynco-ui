import { SectionTag } from "@cynco-labs/ui";

export default function SectionTagDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<SectionTag>Line items</SectionTag>
			<SectionTag>Payment</SectionTag>
		</div>
	);
}
