import { QuotationBoardCard } from "@cynco-labs/ui";

export default function QuotationBoardCardDemo() {
	return (
		<div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
			<QuotationBoardCard
				now="2026-10-30"
				quotation={{
					id: "1",
					quotationNumber: "QT-2026-0088",
					customerName: "Syarikat Maju Jaya Sdn Bhd",
					totalAmount: 18600,
					status: "sent",
					createdAt: "2026-10-27",
				}}
			/>
			<QuotationBoardCard
				now="2026-10-30"
				quotation={{
					id: "2",
					quotationNumber: "QT-2026-0085",
					customerName: "Bayu Dental Clinic",
					totalAmount: 7450,
					status: "accepted",
					createdAt: "2026-10-14",
				}}
			/>
			<QuotationBoardCard
				now="2026-10-30"
				quotation={{
					id: "3",
					quotationNumber: "QT-2026-0079",
					customerName: "Rimba Hijau Landscaping",
					totalAmount: 2300,
					status: "expired",
					createdAt: "2026-08-29",
				}}
			/>
		</div>
	);
}
