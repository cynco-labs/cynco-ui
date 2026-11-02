# BankAccountAvatar

A bank account's mark: the institution's short code in a circle on its brand colour, or the account-type glyph (bank, card, wallet) when there is no institution.

```tsx
import { BankAccountAvatar } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Account rail rows, reconcile account chooser, connect dialogs.

## Props

account {accountName, accountType, institution? {name, shortName, primaryColor}}, size, className and native props (spread on the root).

- `account`: `Pick<BankRailAccount, "accountName" | "accountType" | "institution">`
- `size?`: `number`. Default `24`.
- Also accepts `ComponentProps<"span">`.

## Notes

Size via the size prop; colour and size styles are data-driven.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
