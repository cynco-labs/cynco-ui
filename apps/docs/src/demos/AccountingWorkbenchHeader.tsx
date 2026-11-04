import { AccountingWorkbenchHeader, IconButton } from "@cynco-labs/ui";
import { ArrowSquareOutIcon, PlusIcon } from "@phosphor-icons/react";

export default function AccountingWorkbenchHeaderDemo() {
	return (
		<AccountingWorkbenchHeader
			title="General ledger"
			meta="Kedai Maju Trading Sdn Bhd · FY2026 · 214 accounts · MYR"
			actions={[
				<IconButton key="e" variant="secondary" icon={<ArrowSquareOutIcon />}>
					Export
				</IconButton>,
				<IconButton key="n" variant="primary" icon={<PlusIcon weight="bold" />}>
					New journal entry
				</IconButton>,
			]}
			stats={[
				{ key: "je", label: "Journal entries", value: "142", hint: "October 2026", href: "#" },
				{ key: "dr", label: "Total debits", value: "RM 1,284,560.00", hint: "Posted this period" },
				{
					key: "dft",
					label: "Unposted drafts",
					value: "6",
					status: "warning",
					hint: "2 pending approval",
					href: "#",
				},
				{
					key: "tb",
					label: "Trial balance",
					value: "Balanced",
					status: "success",
					hint: "As at 30 Oct 2026",
				},
			]}
		/>
	);
}
