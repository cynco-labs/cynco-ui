import { RecordBillPaymentDialog } from "@cynco-labs/ui";

export default function RecordBillPaymentDialogDemo() {
	return (
		<RecordBillPaymentDialog
			billAmount={8450}
			paidAmount={3000}
			currency="MYR"
			defaultDate="2026-10-30"
			bankAccounts={[
				{ id: "acc_1", accountCode: "1000-001", accountName: "Maybank Current Account" },
				{ id: "acc_2", accountCode: "1000-002", accountName: "CIMB Business Account" },
				{ id: "acc_3", accountCode: "1010-001", accountName: "Petty Cash" },
			]}
		/>
	);
}
