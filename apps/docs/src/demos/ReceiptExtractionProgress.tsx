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
