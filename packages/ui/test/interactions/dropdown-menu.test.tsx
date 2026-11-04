import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@cynco-labs/ui";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

type Handlers = {
	onDuplicate?: () => void;
	onArchive?: () => void;
	onDelete?: () => void;
	onExportCsv?: () => void;
};

function Fixture({ onDuplicate, onArchive, onDelete, onExportCsv }: Handlers) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button">Row actions</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={onDuplicate} shortcut="d">
					Duplicate
				</DropdownMenuItem>
				<DropdownMenuItem disabled onClick={onArchive}>
					Archive
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem onClick={onExportCsv}>CSV</DropdownMenuItem>
						<DropdownMenuItem>PDF</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={onDelete}>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const trigger = () => screen.getByRole("button", { name: "Row actions" });
const item = (name: string) => screen.getByRole("menuitem", { name });

/** Lets a focus move that Base UI schedules on the next animation frame land. */
const settle = () =>
	act(async () => {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
	});

const openWith = async (
	user: ReturnType<typeof userEvent.setup>,
	keys: string,
) => {
	await user.tab();
	expect(document.activeElement).toBe(trigger());
	await user.keyboard(keys);
	await screen.findByRole("menu");
	await settle();
};

describe("DropdownMenu", () => {
	test("a click opens the menu", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		expect(screen.queryByRole("menu")).toBeNull();

		await user.click(trigger());

		expect(await screen.findByRole("menu")).toBeTruthy();
		expect(trigger().getAttribute("aria-expanded")).toBe("true");
	});

	test.each([
		["Enter", "{Enter}"],
		["Space", " "],
		["ArrowDown", "{ArrowDown}"],
	])("%s on the trigger opens the menu", async (_label, keys) => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openWith(user, keys);

		expect(screen.getByRole("menu")).toBeTruthy();
	});

	test("ArrowDown lands on the first item", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openWith(user, "{ArrowDown}");

		expect(document.activeElement).toBe(item("Duplicate"));
	});

	test("arrow navigation wraps at both ends", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openWith(user, "{ArrowDown}");
		expect(document.activeElement).toBe(item("Duplicate"));

		await user.keyboard("{ArrowUp}");
		await settle();
		expect(document.activeElement).toBe(item("Delete"));

		await user.keyboard("{ArrowDown}");
		await settle();
		expect(document.activeElement).toBe(item("Duplicate"));
	});

	test("Enter activates the highlighted item and closes the menu", async () => {
		const user = userEvent.setup();
		const onDuplicate = vi.fn();
		render(<Fixture onDuplicate={onDuplicate} />);

		await openWith(user, "{ArrowDown}");
		await user.keyboard("{Enter}");

		expect(onDuplicate).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
	});

	test("closing returns focus to the trigger", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openWith(user, "{ArrowDown}");
		await user.keyboard("{Escape}");

		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(trigger()));
	});

	/**
	 * A disabled item stays arrow-reachable, as the ARIA APG recommends, so a keyboard or
	 * screen-reader user learns the action exists and is unavailable rather than finding a
	 * gap in the list. What it must never do is fire.
	 */
	test("a disabled item is reachable and announced, but never fires", async () => {
		const user = userEvent.setup();
		const onArchive = vi.fn();
		render(<Fixture onArchive={onArchive} />);

		await openWith(user, "{ArrowDown}");

		const archive = item("Archive");
		expect(archive.getAttribute("aria-disabled")).toBe("true");

		await user.keyboard("{ArrowDown}");
		await settle();
		expect(document.activeElement).toBe(archive);

		await user.keyboard("{Enter}");
		expect(onArchive).not.toHaveBeenCalled();
		expect(screen.getByRole("menu")).toBeTruthy();

		await user.click(archive);
		expect(onArchive).not.toHaveBeenCalled();
	});

	test("arrowing past a disabled item still reaches the items after it", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openWith(user, "{ArrowDown}");
		await user.keyboard("{ArrowDown}{ArrowDown}");
		await settle();

		expect(document.activeElement).toBe(item("Export"));
	});

	test("ArrowRight on a submenu trigger opens the submenu", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openWith(user, "{ArrowDown}");

		expect(item("Export").getAttribute("aria-haspopup")).toBe("menu");

		await user.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
		await settle();

		expect(await screen.findByRole("menuitem", { name: "CSV" })).toBeTruthy();
	});

	test("ArrowLeft closes the submenu and leaves the parent menu open", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await openWith(user, "{ArrowDown}");
		await user.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
		await settle();
		await screen.findByRole("menuitem", { name: "CSV" });

		await user.keyboard("{ArrowLeft}");
		await settle();

		await waitFor(() =>
			expect(screen.queryByRole("menuitem", { name: "CSV" })).toBeNull(),
		);
		expect(screen.getByRole("menuitem", { name: "Duplicate" })).toBeTruthy();
	});

	test("a submenu item activates and closes the whole menu", async () => {
		const user = userEvent.setup();
		const onExportCsv = vi.fn();
		render(<Fixture onExportCsv={onExportCsv} />);

		await openWith(user, "{ArrowDown}");
		await user.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
		await settle();
		await screen.findByRole("menuitem", { name: "CSV" });

		await user.keyboard("{Enter}");

		expect(onExportCsv).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
	});

	// An item's `shortcut` is a single key that fires it while the menu is open, ahead of
	// Base UI's typeahead (see hooks/use-dropdown-shortcut.ts).
	test("an item's shortcut key fires it while the menu is open", async () => {
		const user = userEvent.setup();
		const onDuplicate = vi.fn();
		render(<Fixture onDuplicate={onDuplicate} />);

		await openWith(user, "{ArrowDown}");
		await user.keyboard("d");

		expect(onDuplicate).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
	});

	test("the shortcut key does nothing while the menu is closed", async () => {
		const user = userEvent.setup();
		const onDuplicate = vi.fn();
		render(<Fixture onDuplicate={onDuplicate} />);

		await user.tab();
		await user.keyboard("d");

		expect(onDuplicate).not.toHaveBeenCalled();
		expect(screen.queryByRole("menu")).toBeNull();
	});

	test("a disabled item registers no shortcut", async () => {
		const user = userEvent.setup();
		const onArchive = vi.fn();
		render(
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button type="button">Row actions</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>Duplicate</DropdownMenuItem>
					<DropdownMenuItem disabled shortcut="a" onClick={onArchive}>
						Archive
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);

		await openWith(user, "{ArrowDown}");
		await user.keyboard("a");

		expect(onArchive).not.toHaveBeenCalled();
	});
});
