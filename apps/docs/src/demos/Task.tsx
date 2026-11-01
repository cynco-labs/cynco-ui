import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "@cynco-labs/ui/ai";

export default function TaskDemo() {
	return (
		<Task defaultOpen className="max-w-[520px]">
			<TaskTrigger title="Searching your ledger" />
			<TaskContent>
				<TaskItem>
					{"Read "}
					<TaskItemFile>general-ledger-oct.csv</TaskItemFile>
				</TaskItem>
				<TaskItem>Found 6 unreconciled lines</TaskItem>
			</TaskContent>
		</Task>
	);
}
