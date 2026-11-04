import { BankStatementEquation } from "@cynco-labs/ui";

export default function BankStatementEquationDemo() {
	return (
		<div className="flex flex-col gap-5">
			<BankStatementEquation
				statement={{
					openingBalance: "58210.35",
					closingBalance: "61942.10",
					totalCredits: "31400.00",
					totalDebits: "27668.25",
					creditLines: 18,
					debitLines: 64,
				}}
			/>
			<BankStatementEquation
				size="sm"
				chainValid={false}
				brokenRows={[3, 16]}
				statement={{
					openingBalance: "12400.00",
					closingBalance: "9811.20",
					totalCredits: "4200.00",
					totalDebits: "6588.80",
					creditLines: 1,
					debitLines: 22,
				}}
			/>
			<BankStatementEquation
				size="sm"
				statement={{
					openingBalance: null,
					closingBalance: "20500.00",
					totalCredits: "8200.00",
					totalDebits: "3100.00",
					creditLines: 5,
					debitLines: 9,
				}}
			/>
		</div>
	);
}
