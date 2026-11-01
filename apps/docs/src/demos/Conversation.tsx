import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
	Message,
	MessageContent,
	MessageResponse,
} from "@cynco-labs/ui/ai";

export default function ConversationDemo() {
	return (
		<Conversation className="h-[230px] max-w-[560px] rounded-lg border">
			<ConversationContent>
				<Message from="user">
					<MessageContent>Who owes us the most?</MessageContent>
				</Message>
				<Message from="assistant">
					<MessageContent>
						<MessageResponse>
							**Nusantara Logistik Bhd** owes RM 48,210.00, of which RM 12,720.00 is overdue.
						</MessageResponse>
					</MessageContent>
				</Message>
				<Message from="user">
					<MessageContent>Send them a statement.</MessageContent>
				</Message>
			</ConversationContent>
			<ConversationScrollButton />
		</Conversation>
	);
}
