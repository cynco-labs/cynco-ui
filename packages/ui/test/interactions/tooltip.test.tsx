import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@cynco-labs/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

const HINT = "Match this line to a bank entry";

function Fixture() {
	return (
		<TooltipProvider delay={0}>
			<button type="button">Before</button>
			<Tooltip>
				<TooltipTrigger asChild>
					<button type="button" aria-label="Reconcile">
						R
					</button>
				</TooltipTrigger>
				<TooltipContent>{HINT}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

const trigger = () => screen.getByRole("button", { name: "Reconcile" });
const focusTrigger = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.tab();
	await user.tab();
};

describe("Tooltip", () => {
	test("nothing is shown until the trigger is hovered or focused", () => {
		render(<Fixture />);

		expect(screen.queryByText(HINT)).toBeNull();
	});

	test("keyboard focus on the trigger shows the hint, moving on hides it", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await focusTrigger(user);
		expect(document.activeElement).toBe(trigger());
		expect(await screen.findByText(HINT)).toBeTruthy();

		await user.tab();
		expect(document.activeElement).not.toBe(trigger());
		await waitFor(() => expect(screen.queryByText(HINT)).toBeNull());
	});

	test("hovering the trigger shows the hint, leaving hides it", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.hover(trigger());
		expect(await screen.findByText(HINT)).toBeTruthy();

		await user.unhover(trigger());
		await waitFor(() => expect(screen.queryByText(HINT)).toBeNull());
	});

	// A tooltip is a hint, not a dialog: Escape dismisses it without the user losing their
	// place (WCAG 1.4.13 "Content on Hover or Focus").
	test("Escape dismisses the hint and leaves focus on the trigger", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await focusTrigger(user);
		await screen.findByText(HINT);

		await user.keyboard("{Escape}");

		await waitFor(() => expect(screen.queryByText(HINT)).toBeNull());
		expect(document.activeElement).toBe(trigger());
	});

	test("the trigger keeps its own accessible name while the hint is open", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await focusTrigger(user);
		await screen.findByText(HINT);

		expect(screen.getByRole("button", { name: "Reconcile" })).toBeTruthy();
	});

	test("the hint is exposed as role=tooltip", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await focusTrigger(user);
		await screen.findByText(HINT);

		expect(screen.queryByRole("tooltip")).not.toBeNull();
	});

	test("the trigger is described by the hint while it is open", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await focusTrigger(user);
		const hint = await screen.findByText(HINT);

		expect(hint.id).toBeTruthy();
		expect(trigger().getAttribute("aria-describedby")).toBe(hint.id);
	});
});
