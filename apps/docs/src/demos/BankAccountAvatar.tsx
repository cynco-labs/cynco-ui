import { BankAccountAvatar } from "@cynco-labs/ui";

export default function BankAccountAvatarDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<BankAccountAvatar
				size={32}
				account={{
					accountName: "Maybank Current",
					accountType: "checking",
					institution: { name: "Maybank", shortName: "MBB", primaryColor: "#FFC72C" },
				}}
			/>
			<BankAccountAvatar
				size={32}
				account={{
					accountName: "CIMB Business",
					accountType: "checking",
					institution: { name: "CIMB Bank", shortName: "CIMB", primaryColor: "#EC1C24" },
				}}
			/>
			<BankAccountAvatar
				size={32}
				account={{
					accountName: "Public Bank",
					accountType: "savings",
					institution: { name: "Public Bank", shortName: "PBB", primaryColor: "#D7171F" },
				}}
			/>
			<BankAccountAvatar
				size={32}
				account={{
					accountName: "RHB Reflex",
					accountType: "checking",
					institution: { name: "RHB Bank", shortName: "RHB", primaryColor: "#0067B1" },
				}}
			/>
			<BankAccountAvatar
				size={32}
				account={{
					accountName: "Hong Leong",
					accountType: "savings",
					institution: { name: "Hong Leong Bank", shortName: "HLB", primaryColor: null },
				}}
			/>
			<BankAccountAvatar account={{ accountName: "Corporate card", accountType: "credit_card" }} />
			<BankAccountAvatar account={{ accountName: "Petty cash", accountType: "ewallet" }} />
			<BankAccountAvatar account={{ accountName: "Operating", accountType: "checking" }} />
		</div>
	);
}
