# Known Debt

Entries are tracked in order of acceptance. Open debt has no resolution date; closed debt records the resolution.

---

## DEBT-001 — Missing harness layers (all layers)

**Opened:** 2026-05-09 (onboarding)  
**Resolved:** 2026-05-09 (wire-harness)

At onboarding, all six harness layers (Spotless, Checkstyle, SpotBugs, JaCoCo, PIT, OWASP Dependency Check) were absent from `sdd-api/pom.xml`. Flyway was also not wired.

**Resolution:** `/wire-harness` added all layers and Flyway to `sdd-api/pom.xml`. Migration tool decision recorded in ADR-001. SpotBugs deferred (DEBT-005, ADR-002) and JaCoCo warnings accepted (DEBT-006, ADR-003) due to Java 25 ASM incompatibility.

---

## DEBT-002 — Testcontainers not wired

**Opened:** 2026-05-09 (wire-harness)  
**Status:** OPEN

Testcontainers is not yet added to the project. The existing `SddApplicationTests` relies on `spring-boot-docker-compose` to start MySQL, which ties integration-style tests to Docker Compose rather than isolated containers. Integration tests (`*IT.java`) should use Testcontainers with a pinned MySQL image for deterministic, isolated execution.

**Trigger to resolve:** When the first `*IT.java` integration test is written (typically in the first `/build` task that creates a JPA entity). Add `spring-boot-testcontainers` + `testcontainers-mysql` to test scope and create a `TestcontainersConfiguration` class.

---

## DEBT-003 — ArchUnit rules not yet defined

**Opened:** 2026-05-09 (wire-harness)  
**Status:** OPEN

No ArchUnit layer-boundary rules exist. Layer structure cannot be enforced until layers (controller, service, repository) are established.

**Trigger to resolve:** After the first two or three features are built — when the package structure is stable enough to encode as invariants. Run `/build arch-rules` or add ArchUnit rules during a `/plan` phase.

---

## DEBT-004 — No OpenAPI contract

**Opened:** 2026-05-09 (wire-harness)  
**Status:** OPEN

SpringDoc is not wired and no OpenAPI spec file exists. The contract-first workflow cannot be used until an `openapi.yaml` is authored.

**Trigger to resolve:** Before writing the first HTTP endpoint. Follow the `openapi-contract-first` skill: author the spec in `/spec`, generate types in `/build`.

---

## DEBT-005 — SpotBugs deferred (Java 25 / JDK class file incompatibility)

**Opened:** 2026-05-09 (wire-harness)  
**Status:** OPEN  
**ADR:** ADR-002

SpotBugs 4.9.x uses ASM which cannot parse class file major version 70 (Java 26 EA classes embedded in JDK 25). SpotBugs crashes before it can analyze any code. It is configured in the `spotbugs` opt-in Maven profile (`mvn -Pspotbugs verify`) but is not in the default lifecycle.

**Trigger to resolve:** A SpotBugs version is released on Maven Central that ships with ASM 9.9+ (Java 25 class file support). Re-enable by moving the SpotBugs plugin back into `<build><plugins>` and closing this entry.

---

## DEBT-006 — JaCoCo instrumentation warnings (Java 25 class files)

**Opened:** 2026-05-09 (wire-harness)  
**Status:** OPEN  
**ADR:** ADR-003

JaCoCo 0.8.13 (latest) cannot instrument Java 25 class files (version 69) or JDK internal Java 26 EA classes (version 70). The build is green because the only production class (`SddApplication`) is excluded from coverage rules and the BUNDLE check finds 0 instructions (passes with undefined ratio). Once production code is added, coverage will be 0% and the check will fail, forcing the upgrade.

**Trigger to resolve:** JaCoCo 0.8.14+ is published with Java 25 support. Upgrade `<jacoco.version>` in `sdd-api/pom.xml`.

---

## DEBT-007 — PIT mutation testing incompatible with Java 25

**Opened:** 2026-05-09 (wire-harness)  
**Status:** OPEN

PIT 1.17.0 uses ASM which cannot instrument Java 25 class files (`Unsupported class file major version 69`). Running `mvn -Ppit pitest:mutationCoverage` fails. PIT is already in an opt-in profile so the default `mvn verify` build is not affected. `<failWhenNoMutations>false</failWhenNoMutations>` is set so it exits cleanly when there is no code to mutate.

**Trigger to resolve:** PIT 1.18+ is published with Java 25 class file support. Test by running `mvn -Ppit pitest:mutationCoverage` — it should produce a mutations report, not an ASM version error.
