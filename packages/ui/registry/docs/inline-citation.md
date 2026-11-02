# InlineCitation

Inline citation badges that open a card listing sources (with carousel for several) on hover, click or Enter, so keyboard users can reach every source.

```tsx
import { InlineCitation } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import {
	InlineCitation,
	InlineCitationCard,
	InlineCitationCardBody,
	InlineCitationCardTrigger,
	InlineCitationSource,
	InlineCitationText,
} from "@cynco-labs/ui/ai";

export default function InlineCitationDemo() {
	return (
		<p className="text-body max-w-[520px]">
			{"SST-registered businesses must issue e-invoices through MyInvois "}
			<InlineCitation>
				<InlineCitationText>from their phase start date</InlineCitationText>
				<InlineCitationCard defaultOpen>
					<InlineCitationCardTrigger sources={["https://sdk.myinvois.hasil.gov.my"]} />
					<InlineCitationCardBody>
						<InlineCitationSource
							title="MyInvois e-Invoice guideline"
							url="https://sdk.myinvois.hasil.gov.my"
							description="Phases, thresholds and what an e-invoice must contain."
						/>
					</InlineCitationCardBody>
				</InlineCitationCard>
			</InlineCitation>
			.
		</p>
	);
}
```

## Use

Citing sources inside assistant text.

## Props

`InlineCitationText`, `InlineCitationCard` › `InlineCitationCardTrigger sources`, `InlineCitationCardBody` › `InlineCitationSource` (`title`, `url`, `description`) or the carousel parts, `InlineCitationQuote`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/inline-citation.tsx`.
