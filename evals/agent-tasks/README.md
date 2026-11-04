# Agent tasks

This harness asks whether a coding agent builds better screens with Cynco UI than with shadcn/ui, Kumo or
Fluid Functionalism. It scaffolds one identical Vite app per library, runs a headless Claude Code agent on the
same task prompts in each, scores every result with neutral automated checks and a blind screenshot judge, and
writes a report.

## Run it

```bash
pnpm install
pnpm --filter @cynco-labs/evals browsers      # once: downloads Playwright's Chromium

# Everything, 3 trials, the maintainer's agent wrapper:
AGENT_CMD="acc launch claude --" pnpm eval all --run 2026-11-a --trials 3

# One stage at a time, or a subset:
pnpm eval scaffold --run smoke --libs cynco,shadcn --tasks invoices-list
pnpm eval agent    --run smoke --libs cynco,shadcn --tasks invoices-list
pnpm eval score    --run smoke --libs cynco,shadcn --tasks invoices-list
pnpm eval judge    --run smoke --libs cynco,shadcn --tasks invoices-list
pnpm eval report   --run smoke --libs cynco,shadcn --tasks invoices-list
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--run <id>` | required | Names the run. Output goes to `evals/agent-tasks/runs/<id>/`. |
| `--libs` | all four | `cynco,shadcn,kumo,fluid` |
| `--tasks` | all six | IDs from `src/tasks.ts` |
| `--trials` | 1 | Agent runs per task and library |
| `--model` | `sonnet` | Model for the building agent |
| `--judge-model` | `opus` | Model for the screenshot judge |
| `--budget` | 5 | `--max-budget-usd` for each agent and judge call |
| `--timeout-min` | 25 | Wall-clock limit for each agent and judge call |
| `--concurrency` | 2 | Agent, score and judge calls in flight |
| `--cynco` | `local` | `local` builds and packs `packages/ui`; `npm` installs the published package |
| `--work-root` | `$TMPDIR/projects` | Where the apps live, outside this repo |
| `--force` | off | Redo stages whose output already exists |
| `--keep-workspaces` | off | Keep each app after scoring instead of deleting it |

`build` (and `all`, which is `build`, `judge`, `report`) scores each app as soon as its agent finishes, copies the agent's `src/` and `package.json` into the cell's
folder, and deletes the app, so at most `--concurrency` apps sit on disk. Each base is a full `npm install`, and
agents install more, so a run that keeps every app needs tens of GB. `clean --run <id>` deletes a run's apps and
bases after saving their source; a cell whose agent finished but was never scored is reset so the agent reruns.

`AGENT_CMD` is split on spaces and defaults to `claude`. `--cynco` and `--work-root` are fixed when a run is
created; later stages reuse them.

Every stage skips work whose output exists, so rerunning the same command resumes an interrupted run. An agent
run that did not finish leaves no `agent.json`, and the next attempt starts it again from a clean copy of the
base. A new agent run deletes that cell's score and its task's judge result, so nothing downstream goes stale.

## Stages and files

1. **scaffold** builds one base app per library from `template/`, runs the library's setup from
   `src/libraries.ts`, writes a one-line `CLAUDE.md`, then proves the base works: a throwaway copy gets one
   library button, must build, and must render in Chromium. A base that fails stops the run before any agent
   budget is spent. Each (task, trial) then gets an APFS copy-on-write clone (`cp -cR`) of its base.
   Writes `bases/<lib>/base.json` (path, installed versions, skill hashes, the exact setup commands, the probe
   score), `bases/<lib>/probe-shots/`, and `<task>/<lib>/<trial>/workspace.json`.
2. **agent** runs `$AGENT_CMD -p <prompt> --model <model> --setting-sources project --strict-mcp-config
   --permission-mode bypassPermissions --output-format stream-json --verbose --no-session-persistence
   --max-budget-usd <budget>` in the workspace. Writes `agent.jsonl` (raw stream), `agent.json`, and
   `agent.stderr.log` when stderr is not empty.
3. **score** runs `npm run typecheck` and `npm run build`, then serves `dist` with `vite preview` and drives
   Chromium. Writes `score.json` and `shots/375.png`, `shots/1280.png` (full page).
4. **judge** copies each library's two screenshots for a (task, trial) into a neutral directory under shuffled
   letters A to D, asks the judge model to rate them, and maps the letters back. The order is seeded by run,
   task and trial, so a rerun shows the same order. Writes `<task>/judge-<trial>.json` (letter mapping and
   scores) and `judge-<trial>.raw.json`.
5. **report** writes `report.md` and `results.json` for the run.

Workspace directories are named like `northwind-app-x7k2`, derived from a hash of the run and cell, so nothing
in the path tells the agent what it is part of.

## What each metric means

