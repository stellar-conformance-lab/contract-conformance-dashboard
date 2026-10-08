# Contract Conformance Dashboard — Roadmap

## Project

**Organization:** `stellar-conformance-lab`
**Repository:** `contract-conformance-dashboard`

## Purpose

The Contract Conformance Dashboard is a separate user-facing frontend for visualizing conformance results produced by the authoritative:

`stellar-conformance-lab/contract-conformance`

repository.

The dashboard does **not** own conformance logic.

The existing `contract-conformance` repository remains authoritative for:

* conformance standards
* conformance engine
* test scenarios
* fixtures
* validation logic
* CLI
* report generation
* conformance correctness

The dashboard is responsible for:

* presentation
* visualization
* report ingestion
* filtering
* developer-facing UX
* historical result presentation where supported

---

# Project Principles

The project follows these principles:

1. **The conformance engine remains authoritative.**
2. **The dashboard must not duplicate conformance logic.**
3. **The dashboard must not execute arbitrary smart contracts.**
4. **Frontend development should initially use mocked report data.**
5. **Integration should consume structured machine-readable reports rather than parse terminal output.**
6. **The dashboard and conformance engine remain independently deployable.**
7. **Do not introduce infrastructure before it is actually required.**
8. **Prefer deterministic, simple, maintainable architecture.**
9. **Do not implement speculative features simply to increase scope.**
10. **Future conformance profiles should integrate through the same report abstraction where practical.**

---

# Roadmap Status

| Phase | Name                             | Status         |
| ----- | -------------------------------- | -------------- |
| D0    | Discovery & Integration Audit    | ✅ Complete     |
| D1    | Repository & UI Foundation       | 🔄 In Progress |
| D2    | Dashboard MVP & UX               | ⏳ Pending      |
| D3    | Report/Data Architecture         | ⏳ Pending      |
| D4    | Real JSON Report Integration     | ⏳ Pending      |
| D5    | GitHub / CI Artifact Integration | ⏳ Pending      |
| D6    | Historical Runs & Reporting      | ⏳ Pending      |
| D7    | Production Hardening             | ⏳ Pending      |
| D8    | Deployment & Public Release      | ⏳ Pending      |
| D9    | Post-Release Maintenance         | ⏳ Pending      |

---

# Phase D0 — Discovery & Integration Audit

## Status

**Complete**

## Objective

Determine how the separate dashboard can consume results from the existing `contract-conformance` project without coupling the dashboard to the conformance engine.

## Findings

The audit established that:

* a separate dashboard repository is technically feasible
* `contract-conformance` already has structured report data
* `ConformanceReport`, `Summary`, and `ScenarioResult` contain the core information required by the dashboard
* the current CLI primarily exposes human-readable output
* the existing report model supports JSON serialization
* the current GitHub Action does not yet publish a dashboard-consumable report artifact
* execution metadata such as timestamp, duration, network, and contract identity is not currently part of the report model
* server-side arbitrary contract execution would introduce unnecessary security and infrastructure risk

## Architectural Decision

The preferred long-term architecture is:

```text
contract-conformance
        │
        │ structured JSON report
        ▼
GitHub Actions / CI
        │
        │ artifact
        ▼
contract-conformance-dashboard
```

The dashboard should consume passive report data rather than execute smart contracts itself.

---

# Phase D1 — Repository & UI Foundation

## Status

**In Progress**

## Objective

Create the independent dashboard repository and establish the initial frontend architecture.

## Scope

* initialize the dashboard repository
* establish frontend framework
* establish TypeScript configuration
* establish styling system
* establish basic project structure
* create typed conformance report models
* create realistic mocked conformance data
* create initial dashboard
* create initial test-results view
* create basic filtering
* create test-detail experience
* create project README
* validate the application locally

## Initial Stack

The recommended stack is:

* Next.js
* TypeScript
* Tailwind CSS

The implementation should remain simple and avoid unnecessary infrastructure.

## Data Source

D1 uses mocked data only.

