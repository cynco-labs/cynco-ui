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
		<p className="text-sm font-medium text-muted-foreground max-w-[520px]">
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
