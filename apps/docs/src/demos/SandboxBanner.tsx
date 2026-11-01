import { SandboxBanner, SandboxBannerAction } from "@cynco-labs/ui";

export default function SandboxBannerDemo() {
	return (
		<div className="relative h-10">
			<SandboxBanner>
				<SandboxBannerAction>Switch to live</SandboxBannerAction>
			</SandboxBanner>
		</div>
	);
}
