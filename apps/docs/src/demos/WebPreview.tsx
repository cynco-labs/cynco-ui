import {
	WebPreview,
	WebPreviewConsole,
	WebPreviewNavigation,
	WebPreviewNavigationButton,
	WebPreviewUrl,
} from "@cynco-labs/ui/ai";
import { ArrowsClockwiseIcon, CaretRightIcon } from "@phosphor-icons/react";

export default function WebPreviewDemo() {
	return (
		<WebPreview defaultUrl="https://app.cynco.io/invoices" className="max-w-[620px] h-auto">
			<WebPreviewNavigation>
				<WebPreviewNavigationButton tooltip="Back">
					<CaretRightIcon size={14} style={{ transform: "rotate(180deg)" }} />
				</WebPreviewNavigationButton>
				<WebPreviewNavigationButton tooltip="Reload">
					<ArrowsClockwiseIcon size={14} />
				</WebPreviewNavigationButton>
				<WebPreviewUrl />
			</WebPreviewNavigation>
			<WebPreviewConsole
				logs={[
					{
						level: "log",
						message: "Invoice list mounted",
						timestamp: new Date(2026, 9, 29, 9, 30),
					},
					{
						level: "warn",
						message: "2 invoices have no tax code",
						timestamp: new Date(2026, 9, 29, 9, 31),
					},
				]}
			/>
		</WebPreview>
	);
}
