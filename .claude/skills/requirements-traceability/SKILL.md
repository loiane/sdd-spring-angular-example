---
name: requirements-traceability
description: Build and verify the AC ↔ tasks ↔ tests ↔ code symbols ↔ gates traceability matrix in `07a-traceability.md`. Use when validating that no AC is uncovered and no test is orphaned.
when_to_use:
  - Phase 6 (Validate) — `/validate` produces the matrix.
  - Code review — verify the matrix is consistent with actual files.
authoritative_references:
  - .claude/templates/traceability.template.md
---

# Requirements traceability

## What gets traced

For each `AC-NNN` from `01-spec.md`:

- The list of `T-NNN` tasks that implement it (`04-tasks.md`).
- The list of test methods that assert it (tests in the files listed under that task's `files_in_scope` in `.tdd-state.json`).
- The list of production code symbols (FQ method names) touched by those tasks' diffs.
- The list of harness gates that ran on those symbols.

For each test method:

- The AC it claims to assert.
- The task that introduced it.

For each production symbol changed in the diff:

- At least one test that covers it (else flagged "orphan code").

## Building the matrix

`spring-validator` runs `.github/scripts/traceability.sh` which:

1. Greps `01-spec.md` for `**AC-NNN**` headers → AC list.
2. Greps `04-tasks.md` for task entries with `**AC-IDs:**` → AC↔task mapping.
3. For each task, maps the ACs from `acs_covered` in `.tdd-state.json` to the test files listed in that task's `files_in_scope` → AC↔test mapping.
4. Reads `git diff --name-only origin/main...HEAD` → changed files; intersects with JaCoCo's per-method coverage data → covered/uncovered symbols.
5. Reads `harness-summary.json` → gates that ran.
6. Emits `07a-traceability.md`.

## Required checks (all must pass)

- **No uncovered AC.** Every `AC-NNN` from `01-spec.md` appears in ≥1 task's `acs_covered` in `.tdd-state.json`, and that task has ≥1 test file in `files_in_scope`.
- **No orphan test.** Every test file listed in `files_in_scope` belongs to a task that covers ≥1 real AC.
- **No orphan code.** Every changed production method has ≥1 covering test.
- **No untraced task.** Every `T-NNN` marked `done` in `04-tasks.md` has a commit recorded.

Failures of any check → validator returns ❌.

## Sample output (truncated)

```markdown
## Coverage

| AC-ID | Tasks | Tests | Status |
|-------|-------|-------|--------|
| AC-001 | T-001, T-002 | ApplyGiftCardRequestTest#rejectsBlankCode, CheckoutControllerTest#happyPath | ✅ |
| AC-002 | T-003 | CheckoutServiceTest#redeemedCardRejected, CheckoutControllerIT#redeemed409 | ✅ |
| AC-003 | T-002 | CheckoutControllerTest#unknownCode404 | ✅ |
| AC-004 | T-004 | GiftCardRepositoryIT#balanceAcrossOrders | ✅ |

## Orphan tests

_None._

## Orphan code

_None._

## Verdict

✅ All ACs covered. No orphans.
```

## Test naming convention (enforced)

```java
@Test
@DisplayName("given expired gift card, when applied, then returns 4xx")
void rejectsExpired() { ... }
```

`@DisplayName` uses pure Given/When/Then — no AC prefix. Do **not** use `@Tag`. AC traceability flows through `04-tasks.md` (`AC-IDs`) and `.tdd-state.json` (`acs_covered` + `files_in_scope`), not through test annotations.

## Anti-patterns

- One mega-test that asserts five ACs at once → split.
- Task `acs_covered` lists an AC but the actual test assertion doesn't exercise it → audit the assertion.
- Using `@Tag` — it is dropped from the convention; remove any that appear.
- Display names without Given/When/Then structure — they describe the method, not the behavior.
