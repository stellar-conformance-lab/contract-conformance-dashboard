# D7.1 - Security Audit

**Project:** Stellar Conformance Dashboard
**Phase:** D7 - Production Hardening
**Status:** Audit complete; remediation pending
**Last audited:** 2026-10-09

## 1. Scope

Reviewed npm dependency vulnerabilities, production dependency exposure, ESLint configuration, report-data handling, and the risk of breaking changes during remediation.

## 2. Dependency Audit Results

| Check                      | Result                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| `npm audit --omit=dev`     | 0 vulnerabilities                                                     |
| `npm audit`                | 5 high-severity findings                                              |
| Affected direct dependency | `eslint-config-next@16.4.0`                                           |
| Affected dependency chain  | `@next/eslint-plugin-next` -> `fast-glob` -> `micromatch` -> `braces` |
| Vulnerable package version | `braces@3.0.3`                                                        |
| Advisory                   | GHSA-vfj7-8cjw-p6xm                                                   |
| Automatic fix              | Requires a breaking downgrade to `eslint-config-next@14.2.35`         |

The five findings represent one underlying vulnerability propagated through the dependency tree, not five independent vulnerabilities.

## 3. Finding: Vulnerable `braces` Dependency

**Severity:** High
**Category:** Denial of service (CWE-674)
**Affected component:** Development and linting toolchain

The advisory describes stack exhaustion caused by deeply nested brace patterns, potentially terminating a Node.js process.

The affected package is reached through the Next.js ESLint tooling. The production-only npm audit reports zero vulnerabilities, so the current audit has not identified this package in the production dependency set.

Development dependencies still matter because they execute during development, linting, and CI.

## 4. Remediation Assessment

The npm audit recommends downgrading `eslint-config-next` to `14.2.35`. This is not an acceptable automatic fix because the application uses Next.js `16.4.0`, and the downgrade could introduce compatibility problems.

The configured ESLint rules import Next.js Core Web Vitals and TypeScript configurations. Removing the package without replacing these checks could reduce lint coverage.

The registry reports `braces@3.0.3` as the latest available version. No verified compatible patch has been established during this audit.

**Decision:** Do not run `npm audit fix --force`. Do not apply an unverified dependency override. Reassess when a compatible upstream fix or verified alternative becomes available.

## 5. Current Mitigations

* Keep production dependencies audited separately.
* Preserve the existing Next.js and ESLint configuration.
* Avoid processing untrusted brace-pattern input through vulnerable tooling.
* Keep CI dependency checks enabled and review new audit findings.
* Re-run the full audit after dependency updates.

These measures reduce avoidable disruption but do not eliminate the reported development-tooling vulnerability.

## 6. Remaining Security Checks

This dependency audit does not, by itself, establish that all dashboard security requirements are satisfied. Continue with:

* Report JSON schema and malformed-data validation.
* Safe rendering of externally supplied report fields.
* Verification that report loading cannot trigger arbitrary contract execution.
* Error handling for unavailable or invalid reports.
* Dependency review and CI enforcement.

## 7. Exit Status

**D7.1 - Partially complete.**

The audit and remediation assessment are documented. One high-severity development-tooling vulnerability remains unresolved. Revisit it when a compatible fix is available, and continue the remaining D7 hardening work without downgrading the Next.js toolchain.
