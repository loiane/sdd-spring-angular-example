# ADR-002 — Defer SpotBugs (Java 25 / JDK class file incompatibility)

**Status:** accepted  
**Date:** 2026-05-09

---

## Context

`sdd-api` compiles to Java 25 (class file major version 69). The JDK 25 runtime also includes JDK-internal preview classes compiled to class file major version 70 (Java 26 EA). SpotBugs 4.9.4 uses the ASM bytecode library, which cannot parse class files beyond version 67 (Java 23). When SpotBugs attempts to build its reference-class set (scanning `java.lang.Object` and other JDK classes), it crashes with `IllegalArgumentException: Unsupported class file major version 70`, making it impossible to run at all on JDK 25.

There is no currently published SpotBugs version on Maven Central that supports JDK 25. The highest available version at time of writing is 4.9.4.0, which has the same limitation.

## Decision drivers

- **Build must be green** — wire-harness requires `mvn verify` to succeed from a clean checkout.
- **No workarounds** — per the harness skill, if a layer is incompatible with the JDK, it must be deferred rather than hacked around.
- **Preservation** — SpotBugs configuration must be retained (in an opt-in profile) so it can be re-enabled without re-wiring once a compatible version is released.

## Considered options

1. **Keep SpotBugs in the default verify path** — build would fail on every `mvn verify`. Rejected.
2. **Pin to an older SpotBugs version** — all 4.x versions use the same ASM version that fails on JDK 25. No viable pin exists.
3. **Defer to an opt-in `-Pspotbugs` profile** — SpotBugs remains configured and runnable on JDK 24 or when a compatible version is released. Chosen.
4. **Remove SpotBugs entirely** — loses the configuration, making re-enabling harder. Rejected.

## Decision outcome

**Chosen: defer SpotBugs to the `spotbugs` opt-in Maven profile.**

SpotBugs is configured with full settings (effort=Max, threshold=Low, FindSecBugs included) inside a `<profile id="spotbugs">` block. It is not part of the default `mvn verify` lifecycle. The `_known-debt.md` entry tracks this as DEBT-005 with a clear trigger.

Developers on JDK 24 or lower can run `mvn -Pspotbugs verify` to activate it manually. CI may also run it on a JDK 24 image as a secondary job if desired.

## Consequences

**Positive:**
- Default `mvn verify` succeeds on JDK 25.
- SpotBugs configuration is preserved and documented; re-enabling is a one-line POM change.

**Negative:**
- Static analysis for bugs and security vulnerabilities is not enforced on every commit until re-enabled.
- FindSecBugs security checks are inactive, reducing the security gate.

**Mitigation:** OWASP Dependency Check (in the `security` profile) still covers CVE scanning of dependencies. Application-level security bugs are partially mitigated by code review until SpotBugs is re-enabled.

## Links

- `DEBT-005` in `.specs/_known-debt.md`
- [SpotBugs GitHub issues](https://github.com/spotbugs/spotbugs/issues) — track ASM upgrades for Java 25/26 support
- Related: `ADR-003` (JaCoCo Java 25 instrumentation warnings, non-fatal)

## Trigger to revisit

- A SpotBugs version is published on Maven Central that ships ASM 9.9+ (Java 25 class file support).
- The project downgrades its Java version to 24 or lower.
- Verify by running `mvn -Pspotbugs verify` — if it completes without `Unsupported class file major version` errors, re-enable in the default build and close DEBT-005.
