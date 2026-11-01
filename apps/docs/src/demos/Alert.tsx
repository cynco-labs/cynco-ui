import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@cynco-labs/ui";

export default function AlertDemo() {
	return (
		<div className="flex flex-col gap-2 max-w-[520px]">
			<Alert>
				<InfoIcon size={16} />
				<AlertTitle>Default</AlertTitle>
				<AlertDescription>Changes apply to new invoices only.</AlertDescription>
			</Alert>
			<Alert variant="note">
				<InfoIcon size={16} />
				<AlertTitle>Note</AlertTitle>
				<AlertDescription>Demo company data resets every 30 days.</AlertDescription>
			</Alert>
			<Alert variant="success">
				<CheckCircleIcon size={16} />
				<AlertTitle>Maybank connected</AlertTitle>
			</Alert>
			<Alert variant="warning">
				<WarningIcon size={16} />
				<AlertTitle>3 invoices past due</AlertTitle>
			</Alert>
			<Alert variant="destructive">
				<WarningCircleIcon size={16} />
				<AlertTitle>MyInvois submission failed</AlertTitle>
				<AlertDescription>LHDN rejected INV-2026-0139: buyer TIN is invalid.</AlertDescription>
			</Alert>
		</div>
	);
}
