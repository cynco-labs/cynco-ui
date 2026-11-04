import { TaxFilingWorkflow } from "@cynco-labs/ui";

export default function TaxFilingWorkflowDemo() {
	return (
		<div className="flex flex-col gap-3">
			<TaxFilingWorkflow status="reviewed" reviewedAt="2026-10-21" />
			<TaxFilingWorkflow status="filed" filingReference="C-2025-0048213" reviewedAt="2026-10-21" filedAt="2026-10-28" />
		</div>
	);
}
