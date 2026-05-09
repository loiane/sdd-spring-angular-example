# Onboarding Report

**Generated:** 2026-05-09  
**Classification:** GREENFIELD  
**Module path:** `sdd-api`

---

## Repository Layout

This is a **polyglot monorepo** containing two sibling apps:

| Directory | Kind | Notes |
|-----------|------|-------|
| `sdd-api/` | Spring Boot 4 (Maven) | Primary harness module |
| `sdd-ui/` | Angular 21 | Sibling — owned by Angular pipeline |

---

## Stack (sdd-api)

| Property | Value |
|----------|-------|
| Java | 25 |
| Spring Boot | 4.0.6 |
| Database | MySQL (`mysql-connector-j`) |
| Migration tool | **None** — not yet wired |
| JUnit 5 | ✅ |
| Testcontainers | ❌ |
| ArchUnit | ❌ |
| SpringDoc / OpenAPI | ❌ |

### sdd-api Dependencies (current pom.xml)
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-webmvc`
- `spring-boot-devtools` (runtime, optional)
- `spring-boot-docker-compose` (runtime, optional)
- `mysql-connector-j` (runtime)
- `spring-boot-starter-data-jpa-test` (test)
- `spring-boot-starter-webmvc-test` (test)

### sdd-ui Stack
- Angular 21.2 + Angular Material + CDK
- TypeScript 5.9.2
- Vitest 4.x (unit testing)
- Prettier (formatting)

---

## Greenfield Classification

Only the Spring Boot auto-generated scaffold exists:
- `src/main/java/com/loiane/sdd/SddApplication.java` (1 file)
- `src/test/java/com/loiane/sdd/SddApplicationTests.java` (1 auto-generated test)

**Baseline harness run:** N/A — greenfield

---

## Findings: Missing Harness Layers

All harness layers are absent from `sdd-api/pom.xml`:

| Layer | Status | Priority |
|-------|--------|----------|
| Spotless (code formatting) | ❌ Missing | High |
| Checkstyle (style rules) | ❌ Missing | High |
| SpotBugs (static analysis) | ❌ Missing | Medium |
| JaCoCo (coverage) | ❌ Missing | High |
| PIT (mutation testing) | ❌ Missing | Medium |
| OWASP Dependency Check | ❌ Missing | Medium |
| Flyway **or** Liquibase | ❌ Not chosen | High — pick one before first migration |
| Testcontainers | ❌ Missing | High — needed for MySQL integration tests |
| SpringDoc / OpenAPI | ❌ Missing | Medium — contract-first workflow |
| ArchUnit | ❌ Missing | Low — add once layer structure is established |

---

## Recommended Next Steps

1. **Pick a migration tool** — Flyway or Liquibase (required before writing any schema). Add to `pom.xml` and create the first migration script.
2. **Wire the harness** — run `/wire-harness` (or add layers from `.claude/skills/maven-harness-pom`) to get Spotless, Checkstyle, JaCoCo, and SpotBugs in place.
3. **Add Testcontainers** — MySQL integration tests require a real container; add `spring-boot-testcontainers` + `testcontainers-mysql` to test scope.
4. **Write the first spec** — run `/spec` to define the first feature (e.g., the first REST endpoint + JPA entity).

**Recommended command:** `/spec <feature-name>`
