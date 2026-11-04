import { CustomerStatementTable } from "@cynco-labs/ui";

export default function CustomerStatementTableDemo() {
	return (
		<CustomerStatementTable
			balanceDue={48250.4}
			transactions={[
				{
					date: "2026-09-01",
					transactionType: "Opening Balance",
					details: "Balance brought forward",
					currency: "MYR",
					amount: "0.00",
					payment: "0.00",
					balance: "41769.90",
				},
				{
					date: "2026-09-02",
					transactionType: "Payment",
					details: "RCPT-2026-0388 · Cheque 004512",
					currency: "MYR",
					amount: "0.00",
					payment: "6000.00",
					balance: "35769.90",
				},
				{
					date: "2026-09-15",
					transactionType: "Invoice",
					details: "INV-2026-0131 · Monthly supply Sep",
					currency: "MYR",
					amount: "6680.00",
					payment: "0.00",
					balance: "42449.90",
				},
				{
					date: "2026-10-06",
					transactionType: "Invoice",
					details: "INV-2026-0149 · Export order SG",
					currency: "MYR",
					amount: "11316.00",
					payment: "0.00",
					balance: "53765.90",
				},
				{
					date: "2026-10-09",
					transactionType: "Debit Note",
					details: "DN-2026-0007 · Late delivery surcharge",
					currency: "MYR",
					amount: "1250.00",
					payment: "0.00",
					balance: "55015.90",
				},
				{
					date: "2026-10-14",
					transactionType: "Credit Note",
					details: "CN-2026-0021 · Returned goods",
					currency: "MYR",
					amount: "0.00",
					payment: "10746.00",
					balance: "44269.90",
				},
				{
					date: "2026-10-21",
					transactionType: "Invoice",
					details: "INV-2026-0156 · Monthly supply Oct",
					currency: "MYR",
					amount: "12480.50",
					payment: "0.00",
					balance: "56750.40",
				},
				{
					date: "2026-10-28",
					transactionType: "Payment",
					details: "RCPT-2026-0412 · DuitNow",
					currency: "MYR",
					amount: "0.00",
					payment: "8500.00",
					balance: "48250.40",
				},
			]}
		/>
	);
}
