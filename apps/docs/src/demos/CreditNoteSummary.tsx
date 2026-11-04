import { CreditNoteSummary } from "@cynco-labs/ui";

export default function CreditNoteSummaryDemo() {
	return (
		<div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
			<CreditNoteSummary
				note={{
					noteType: "credit",
					status: "partially_applied",
					subtotal: "1500.00",
					discountAmount: "0.00",
					taxAmount: "120.00",
					totalAmount: "1620.00",
					appliedAmount: "1000.00",
					refundAmount: "200.00",
					remainingAmount: "420.00",
				}}
			/>
			<CreditNoteSummary
				note={{
					noteType: "debit",
					status: "partially_paid",
					subtotal: "800.00",
					taxAmount: "64.00",
					totalAmount: "864.00",
					paidAmount: "500.00",
				}}
				payments={[
					{
						id: "p1",
						paymentDate: "2026-10-21",
						method: "Bank Transfer",
						reference: "MBB-882140",
						amount: "300.00",
					},
					{
						id: "p2",
						paymentDate: "2026-10-27",
						method: "Credit note",
						reference: "CN-2026-0018",
						amount: "200.00",
					},
				]}
			/>
		</div>
	);
}
