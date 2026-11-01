import { JournalBalanceBar } from "@cynco-labs/ui";

export default function JournalBalanceBarDemo() {
	return (
		<div className="flex flex-col gap-3">
			<JournalBalanceBar totalDebit={20905} totalCredit={20905} currency="MYR" autoSave="saved" />
			<JournalBalanceBar
				totalDebit={20905}
				totalCredit={20655}
				currency="MYR"
				showError
				autoSave="saving"
			/>
			<JournalBalanceBar totalDebit={0} totalCredit={0} />
		</div>
	);
}
