# Artifact

A titled container for something the assistant produced (a file, config or document), with actions and a close button.

```tsx
import { Artifact } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { CopyIcon } from "@phosphor-icons/react";
import {
	Artifact,
	ArtifactAction,
	ArtifactActions,
	ArtifactClose,
	ArtifactContent,
	ArtifactDescription,
	ArtifactHeader,
	ArtifactTitle,
} from "@cynco-labs/ui/ai";

export default function ArtifactDemo() {
	return (
		<Artifact className="max-w-[520px]">
			<ArtifactHeader>
				<div>
					<ArtifactTitle>journal-oct-2026.csv</ArtifactTitle>
					<ArtifactDescription>Generated month-end accruals</ArtifactDescription>
				</div>
				<ArtifactActions>
					<ArtifactAction tooltip="Copy" label="Copy">
						<CopyIcon size={14} />
					</ArtifactAction>
					<ArtifactClose />
				</ArtifactActions>
			</ArtifactHeader>
			<ArtifactContent className="text-body">
				{"6210 Utilities, Dr 1,184.30 · 2300 Accruals, Cr 1,184.30"}
			</ArtifactContent>
		</Artifact>
	);
}
```

## Use

Showing generated output beside or inside a chat.

## Props

`ArtifactHeader` › `ArtifactTitle`, `ArtifactDescription`, `ArtifactActions` › `ArtifactAction` (`tooltip`, `label`, `icon` or children), `ArtifactClose`; `ArtifactContent`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/artifact.tsx`.
