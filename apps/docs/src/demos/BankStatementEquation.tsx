import { BankStatementEquation } from "@cynco-labs/ui";

export default function BankStatementEquationDemo() {
	return (
		<div className="flex flex-col gap-5">
			<BankStatementEquation
				statement={{
					openingBalance: 58210.35,
					closingBalance: 61942.1,
					totalCredits: 31400,
					totalDebits: 27668.25,
					creditLines: 18,
					debitLines: 64,
				}}
			/>
			<BankStatementEquation
				size="sm"
				chainValid={false}
				brokenRows={[3, 16]}
				statement={{
					openingBalance: 12400,
					closingBalance: 9811.2,
					totalCredits: 4200,
					totalDebits: 6588.8,
					creditLines: 1,
					debitLines: 22,
				}}
			/>
			<BankStatementEquation
				size="sm"
				statement={{
					openingBalance: null,
					closingBalance: 20500,
					totalCredits: 8200,
					totalDebits: 3100,
					creditLines: 5,
					debitLines: 9,
				}}
			/>
		</div>
	);
}
