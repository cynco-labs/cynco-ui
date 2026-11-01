import { CustomerListTable } from "@cynco-labs/ui";

export default function CustomerListTableDemo() {
	return (
		<CustomerListTable
			defaultSelectedIds={["c2"]}
			customers={[
				{
					id: "c1",
					name: "Kedai Runcit Mesra Sdn Bhd",
					email: "accounts@mesra.com.my",
					location: "Shah Alam, Selangor",
					creditLimit: 50000,
					receivables: {
						outstanding: 48250.4,
						overdue: 12680,
						openInvoiceCount: 7,
						nextAction: { label: "Send reminder", tone: "critical" },
					},
					margin: { percent: 31.4, revenue: 186420.75 },
				},
				{
					id: "c2",
					name: "Bina Jaya Construction",
					email: "finance@binajaya.my",
					location: "Johor Bahru, Johor",
					creditLimit: 30000,
					receivables: {
						outstanding: 33150,
						overdue: 0,
						openInvoiceCount: 3,
						nextAction: { label: "Review balance", tone: "warning" },
					},
					margin: { percent: -4.2, revenue: 52300, belowCostLines: 2 },
				},
				{
					id: "c3",
					name: "Klinik Pergigian Senyum",
					phone: "+60 4-226 1188",
					location: "George Town, Penang",
					receivables: {
						outstanding: 4280,
						overdue: 0,
						openInvoiceCount: 2,
						nextAction: { label: "Awaiting payment", tone: "neutral" },
					},
					margin: { percent: 44.8, revenue: 18900 },
				},
				{
					id: "c4",
					name: "Lim & Sons Trading",
					email: "lim@limsons.com.my",
					location: "Ipoh, Perak",
					receivables: {
						outstanding: 0,
						overdue: 0,
						openInvoiceCount: 0,
						nextAction: { label: "Create invoice", tone: "neutral" },
					},
				},
				{
					id: "c5",
					name: "Warisan Kopitiam",
					email: "hello@warisankopi.my",
					location: "Kuching, Sarawak",
					isActive: false,
				},
			]}
		/>
	);
}
