---
title: CLI
description: Browse Cynco UI components and read their docs from the terminal.
---

The package ships a small command-line tool, `cynco-ui`, that reads the component registry bundled with the package. It is useful for finding the right component without leaving your editor, and for giving coding agents the exact usage of a component.

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

Prints the same Markdown as [the component's page](/components/tax-invoice-document.md): the summary, the import line, a complete usage example, when to use it, its props and notes.

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
