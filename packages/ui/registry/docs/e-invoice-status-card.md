# EInvoiceStatusCard

LHDN MyInvois e-invoice state for an invoice or note per environment (valid, pending validation, rejected with LHDN errors, unconfirmed, cancelled, buyer-requested rejection), the validated UUID / long ID stamp, and Submit / Cancel (72-hour window) actions.

```tsx
import { EInvoiceStatusCard } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Invoice and credit/debit note detail sidebars (NoteEInvoiceCard).

## Props

`credentialEnvironments` (sandbox|production), `byEnvironment` {status, documentUuid, longId, validatedAt, rejectionRequestedAt, rejectionReason, validationErrors, unconfirmed, withinCancelWindow}; optional `documentLabel`, `hasCorrection`, `onSubmit`, `onCancel`, `onCheck`; optional `className` and native div props on the root.

- `credentialEnvironments`: `EnvName[]`
- `byEnvironment`: `Partial<Record<EnvName, EInvoiceEnvStatus>>`
- `documentLabel?`: `string`. Default `"invoice"`.
- `hasCorrection?`: `boolean`. Default `true`.
- `credentialsHref?`: `string`. Where MyInvois credentials are set up; links the "not configured" message.
- `correctionHref?`: `string`. Where to raise the correcting credit note; links the "window has passed" message.
- `onSubmit?`: `(env: EnvName) => void`
- `onCancel?`: `(env: EnvName, reason: string) => void`
- `onCheck?`: `(env: EnvName) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Fetcher, retry hold and portal-settle flow are left to the caller. Validation stamp from templates/EInvoiceValidationBlock (QR omitted). Responsive by container: controls in a wrapping ActionBar; UUID and long ID break instead of overflowing.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
