import type { TaskId, TaskSet } from "./types.ts";

export interface Task {
	id: TaskId;
	set: TaskSet;
	prompt: string;
}

export const TASKS: readonly Task[] = [
	{
		id: "account-settings",
		set: "generic",
		prompt: `Can you build an account settings page in src/App.tsx? Sections for profile (name, email, job title, a timezone select with a decent list of zones, short bio), notifications (toggles for email digests, product updates, mentions, weekly summary) and a danger zone at the bottom with a delete account button that asks for confirmation in a dialog before doing anything. Saving should validate inline: name required, email must look like an email, bio max 160 characters, with the errors shown next to the fields. There's no backend yet, so just put made-up data for the current user in the code and fake the save. It needs to work well on phone and desktop.`,
	},
	{
		id: "team-members",
		set: "generic",
		prompt: `I need a team members screen in src/App.tsx. A table of members with name, email, role, status and last active. Add a search box, a filter by role (owner, admin, member, viewer), sortable columns, and a menu on each row with change role and remove. Remove should ask for confirmation first. Show a proper empty state when the search or filter matches nobody, and paginate at 10 per page. We don't have a backend yet, so make up about 35 members in the code. Has to work on phone and desktop.`,
	},
	{
		id: "analytics-overview",
		set: "generic",
		prompt: `Build an analytics overview page in src/App.tsx for a small SaaS app. Across the top, KPI tiles for active users, new signups, revenue and churn rate, each with the change versus the previous period. A switcher for the last 7, 30 or 90 days that updates the numbers, and below that a recent activity list (who did what, and when). No backend, so generate plausible made-up data in the code for each range. It should look right on phone and desktop.`,
	},
	{
		id: "command-palette",
		set: "generic",
		prompt: `Add a command palette to a simple project dashboard in src/App.tsx. The dashboard itself can be light: a header with a search button that shows the shortcut, and a few project cards. Cmd+K (Ctrl+K on Windows) or the button opens the palette. Typing filters a list of actions and pages grouped into sections (Navigation, Projects, Actions), arrow keys move through results, Enter runs the highlighted one, Esc closes, and it shows a "no results" message when nothing matches. Running an action should do something visible, like a toast or switching the page title. No backend, so made-up projects in the code are fine. It has to work on phone and desktop.`,
	},
	{
		id: "invoices-list",
		set: "domain",
		prompt: `Please build an invoices list in src/App.tsx for a Malaysian small business. Tabs to filter by status: all, draft, sent, overdue and paid, with a count on each. Each invoice shows its number, customer, issue date, due date, amount in MYR and status. Above the list, a summary of the totals (outstanding, overdue, paid this month). Let me select several invoices with checkboxes and mark the selected drafts as sent in one go. No backend yet, so put around 25 made-up invoices in the code. It needs to work on phone and desktop.`,
	},
	{
		id: "new-invoice",
		set: "domain",
		prompt: `I need a new invoice form in src/App.tsx. Pick a customer from a list (with search), set the issue date and due date, then add line items with description, quantity and unit price; I should be able to add and remove lines. Show each line's amount and, at the bottom, the subtotal, 8% SST and the total, all in MYR and updating as I type. Amounts must add up exactly to the cent. Add save as draft and send buttons. There's no backend, so made-up customers in the code are fine and saving can just show a confirmation. Has to work on phone and desktop.`,
	},
];

const FORBIDDEN_WORDS = /\b(eval\w*|test\w*|judge\w*|benchmark\w*|score\w*|compar\w*|candidate\w*|arena)\b/i;

/**
 * Throws when text the agent can see would tell it that it is being measured or name a library it is
 * measured against.
 */
export function assertBlind(text: string, forbiddenNames: readonly string[], where: string): void {
	const word = text.match(FORBIDDEN_WORDS);
	if (word) throw new Error(`${where} contains "${word[0]}", which would tell the agent it is being measured.`);
	assertNoNames(text, forbiddenNames, where);
}

export function assertNoNames(text: string, names: readonly string[], where: string): void {
	const lower = text.toLowerCase();
	const name = names.find((n) => lower.includes(n.toLowerCase()));
	if (name) throw new Error(`${where} names "${name}", a library under study.`);
}
