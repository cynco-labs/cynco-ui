import { type PayslipData, PayslipsRunTable } from "@cynco-labs/ui";

export default function PayslipsRunTableDemo() {
	function p(
		id: string,
		n: string,
		r: string,
		g: number,
		st: number,
		o: number,
		ec: number,
		paid: boolean,
	): PayslipData {
		return {
			id,
			employeeName: n,
			reference: r,
			gross: g,
			statutoryDeductions: st,
			otherDeductions: o,
			net: g - st - o,
			employerCost: ec,
			paymentStatus: paid ? "paid" : "unpaid",
			paymentReference: null,
			lines: [],
			contributions: [],
		};
	}
	return (
		<PayslipsRunTable
			payslips={[
				p("1", "Nurul Aisyah binti Hassan", "EMP-0042", 685000, 107790, 15000, 788505, false),
				p("2", "Tan Wei Jie", "EMP-0017", 920000, 168420, 0, 1047300, true),
				p("3", "Rajesh a/l Subramaniam", "EMP-0023", 480000, 58140, 0, 553980, true),
				p("4", "Siti Mariam binti Osman", "EMP-0051", 350000, 39480, 5000, 404750, false),
			]}
		/>
	);
}
