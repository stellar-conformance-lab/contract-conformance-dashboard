# Stellar Contract Conformance Dashboard

This is the frontend presentation layer for the `stellar-conformance-lab/contract-conformance` engine.

## Purpose

The dashboard visualizes deterministic behavioral conformance test results (such as SEP-41 conformance).

This repository is **exclusively a frontend UI**. It does NOT execute smart contracts, interact with RPCs, or run conformance logic. All authoritative conformance testing happens inside the `contract-conformance` execution engine.

## Current Status (D1 - Foundation)

The dashboard is currently in its initial foundation phase and uses **mocked JSON data** (`src/data/mockReport.ts`) modeled directly after the `ConformanceReport` output of the `contract-conformance` v0.1.0 engine.

### Capabilities
- Visual overview of the SEP-41 profile conformance status.
- Summary statistics (Passed, Failed, Errors, Skipped).
- Interactive, filterable test-result views.
- Detailed inspection of Expected vs. Observed behavior.

### Deferred Functionality
The following features are intentionally out of scope for the current foundation:
- Live JSON CLI integration
- GitHub artifact ingestion
- Backend API
- Contract uploads
- Live conformance execution
- Network/RPC integration
- Authentication or databases

## Running Locally

First, install the dependencies:

```bash
npm install
```

Then, start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
