import { CopyButton, CopyIconButton, MiniCopyButton } from "@cynco-labs/ui";

export default function CopyButtonDemo() {
	return (
		<div className="flex flex-col gap-3 items-start">
			<div className="flex flex-wrap items-center gap-2">
				<CopyButton text="INV-2026-0142">INV-2026-0142</CopyButton>
				<CopyIconButton text="cy_sk_test_7f3a91" />
			</div>
			<MiniCopyButton text="1200-001" displayText="1200-001" />
		</div>
	);
}
