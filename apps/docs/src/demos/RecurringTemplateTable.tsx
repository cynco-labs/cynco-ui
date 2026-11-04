import { RecurringTemplateTable } from "@cynco-labs/ui";

export default function RecurringTemplateTableDemo() {
	return (
		<RecurringTemplateTable
			templates={[
				{
					id: "1",
					customerName: "Bayu Dental Clinic",
					customerEmail: "admin@bayudental.my",
					frequency: "monthly",
					nextGenerationDate: "2026-11-01",
					totalAmount: "1890.00",
					totalGenerated: 14,
					status: "active",
				},
				{
					id: "2",
					customerName: "Syarikat Maju Jaya Sdn Bhd",
					customerEmail: "finance@majujaya.com.my",
					frequency: "quarterly",
					nextGenerationDate: "2027-01-01",
					totalAmount: "10800.00",
					totalGenerated: 5,
					status: "active",
				},
				{
					id: "3",
					customerName: "Tropika Kopi Enterprise",
					customerEmail: "hello@tropikakopi.my",
					frequency: "weekly",
					nextGenerationDate: null,
					totalAmount: "420.00",
					totalGenerated: 31,
					status: "paused",
				},
				{
					id: "4",
					customerName: "Rimba Hijau Landscaping",
					customerEmail: "ops@rimbahijau.my",
					frequency: "annually",
					nextGenerationDate: "2027-03-15",
					totalAmount: null,
					totalGenerated: 0,
					status: "draft",
				},
			]}
		/>
	);
}
