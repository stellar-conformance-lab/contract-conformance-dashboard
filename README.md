# Stellar Contract Conformance Dashboard

A static dashboard for exploring deterministic smart contract conformance test results from the Stellar ecosystem.

**Live dashboard:** https://stellar-conformance-lab.github.io/contract-conformance-dashboard/

**Conformance engine:** https://github.com/stellar-conformance-lab/contract-conformance

## Overview

The dashboard is the frontend presentation layer for the `contract-conformance` engine. It displays published conformance reports and historical runs, helping users inspect test outcomes without running the conformance engine locally.

This repository does **not** execute smart contracts, interact with RPCs, or run conformance tests. The engine is the authoritative source of conformance results.

## Features

* Conformance summary statistics for passed, failed, errored, and skipped tests.
* Searchable and filterable test results.
* Detailed inspection of expected and observed behavior.
* Integration with published JSON reports.
* Historical run selection.
* Report validation and handling of unavailable or malformed data.
* Request timeouts and protection against stale responses.
* Static export and deployment through GitHub Pages.

## Architecture

The data flow is:

1. The conformance engine executes the tests.
2. The engine publishes JSON report artifacts, including the latest report and historical-run data.
3. The dashboard fetches and validates the published JSON.
4. The interface presents the results and allows users to inspect previous runs.

The dashboard remains a static frontend; it does not require its own backend, database, or authentication service.

## Running Locally

Requirements: Node.js and npm.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Verification

Run the production build:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Both commands passed during the latest local verification. The live dashboard was also checked for report loading, historical-run selection, search, filters, and interface states.

## Deployment

The dashboard is deployed to GitHub Pages using GitHub Actions. The workflow builds the Next.js application as a static export and publishes the generated output.

Live site: https://stellar-conformance-lab.github.io/contract-conformance-dashboard/

## Security and Known Limitations

* The production dependency audit reported zero vulnerabilities.
* The full dependency audit identified a high-severity vulnerability in the development-tooling dependency chain involving `braces`. A compatible fix was not available during the audit. This remains unresolved and should be revisited when a compatible upstream fix becomes available.
* Automated unit and end-to-end test coverage for report validation, request timeouts, historical selection, and request races remains a follow-up task.
* The dashboard displays published engine results; it does not independently establish the correctness of the engine's tests.

## Future Contributions

Potential follow-up work includes:

* Add automated tests for report-loader validation and failure handling.
* Add end-to-end tests for historical-run selection and asynchronous request races.
* Complete a keyboard-navigation and screen-reader accessibility audit.
* Add a comparison view for historical conformance runs.
* Revisit the development-tooling vulnerability when a compatible fix becomes available.

Contributions should preserve the separation between the conformance engine, which owns test execution and authoritative results, and this dashboard, which consumes and presents published reports.
