# Stellar Contract Conformance Dashboard

A static dashboard for exploring deterministic smart contract conformance test results from the Stellar ecosystem.

**Live dashboard:** https://stellar-conformance-lab.github.io/contract-conformance-dashboard/

**Conformance engine:** https://github.com/stellar-conformance-lab/contract-conformance

## Overview

The dashboard is the frontend presentation layer for the `contract-conformance` engine. It displays published conformance reports and historical runs, helping users inspect test outcomes without running the conformance engine locally.

This repository does **not** execute smart contracts, interact with RPCs, or run conformance tests. The engine is the authoritative source of conformance results.

## Features

* **Summary Metrics:** Overall pass/fail status and breakdown of passed, failed, errored, and skipped scenarios.
* **Historical Run Selector:** Seamlessly switch between the latest report and previous runs from historical manifest data.
* **Comparative Run Diff Mode:** Compare any active run against a baseline historical run to inspect metric deltas, fixed tests, and regressed assertions.
* **Scenario Search & Filtering:** Filter results by status, view diff-only scenarios, or search by test ID and description.
* **Report JSON Export:** One-click download of the complete structured report JSON for external analysis.
* **Resilient Data Ingestion:** Schema validation, duplicate ID rejection, path traversal protection, and network timeout guards.
* **Automated CI Quality Gates:** Pull request and push workflows ensuring continuous linting, unit testing, and static export verification.

## Architecture

The data flow is:

1. The conformance engine executes the tests.
2. The engine publishes JSON report artifacts, including the latest report and historical-run data.
3. The dashboard fetches and validates the published JSON.
4. The interface presents the results, enables historical comparison, and allows users to inspect individual scenarios.

The dashboard remains a static frontend; it does not require its own backend, database, or authentication service.

## Running Locally

Requirements: Node.js (v20+ recommended) and npm.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Verification & Testing

Run unit tests:

```bash
npm test
```

Run ESLint:

```bash
npm run lint
```

Run the production static export build:

```bash
npm run build
```

## Continuous Integration & Deployment

The repository uses GitHub Actions for continuous quality assurance and deployment:

* **CI Workflow (`ci.yml`):** Runs `npm ci`, unit tests (`vitest`), linter (`eslint`), and static build on all pull requests and pushes to `main`.
* **Deploy Workflow (`deploy.yml`):** Automatically builds and publishes the static export to GitHub Pages on merges to `main`.

Live site: https://stellar-conformance-lab.github.io/contract-conformance-dashboard/

## Contributor Backlog & Future Work

As part of the ongoing maintainer initiatives and community grants, open contributor tracks include:

* **End-to-End Testing:** Add automated Playwright / Cypress browser test suites for regression testing interactive features.
* **Embeddable Conformance Badges:** Create an SVG badge generator displaying live SEP-41 conformance pass rates in consumer contract READMEs.
* **Accessibility Enhancements:** Complete a comprehensive WCAG 2.1 AA screen-reader audit.
* **Multi-Standard Support:** Interface tabs for visualizing additional profiles (e.g. SEP-42) as the conformance engine expands.

Contributions should preserve the separation between the conformance engine, which owns test execution and authoritative results, and this dashboard, which consumes and presents published reports.