The mock data should model the existing report concepts:

```text
ConformanceReport
├── profile
├── fixture
├── status
├── summary
└── results[]
```

```text
Summary
├── total
├── passed
├── failed
├── errors
└── skipped
```

```text
ScenarioResult
├── test_id
├── description
├── status
├── expected
└── observed
```

The UI must not hard-code summary values independently of the report.

## Explicitly Out of Scope

D1 must not implement:

* backend
* database
* authentication
* contract execution
* RPC integration
* wallet integration
* contract uploads
* live API
* GitHub API integration
* GitHub artifact ingestion
* production deployment

---

# Phase D2 — Dashboard MVP & UX

## Status

**Pending**

## Objective

Turn the initial frontend into a polished and useful conformance dashboard using mocked report data.

## Dashboard

Provide:

* overall conformance status
* total tests
* passed tests
* failed tests
* errors
* skipped tests
* active profile
* clear visual hierarchy

## Test Results

Provide:

* test ID
* description
* status
* expected behavior
* observed behavior

## Filtering

Support filtering by:

* All
* Passed
* Failed
* Errors
* Skipped

Where useful, add:

* search
* sorting

Do not introduce unnecessary complexity.

## Test Details

Users should be able to inspect an individual test result.

The detail experience should clearly communicate:

```text
Test ID
Description
Status
Expected behavior
Observed behavior
```

## UX Quality

Ensure:

* responsive design
* accessible controls
* status is not communicated through color alone
* useful empty states
* useful error states
* clean navigation
* minimal visual clutter

The dashboard should feel like a developer/conformance tool rather than a generic administrative dashboard.

---

# Phase D3 — Report & Data Architecture

## Status

**Pending**

## Objective

Establish a clean boundary between the dashboard UI and its report source.

The intended architecture is:

```text
Report Source
      │
      ▼
Report Loader
      │
      ▼
Typed ConformanceReport
      │
      ▼
Dashboard UI
```

The UI should not know whether the report originated from:

* mock data
* local JSON
* GitHub Actions
* another supported artifact source

## Requirements

Define and validate the dashboard's internal report abstraction.

The report model should remain compatible with the authoritative `contract-conformance` report model.

Avoid duplicating conformance logic.

## Goal

Replacing:

```text
mock.json
```

with:

```text
real conformance report
```

should require minimal UI changes.

---

# Phase D4 — Real JSON Report Integration

## Status

**Pending**

## Objective

Enable the existing `contract-conformance` project to produce a stable machine-readable report that the dashboard can consume.

This phase requires changes to the authoritative repository and therefore must be treated separately from frontend work.

## Potential Scope

Investigate and, if validated:

* CLI JSON output
* stable report serialization
* documented JSON schema
* report versioning
* machine-readable error handling

Potential CLI usage:

```bash
stellar-conform test --profile sep-41 --output json
```

This is an example target, not a commitment to a specific CLI interface.

## Important Constraints

Do not alter conformance behavior.

Do not change the authoritative test logic merely to support the dashboard.

The JSON report should represent the same conformance result produced by the existing engine.

## Metadata

Potential future metadata includes:

* timestamp
* execution duration
* contract identifier
* network
* runner/environment information

Only add metadata when its semantics are clearly defined and useful.

---

# Phase D5 — GitHub / CI Artifact Integration

## Status

**Pending**

## Objective

Connect real conformance reports to the dashboard through CI-generated artifacts.

Target architecture:

```text
contract-conformance
        │
        ▼
GitHub Action
        │
        ▼
JSON report
        │
        ▼
Artifact
        │
        ▼
Dashboard
```

## Potential Scope

* generate JSON report in CI
* validate report structure
* publish report artifact
* establish dashboard artifact ingestion
* handle unavailable or malformed reports
* document the integration

## Security Principle

The dashboard should consume passive reports.

It should not become a server that executes arbitrary Soroban contracts.

---

# Phase D6 — Historical Runs & Reporting

## Status

**Pending**

## Objective

