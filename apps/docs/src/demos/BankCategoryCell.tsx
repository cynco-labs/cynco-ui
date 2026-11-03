import type { ReactNode } from "react";
import { BankCategoryCell } from "@cynco-labs/ui";

export default function BankCategoryCellDemo() {
	function line(label: string, el: ReactNode) {
		return (
			<div className="flex items-center gap-4">
				<span className="w-28 text-tiny text-tertiary-foreground">{label}</span>
				{el}
			</div>
		);
	}
	return (
		<div className="flex flex-col gap-2.5">
			{line(
				"Suggested",
				<BankCategoryCell
					status="imported"
					suggestion={{ accountName: "Professional Fees", confidence: 0.88 }}
				/>,
			)}
			{line(
				"Confirmed",
				<BankCategoryCell status="categorized" category="6300 Rental of Premises" />,
			)}
			{line("Unassigned", <BankCategoryCell status="imported" />)}
			{line(
				"Locked (posted)",
				<BankCategoryCell status="posted" category="6120 EPF Contributions" />,
			)}
			{line("Picking", <BankCategoryCell status="imported" picking />)}
		</div>
	);
}
