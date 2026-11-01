import {
	Confirmation,
	ConfirmationAccepted,
	ConfirmationAction,
	ConfirmationActions,
	ConfirmationRejected,
	ConfirmationRequest,
	ConfirmationTitle,
} from "@cynco-labs/ui/ai";

export default function ConfirmationDemo() {
	return (
		<div className="max-w-[520px]">
			<Confirmation state="approval-requested" approval={{ id: "a1" }}>
				<ConfirmationTitle>
					<ConfirmationRequest>
						{"Post 14 journal entries for October? This updates the ledger."}
					</ConfirmationRequest>
					<ConfirmationAccepted>Approved</ConfirmationAccepted>
					<ConfirmationRejected>Rejected</ConfirmationRejected>
				</ConfirmationTitle>
				<ConfirmationActions>
					<ConfirmationAction variant="secondary">Reject</ConfirmationAction>
					<ConfirmationAction variant="primary">Approve</ConfirmationAction>
				</ConfirmationActions>
			</Confirmation>
		</div>
	);
}
