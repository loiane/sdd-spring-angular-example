# Traceability: 2026-05-09-create-new-customer

Generated: 2026-05-18T22:15:05Z (manual — see note)

> **Note:** The automated `traceability.sh` script scans for `@Tag("AC-NNN")` in Java tests and `### AC-NNN` headings in the spec. This project drops `@Tag` (see `memory/feedback_test_annotations.md`) and uses `- AC-NNN:` list format in the spec. The matrix below is maintained manually; the source of truth is `06-test-plan.md`.

| AC | Title (abbreviated) | Tests | Production code |
| --- | --- | --- | --- |
| AC-001 | Form displays 5 fields | `CustomerCreate` spec T-005-T1 "all five fields are present" | `CustomerCreate`, `customer-create.html` |
| AC-002 | Submit disabled until valid | `CustomerCreate` spec T-005-T1 "submit button is disabled" | `CustomerCreate`, `customer-create.html` |
| AC-003 | Required field inline error | `CustomerCreate` spec T-005-T1 firstName/lastName/email required | `CustomerCreate`, `customer-create.html` |
| AC-004 | Name format inline error | `CustomerCreate` spec T-005-T1 "First Name with a digit" | `CustomerCreate`, `customer-create.html` |
| AC-005 | Email format inline error | `CustomerCreate` spec T-005-T1 "invalid email string" | `CustomerCreate`, `customer-create.html` |
| AC-006 | Phone format inline error | `CustomerCreate` spec T-005-T1 "phone value with #" | `CustomerCreate`, `customer-create.html` |
| AC-007 | Error removed when corrected | `CustomerCreate` spec T-005-T1 "error clears on correction" | `CustomerCreate`, `customer-create.html` |
| AC-008 | Record saved on valid submit | `CustomerRepositoryTest`, `CustomerRepositoryIT`, `CustomerServiceTest`, `CustomerControllerTest`, `CustomerControllerIT`, `customer-service.spec.ts` T-004-T1, `customer-create.spec.ts` T-006-T1 | `Customer`, `CustomerRepository`, `CustomerService`, `CustomerController` |
| AC-009 | Success snackbar + navigate | `customer-create.spec.ts` T-006-T1 "success snackbar opens and router navigates" | `CustomerCreate.onSubmit()`, `MatSnackBar`, `Router` |
| AC-010 | 400 field errors shown | `CustomerServiceTest`, `CustomerControllerTest`, `customer-service.spec.ts` T-004-T1, `customer-create.spec.ts` T-006-T1 | `CustomerExceptionHandler`, `CustomerCreate.onError()` |
| AC-011 | 409 duplicate email shown | `CustomerServiceTest`, `CustomerControllerTest` (including GAP-001), `CustomerControllerIT`, `customer-service.spec.ts` T-004-T1, `customer-create.spec.ts` T-006-T1 | `CustomerExceptionHandler`, `CustomerCreate.onError()` |
| AC-012 | 400 length error shown | `CustomerRepositoryTest`, `CustomerServiceTest`, `CustomerControllerTest`, `customer-service.spec.ts` T-004-T1, `customer-create.spec.ts` T-006-T1 | `CustomerRequest`, `CustomerExceptionHandler` |
| AC-013 | 500 generic error, form preserved | `CustomerControllerTest`, `customer-service.spec.ts` T-004-T1, `customer-create.spec.ts` T-006-T1 | `CustomerExceptionHandler`, `CustomerCreate.onError()` |

## Gaps

| Gap | Description | Status |
| --- | --- | --- |
| GAP-001 | `handleDataIntegrity` (race-condition 409) uncovered | closed — `createReturns409ForDataIntegrityViolation` in `CustomerControllerTest` |
| GAP-002 | `SddApplication.main()` line coverage 33.3% | waived — main class excluded from JaCoCo by convention |
| GAP-003 | ArchUnit rules absent | deferred — no ArchUnit dependency yet |
| GAP-004 | OpenAPI contract test absent | deferred — SpringDoc not yet added |
| GAP-005 | PIT mutation testing absent | deferred — PIT profile not yet wired |

## Notes

- An AC with no tests is a hard validation failure. All 13 ACs are covered above.
- Production code column is heuristic. Verify manually for accuracy.
- Script automation deferred until spec format and `@Tag` usage align with `traceability.sh` expectations.
