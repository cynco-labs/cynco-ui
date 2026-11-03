import { EInvoiceStatusCard } from "@cynco-labs/ui";

export default function EInvoiceStatusCardDemo() {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<EInvoiceStatusCard
				credentialEnvironments={["production", "sandbox"]}
				byEnvironment={{
					production: {
						status: "valid",
						documentUuid: "F9D425P6DS7D8IU7G1H2K3L4M5",
						longId: "QJGYW3DSNJ9K2TMR0VBX8E7Y10Q5HT61702381293",
						validationUrl: "https://example.com/myinvois/share/QJGYW3DSNJ9K2TMR0VBX8E7Y10Q5HT61702381293",
						validatedAt: "2026-10-29T10:42:00+08:00",
						withinCancelWindow: true,
					},
				}}
			/>
			<EInvoiceStatusCard
				credentialEnvironments={["sandbox"]}
				byEnvironment={{
					sandbox: {
						status: "invalid",
						validationErrors: [
							"Buyer TIN C20880050010 does not match the registered name.",
							"Classification code 022 is not valid for line 2.",
						],
					},
				}}
			/>
		</div>
	);
}
