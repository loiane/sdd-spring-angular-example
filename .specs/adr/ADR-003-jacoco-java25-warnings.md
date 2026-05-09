# ADR-003 — JaCoCo Java 25 instrumentation warnings (accepted, non-fatal)

**Status:** accepted  
**Date:** 2026-05-09

---

## Context

JaCoCo 0.8.13 (the latest available version) uses ASM 9.7, which cannot instrument class files compiled to Java 25 (version 69) or the Java 26 EA preview classes embedded in JDK 25 (version 70). When the JaCoCo agent is attached during test execution, it logs `IllegalClassFormatException` warnings for uninstrumented classes but does not fail the build.

For the current greenfield state:
- The only production class is `SddApplication.java`, which is excluded from coverage rules (`**/*Application.class`).
- After exclusion, the JaCoCo BUNDLE rule finds 0 instructions — this does not fail the coverage check (undefined ratio passes the minimum threshold).
- The `mvn verify` build is green.

The risk is deferred: once production code is added (services, controllers, repositories), those classes will be compiled to Java 25 and JaCoCo will not be able to instrument them. Coverage tracking will be effectively zero for all production code until a compatible JaCoCo version is released.

## Decision drivers

- **Build must be green** — the current warnings are non-fatal.
- **Coverage gates are still in POM** — they will be enforced once JaCoCo can instrument Java 25 classes.
- **Minimum viable gate** — accepting non-zero warning noise is better than disabling JaCoCo entirely.

## Considered options

1. **Keep JaCoCo as-is, accept warnings** — build succeeds; gates are defined but won't enforce until a compatible version is available. Chosen.
2. **Remove JaCoCo entirely** — loses the configuration and the enforcement intent. Rejected.
3. **Defer JaCoCo to opt-in profile** — would mean no coverage reporting even for classes JaCoCo can handle (none currently, but in future mixed scenarios). Rejected.

## Decision outcome

**Chosen: keep JaCoCo at 0.8.13 in the default build; accept Java 25 instrumentation warnings.**

Coverage thresholds (90% line, 90% branch) remain configured and will enforce as soon as JaCoCo gains Java 25 support. When actual production code is added, if coverage is 0% (due to instrumentation failure), the build will fail and prompt the upgrade to a compatible JaCoCo version.

## Consequences

**Positive:**
- Build is green today.
- Coverage infrastructure is in place with correct thresholds.
- First failing build after adding production code will be the trigger to upgrade JaCoCo.

**Negative:**
- No meaningful coverage data until JaCoCo supports Java 25.
- Warnings in build output may hide other issues.

## Links

- `DEBT-006` in `.specs/_known-debt.md`
- [JaCoCo GitHub](https://github.com/jacoco/jacoco) — track releases with Java 25 / ASM 9.9+ support
- Related: `ADR-002` (SpotBugs deferral)

## Trigger to revisit

- JaCoCo 0.8.14+ is published on Maven Central with Java 25 class file support.
- Verify by running `mvn verify` and confirming no `Unsupported class file major version` warnings in JaCoCo output.
- At that point, upgrade `<jacoco.version>` in `pom.xml` properties and close DEBT-006.
