import { CreditDebitNoteList } from "@cynco-labs/ui";

export default function CreditDebitNoteListDemo() {
	return (
		<CreditDebitNoteList
			onRowAction={() => {}}
			notes={[
				{
					id: "1",
					noteNumber: "CN-2026-0018",
					noteType: "credit",
					customerName: "Tropika Kopi Enterprise",
					totalAmount: 1620,
					status: "partially_applied",
					date: "2026-10-21",
				},
				{
					id: "2",
					noteNumber: "DN-2026-0007",
					noteType: "debit",
					customerName: "Nusantara Logistik Bhd",
					totalAmount: 864,
					status: "partially_paid",
					date: "2026-10-18",
				},
				{
					id: "3",
					noteNumber: "CN-2026-0017",
					noteType: "credit",
					customerName: "Bayu Dental Clinic",
					totalAmount: 350,
					status: "fully_applied",
					date: "2026-10-09",
				},
				{
					id: "4",
					noteNumber: null,
					noteType: "credit",
					customerName: "Kedai Runcit Pak Ali",
					totalAmount: 48.6,
					status: "draft",
					date: "2026-10-29",
				},
			]}
		/>
	);
}
