# Test Plan: 2026-05-09-create-new-customer — Create New Customer

> Owner: `spring-test-engineer` · Phase 5 · Template: `.claude/templates/test-plan.template.md`

## Inputs

- `04-tasks.md` revision: c17f482
- `05-implementation-log.md` revision: current (T-001 → T-006 all `done`)
- Stack snapshot: Testcontainers **absent** (docker-compose MySQL for ITs); OpenAPI source **controllers** (SpringDoc not yet added).

## Test inventory

| Test-ID      | Type                          | File                                                                 | AC-IDs                              | Owner task | Status |
|--------------|-------------------------------|----------------------------------------------------------------------|-------------------------------------|------------|--------|
| T-001-T1     | JPA slice (`@DataJpaTest`)    | `sdd-api/.../CustomerRepositoryTest.java`                            | AC-008, AC-011, AC-012              | T-001      | green  |
| T-001-T2     | IT (`@SpringBootTest`)        | `sdd-api/.../CustomerRepositoryIT.java`                              | AC-008, AC-011, AC-012              | T-001      | green  |
| T-002-T1     | Unit (Mockito)                | `sdd-api/.../CustomerServiceTest.java`                               | AC-008, AC-010, AC-011, AC-012      | T-002      | green  |
| T-003-T1     | MVC slice (`@WebMvcTest`)     | `sdd-api/.../CustomerControllerTest.java`                            | AC-008, AC-010, AC-011, AC-012, AC-013 | T-003   | green  |
| T-003-T2     | IT (`@SpringBootTest RANDOM_PORT`) | `sdd-api/.../CustomerControllerIT.java`                         | AC-008, AC-011                      | T-003      | green  |
| T-004-T1     | Angular unit (HttpClientTesting) | `sdd-ui/.../customer-service.spec.ts`                             | AC-008, AC-010, AC-011, AC-012, AC-013 | T-004   | green  |
| T-005-T1     | Angular unit (TestBed)        | `sdd-ui/.../customer-create/customer-create.spec.ts` (T-005 block)   | AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007 | T-005 | green |
| T-006-T1     | Angular integration (TestBed + vi.fn mocks) | `sdd-ui/.../customer-create/customer-create.spec.ts` (T-006 block) | AC-008, AC-009, AC-010, AC-011, AC-012, AC-013 | T-006 | green |
| GAP-001      | MVC slice (`@WebMvcTest`)     | `sdd-api/.../CustomerControllerTest.java`                            | AC-011 (race path)                  | Phase 5    | **added** |

## AC Coverage Matrix

| AC     | T-001-T1 | T-001-T2 | T-002-T1 | T-003-T1 | T-003-T2 | T-004-T1 | T-005-T1 | T-006-T1 | GAP-001 |
|--------|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|:-------:|
| AC-001 |          |          |          |          |          |          |    ✓     |          |         |
| AC-002 |          |          |          |          |          |          |    ✓     |          |         |
| AC-003 |          |          |          |          |          |          |    ✓     |          |         |
| AC-004 |          |          |          |          |          |          |    ✓     |          |         |
| AC-005 |          |          |          |          |          |          |    ✓     |          |         |
| AC-006 |          |          |          |          |          |          |    ✓     |          |         |
| AC-007 |          |          |          |          |          |          |    ✓     |          |         |
| AC-008 |    ✓     |    ✓     |    ✓     |    ✓     |    ✓     |    ✓     |          |    ✓     |         |
| AC-009 |          |          |          |          |          |          |          |    ✓     |         |
| AC-010 |          |          |    ✓     |    ✓     |          |    ✓     |          |    ✓     |         |
| AC-011 |    ✓     |    ✓     |    ✓     |    ✓     |    ✓     |    ✓     |          |    ✓     |   ✓     |
| AC-012 |    ✓     |    ✓     |    ✓     |    ✓     |          |    ✓     |          |    ✓     |         |
| AC-013 |          |          |          |    ✓     |          |    ✓     |          |    ✓     |         |

