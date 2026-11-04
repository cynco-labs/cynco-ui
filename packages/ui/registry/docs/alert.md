# Alert

Inline notice in five tones: default, note, success, warning, destructive.

```tsx
import { Alert } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Alert, AlertDescription, AlertTitle } from "@cynco-labs/ui";
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react";

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
```

## Use

Page- or section-level messages that stay visible.

## Props

`variant`; an optional leading 16px icon, `AlertTitle`, `AlertDescription`, `AlertAction`.

- `variant?`: `"default" | "destructive" | "note" | "success" | "warning"`. Default `"default"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Tinted at 4% fill and 15% border; text stays `foreground` at 80%. Tone hues come from Tailwind (sky, emerald, amber, red), not tokens.

Category: Components · Feedback. Source: `packages/ui/src/base/components/ui/alert.tsx:23-33`.
