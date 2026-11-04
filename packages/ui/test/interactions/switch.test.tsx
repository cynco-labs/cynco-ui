import { Switch } from "@cynco-labs/ui";
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
		<Switch
			aria-label="Auto-post journals"
			disabled={disabled}
			checked={checked}
			onCheckedChange={(next) => {
				setChecked(next);
				onCheckedChange?.(next);
			}}
		/>
	);
}

const toggle = () => screen.getByRole("switch", { name: "Auto-post journals" });
const isOn = () => toggle().getAttribute("aria-checked") === "true";

describe("Switch", () => {
	test("Space toggles it on and off", async () => {
		const user = userEvent.setup();
		render(<Controlled />);

		await user.tab();
		expect(document.activeElement).toBe(toggle());
		expect(isOn()).toBe(false);

		await user.keyboard(" ");
		expect(isOn()).toBe(true);

		await user.keyboard(" ");
		expect(isOn()).toBe(false);
	});

	test("a click toggles it", async () => {
		const user = userEvent.setup();
		render(<Controlled />);

		await user.click(toggle());
		expect(isOn()).toBe(true);
	});

	// A sheet binds cmd/ctrl+Enter to submit. The focused switch must not also flip,
	// or submitting from a switch silently changes the value being submitted.
	test("cmd+Enter and ctrl+Enter do not toggle it", async () => {
		const user = userEvent.setup();
		const onCheckedChange = vi.fn();
		render(<Controlled onCheckedChange={onCheckedChange} />);

		await user.tab();
		await user.keyboard("{Meta>}{Enter}{/Meta}");
		await user.keyboard("{Control>}{Enter}{/Control}");

		expect(onCheckedChange).not.toHaveBeenCalled();
		expect(isOn()).toBe(false);
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

		await user.click(toggle());
		await user.keyboard(" ");
		expect(onCheckedChange).not.toHaveBeenCalled();
		expect(isOn()).toBe(false);

		await user.tab();
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "After" }),
		);
	});

	test("uncontrolled use toggles without a checked prop", async () => {
		const user = userEvent.setup();
		render(<Switch aria-label="Email receipts" />);

		const target = screen.getByRole("switch", { name: "Email receipts" });
		await user.click(target);

		expect(target.getAttribute("aria-checked")).toBe("true");
	});
});
