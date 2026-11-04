import { Checkbox } from "@cynco-labs/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

function Controlled({
	disabled,
	onCheckedChange,
}: {
	disabled?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}) {
	const [checked, setChecked] = React.useState(false);
	return (
		<Checkbox
			aria-label="Mark as reconciled"
			disabled={disabled}
			checked={checked}
			onCheckedChange={(next) => {
				setChecked(next);
				onCheckedChange?.(next);
			}}
		/>
	);
}

const box = () => screen.getByRole("checkbox", { name: "Mark as reconciled" });
const isChecked = () => box().getAttribute("aria-checked") === "true";

describe("Checkbox", () => {
	test("Space toggles it on and off", async () => {
		const user = userEvent.setup();
		render(<Controlled />);

		await user.tab();
		expect(document.activeElement).toBe(box());
		expect(isChecked()).toBe(false);

		await user.keyboard(" ");
		expect(isChecked()).toBe(true);

		await user.keyboard(" ");
		expect(isChecked()).toBe(false);
	});

	test("a click toggles it", async () => {
		const user = userEvent.setup();
		render(<Controlled />);

		await user.click(box());
		expect(isChecked()).toBe(true);
	});

	// A sheet binds cmd/ctrl+Enter to submit. The focused checkbox must not also flip,
	// or submitting from a checkbox silently changes the value being submitted.
	test("cmd+Enter and ctrl+Enter do not toggle it", async () => {
		const user = userEvent.setup();
		const onCheckedChange = vi.fn();
		render(<Controlled onCheckedChange={onCheckedChange} />);

		await user.tab();
		await user.keyboard("{Meta>}{Enter}{/Meta}");
		await user.keyboard("{Control>}{Enter}{/Control}");

		expect(onCheckedChange).not.toHaveBeenCalled();
		expect(isChecked()).toBe(false);
	});

	test("a bare Enter toggles it", async () => {
		const user = userEvent.setup();
		render(<Controlled />);

		await user.tab();
		await user.keyboard("{Enter}");

		expect(isChecked()).toBe(true);
	});

	test("disabled does not toggle and is skipped by Tab", async () => {
		const user = userEvent.setup();
		const onCheckedChange = vi.fn();
		render(
			<>
				<Controlled disabled onCheckedChange={onCheckedChange} />
				<button type="button">After</button>
			</>,
		);

		await user.click(box());
		await user.keyboard(" ");
		await user.keyboard("{Enter}");
		expect(onCheckedChange).not.toHaveBeenCalled();
		expect(isChecked()).toBe(false);

		await user.tab();
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "After" }),
		);
	});

	test("uncontrolled use toggles without a value prop", async () => {
		const user = userEvent.setup();
		render(<Checkbox aria-label="Include drafts" />);

		const target = screen.getByRole("checkbox", { name: "Include drafts" });
		await user.click(target);

		expect(target.getAttribute("aria-checked")).toBe("true");
	});
});
