import { RecordBillPaymentDialog } from "@cynco-labs/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const ACCOUNTS = [{ id: "acc_1", accountCode: "1000-001", accountName: "Maybank Current Account" }];

function Fixture(props: {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSubmit?: (data: { paymentMethod: string | null; bankAccountId: string; paymentAmount: string }) => void;
}) {
	return (
		<RecordBillPaymentDialog
			billAmount="8450.00"
			paidAmount="3000.00"
			bankAccounts={ACCOUNTS}
			defaultDate="2026-10-30"
			{...props}
		/>
	);
}

const combobox = (name: string) => screen.getByRole("combobox", { name });

/** Open the sheet and choose the one bank account, which is the only required pick. */
async function openAndPickAccount(user: ReturnType<typeof userEvent.setup>) {
	await user.click(screen.getByRole("button", { name: "Record payment" }));
	await user.click(combobox("Bank / Cash Account *"));
	await user.click(await screen.findByRole("option", { name: /Maybank Current Account/ }));
}

describe("RecordBillPaymentDialog payment method", () => {
	test("a method left unspecified submits as null", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<Fixture onSubmit={onSubmit} />);

		await openAndPickAccount(user);
		await user.click(screen.getByRole("button", { name: "Confirm payment" }));

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ paymentMethod: null, bankAccountId: "acc_1", paymentAmount: "5450.00" }),
		);
	});

	test("choosing Cheque submits its id, not the words on screen", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<Fixture onSubmit={onSubmit} />);

		await openAndPickAccount(user);
		await user.click(combobox("Payment method"));
		await user.click(await screen.findByRole("option", { name: "Cheque" }));
		await user.click(screen.getByRole("button", { name: "Confirm payment" }));

		expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ paymentMethod: "cheque" }));
	});

	test("Not specified takes a chosen method back to null", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<Fixture onSubmit={onSubmit} />);

		await openAndPickAccount(user);
		await user.click(combobox("Payment method"));
		await user.click(await screen.findByRole("option", { name: "Card" }));
		await user.click(combobox("Payment method"));
		await user.click(await screen.findByRole("option", { name: "Not specified" }));
		await user.click(screen.getByRole("button", { name: "Confirm payment" }));

		expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ paymentMethod: null }));
	});
});

describe("RecordBillPaymentDialog open state", () => {
	test("a caller holding open false keeps the sheet shut and still hears the request to open", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();
		render(<Fixture open={false} onOpenChange={onOpenChange} />);

		await user.click(screen.getByRole("button", { name: "Record payment" }));

		expect(onOpenChange).toHaveBeenCalledWith(true);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	test("a caller holding open true shows the sheet with no click", () => {
		render(<Fixture open={true} />);

		expect(screen.getByRole("dialog", { name: "Record payment" })).toBeTruthy();
	});
});