All 13 ACs covered ✓

## Cross-cutting suites added in this phase

### Architecture (ArchUnit)

**Status: deferred — no ArchUnit dependency in pom.xml yet.**

Planned rules (to add in a follow-up task):
- `slices().matching("com.loiane.sdd.(*)..").should().beFreeOfCycles()` — no cross-feature cycles (ADR-001).
- No field injection (`@Autowired` on instance fields banned).
- Controllers must end in `Controller`; no controller-to-repository direct calls.

### Contract (OpenAPI)

**Status: deferred — SpringDoc/Springdoc-openapi not yet in pom.xml.**

Once SpringDoc is added: generate spec on build, diff against the sketch in `03-design.md`; breaking changes are blockers.

### Integration tests

- Containers: docker-compose MySQL (no Testcontainers; see `_stack.json`).
- IT classes annotated `@SpringBootTest` use the running docker-compose instance.
- `CustomerRepositoryIT` — Flyway migration + schema shape.
- `CustomerControllerIT` — end-to-end POST 201 and 409.

## Coverage strategy

- Threshold: **90% line + branch** (JaCoCo gate in `pom.xml`).
- Current state (last harness run):
  - `CustomerRequest` — 100% line
  - `Customer` — 100% line
  - `CustomerService` / `CustomerServiceImpl` — 100% line, 100% branch
  - `CustomerController` — 100% line
  - `CustomerExceptionHandler` — 93.8% line (1 missed — `handleDataIntegrity` body; closed by GAP-001)
  - `CustomerResponse` — 100% line
  - `DuplicateEmailException` — 100% line
  - `SddApplication` — 33.3% (main method; excluded from gate per convention — see Gaps)

## Mutation strategy

- Tool: PIT (not yet configured in pom.xml).
- **Status: deferred** — no mutations.xml present.
- Scope when added: `com.loiane.sdd.customer.*`.

## Gaps + waivers

### GAP-001 — `CustomerExceptionHandler.handleDataIntegrity` uncovered (1 line)

- **Root cause:** `DataIntegrityViolationException` is the race-condition fallback described in ADR-002 (duplicate email slips past the proactive service-layer check). No existing test triggers this path.
- **Resolution:** Added `createReturns409ForDataIntegrityViolation()` to `CustomerControllerTest` — stubs `CustomerService.create()` to throw `DataIntegrityViolationException` and asserts 409 + email field error.
- **Status: closed.**

### GAP-002 — `SddApplication` line coverage 33.3%

- **Root cause:** Spring Boot main class; the `main(String[])` method is not called by any Surefire unit test (context is loaded by `@SpringBootTest` but not via `main()`).
- **Resolution:** Won't fix — exclude `SddApplication` from JaCoCo via `<exclude>` in pom.xml. Industry convention; testing `SpringApplication.run()` provides no business value.
- **Status: waivedwaived — add JaCoCo exclusion.**

### GAP-003 — ArchUnit rules absent

- **Resolution:** Deferred to a dedicated follow-up task. No production risk in the current single-feature codebase.
- **Status: deferred.**

### GAP-004 — OpenAPI contract test absent

- **Resolution:** Deferred until SpringDoc is added to pom.xml.
- **Status: deferred.**

### GAP-005 — PIT mutation testing absent

- **Resolution:** Deferred until PIT profile is wired (see `_known-debt.md`).
- **Status: deferred.**

## Sign-off

- [x] Every AC has at least one passing test (see matrix above).
- [x] No `@Disabled` test without a `# DisabledReason` comment.
- [x] GAP-001 closed with a new test.
- [ ] ArchUnit, OpenAPI contract, PIT — deferred with rationale (GAP-003/4/5).
- [ ] Reviewed by user on <!-- YYYY-MM-DD -->.
