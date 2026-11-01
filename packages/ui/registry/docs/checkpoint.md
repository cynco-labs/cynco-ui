# Checkpoint

A divider row marking a restorable point in a conversation.

```tsx
import { Checkpoint } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "@cynco-labs/ui/ai";

export default function CheckpointDemo() {
	return (
		<Checkpoint className="max-w-[520px]">
			<CheckpointIcon />
			<CheckpointTrigger tooltip="Restore this checkpoint">Restore checkpoint</CheckpointTrigger>
		</Checkpoint>
	);
}
```

## Use

Between messages, to roll back.

## Props

`CheckpointIcon`, `CheckpointTrigger` (Button props + `tooltip`).

Category: AI. Source: `packages/ui/src/base/components/ai-elements/checkpoint.tsx`.
