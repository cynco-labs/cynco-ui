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
					amount: 0,
					payment: 0,
					balance: 41769.9,
				},
				{
					date: "2026-09-02",
					transactionType: "Payment",
					details: "RCPT-2026-0388 · Cheque 004512",
					currency: "MYR",
					amount: 0,
					payment: 6000,
					balance: 35769.9,
				},
				{
					date: "2026-09-15",
					transactionType: "Invoice",
					details: "INV-2026-0131 · Monthly supply Sep",
					currency: "MYR",
					amount: 6680,
					payment: 0,
					balance: 42449.9,
				},
				{
					date: "2026-10-06",
					transactionType: "Invoice",
					details: "INV-2026-0149 · Export order SG",
					currency: "MYR",
					amount: 11316,
					payment: 0,
					balance: 53765.9,
				},
				{
					date: "2026-10-09",
					transactionType: "Debit Note",
					details: "DN-2026-0007 · Late delivery surcharge",
					currency: "MYR",
					amount: 1250,
					payment: 0,
					balance: 55015.9,
				},
				{
					date: "2026-10-14",
					transactionType: "Credit Note",
					details: "CN-2026-0021 · Returned goods",
					currency: "MYR",
					amount: 0,
					payment: 10746,
					balance: 44269.9,
				},
				{
					date: "2026-10-21",
					transactionType: "Invoice",
					details: "INV-2026-0156 · Monthly supply Oct",
					currency: "MYR",
					amount: 12480.5,
					payment: 0,
					balance: 56750.4,
				},
				{
					date: "2026-10-28",
					transactionType: "Payment",
					details: "RCPT-2026-0412 · DuitNow",
					currency: "MYR",
					amount: 0,
					payment: 8500,
					balance: 48250.4,
				},
			]}
		/>
	);
}
