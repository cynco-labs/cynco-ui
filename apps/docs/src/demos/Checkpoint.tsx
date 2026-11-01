import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "@cynco-labs/ui/ai";

export default function CheckpointDemo() {
	return (
		<Checkpoint className="max-w-[520px]">
			<CheckpointIcon />
			<CheckpointTrigger tooltip="Restore this checkpoint">Restore checkpoint</CheckpointTrigger>
		</Checkpoint>
	);
}
