import { CopyablePre } from "@cynco-labs/ui";

export default function CopyablePreDemo() {
	return (
		<div className="max-w-[460px]">
			<CopyablePre text={'pnpm add @cynco-labs/ui\nimport { DataTable } from "@cynco-labs/ui";'} />
		</div>
	);
}
