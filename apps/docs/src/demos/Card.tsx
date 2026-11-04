import {
	Badge,
	Button,
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@cynco-labs/ui";

export default function CardDemo() {
	return (
		<Card className="max-w-[380px]">
			<CardHeader>
				<CardTitle>Maybank Current</CardTitle>
				<CardDescription>1010-001 · last synced today</CardDescription>
				<CardAction>
					<Badge variant="muted">Primary</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="text-sm font-medium text-muted-foreground">RM 84,215.40 · 14 lines to review</CardContent>
			<CardFooter>
				<Button variant="secondary" size="sm">
					Review lines
				</Button>
			</CardFooter>
		</Card>
	);
}
