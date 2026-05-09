# Starter Design Baseline

Captured by `/wire-harness` on 2026-05-09. Update this file when a `/plan` or ADR changes a convention.

---

## Module

| Key | Value |
|-----|-------|
| Maven module | `sdd-api/` |
| Group ID | `com.loiane` |
| Artifact ID | `sdd` |
| Base package | `com.loiane.sdd` |
| Java version | 25 |
| Spring Boot | 4.0.6 |

---

## Code style

| Tool | Config | Notes |
|------|--------|-------|
| Spotless | Google Java Format 1.27.0, `GOOGLE` style | Applied at `validate` phase via `spotless:check`; fix with `mvn spotless:apply` |
| Checkstyle | `sdd-api/checkstyle.xml` | Google-style structural rules: naming, braces, line length (100), no tabs |
| sortPom | Spotless built-in | POM element order enforced on every build |

---

## Test naming conventions

| Type | Naming | Runner | Phase |
|------|--------|--------|-------|
| Unit test | `*Test.java` | Surefire 3.5.2 | `test` |
| Integration test | `*IT.java` | Failsafe 3.5.2 | `integration-test` / `verify` |

Unit tests must not start the Spring context (use `@ExtendWith(MockitoExtension.class)` or `@WebMvcTest`).  
Integration tests use `@SpringBootTest` with Testcontainers (see DEBT-002).

---

## Harness profiles

| Profile | Command | Purpose |
|---------|---------|---------|
| *(default)* | `mvn verify` | Compile, unit tests, Spotless, Checkstyle, JaCoCo |
| `pit` | `mvn -Ppit pitest:mutationCoverage` | Mutation testing (slow; run on PR branches) |
| `security` | `mvn -Psecurity verify` | OWASP Dependency Check (requires NVD download) |
| `spotbugs` | `mvn -Pspotbugs verify` | SpotBugs + FindSecBugs (deferred; use on JDK 24 until DEBT-005 closed) |

---

## Coverage policy

- **Hard floor:** 90% line coverage, 90% branch coverage (BUNDLE)
- **Package floor:** 85% line coverage
- **Excluded:** `**/*Application.class` (Spring Boot bootstrap — untestable in isolation)
- **New code:** 95% (enforced via `.github/scripts/check-new-code-coverage.sh` in CI)

---

## Migration tool

- **Tool:** Flyway (see ADR-001)
- **Script location:** `sdd-api/src/main/resources/db/migration/`
- **Naming:** `V{N}__{description}.sql` (e.g. `V1__init.sql`)
- **Database:** MySQL 8+ (via `mysql-connector-j` + `flyway-mysql`)

---

## Deferred layers

| Layer | Debt entry | Trigger |
|-------|-----------|---------|
| Testcontainers | DEBT-002 | First `*IT.java` test |
| ArchUnit | DEBT-003 | After ≥2 features establish package structure |
| SpringDoc / OpenAPI | DEBT-004 | Before first HTTP endpoint |
