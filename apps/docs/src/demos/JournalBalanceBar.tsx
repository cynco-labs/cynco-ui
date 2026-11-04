import { JournalBalanceBar } from "@cynco-labs/ui";

export default function JournalBalanceBarDemo() {
	return (
		<div className="flex flex-col gap-3">
			<JournalBalanceBar totalDebit={"20905.00"} totalCredit={"20905.00"} currency="MYR" autoSave="saved" />
			<JournalBalanceBar totalDebit={"20905.00"} totalCredit={"20655.00"} currency="MYR" showError autoSave="saving" />
			<JournalBalanceBar totalDebit={"0.00"} totalCredit={"0.00"} />
		</div>
	);
}
