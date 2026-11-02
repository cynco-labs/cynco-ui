# DocumentStudio

The brand editor for every printed document: logo, layout, typeface, language and footer note, with a live preview of any document at any paper size and stamp.

```tsx
import { DocumentStudio } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	BalanceSheetReport,
	DeliveryOrderDocument,
	DocumentStudio,
	PayslipDocument,
	ProfitAndLossReport,
	PurchaseOrderDocument,
	QuotationDocument,
	ReceiptDocument,
	StatementOfAccountDocument,
	TaxInvoiceDocument,
} from "@cynco-labs/ui";

const NUSA = {
	name: "Nusantara Logistik Bhd",
	registrationNo: "200501012345 (689012-W)",
	tin: "C10987654320",
	sstNo: "W10-1808-31004422",
	address: ["Lot 8, Persiaran Klang, Kawasan Perindustrian Bukit Raja", "41050 Klang, Selangor"],
	attention: "Puan Aisyah Rahman, Finance",
};

const NUSA_SITE = {
	name: "Nusantara Logistik Bhd — Warehouse B",
	address: [
		"Lot 12A, Jalan Sungai Puloh, Kawasan Perindustrian Sungai Puloh",
		"42100 Klang, Selangor",
	],
	attention: "En. Hafiz Zainal, Facilities",
	phone: "+60 12-334 8821",
};

const D_INV = {
	title: "taxInvoice",
	number: "INV-2026-0142",
	status: "partially_paid",
	invoiceDate: "2026-10-28",
	dueDate: "2026-11-27",
	terms: "Net 30",
	reference: "PO-NL-7781",
	billTo: NUSA,
	shipTo: NUSA_SITE,
	lines: [
		{
			description: "Rooftop solar PV installation — 12.3 kWp",
			detail: "Mounting, DC/AC cabling, earthing and commissioning · Warehouse B",
			quantity: "1",
			unit: "lot",
			unitPrice: "38500.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "38500.00",
		},
		{
			description: "Huawei SUN2000-12KTL-M5 string inverter",
			detail: "S/N HV2310045872 · 10-year manufacturer warranty",
			quantity: "1",
			unit: "unit",
			unitPrice: "6800.00",
			taxCode: "ST10",
			taxRate: "10",
			amount: "6800.00",
		},
		{
			description: "AC cable 6mm² 4-core XLPE/SWA",
			quantity: "120",
			unit: "m",
			unitPrice: "8.50",
			discount: "10%",
			taxCode: "ST10",
			taxRate: "10",
			amount: "918.00",
		},
		{
			description: "Preventive maintenance — first year",
			detail: "2 site visits, panel cleaning, thermal scan and performance report",
			quantity: "1",
			unit: "yr",
			unitPrice: "1800.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "1800.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "48018.00" },
		{ label: "serviceTax", hint: "8%", value: "3224.00", kind: "tax" },
		{ label: "salesTax", hint: "10%", value: "771.80", kind: "tax" },
		{ label: "total", value: "52013.80", kind: "total" },
		{ label: "deposit", hint: "paid 14 Oct 2026", value: "-15000.00", kind: "paid" },
		{ label: "balanceDue", value: "37013.80", kind: "balance" },
	],
	payment: {
		bankName: "Maybank Islamic",
		accountName: "Arus Teknik Sdn Bhd",
		accountNumber: "5621 4400 8812",
		note: "Please quote the invoice number as the payment reference.",
	},
	einvoice: { status: "pending", uuid: "F9D425P6DS7D8IU0K2C8VXHF10" },
	notes:
		"Installation completed and commissioned on 24 Oct 2026. Net Energy Metering (NEM 3.0) application ref. SEDA-NEM-2026-08812.",
	termsAndConditions:
		"Late payment interest of 1.5% per month applies after the due date. Goods remain the property of Arus Teknik Sdn Bhd until paid in full.",
	signature: true,
};

const D_QUO = {
	number: "QUO-2026-0093",
	status: "sent",
	date: "2026-10-20",
	validUntil: "2026-11-19",
	reference: "RFQ-NL-2604",
	terms: "50% deposit",
	preparedBy: "Lim Wei Jie",
	customer: NUSA,
	shipTo: NUSA_SITE,
	sections: [
		{
			title: "Phase 1 · Survey & design",
			subtotal: "3700.00",
			lines: [
				{
					description: "Site survey and shading analysis",
					detail: "Drone roof survey, structural check, 12-month yield simulation",
					quantity: "1",
					unit: "lot",
					unitPrice: "1200.00",
					taxCode: "SV8",
					taxRate: "8",
					amount: "1200.00",
				},
				{
					description: "System design and NEM 3.0 application",
					detail: "Single-line diagram, SEDA and TNB submissions",
					quantity: "1",
					unit: "lot",
					unitPrice: "2500.00",
					taxCode: "SV8",
					taxRate: "8",
					amount: "2500.00",
				},
			],
		},
		{
			title: "Phase 2 · Supply",
			subtotal: "22640.00",
			lines: [
				{
					description: "Jinko Tiger Neo 580W N-type mono panel",
					detail: "25-year linear performance warranty",
					quantity: "22",
					unit: "pcs",
					unitPrice: "720.00",
					taxCode: "ST10",
					taxRate: "10",
					amount: "15840.00",
				},
				{
					description: "Huawei SUN2000-12KTL-M5 string inverter",
					quantity: "1",
					unit: "unit",
					unitPrice: "6800.00",
					taxCode: "ST10",
					taxRate: "10",
					amount: "6800.00",
				},
			],
		},
		{
			title: "Phase 3 · Installation",
			subtotal: "9800.00",
			lines: [
				{
					description: "Mounting, cabling, earthing and commissioning",
					detail: "Includes scaffolding, PPE and CIDB-registered crew",
					quantity: "1",
					unit: "lot",
					unitPrice: "9800.00",
					taxCode: "SV8",
					taxRate: "8",
					amount: "9800.00",
				},
			],
		},
	],
	optionalItems: [
		{
			description: "Huawei LUNA2000 10 kWh battery storage",
			quantity: "1",
			unit: "unit",
			unitPrice: "18500.00",
			taxCode: "ST10",
			taxRate: "10",
			amount: "18500.00",
		},
		{
			description: "Bird-proofing mesh around array",
			quantity: "1",
			unit: "lot",
			unitPrice: "1450.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "1450.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "36140.00" },
		{ label: "serviceTax", hint: "8%", value: "1080.00", kind: "tax" },
		{ label: "salesTax", hint: "10%", value: "2264.00", kind: "tax" },
		{ label: "total", value: "39484.00", kind: "total" },
	],
	notes: "Estimated generation 15,900 kWh/yr. Estimated payback 4.6 years at current TNB tariff.",
	termsAndConditions: [
		"Prices are valid until the date stated above.",
		"50% deposit on acceptance; balance within 14 days of commissioning.",
		"Installation within 21 working days of deposit, subject to SEDA approval.",
		"Workmanship warranty of 5 years from the date of commissioning.",
		"Any work outside this scope is quoted separately.",
		"Prices include SST at the prevailing rates.",
	],
};

const D_RCPT = {
	number: "OR-2026-0318",
	status: "issued",
	date: "2026-11-01",
	receivedFrom: {
		name: "Ahmad Faizal bin Rahman",
		address: ["No. 22, Jalan Anggerik 3, Taman Sri Muda", "40400 Shah Alam, Selangor"],
	},
	payment: { method: "cash" },
	amountReceived: "1284.40",
	allocations: [
		{ number: "INV-2026-0151", date: "2026-10-29", invoiceAmount: "1284.42", applied: "1284.42" },
	],
	totals: [
		{ label: "totalDue", value: "1284.42" },
		{ label: "rounding", value: "-0.02", kind: "rounding" },
		{ label: "amountReceived", value: "1284.40", kind: "total" },
		{ label: "cashTendered", value: "1300.00" },
		{ label: "change", value: "15.60" },
	],
	notes: "Rounded to the nearest 5 sen (BNM rounding mechanism).",
};

const D_DO = {
	number: "DO-2026-0087",
	status: "issued",
	date: "2026-10-21",
	deliveryDate: "2026-10-22",
	reference: "PO-NL-7781",
	salesOrder: "SO-2026-0064",
	invoiceNo: "INV-2026-0142",
	billTo: NUSA,
	shipTo: NUSA_SITE,
	vehicleNo: "WXY 4821 · 3-tonne lorry",
	driver: "Muthu a/l Ramasamy · 012-778 3310",
	packages: "6 pallets, 4 cartons",
	weight: "1,148 kg",
	lines: [
		{
			code: "JKM-580N",
			description: "Jinko Tiger Neo 580W N-type mono panel",
			detail: "Pallet 1–4 · 22 pcs",
			unit: "pcs",
			ordered: "22",
			delivered: "22",
			backOrdered: "0",
		},
		{
			code: "HW-12KTL-M5",
			description: "Huawei SUN2000-12KTL-M5 string inverter",
			detail: "S/N HV2310045872",
			unit: "unit",
			ordered: "1",
			delivered: "1",
		},
		{
			code: "MR-AL42",
			description: "Aluminium mounting rail 4.2 m",
			detail: "Balance 6 pcs to follow on DO-2026-0091",
			unit: "pcs",
			ordered: "36",
			delivered: "30",
			backOrdered: "6",
		},
		{
			code: "CBL-6C4",
			description: "AC cable 6mm² 4-core XLPE/SWA",
			unit: "m",
			ordered: "120",
			delivered: "120",
		},
		{
			code: "MC4-PR",
			description: "MC4 connector, male/female pair",
			unit: "pair",
			ordered: "24",
			delivered: "24",
		},
		{
			code: "ACC-CLMP",
			description: "Mid and end clamps, stainless steel",
			unit: "set",
			ordered: "48",
			delivered: "40",
			backOrdered: "8",
		},
	],
	notes:
		"Please inspect all items on delivery. Report any shortage or damage within 3 working days. Panels must be stored flat and covered.",
};

const D_PO = {
	number: "PO-2026-0088",
	date: "2026-10-30",
	requiredBy: "2026-11-06",
	terms: "Net 30",
	quotationRef: "QT-BBU-26-0412",
	requester: { name: "Nurul Huda Ismail", department: "Production" },
	vendor: {
		name: "Bekalan Bakeri Utama Sdn Bhd",
		registrationNo: "200901027781 (865412-P)",
		sstNo: "B10-1808-31004418",
		tin: "C10745821600",
		address: ["No. 8, Jalan Industri Puchong 3", "47100 Puchong, Selangor"],
		attention: "Mr. Lim Wei Jie, Sales",
		phone: "+60 3-8061 2290",
	},
	deliverTo: {
		name: "Kilang Roti Mutiara — Central Kitchen",
		address: ["Lot 22, Jalan Utas 15/7, Seksyen 15", "40200 Shah Alam, Selangor"],
		attention: "Encik Faizal, Store (Loading bay 2)",
		phone: "+60 12-338 7710",
	},
	lines: [
		{
			itemCode: "FLR-HP-25",
			description: "High-protein bread flour",
			detail: "Cap Sauh, 25 kg bag",
			quantity: "40",
			unit: "bag",
			unitPrice: "68.50",
			taxCode: "EX",
			amount: "2740.00",
		},
		{
			itemCode: "BTR-UNS-5",
			description: "Unsalted butter block",
			detail: "5 kg, chilled (2–4°C)",
			quantity: "12",
			unit: "blk",
			unitPrice: "142.00",
			taxRate: 5,
			taxCode: "ST5",
			amount: "1704.00",
		},
		{
			itemCode: "YST-INS-500",
			description: "Instant dry yeast",
			detail: "500 g vacuum pack",
			quantity: "24",
			unit: "pkt",
			unitPrice: "9.80",
			taxRate: 5,
			taxCode: "ST5",
			amount: "235.20",
		},
		{
			itemCode: "PKG-LOAF-600",
			description: "Printed loaf bag, 600 g",
			detail: "LDPE, 2-colour Mutiara print · 1,000 pcs/ctn",
			quantity: "10",
			unit: "ctn",
			unitPrice: "185.00",
			taxRate: 10,
			taxCode: "ST10",
			amount: "1850.00",
		},
		{
			itemCode: "TRY-SS-6040",
			description: "Stainless steel baking tray",
			detail: "600 × 400 mm, perforated",
			quantity: "20",
			unit: "pcs",
			unitPrice: "46.00",
			taxRate: 10,
			taxCode: "ST10",
			amount: "920.00",
		},
	],
	totals: {
		subtotal: "7449.20",
		taxes: [
			{ label: { en: "Sales tax", ms: "Cukai jualan" }, rate: 5, amount: "96.96" },
			{ label: { en: "Sales tax", ms: "Cukai jualan" }, rate: 10, amount: "277.00" },
		],
		shipping: "120.00",
		total: "7943.16",
	},
	deliveryInstructions:
		"Deliver Mon–Fri, 8.00 am – 3.00 pm to loading bay 2.\nButter must arrive chilled; temperature log required.\nQuote PO-2026-0088 on the delivery order and invoice.",
	termsAndConditions:
		"1. Goods must match the quotation and specification above.\n2. Short or damaged deliveries will be rejected at receiving.\n3. Invoices without a valid PO number will not be processed.",
	preparedBy: { name: "Nurul Huda Ismail", title: "Production Executive", date: "30 Oct 2026" },
	approvedBy: { name: "Tan Mei Ling", title: "Operations Manager" },
};

const D_SOA = {
	number: "SOA-2026-10-0147",
	date: "2026-10-31",
	periodFrom: "2026-10-01",
	periodTo: "2026-10-31",
	accountNo: "C-0147",
	terms: "Net 14",
	party: {
		name: "Kafe Pelangi Enterprise",
		registrationNo: "202003154872 (KT0458721-X)",
		tin: "IG24758193020",
		address: ["G-12, Imago Shopping Mall, Jalan Coastal", "88000 Kota Kinabalu, Sabah"],
		attention: "Ms. Joanne Chong",
	},
	openingBalance: "6480.50",
	totalDebit: "14278.05",
	totalCredit: "8185.30",
	closingBalance: "12573.25",
	transactions: [
		{
			date: "2026-10-02",
			type: "payment",
			number: "OR-2026-0611",
			description: "Payment received — DuitNow",
			credit: "3200.00",
			balance: "3280.50",
		},
		{
			date: "2026-10-03",
			type: "invoice",
			number: "INV-2026-1402",
			description: "Soft drinks & mineral water, 48 ctn",
			debit: "1862.40",
			balance: "5142.90",
		},
		{
			date: "2026-10-07",
			type: "invoice",
			number: "INV-2026-1419",
			description: "Arabica beans 1 kg × 20, syrups",
			debit: "2315.00",
			balance: "7457.90",
		},
		{
			date: "2026-10-09",
			type: "creditNote",
			number: "CN-2026-0088",
			description: "Damaged cartons returned (INV-2026-1402)",
			credit: "124.80",
			balance: "7333.10",
		},
		{
			date: "2026-10-10",
			type: "invoice",
			number: "INV-2026-1433",
			description: "Juice concentrate, 12 btl",
			debit: "986.50",
			balance: "8319.60",
		},
		{
			date: "2026-10-14",
			type: "invoice",
			number: "INV-2026-1450",
			description: "Mineral water 1.5 L, 60 ctn",
			debit: "1540.00",
			balance: "9859.60",
		},
		{
			date: "2026-10-15",
			type: "payment",
			number: "OR-2026-0648",
			description: "Payment received — IBG",
			credit: "2860.50",
			balance: "6999.10",
		},
		{
			date: "2026-10-17",
			type: "invoice",
			number: "INV-2026-1468",
			description: "Arabica beans, fresh milk, syrups",
			debit: "2104.20",
			balance: "9103.30",
		},
		{
			date: "2026-10-21",
			type: "invoice",
			number: "INV-2026-1481",
			description: "Paper cups 12 oz, 20 ctn",
			debit: "760.00",
			balance: "9863.30",
		},
		{
			date: "2026-10-22",
			type: "debitNote",
			number: "DN-2026-0019",
			description: "Re-delivery charge, 20 Oct",
			debit: "45.00",
			balance: "9908.30",
		},
		{
			date: "2026-10-24",
			type: "invoice",
			number: "INV-2026-1497",
			description: "Soft drinks, 32 ctn",
			debit: "1318.75",
			balance: "11227.05",
		},
		{
			date: "2026-10-28",
			type: "payment",
			number: "OR-2026-0702",
			description: "Part payment — cheque 118842",
			credit: "2000.00",
			balance: "9227.05",
		},
		{
			date: "2026-10-29",
			type: "invoice",
			number: "INV-2026-1510",
			description: "Arabica beans, oat milk, cups",
			debit: "2452.80",
			balance: "11679.85",
		},
		{
			date: "2026-10-31",
			type: "invoice",
			number: "INV-2026-1524",
			description: "Mineral water 500 ml, 40 ctn",
			debit: "893.40",
			balance: "12573.25",
		},
	],
	aging: {
		current: "7574.15",
		days1to30: "4579.10",
		days31to60: "0.00",
		days61to90: "420.00",
		days90plus: "0.00",
	},
	totalDue: "12573.25",
	payment: {
		bankName: "Public Bank",
		accountName: "Pengedar Minuman Borneo Sdn Bhd",
		accountNumber: "3197 5520 14",
		reference: "C-0147",
	},
	notes:
		"RM 420.00 from INV-2026-1188 (August) is now over 60 days. Please settle to avoid a hold on deliveries.",
};

const D_PS = {
	number: "PS-2026-10-0042",
	periodFrom: "2026-10-01",
	periodTo: "2026-10-31",
	payDate: "2026-10-31",
	employer: { epfNo: "021456789", socsoNo: "B32012345678", taxNo: "E 9123456708" },
	employee: {
		name: "Nurul Aina binti Kamarudin",
		staffId: "LDS-0042",
		icNo: "920814-14-5528",
		position: "Senior UX Designer",
		department: "Product Design",
		epfNo: "19837465",
		socsoNo: "920814145528",
		taxNo: "IG 21837465090",
		bankName: "Maybank",
		bankAccount: "1621 4589 3307",
	},
	earnings: [
		{ label: "basicSalary", amount: "4200.00" },
		{ label: { en: "Transport allowance", ms: "Elaun pengangkutan" }, amount: "250.00" },
		{ label: { en: "Phone allowance", ms: "Elaun telefon" }, amount: "100.00" },
		{
			label: "overtime",
			detail: { en: "10.0 hrs × RM 30.29 (1.5×)", ms: "10.0 jam × RM 30.29 (1.5×)" },
			amount: "302.90",
		},
		{
			label: "commission",
			detail: { en: "Q3 retainer upsell", ms: "Jualan tambahan retainer S3" },
			amount: "380.00",
		},
	],
	deductions: [
		{
			label: "epf",
			detail: { en: "11% of EPF wages RM 4,930.00", ms: "11% daripada gaji KWSP RM 4,930.00" },
			amount: "544.00",
		},
		{
			label: "socso",
			detail: { en: "Employment Injury & Invalidity", ms: "Bencana Pekerjaan & Keilatan" },
			amount: "26.25",
		},
		{ label: "eis", detail: "0.2%", amount: "10.50" },
		{ label: "pcb", amount: "213.45" },
		{ label: "zakat", detail: "Lembaga Zakat Selangor", amount: "50.00" },
		{
			label: "advance",
			detail: { en: "Recovery 2 of 3", ms: "Bayaran balik 2 daripada 3" },
			amount: "200.00",
		},
	],
	employerContributions: [
		{ label: "epf", amount: "643.00" },
		{ label: "socso", amount: "91.85" },
		{ label: "eis", amount: "10.50" },
		{ label: "hrdf", amount: "45.50" },
	],
	grossPay: "5232.90",
	totalDeductions: "1044.20",
	netPay: "4188.70",
	totalEmployerContributions: "790.85",
	ytd: [
		{ label: "grossPay", amount: "51904.62" },
		{ label: "epf", amount: "5412.00" },
		{ label: "socso", amount: "262.50" },
		{ label: "eis", amount: "105.00" },
		{ label: "pcb", amount: "2121.30" },
		{ label: "zakat", amount: "500.00" },
		{ label: "netPay", amount: "43303.82" },
	],
};

const D_PNL = {
	period: { kind: "month", end: "2026-10-31" },
	basis: "accrual",
	currency: "MYR",
	columns: [{ label: "Oct 2026" }, { label: "Oct 2025" }],
	variance: true,
	filters: [
		{ label: "Branch", value: "All branches" },
		{ label: "Department", value: "All" },
	],
	preparedBy: "Aisyah Rahman, Finance Manager",
	preparedOn: "2026-11-01",
	notes:
		"Management accounts — unaudited. Income tax is provided at the expected effective rate of 22% for YA 2026. Note references are to the notes in the year-end financial statements.",
	revenue: [
		{
			code: "4000-001",
			label: "Sales — furniture (local)",
			values: ["368450.00", "321780.00"],
			variance: "46670.00",
			variancePct: "14.5",
		},
		{
			code: "4000-002",
			label: "Sales — export",
			values: ["52300.00", "61200.00"],
			variance: "-8900.00",
			variancePct: "-14.5",
		},
		{
			code: "4100-001",
			label: "Installation and delivery income",
			values: ["14860.00", "11240.00"],
			variance: "3620.00",
			variancePct: "32.2",
		},
		{
			code: "4900-001",
			label: "Sales returns and discounts",
			values: ["-6215.00", "-4980.00"],
			variance: "-1235.00",
			variancePct: "-24.8",
		},
	],
	totalRevenue: { values: ["429395.00", "389240.00"], variance: "40155.00", variancePct: "10.3" },
	costOfSales: [
		{
			code: "5000-001",
			label: "Cost of goods sold",
			values: ["-232640.00", "-205310.00"],
			variance: "-27330.00",
			variancePct: "-13.3",
		},
		{
			code: "5100-001",
			label: "Direct labour",
			values: ["-28400.00", "-26150.00"],
			variance: "-2250.00",
			variancePct: "-8.6",
		},
		{
			code: "5200-001",
			label: "Freight inwards and import duties",
			values: ["-9870.00", "-8640.00"],
			variance: "-1230.00",
			variancePct: "-14.2",
		},
	],
	totalCostOfSales: {
		values: ["-270910.00", "-240100.00"],
		variance: "-30810.00",
		variancePct: "-12.8",
	},
	grossProfit: { values: ["158485.00", "149140.00"], variance: "9345.00", variancePct: "6.3" },
	operatingExpenses: [
		{
			label: "Staff costs",
			lines: [
				{
					code: "6100-001",
					label: "Salaries and wages",
					values: ["-48600.00", "-44200.00"],
					variance: "-4400.00",
					variancePct: "-10.0",
				},
				{
					code: "6100-002",
					label: "EPF, SOCSO and EIS",
					values: ["-6912.40", "-6284.60"],
					variance: "-627.80",
					variancePct: "-10.0",
				},
				{
					code: "6100-003",
					label: "Staff welfare and HRDF levy",
					values: ["-1850.00", "-2120.00"],
					variance: "270.00",
					variancePct: "12.7",
				},
			],
			total: { values: ["-57362.40", "-52604.60"], variance: "-4757.80", variancePct: "-9.0" },
		},
		{
			label: "Premises",
			lines: [
				{
					code: "6200-001",
					label: "Rental — factory and showroom",
					values: ["-18500.00", "-18500.00"],
					variance: "0.00",
					variancePct: "0.0",
				},
				{
					code: "6200-002",
					label: "Utilities (TNB, Air Selangor)",
					values: ["-4386.55", "-3912.30"],
					variance: "-474.25",
					variancePct: "-12.1",
				},
				{
					code: "6200-003",
					label: "Repairs and maintenance",
					values: ["-1240.00", "-2860.00"],
					variance: "1620.00",
					variancePct: "56.6",
				},
			],
			total: { values: ["-24126.55", "-25272.30"], variance: "1145.75", variancePct: "4.5" },
		},
		{
			label: "Selling and distribution",
			lines: [
				{
					code: "6300-001",
					label: "Advertising and promotion",
					values: ["-7450.00", "-5200.00"],
					variance: "-2250.00",
					variancePct: "-43.3",
				},
				{
					code: "6300-002",
					label: "Sales commission",
					values: ["-8420.00", "-7310.00"],
					variance: "-1110.00",
					variancePct: "-15.2",
				},
				{
					code: "6300-003",
					label: "Delivery and transport",
					values: ["-5680.20", "-4950.80"],
					variance: "-729.40",
					variancePct: "-14.7",
				},
			],
			total: { values: ["-21550.20", "-17460.80"], variance: "-4089.40", variancePct: "-23.4" },
		},
		{
			label: "Administrative",
			lines: [
				{
					code: "6400-001",
					label: "Audit and professional fees",
					values: ["-2500.00", "-2500.00"],
					variance: "0.00",
					variancePct: "0.0",
				},
				{
					code: "6400-002",
					label: "Software subscriptions",
					values: ["-1180.00", "-890.00"],
					variance: "-290.00",
					variancePct: "-32.6",
				},
				{
					code: "6400-003",
					label: "Insurance",
					values: ["-1325.00", "-1250.00"],
					variance: "-75.00",
					variancePct: "-6.0",
				},
				{
					code: "6400-004",
					label: "Bank charges",
					values: ["-412.35", "-386.10"],
					variance: "-26.25",
					variancePct: "-6.8",
				},
				{
					code: "6500-001",
					label: "Depreciation and amortisation",
					values: ["-9930.00", "-9210.00"],
					variance: "-720.00",
					variancePct: "-7.8",
					note: "5",
				},
			],
			total: { values: ["-15347.35", "-14236.10"], variance: "-1111.25", variancePct: "-7.8" },
		},
	],
	totalOperatingExpenses: {
		values: ["-118386.50", "-109573.80"],
		variance: "-8812.70",
		variancePct: "-8.0",
	},
	operatingProfit: { values: ["40098.50", "39566.20"], variance: "532.30", variancePct: "1.3" },
	otherIncome: [
		{
			code: "7100-001",
			label: "Interest income — fixed deposit",
			values: ["820.00", "640.00"],
			variance: "180.00",
			variancePct: "28.1",
		},
		{
			code: "7100-002",
			label: "Realised foreign exchange gain/(loss)",
			values: ["-1135.40", "2280.00"],
			variance: "-3415.40",
			variancePct: "-149.8",
		},
	],
	otherExpenses: [
		{
			code: "8100-001",
			label: "Hire purchase interest",
			values: ["-1264.00", "-1410.00"],
			variance: "146.00",
			variancePct: "10.4",
		},
		{
			code: "8100-002",
			label: "Term loan interest",
			values: ["-2980.00", "-3240.00"],
			variance: "260.00",
			variancePct: "8.0",
		},
		{
			code: "8100-003",
			label: "Lease interest",
			values: ["-760.00", "-880.00"],
			variance: "120.00",
			variancePct: "13.6",
		},
	],
	profitBeforeTax: { values: ["34779.10", "36956.20"], variance: "-2177.10", variancePct: "-5.9" },
	tax: [
		{
			code: "8800-001",
			label: "Income tax expense (estimated)",
			values: ["-7651.00", "-8130.00"],
			variance: "479.00",
			variancePct: "5.9",
			note: "6",
		},
	],
	netProfit: { values: ["27128.10", "28826.20"], variance: "-1698.10", variancePct: "-5.9" },
};

const D_BS = {
	period: { kind: "asAt", end: "2026-10-31" },
	currency: "MYR",
	columns: [{ label: "31 Oct 2026" }, { label: "31 Dec 2025", sublabel: "RM · audited" }],
	preparedBy: "Aisyah Rahman, Finance Manager",
	preparedOn: "2026-11-01",
	notes:
		"Comparative figures as at 31 December 2025 are taken from the audited financial statements.",
	nonCurrentAssets: [
		{ label: "Property, plant and equipment", values: ["1284600.00", "1326400.00"], note: "3" },
		{ label: "Right-of-use assets", values: ["186000.00", "214000.00"], note: "4" },
		{ label: "Intangible assets — software", values: ["24500.00", "28000.00"] },
	],
	totalNonCurrentAssets: { values: ["1495100.00", "1568400.00"] },
	currentAssets: [
		{ label: "Inventories", values: ["862340.50", "781215.00"], note: "7" },
		{ label: "Trade receivables", values: ["524180.25", "468920.40"], note: "8" },
		{ label: "Other receivables, deposits and prepayments", values: ["46718.35", "38560.00"] },
		{ label: "Cash and bank balances", values: ["279591.65", "254310.85"], note: "9" },
	],
	totalCurrentAssets: { values: ["1712830.75", "1543006.25"] },
	totalAssets: { values: ["3207930.75", "3111406.25"] },
	currentLiabilities: [
		{ label: "Trade payables", values: ["386240.60", "352180.30"] },
		{ label: "Other payables and accruals", values: ["92415.00", "84600.00"] },
		{ label: "SST payable", values: ["18642.35", "16980.20"] },
		{ label: "Hire purchase payables", values: ["24000.00", "24000.00"], note: "10" },
		{ label: "Term loan", values: ["60000.00", "60000.00"], note: "11" },
		{ label: "Current tax liabilities", values: ["32180.00", "21450.00"] },
	],
	totalCurrentLiabilities: { values: ["613477.95", "559210.50"] },
	nonCurrentLiabilities: [
		{ label: "Hire purchase payables", values: ["38000.00", "58000.00"], note: "10" },
		{ label: "Term loan", values: ["420000.00", "470000.00"], note: "11" },
		{ label: "Lease liabilities", values: ["156000.00", "182000.00"], note: "4" },
		{ label: "Deferred tax liabilities", values: ["46800.00", "46800.00"] },
	],
	totalNonCurrentLiabilities: { values: ["660800.00", "756800.00"] },
	totalLiabilities: { values: ["1274277.95", "1316010.50"] },
	equity: [
		{ label: "Share capital", values: ["500000.00", "500000.00"], note: "12" },
		{ label: "Retained earnings", values: ["1433652.80", "1295395.75"] },
	],
	totalEquity: { values: ["1933652.80", "1795395.75"] },
	totalEquityAndLiabilities: { values: ["3207930.75", "3111406.25"] },
	balanced: true,
};

const BRAND = {
	company: {
		name: "Arus Teknik Sdn Bhd",
		registrationNo: "201801034567 (1295521-D)",
		sstNo: "B16-1809-32000417",
		tin: "C25718364020",
		address: ["No. 18, Jalan Pelabur 23/1, Seksyen 23", "40300 Shah Alam, Selangor"],
		phone: "+60 3-5541 2280",
		email: "accounts@arusteknik.my",
		website: "arusteknik.my",
	},
	layout: "minimal",
	locale: "en",
	signature: { name: "Lim Wei Jie", title: "Operations Manager" },
	footerNote: "Thank you for your business.",
};

function d(id, label, C, prop, data, sizes, stamps) {
	return {
		id,
		label,
		sizes,
		stamps,
		render: (o) => {
			const p = { isolate: true, stamp: o.stamp, size: o.size };
			p[prop] = data;
			return <C {...p} />;
		},
	};
}

const DOCS = [
	d(
		"inv",
		"Tax invoice",
		TaxInvoiceDocument,
		"invoice",
		D_INV,
		["a4", "letter"],
		["paid", "overdue", "draft", "void"],
	),
	d("quo", "Quotation", QuotationDocument, "quotation", D_QUO, ["a4"], ["draft"]),
	d("rcpt", "Receipt", ReceiptDocument, "receipt", D_RCPT, ["a4", "a5", "receipt"], ["copy"]),
	d("do", "Delivery order", DeliveryOrderDocument, "order", D_DO, ["a4", "a5"], ["copy"]),
	d("po", "Purchase order", PurchaseOrderDocument, "order", D_PO, ["a4"], ["draft", "void"]),
	d("soa", "Statement", StatementOfAccountDocument, "statement", D_SOA, ["a4"], []),
	d("ps", "Payslip", PayslipDocument, "payslip", D_PS, ["a4", "a5"], ["copy"]),
	d("pnl", "Profit & loss", ProfitAndLossReport, "report", D_PNL, ["a4"], ["draft"]),
	d("bs", "Balance sheet", BalanceSheetReport, "report", D_BS, ["a4"], ["draft"]),
];

export default function DocumentStudioDemo() {
	return <DocumentStudio defaultBrand={BRAND} documents={DOCS} />;
}
```

## Use

Settings → Documents (invoice templates). One brand drives invoices, receipts, statements, payslips and reports, so customers set it once.

## Props

brand / defaultBrand / onBrandChange (DocBrand), documents ([{id, label, render({stamp, size}), sizes?, stamps?}]), defaultDocumentId, onPrint. brandFromCyncoTemplate(template, company) maps Cynco's stored invoice template onto a DocBrand.

- `documents`: `StudioDocument[]`
- `brand?`: `DocBrand`. Controlled brand.
- `defaultBrand?`: `DocBrand`. Uncontrolled starting brand.
- `onBrandChange?`: `(brand: DocBrand) => void`
- `defaultDocumentId?`: `string`
- `onPrint?`: `() => void`. Called when the user presses Print (defaults to window.print, which prints only the previewed document).
- Also accepts `ComponentProps<"div">`.

## Notes

Controls stack above the preview below 48rem of container width. Logo upload reads the file to a data URL (production should upload it and store the URL). Layout thumbnails and Inter / Geist / Newsreader; documents stay black ink, so there is no colour picker. Print prints only the previewed document.

Category: Documents. Source: `packages/ui/src/documents/studio.tsx`.
