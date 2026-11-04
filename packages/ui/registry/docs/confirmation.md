# Confirmation

An approval request for a tool call, built on Alert.

```tsx
import { Confirmation } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
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
					<ConfirmationRequest>{"Post 14 journal entries for October? This updates the ledger."}</ConfirmationRequest>
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
```

## Use

When the agent needs a yes/no before acting (deleting, posting).

## Props

`state` (AI SDK tool state), `approval`; `ConfirmationTitle` › `ConfirmationRequest` / `ConfirmationAccepted` / `ConfirmationRejected`; `ConfirmationActions` › `ConfirmationAction`.

- `state`: `ToolUIPart["state"]`
- `variant?`: `"default" | "destructive" | "note" | "success" | "warning"`. Default `"default"`.
- `approval?`: `ToolUIPartApproval`
- Also accepts `ComponentProps<"div">`.

## Notes

Each child renders only in its matching state.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/confirmation.tsx:59-88`.
