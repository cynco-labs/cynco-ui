import { MarkAsPaidDialog } from "@cynco-labs/ui";

export default function MarkAsPaidDialogDemo() {
	return (
		<MarkAsPaidDialog
			defaultOpen
			modal={false}
			invoice={{
				invoiceNumber: "INV-2026-0139",
				customerName: "Nusantara Logistik Bhd",
				total: "28400.00",
				paidAmount: "10000.00",
				currency: "MYR",
			}}
			paymentDate="2026-10-30"
			defaultPaymentMethod="bank_transfer"
			defaultBankAccount="1000-001"
			bankAccounts={[
				{ accountCode: "1000-001", accountName: "Maybank Current Account" },
				{ accountCode: "1000-002", accountName: "CIMB Business Account" },
			]}
		/>
	);
}
