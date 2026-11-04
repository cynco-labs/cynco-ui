import { CopyButton } from "@cynco-labs/ui";

export default function CopyButtonDemo() {
	return (
		<div className="flex flex-col items-start gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<CopyButton text="INV-2026-0142" />
				<CopyButton variant="icon" text="cy_sk_test_7f3a91" />
			</div>
			<CopyButton variant="inline" text="1200-001" />
		</div>
	);
}
