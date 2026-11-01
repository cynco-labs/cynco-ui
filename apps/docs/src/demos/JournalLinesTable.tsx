import { JournalLinesTable } from "@cynco-labs/ui";

export default function JournalLinesTableDemo() {
	return (
		<JournalLinesTable
			currency="MYR"
			lines={[
				{
					id: "1",
					lineNumber: 1,
					accountCode: "6100-000",
					accountName: "Salaries & Wages",
					accountType: "expense",
					debitAmount: "18500.00",
					creditAmount: "0",
					description: "October 2026 payroll – gross",
				},
				{
					id: "2",
					lineNumber: 2,
					accountCode: "6110-000",
					accountName: "EPF Employer Contribution",
					accountType: "expense",
					debitAmount: "2405.00",
					creditAmount: "0",
					description: "Employer EPF 13%",
				},
				{
					id: "3",
					lineNumber: 3,
					accountCode: "2300-001",
					accountName: "EPF Payable",
					accountType: "liability",
					debitAmount: "0",
					creditAmount: "4440.00",
					description: "EPF employee + employer",
				},
				{
					id: "4",
					lineNumber: 4,
					accountCode: "2300-003",
					accountName: "PCB Payable",
					accountType: "liability",
					debitAmount: "0",
					creditAmount: "1210.00",
					description: null,
				},
				{
					id: "5",
					lineNumber: 5,
					accountCode: "1000-001",
					accountName: "Maybank Current Account",
					accountType: "asset",
					debitAmount: "0",
					creditAmount: "15255.00",
					description: "Net salaries paid",
				},
			]}
		/>
	);
}
