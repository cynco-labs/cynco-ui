---
title: CLI
description: Find Cynco UI components, read their docs, check your code against the rules and install the agent skill, from the terminal.
---

The package ships a small command-line tool, `cynco-ui`. It reads the component registry bundled with the package, so you can find the right component without leaving your editor and give coding agents the exact usage of a component. It also checks your code against Cynco UI's rules and installs the agent skill.

## Run it

```bash
npx cynco-ui --help
```

or, inside a project that depends on the package:

```bash
pnpm exec cynco-ui --help
```

The commands below cover the common tasks; `--help` lists everything the installed version supports.

## List components

```bash
npx cynco-ui list
```

Lists every component with its category and one-line summary. Filter by category:

```bash
npx cynco-ui list accounting
```

## Read a component's docs

```bash
npx cynco-ui docs tax-invoice-document
```

Prints the same Markdown as [the component's page](/components/tax-invoice-document.md): the summary, the import line, a complete usage example, when to use it, its props and notes. If the name is not found, it lists the closest components.

## Search

```bash
npx cynco-ui search bank reconciliation
```

Finds components by name, group, category and description. Each word is matched on its own, in any order, and "reconcile" also finds "reconciliation". Name matches come first. If no component matches every word, it lists the components that match the most words and says so.

## Check your code

```bash
npx cynco-ui check
```

Checks `src` (or the current directory if there is no `src`) against the rules the components themselves follow. Pass paths to check something else: `npx cynco-ui check app components`. It fails on:

- hex colours in class names, and Tailwind palette colours (`text-gray-500`): use the theme tokens
- arbitrary type sizes (`text-[13px]`): use the type scale
- important utilities (`!px-2`, `px-2!`)
- `transition-all`
- `@container` on a box that shrinks to its content (`w-fit`, `inline-flex`…), which collapses it to zero width
- `parseFloat` or `Number()` on an amount, total, price or balance, and `.toFixed(2)`: amounts are decimal strings

Each violation prints as `file:line:match [rule]`, followed by the reason for each rule that was hit. The command exits with status 1 if anything fails, so you can run it in CI or from an agent hook.

Viewport breakpoints (`md:`) are allowed, because a page layout is sized by the window. Inside a component, use the container variants (`@md:`) instead.

When a rule is wrong for one file, add an exception to `cynco-ui.allow` at the project root (or pass `--allow <file>`), one per line:

```text
src/emails/receipt.tsx:hex-colour  # email clients ignore CSS variables
```

The path is a file or a directory. The pattern is a rule id or the matched text. The reason after `#` is required, and an entry that no longer matches anything also fails the check.

## Install the agent skill

```bash
npx cynco-ui skill
```

Copies the skill that ships with the package to `.claude/skills/cynco-ui/SKILL.md`, where Claude Code loads skills from. To use another location, pass the skills directory: `npx cynco-ui skill .agents/skills`. Run it again after upgrading to bring the skill up to date. It replaces the file, so make local changes somewhere else.

## The registry

The CLI reads `@cynco-labs/ui/registry/components.json`, which you can also import directly:

```ts
import registry from "@cynco-labs/ui/registry/components.json";

const accounting = registry.filter((c) => c.category === "Accounting");
```

Each entry has `name`, `slug`, `category`, `group`, `summary`, `use`, `provide`, `notes`, `sourcePath`, `demoPath` and `importFrom`. The per-component Markdown lives in `registry/docs/<slug>.md` in the package.

## For LLMs and agents

This site publishes the same content for language models:

- [`/llms.txt`](/llms.txt): an index of every page with a one-line description.
- Every page has a Markdown version: add `.md` to the URL, for example [`/installation.md`](/installation.md) or [`/components/data-list.md`](/components/data-list.md).
