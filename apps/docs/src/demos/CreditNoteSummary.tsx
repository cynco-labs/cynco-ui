import { CreditNoteSummary } from "@cynco-labs/ui";

export default function CreditNoteSummaryDemo() {
	return (
		<div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
			<CreditNoteSummary
				note={{
					noteType: "credit",
					status: "partially_applied",
					subtotal: 1500,
					discountAmount: 0,
					taxAmount: 120,
					totalAmount: 1620,
					appliedAmount: 1000,
					refundAmount: 200,
					remainingAmount: 420,
				}}
			/>
			<CreditNoteSummary
				note={{
					noteType: "debit",
					status: "partially_paid",
					subtotal: 800,
					taxAmount: 64,
					totalAmount: 864,
					paidAmount: 500,
				}}
				payments={[
					{
						id: "p1",
						paymentDate: "2026-10-21",
						method: "Bank Transfer",
						reference: "MBB-882140",
						amount: 300,
					},
					{
						id: "p2",
						paymentDate: "2026-10-27",
						method: "Credit note",
						reference: "CN-2026-0018",
						amount: 200,
					},
				]}
			/>
		</div>
	);
}
