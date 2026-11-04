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
import { CopyIcon } from "@phosphor-icons/react";

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
			<ArtifactContent className="text-sm font-medium text-muted-foreground">
				{"6210 Utilities, Dr 1,184.30 · 2300 Accruals, Cr 1,184.30"}
			</ArtifactContent>
		</Artifact>
	);
}
