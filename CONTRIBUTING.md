# Contributing to dimems

Thanks for your interest in contributing! `dimems` is a local AI-integrated
digital memory system with a three-layer architecture (short-term, episodic,
long-term). This guide walks you through getting a working dev environment,
the expected quality bar, and how to propose changes.

## Prerequisites

- **Node.js** matching the version in [`.nvmrc`](./.nvmrc) (currently `22`).
  If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use`.
- **npm** (ships with Node).
- A clone of this repo.

## Setup

```bash
git clone https://github.com/kode7/dimems.git
cd dimems
nvm use            # optional, picks the right Node
npm install
cp config.example.yml config.yml  # adjust to point at your vault
```

## Common scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the MCP server in watch mode (`tsx src/index.ts`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run the [vitest](https://vitest.dev) suite |
| `npm run test:coverage` | Tests + coverage report |
| `npm run lint` | ESLint over `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI-friendly) |

Before opening a PR, please run at minimum:

```bash
npm run lint
npm run typecheck
npm test
```

## Pull-request flow

1. **Fork & branch.** Create a topic branch off `main`. Use a short,
   descriptive name, e.g. `feat/episodic-rollup` or `fix/watcher-race`.
2. **Keep PRs focused.** One logical change per PR. Smaller PRs get reviewed
   faster.
3. **Write a clear description.** What changed, why, and how to verify.
   Link related issues or tasks (e.g. `Closes #42` or `Closes TASK-7`).
4. **Tests.** New behavior needs at least one test. Bug fixes should include
   a regression test.
5. **Docs.** Update `README.md` or files under `docs/` if you changed
   user-visible behavior.
6. **Conventional commits** are appreciated (`feat:`, `fix:`, `chore:`,
   `docs:`, `refactor:`, `test:`).

## Reporting issues

Open a GitHub issue with:

- A short, descriptive title.
- Steps to reproduce (minimal example preferred).
- Expected vs actual behavior.
- Your Node version (`node --version`) and OS.

## License

By contributing, you agree that your contributions will be licensed under the
project's [MIT License](./LICENSE).
