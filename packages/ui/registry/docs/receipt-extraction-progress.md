# ReceiptExtractionProgress

Every Cynco AI extraction state on a bill: the four-step Reading / Extracting / Checking / Applying timeline, timed out, done with confidence, and failed (with or without retry).

```tsx
import { ReceiptExtractionProgress } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ReceiptExtractionProgress } from "@cynco-labs/ui";

export default function ReceiptExtractionProgressDemo() {
	return (
		<div className="grid gap-3 sm:grid-cols-2 max-w-[640px] items-start">
			<ReceiptExtractionProgress
				view={{ kind: "running", stage: "extracting", detail: "Line items and SST, page 1 of 2" }}
			/>
			<div className="flex flex-col gap-3">
				<ReceiptExtractionProgress view={{ kind: "done", confidence: 94 }} />
				<ReceiptExtractionProgress view={{ kind: "timed-out" }} />
				<ReceiptExtractionProgress
					view={{
						kind: "failed",
						message:
							"This looks like a scanned image with no readable text. Fill in the details manually.",
						retryable: false,
					}}
				/>
				<ReceiptExtractionProgress view={{ kind: "failed", message: null }} />
			</div>
		</div>
	);
}
```

## Use

Top of the bill form while a receipt or bill document is being read.

## Props

view ({kind:'running', stage, detail, slow} | {kind:'timed-out'} | {kind:'done', confidence} | {kind:'failed', message, retryable}), hasExtractedData, manualEntry, isReExtracting, onReview, onReExtract, onEnterManually, onCheckStatus; className and native div props.

- `view`: `ExtractionView | null`
- `hasExtractedData?`: `boolean`. Default `true`.
- `manualEntry?`: `boolean`. The user chose to fill the form while extraction runs. Default `false`.
- `isReExtracting?`: `boolean`
- `onReview?`: `() => void`
- `onReExtract?`: `() => void`
- `onEnterManually?`: `() => void`
- `onCheckStatus?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive: actions sit under the message, so it reads at any width.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
