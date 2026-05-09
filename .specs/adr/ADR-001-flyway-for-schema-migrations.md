# ADR-001 — Use Flyway for schema migrations

**Status:** accepted  
**Date:** 2026-05-09

---

## Context

`sdd-api` uses MySQL via JPA. Schema changes must be versioned, reproducible, and applied automatically on startup. A migration tool must be chosen before any table definition is written. The two mainstream options for Spring Boot are Flyway and Liquibase.

## Decision drivers

- **Simplicity** — greenfield project with a small team; lower operational overhead is preferred.
- **SQL-first** — plain SQL migrations are easier to review, diff, and run by hand during incidents.
- **Spring Boot integration** — both tools are first-class citizens in Spring Boot, but Flyway's auto-configuration is more transparent.
- **Team familiarity** — Flyway's version-numbered file naming (`V1__init.sql`) is self-documenting.

## Considered options

1. **Flyway** — SQL file per version; simple mental model; forward-only by default.
2. **Liquibase** — Changelog-driven (YAML/XML/JSON/SQL); richer rollback and diff tooling; heavier setup.

## Decision outcome

**Chosen: Flyway.**

Flyway is sufficient for a greenfield relational schema where migrations are additive and SQL is the preferred language. The simpler configuration reduces onboarding friction and the file-per-version model maps directly to PR reviews. Liquibase's additional rollback primitives are not needed at this stage.

Migration scripts live at `sdd-api/src/main/resources/db/migration/`. Naming: `V{N}__{description}.sql`. The first script (`V1__init.sql`) must be created before any entity is mapped.

## Consequences

**Positive:**
- Zero-configuration startup: Spring Boot auto-detects Flyway and runs pending migrations.
- Migrations are plain SQL — readable in code review without tool knowledge.
- `flyway_schema_history` table provides an audit trail of applied migrations.

**Negative:**
- No built-in rollback: destructive changes require a two-step additive migration strategy.
- Changing a committed migration script causes a checksum error — discipline required.
- Switching to Liquibase later requires exporting the baseline and rewriting changelog structure.

## Pros and cons per option

| | Flyway | Liquibase |
|---|---|---|
| Setup complexity | Low | Medium |
| Migration language | SQL only | SQL / YAML / XML / JSON |
| Rollback support | Manual (add new migration) | Built-in changeSet rollback |
| Spring Boot auto-config | Native | Native |
| Cross-DB portability | Medium | High |
| Review clarity | High (SQL is the PR) | Medium (YAML adds abstraction) |

## Links

- [Flyway documentation](https://documentation.red-gate.com/flyway)
- `flyway-or-liquibase-detection` skill in `.claude/skills/`
- `.specs/_onboarding.md` — initial stack assessment

## Trigger to revisit

Switch to Liquibase if: (a) destructive schema changes (column drops, renames) become frequent, (b) multi-database portability is required, or (c) the team wants automated rollback scripts generated from changelogs.
