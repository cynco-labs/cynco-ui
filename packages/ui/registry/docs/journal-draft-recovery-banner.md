# JournalDraftRecoveryBanner

The banner offering to recover an unsaved local journal draft.

```tsx
import { JournalDraftRecoveryBanner } from "@cynco-labs/ui";
```

## Usage

```tsx
import { JournalDraftRecoveryBanner } from "@cynco-labs/ui";

export default function JournalDraftRecoveryBannerDemo() {
	return <JournalDraftRecoveryBanner savedAgo="12 minutes ago" />;
}
```

## Use

Below the journal top bar when a recoverable draft exists in local storage.

## Props

savedAgo (e.g. "12 minutes ago"), onRecover, onDismiss, className? (merged on the root) and native props.

- `savedAgo`: `string`
- `onRecover?`: `() => void`
- `onDismiss?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive: Buttons wrap under the message when narrow.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger.tsx`.
