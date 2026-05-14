This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

<p align="center">
    Bootstrap to configure <strong>rules, skills, and hooks</strong> for multiple AI coding agents from a single source of truth.
</p>

## 🔗 Unified rules and skills via `.agents/`

Each AI agent reads instructions from a different path. Maintaining them separately is error-prone, so this project centralizes everything and uses **symlinks** so each agent reads from its expected path while the content lives in a single place:

1. **Rules** are written once in `AGENTS.md` (one per directory if needed).
2. **Skills** live in `.agents/skills/` and are shared across agents.
3. A `make` command generates the symlinks each agent expects:

| Command                 | What it does                                                                                                                      |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `make claude-symlinks`  | Creates a `CLAUDE.md → AGENTS.md` symlink in every directory that has an `AGENTS.md`, and links `.claude/skills → .agents/skills` |
| `make codex-symlinks`   | Links `.codex/skills → .agents/skills`                                                                                            |
| `make copilot-symlinks` | Links `.github/skills → .agents/skills`                                                                                           |
| `make cursor-symlinks`  | Links `.cursor/skills → .agents/skills`                                                                                           |
| `make junie-symlinks`   | Links `.junie/skills → .agents/skills`                                                                                            |


### Junie special case

Junie does not support `AGENTS.md`. Instead, `.junie/guidelines.md` instructs the agent to look for and follow any `AGENTS.md` file it encounters while navigating the project.

## 📃 `/create-doc` skill

A shared skill that generates convention documentation following the project's guidelines (see `docs/`). It helps improve the harness so future sessions get better context.

Two ways to use it:

- **After a conversation** — run `/create-doc` to turn the feedback the agent received during the session into a new doc.
- **Before a conversation** — run `/create-doc <description>` to create a doc for a convention you want to formalize upfront.

## 🛡️ `export` command blocked via hooks

The `export` command can leak environment variables (tokens, secrets) if an agent runs it. To prevent this, each agent has a **pre-execution hook** that blocks any shell command containing `export`:

| Agent       | Hook location                                        | Mechanism                                                                              |
|-------------|------------------------------------------------------|----------------------------------------------------------------------------------------|
| Claude Code | `.claude/settings.json`                              | Uses the `if` keyword with a glob pattern (`Bash(*export*)`) to match and block inline |
| Cursor      | `.cursor/hooks.json` + `hooks/block-export.sh`       | Runs a shell script that parses the command via `jq` and exits with code 2 on match    |
| Copilot     | `.github/hooks/hooks.json` + `hooks/block-export.sh` | Same approach as Cursor, adapted to Copilot's hook input format                        |


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