**Agent.** `costUsd`, `turns` and `durationMs` come from the CLI's result message. `inputTokens` is the total
prompt tokens including cache reads and writes; `outputTokens` is generated tokens. `toolCalls` counts every
`tool_use` by name, subagents included. `docLookups` counts WebFetch and WebSearch calls, calls to the library's own skill (not Claude Code's built-in skills), Bash calls to
the library's docs CLI (`cynco-ui search|docs`, `kumo doc|ls|ai`, `shadcn docs|search|view|info`), and Reads
under `.claude/skills/` or the library's package in `node_modules`. When the agent times out or crashes before
its result message, `costUsd` is null and the other figures are summed from the stream.

**Build.** `typeErrors` counts `error TS` lines from `tsc --noEmit`. `ok` is whether `vite build` exits 0.
Vite does not typecheck, so a build can pass with type errors.

**Browser** (only when the build passed):
- `rendered`: the page shows visible text (`innerText`) after load.
- `consoleErrors`: console errors and uncaught page errors from load through every check.
- `axe`: violating nodes per impact level, from axe-core at 1280px.
- `overflow`: `scrollWidth > clientWidth` on the document at 320, 375, 768 and 1280px.
- `focusVisible`: the probe records every focusable element's outline, box-shadow, border and background before
  anything has focus, then presses Tab up to 30 times. `checked` is the stops it could compare; `visible` is
  the stops where the element or its parent looked different focused.

**Source.** The scan covers `src/**/*.tsx` that the agent wrote or changed. It skips files identical to the
base and the directories the library's CLI writes into (`src/components/ui`, `src/lib` and `src/hooks` for
shadcn and Fluid).
- `rawInteractive`: `<button`, `<input`, `<select`, `<textarea`, `<dialog`, `<table` written by hand.
- `libraryImports`: distinct names imported from the library.
- `offSystemStyles`: hex, `rgb()`, `hsl()` and `oklch()` literals, Tailwind palette colour classes
  (`bg-blue-500`, `text-white`), and arbitrary values for size, spacing, radius or colour (`text-[13px]`,
  `w-[600px]`).

These checks are deliberately library-neutral. The harness never runs Cynco's own rule checker.

**Judge.** Each screen gets 1 to 10 for `fulfils` (does what was asked), `hierarchy`, `polish` and `mobile`,
plus short notes. The overall figure in the report is the mean of the four. A library whose app did not build
has no screenshots and gets 1 on every criterion, marked `judged: false`: to a user, a broken build and a blank
page are the same outcome.

The report gives pass rates and mean / median [min, max] per library, with the generic and accounting tasks in
separate sections, then a per-task table. With a few trials per cell, read the spread before the centre.

## Fairness choices

- **Same base.** Every arm starts from the same Vite + React 19 + TypeScript + Tailwind v4 app with an `@/*`
  alias, using npm so a base can be cloned with its `node_modules`.
- **The harness does setup.** Each library is installed the way its own docs say, so setup skill is not part
  of what is measured. The agent never installs the library.
- **Base UI on every arm.** shadcn and Fluid use their Base UI flavour; Cynco and Kumo are built on Base UI.
- **shadcn's own defaults.** `shadcn init` now adds `button.tsx`; the base keeps it, as a user's project would.
  No other components are pre-added, for shadcn or Fluid.
- **Each library's official agent guidance.** Cynco gets `npx cynco-ui skill`, shadcn gets its skill from
  `shadcn/ui`, Fluid gets `fluid-functionalism`. Kumo ships no skill; its agent docs are `llms.txt` and the
  `kumo` CLI, which the agent can reach. No arm has an MCP server.
- **Same project instructions.** Each arm's `CLAUDE.md` is one line naming its library and docs URL.
  `--setting-sources project` keeps the operator's own `CLAUDE.md`, plugins and skills out.
  Claude Code's built-in skills stay available to every arm, and agents do call them (`artifact-design`, `run`),
  so they shape every arm equally.
- **Blinding.** At startup the harness refuses any task prompt that names a library or says eval, test, judge,
  benchmark, score, compare, candidate or arena, and refuses an arm's `CLAUDE.md` that names another library.
  Third-party skills are installed unedited, so Fluid's skill mentions shadcn, which it is built on.
- **The judge.** The judge sees letters, never library names, and the same model judges every arm. It is a
  Claude model like the agent, so any family bias is shared by all arms. Screenshots can still reveal a
  library's visual signature to a judge that knows it.
- **Accounting tasks.** The two accounting tasks are Cynco's home market, so the report keeps them separate
  from the four generic tasks.

## Risks and cost

`--permission-mode bypassPermissions` lets the agent run any command as you, without asking, with your network
and your credentials. The workspaces live in a temp directory outside this repo, but nothing stops a command
from reaching beyond it. Run this on a machine and account you are willing to expose that way.

The ceiling is `tasks × libraries × trials × budget` for agents plus `tasks × trials × budget` for the judge.
All six tasks, four libraries and three trials at the default `--budget 5` can spend up to $360 on agents and
$90 on judging. The cap is a ceiling, not an estimate: start with one task and one trial to see real costs in
`report.md`.
