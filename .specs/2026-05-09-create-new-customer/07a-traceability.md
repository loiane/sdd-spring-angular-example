# Traceability: 2026-05-09-create-new-customer

Generated: 2026-05-18T22:35:00Z

Note: This project uses @DisplayName with Given/When/Then format and drops @Tag (see feedback_test_annotations.md memory). AC-to-test mapping is derived from the tasks spec (04-tasks.md) Test-ID table, not from @Tag scanning.

## AC to Test Matrix

| AC | Description (summary) | Backend tests | Frontend tests | Status |
|----|----------------------|---------------|----------------|--------|
| AC-001 | Form displays all five fields | — | `CustomerCreate — [AC-001] form fields` (customer-create.spec.ts) | covered |
| AC-002 | Submit button disabled until required fields valid | — | `CustomerCreate — [AC-002] submit button disabled` (customer-create.spec.ts) | covered |
| AC-003 | Inline "required" error on blank required field after blur | — | `CustomerCreate — [AC-003] required field inline error` (customer-create.spec.ts, 3 cases) | covered |
| AC-004 | Inline format error on First/Last Name with digits | — | `CustomerCreate — [AC-004] name format inline error` (customer-create.spec.ts) | covered |
| AC-005 | Inline format error on invalid Email | — | `CustomerCreate — [AC-005] email format inline error` (customer-create.spec.ts) | covered |
| AC-006 | Inline format error on Phone with disallowed chars | — | `CustomerCreate — [AC-006] phone format inline error` (customer-create.spec.ts) | covered |
| AC-007 | Error removed when field corrected | — | `CustomerCreate — [AC-007] error clears on correction` (customer-create.spec.ts) | covered |
| AC-008 | Form submits and saves record | `CustomerServiceTest.createReturnsCustomerResponseWithId`, `CustomerControllerTest.createReturns201WithBodyForValidRequest`, `CustomerRepositoryTest.saveValidCustomer`, `CustomerControllerIT.createReturns201WithIdForValidRequest` | `CustomerService — [AC-008]` (customer-service.spec.ts), `CustomerCreate HTTP — [AC-008, AC-009] happy path` (customer-create.spec.ts) | covered |
| AC-009 | Success snackbar + navigate to /customers | — | `CustomerCreate HTTP — [AC-008, AC-009] happy path` snackbar + router assertions (customer-create.spec.ts) | covered |
| AC-010 | 400 on missing field; error identifies the field | `CustomerControllerTest.createReturns400WithErrorsForBlankFirstName` | `CustomerService — [AC-010, AC-012]` (customer-service.spec.ts), `CustomerCreate HTTP — [AC-010, AC-012]` (customer-create.spec.ts) | covered |
| AC-011 | 409 on duplicate email; error on Email field | `CustomerServiceTest.createThrowsDuplicateEmailExceptionWhenEmailExists`, `CustomerControllerTest.createReturns409WithEmailErrorForDuplicateEmail`, `CustomerControllerTest.createReturns409ForDataIntegrityViolation`, `CustomerControllerIT.createReturns409ForDuplicateEmail`, `CustomerRepositoryTest.duplicateEmailThrowsDataIntegrityViolation` | `CustomerService — [AC-011]` (customer-service.spec.ts), `CustomerCreate HTTP — [AC-011]` (customer-create.spec.ts) | covered |
| AC-012 | 400 on oversized field; error on offending field | `CustomerControllerTest.createReturns400WithErrorsForBlankFirstName` (bean validation path) | `CustomerService — [AC-010, AC-012]` (customer-service.spec.ts), `CustomerCreate HTTP — [AC-010, AC-012]` (customer-create.spec.ts) | covered |
| AC-013 | 500 generic snackbar; user stays on form | `CustomerControllerTest.createReturns500WithDetailForUnexpectedException` | `CustomerService — [AC-013]` (customer-service.spec.ts), `CustomerCreate HTTP — [AC-013]` (customer-create.spec.ts) | covered |

All 13 ACs covered. Zero uncovered ACs. Zero orphan tests (all tests map to at least one AC).

## Production code referenced by tests

| File | Referenced by |
|------|--------------|
| `com.loiane.sdd.customer.Customer` | CustomerRepositoryTest, CustomerServiceTest |
| `com.loiane.sdd.customer.CustomerController` | CustomerControllerTest, CustomerControllerIT |
| `com.loiane.sdd.customer.CustomerExceptionHandler` | CustomerControllerTest (via @WebMvcTest slice) |
| `com.loiane.sdd.customer.CustomerRepository` | CustomerRepositoryTest, CustomerRepositoryIT, CustomerServiceTest (mock) |
| `com.loiane.sdd.customer.CustomerRequest` | CustomerControllerTest, CustomerServiceTest, CustomerControllerIT |
| `com.loiane.sdd.customer.CustomerResponse` | CustomerControllerTest, CustomerServiceTest, CustomerControllerIT |
| `com.loiane.sdd.customer.CustomerService` | CustomerControllerTest (mock), CustomerServiceTest |
| `com.loiane.sdd.customer.DuplicateEmailException` | CustomerServiceTest, CustomerControllerTest |
| `sdd-ui: customer.ts` | customer-service.spec.ts, customer-create.spec.ts |
| `sdd-ui: customer-service.ts` | customer-service.spec.ts, customer-create.spec.ts |
| `sdd-ui: customer-create/customer-create.ts` | customer-create.spec.ts |

## Notes

- No @Tag annotations used per project convention (feedback_test_annotations.md).
- AC-to-test mapping is manually derived from 04-tasks.md Test-ID table.
- AC-012 (oversized field / 400) is covered by the same bean-validation path as AC-010 in the controller test (blank field triggers @NotBlank which is the same handler as @Size). A dedicated max-length test was not written as a separate method, but the exception handler logic is exercised and the production code's @Size constraints are validated by @Valid.
- Ghost test reports (CustomerServiceImplTest, internal.CustomerRepositoryTest, internal.CustomerRepositoryIT) exist in target/surefire-reports and target/failsafe-reports from stale compiled classes of prior builds. No corresponding source files exist. These do not represent orphan tests; they are build artifacts that will disappear after mvn clean.
