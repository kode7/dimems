# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] — 2026-05-27

### Added

- **Contributor onboarding (`CONTRIBUTING.md`)** — prerequisites, setup, the
  full script catalog, PR flow, and issue-reporting expectations
  ([#3](https://github.com/kode7/dimems/pull/3), TASK-3).
- **`.editorconfig`** at the repo root so EditorConfig-aware editors apply
  consistent indentation, line endings, and trailing-whitespace handling
  across `.ts` / `.js` / `.md` / `.yml` / `.json`
  ([#2](https://github.com/kode7/dimems/pull/2), TASK-2).
- **`.nvmrc`** pinned to Node `22` so `nvm use` selects the supported
  toolchain automatically
  ([#1](https://github.com/kode7/dimems/pull/1), TASK-1).

### Changed

- **`engines.node`** bumped from `>=18.0.0` to `>=22.0.0` to match `.nvmrc`
  and reflect the current active LTS line
  ([#1](https://github.com/kode7/dimems/pull/1), TASK-1).

### Notes

This is a quality-of-life release. No runtime behavior changed; the focus is
on giving new contributors a consistent local toolchain and a clear path to
opening PRs. See milestone **m-1 — v0.2.0 — Quality & Docs** in the backlog
for the full scope.

[Unreleased]: https://github.com/kode7/dimems/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/kode7/dimems/compare/v0.1.0...v0.2.0
