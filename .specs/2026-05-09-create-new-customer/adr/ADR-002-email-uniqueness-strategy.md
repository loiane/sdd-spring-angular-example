# ADR-002: Email uniqueness enforcement strategy

- **Status:** accepted
- **Date:** 2026-05-09
- **Deciders:** loiane, `spring-architect`
- **Consulted:** —
- **Informed:** —

## Context and problem statement

AC-011 requires that submitting a form with an email already belonging to another customer produces a `409 Conflict` with a field-level error on the Email field. Two technical strategies exist for detecting the duplicate: a proactive service-layer check before the INSERT, or catching the `DataIntegrityViolationException` thrown by the DB unique constraint after the failed INSERT. The choice affects testability, error message clarity, and behavior under concurrent writes.

## Decision drivers

- Error message quality: the `409` body must identify the `email` field by name; a raw DB exception message does not.
- Testability: the uniqueness check must be unit-testable without a database.
- Safety under concurrency: the race window between check and INSERT must be acknowledged and its impact assessed.
- Simplicity: the project is a teaching example; the strategy should be easy to understand.

## Considered options

1. **Proactive check in `CustomerServiceImpl` + DB unique constraint as safety net** — call `CustomerRepository.existsByEmail(email)` before `save()`; if true, throw `DuplicateEmailException`. The DB unique constraint on `email` is still present and will catch concurrent duplicates; those are mapped to `409` in the exception handler by catching `DataIntegrityViolationException`.
2. **Catch `DataIntegrityViolationException` only** — no proactive check; rely entirely on the DB constraint and parse the exception to produce the `409` response.
3. **Pessimistic lock** — acquire a row lock before checking; prevents the race but adds latency and complexity inappropriate for a low-concurrency teaching example.

## Decision outcome

Chosen option: **Option 1 — proactive check + DB constraint safety net**, because it produces clean, readable service code with a domain exception that carries meaningful field context, is unit-testable in isolation, and the DB unique constraint closes the narrow concurrency window.

### Consequences

- Positive: `CustomerServiceImpl` is unit-testable (mock repository returning `true`/`false`); error message is controlled by application code, not DB dialect; both fast-path and concurrent-race path produce `409`.
- Negative / trade-offs: two database round-trips on the happy path for duplicate detection; the tiny race window (between `existsByEmail` and `save`) results in a `DataIntegrityViolationException` that must be caught and re-wrapped — adding a small amount of complexity to the exception handler.

## Pros and cons of the options

### Option 1 — proactive check + safety net

- Pro: clean domain exception; unit-testable; race-safe via DB constraint fallback.
- Con: two DB calls on the duplicate path; `DataIntegrityViolationException` catch in handler is technically DB-dialect-coupled (but acceptable here since MySQL is the only engine).

### Option 2 — catch exception only

- Pro: single DB round-trip; no service-layer check needed.
- Con: parsing `DataIntegrityViolationException` messages is brittle and DB-dialect-specific; not unit-testable without a real DB.

### Option 3 — pessimistic lock

- Pro: zero race window.
- Con: serializes all customer creates; complexity far exceeds the problem size for this application.

## Links

- Related ADRs: ADR-001
- Source: AC-011 in `.specs/2026-05-09-create-new-customer/01-spec.md`
- Supersedes: —