Provide useful historical visibility once reliable real reports are available.

Potential features:

* previous conformance runs
* run timestamps
* pass/fail history
* profile history
* regression visibility
* run comparison
* trend visualization
* execution duration trends

## Constraint

Do not introduce a database unless the actual integration requirements justify one.

Static or artifact-based history should be preferred when practical.

---

# Phase D7 — Production Hardening

## Status

**Pending**

## Objective

Prepare the dashboard for reliable public use.

## Areas

### Security

* dependency auditing
* artifact validation
* safe data handling
* no arbitrary contract execution
* no unnecessary secrets
* appropriate access controls if private functionality is ever introduced

### Reliability

* error handling
* invalid report handling
* unavailable artifact handling
* loading states
* fallback states

### Performance

* efficient rendering
* appropriate caching
* optimized assets
* reasonable bundle size

### Accessibility

* keyboard navigation
* semantic markup
* readable contrast
* screen-reader support
* non-color-only status indicators

### Quality

* automated tests
* linting
* type checking
* production builds
* CI validation

---

# Phase D8 — Deployment & Public Release

## Status

**Pending**

## Objective

Deploy the dashboard and prepare it for public use.

Potential scope:

* production hosting
* deployment pipeline
* custom domain if appropriate
* documentation
* screenshots
* architecture documentation
* contribution guidelines
* release version
* public launch

Target relationship:

```text
stellar-conformance-lab
│
├── contract-conformance
│
└── contract-conformance-dashboard
              │
              ▼
       Public Dashboard
```

The dashboard release should remain independently versioned from the conformance engine.

---

# Phase D9 — Post-Release Maintenance

## Status

**Pending**

After release, development should be driven by actual requirements rather than feature accumulation.

Valid reasons for future work include:

* bugs
* security issues
* accessibility issues
* performance problems
* CI integration problems
* report-format evolution
* new conformance profiles
* meaningful developer feedback
* concrete ecosystem requirements

Avoid speculative features.

---

# Future Conformance Profiles

The dashboard should be designed so that SEP-41 is not permanently hard-coded as the only possible profile.

The conceptual model should support:

```text
Profiles
├── SEP-41
├── Future Profile
└── Future Profile
```

However:

**Do not implement unsupported profiles merely to demonstrate extensibility.**

The dashboard should only display profiles for which authoritative conformance reports exist.

---

# Security Boundary

The following boundary is intentional:

```text
┌─────────────────────────────────────┐
│ contract-conformance               │
│                                     │
│ Authoritative execution             │
│ Rust conformance engine             │
│ Fixtures                            │
│ Contract interaction                │
└──────────────────┬──────────────────┘
                   │
                   │ JSON report
                   ▼
┌─────────────────────────────────────┐
│ contract-conformance-dashboard      │
│                                     │
│ Presentation                        │
│ Visualization                       │
│ Filtering                           │
│ Report ingestion                    │
└─────────────────────────────────────┘
```

The dashboard must not become an arbitrary smart-contract execution service.

---

# Current Strategic Direction

The project should progress in this order:

```text
D0
 │
 ▼
D1
 │
 ▼
D2
 │
 ▼
D3
 │
 ▼
D4
 │
 ▼
D5
 │
 ▼
D6
 │
 ▼
D7
 │
 ▼
D8
 │
 ▼
D9
```

Each phase should be completed and reviewed before beginning the next.

Do not skip architectural validation simply because a later feature appears easy to implement.

---

# Definition of Success

The project is successful when a developer can:

1. Open the dashboard.
2. Select or view a supported conformance profile.
3. Understand the overall conformance result.
4. Inspect individual test results.
5. Understand expected versus observed behavior.
6. Filter and navigate results easily.
7. Trust that the dashboard is displaying results produced by the authoritative `contract-conformance` engine.
8. View historical results when reliable history is supported.
9. Never need to execute an arbitrary smart contract through the dashboard itself.

The dashboard is a **visualization and developer-experience layer**, not a replacement for the conformance engine.
