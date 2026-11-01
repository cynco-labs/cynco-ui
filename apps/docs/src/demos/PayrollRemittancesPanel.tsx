import { PayrollRemittancesPanel } from "@cynco-labs/ui";

export default function PayrollRemittancesPanelDemo() {
	return (
		<PayrollRemittancesPanel
			remittances={[
				{ payable: "epf", label: "KWSP (EPF)", employee: 269870, employer: 318390 },
				{ payable: "socso", label: "PERKESO (SOCSO)", employee: 8900, employer: 31150 },
				{ payable: "eis", label: "PERKESO (EIS)", employee: 4280, employer: 4280 },
				{ payable: "pcb", label: "LHDN (PCB)", employee: 94315, employer: 0 },
				{ payable: "hrdf", label: "HRD Corp levy", employee: 0, employer: 24350 },
			]}
		/>
	);
}
