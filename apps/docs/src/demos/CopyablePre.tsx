import { CopyablePre, CopyableSpan } from "@cynco-labs/ui";

export default function CopyablePreDemo() {
	return (
		<div className="flex flex-col gap-3 max-w-[460px]">
			<CopyablePre text="npm install @cynco-labs/ui" />
			<CopyableSpan text="am_pk_test_81Hx" />
		</div>
	);
}
