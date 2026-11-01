import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@cynco-labs/ui";

export default function DialogDemo() {
	return (
		<Dialog defaultOpen modal={false}>
			<DialogContent className="max-w-[420px]">
				<DialogHeader>
					<DialogTitle>Void invoice</DialogTitle>
					<DialogDescription>
						INV-2026-0142 will be reversed in the ledger and marked Void. This cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="secondary">Cancel</Button>
					<Button variant="destructive">Void invoice</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
