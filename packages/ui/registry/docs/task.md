# Task

A collapsible task with its sub-steps and file references.

```tsx
import { Task } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
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
```

## Use

Showing an agent's search or edit work.

## Props

`TaskTrigger title`, `TaskContent` › `TaskItem` (with `TaskItemFile`).

- `asChild?`: `boolean`
- Also accepts `CollapsiblePrimitive.Root.Props`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/task.tsx`.
