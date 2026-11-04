import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@cynco-labs/ui";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

function Fixture() {
	return (
		<>
			<button type="button">Before</button>
			<Dialog>
				<DialogTrigger asChild>
					<button type="button">Post entry</button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>Post this entry?</DialogTitle>
					<DialogDescription>
						Posting locks the lines against further edits.
					</DialogDescription>
					<button type="button">Cancel</button>
					<button type="button">Post</button>
				</DialogContent>
			</Dialog>
			<button type="button">After</button>
		</>
	);
}

const trigger = () => screen.getByRole("button", { name: "Post entry" });

/**
 * Tab, then let the focus trap's redirect land. Tabbing past the last control focuses
 * floating-ui's hidden guard, which bounces focus back on the next animation frame.
 */
const tabAndSettle = async (
	user: ReturnType<typeof userEvent.setup>,
	opts?: { shift: boolean },
) => {
	await user.tab(opts);
	await act(async () => {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
	});
};
const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.click(trigger());
	return screen.findByRole("dialog");
};

describe("Dialog", () => {
	test("the trigger opens it and the content is named by its title", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		expect(screen.queryByRole("dialog")).toBeNull();

		const dialog = await openDialog(user);

		expect(dialog.textContent).toContain("Post this entry?");
		expect(
			screen.getByRole("dialog", { name: "Post this entry?" }),
		).toBeTruthy();
	});

	test("Enter on the trigger opens it", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.tab();
		await user.tab();
		expect(document.activeElement).toBe(trigger());

		await user.keyboard("{Enter}");

		expect(await screen.findByRole("dialog")).toBeTruthy();
	});

	test("opening moves focus inside the dialog", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const dialog = await openDialog(user);

		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
	});

	// Tab must not escape to the page behind: a keyboard user who tabs past the last
	// control lands back on the first, not on "After".
	test("Tab cycles within the dialog and never reaches the page behind", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const outside = [
			screen.getByRole("button", { name: "Before" }),
			screen.getByRole("button", { name: "After" }),
			trigger(),
		];

		const dialog = await openDialog(user);
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

		const inside = [
			screen.getByRole("button", { name: "Cancel" }),
			screen.getByRole("button", { name: "Post" }),
			screen.getByRole("button", { name: "Close" }),
		];

		// Ten tabs is more than the dialog has controls, so a trap must have wrapped by now.
		const seen = new Set<HTMLElement>();
		for (let i = 0; i < 10; i++) {
			await tabAndSettle(user);
			const active = document.activeElement as HTMLElement;
			expect(outside).not.toContain(active);
			expect(dialog.contains(active)).toBe(true);
			seen.add(active);
		}

		// Every control got a turn, so the cycle covers the dialog rather than a corner of it.
		for (const control of inside) expect(seen.has(control)).toBe(true);
	});

	// The other half of the trap, and the one a screen reader depends on: while the dialog
	// is open the rest of the page is out of the accessibility tree entirely.
	test("the page behind leaves the accessibility tree while it is open", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		expect(screen.getByRole("button", { name: "Before" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "After" })).toBeTruthy();

		await openDialog(user);

		expect(screen.queryByRole("button", { name: "Before" })).toBeNull();
		expect(screen.queryByRole("button", { name: "After" })).toBeNull();
	});

	test("Shift+Tab wraps backwards inside the dialog too", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const outside = [
			screen.getByRole("button", { name: "Before" }),
			screen.getByRole("button", { name: "After" }),
			trigger(),
		];

		const dialog = await openDialog(user);
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

		for (let i = 0; i < 6; i++) {
			await tabAndSettle(user, { shift: true });
			const active = document.activeElement as HTMLElement;
			expect(outside).not.toContain(active);
			expect(dialog.contains(active)).toBe(true);
		}
	});

	test("Escape closes it and returns focus to the trigger", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openDialog(user);
		await user.keyboard("{Escape}");

		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(trigger()));
	});

	test("the close button has an accessible name and closes the dialog", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openDialog(user);

		const close = screen.getByRole("button", { name: "Close" });
		await user.click(close);

		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(trigger()));
	});

	test("the close button is reachable and operable from the keyboard", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const dialog = await openDialog(user);
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

		const close = screen.getByRole("button", { name: "Close" });
		close.focus();
		await user.keyboard("{Enter}");

		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	test("showCloseButton={false} leaves no close button", async () => {
		const user = userEvent.setup();
		render(
			<Dialog>
				<DialogTrigger asChild>
					<button type="button">Open</button>
				</DialogTrigger>
				<DialogContent showCloseButton={false}>
					<DialogTitle>Bare</DialogTitle>
				</DialogContent>
			</Dialog>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		await screen.findByRole("dialog");

		expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
	});
});

describe("Dialog, nested", () => {
	function Nested() {
		return (
			<Dialog>
				<DialogTrigger asChild>
					<button type="button">Open parent</button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>Parent</DialogTitle>
					<Dialog>
						<DialogTrigger asChild>
							<button type="button">Open child</button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>Child</DialogTitle>
						</DialogContent>
					</Dialog>
				</DialogContent>
			</Dialog>
		);
	}

	/**
	 * Held by reference, not re-queried: once the child opens, the parent leaves the
	 * accessibility tree (that is the nesting working), so getByRole can no longer find it.
	 */
	const openParent = async (user: ReturnType<typeof userEvent.setup>) => {
		await user.click(screen.getByRole("button", { name: "Open parent" }));
		return screen.findByRole("dialog", { name: "Parent" });
	};

	// The parent dims behind the child through `data-nested-dialog-open:after:opacity-100`,
	// so the attribute is the whole mechanism, not a styling detail.
	test("opening a child dialog marks the parent as nested-open", async () => {
		const user = userEvent.setup();
		render(<Nested />);

		const parent = await openParent(user);
		expect(parent.hasAttribute("data-nested-dialog-open")).toBe(false);

		await user.click(screen.getByRole("button", { name: "Open child" }));
		await screen.findByRole("dialog", { name: "Child" });

		await waitFor(() =>
			expect(parent.hasAttribute("data-nested-dialog-open")).toBe(true),
		);
	});

	test("the child takes over the accessibility tree from the parent", async () => {
		const user = userEvent.setup();
		render(<Nested />);

		await openParent(user);
		await user.click(screen.getByRole("button", { name: "Open child" }));
		await screen.findByRole("dialog", { name: "Child" });

		expect(screen.queryByRole("dialog", { name: "Parent" })).toBeNull();
	});

	test("Escape closes the child first and leaves the parent open and undimmed", async () => {
		const user = userEvent.setup();
		render(<Nested />);

		const parent = await openParent(user);
		await user.click(screen.getByRole("button", { name: "Open child" }));
		await screen.findByRole("dialog", { name: "Child" });

		await user.keyboard("{Escape}");

		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Child" })).toBeNull(),
		);
		expect(screen.getByRole("dialog", { name: "Parent" })).toBeTruthy();
		await waitFor(() =>
			expect(parent.hasAttribute("data-nested-dialog-open")).toBe(false),
		);
	});
});
