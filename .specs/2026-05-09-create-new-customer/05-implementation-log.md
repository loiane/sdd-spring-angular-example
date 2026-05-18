# Implementation Log: 2026-05-09-create-new-customer

---

## T-001 — red

**Phase:** red
**Date:** 2026-05-11

**Tests written:**

- `CustomerRepositoryTest` (`@DataJpaTest` + `@AutoConfigureTestDatabase(replace=NONE)`)
  - `[AC-008]` `saveValidCustomer` — save entity, verify assigned id and `existsByEmail` true
  - `[AC-008, AC-012]` `saveCustomerWithAllFieldsAndReadBack` — all fields including phone and company
  - `[AC-011]` `existsByEmailReturnsFalseForUnknownEmail`
  - `[AC-011]` `duplicateEmailThrowsDataIntegrityViolation`
- `CustomerRepositoryIT` (`@SpringBootTest`, Failsafe)
  - `[AC-008, AC-012]` `customerTableExistsWithAllColumns` — verifies all 6 DDL columns via JDBC metadata
  - `[AC-011]` `customerEmailColumnHasUniqueConstraint` — verifies `uk_customer_email` index name

**Red failure excerpt:**

```text
[ERROR] cannot find symbol
  symbol:   class Customer
  location: class com.loiane.sdd.customer.CustomerRepositoryTest
[ERROR] cannot find symbol
  symbol:   class CustomerRepository
```

Test-compile failed — no production classes existed yet.

**Discovery:** Spring Boot 4 relocated `@DataJpaTest` to
`org.springframework.boot.data.jpa.test.autoconfigure` and `@AutoConfigureTestDatabase` to
`org.springframework.boot.jdbc.test.autoconfigure`. Updated test imports accordingly.

---

## T-001 — green

**Phase:** green
**Date:** 2026-05-11

**Files created:**

- `sdd-api/src/main/resources/db/migration/V1__create_customer_table.sql`
- `sdd-api/src/main/java/com/loiane/sdd/customer/Customer.java`
- `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerRepository.java`

**Infrastructure fixes required (pom.xml — outside files_in_scope but necessary):**

1. Replaced `org.flywaydb:flyway-core` with `org.springframework.boot:spring-boot-starter-flyway` —
   Spring Boot 4 extracted `FlywayAutoConfiguration` into `org.springframework.boot:spring-boot-flyway`;
   the bare `flyway-core` dependency left Flyway unconfigured so `customer` table was never created.
2. Added `spring.docker.compose.skip.in-tests=false` to Failsafe plugin `systemPropertyVariables` —
   property was Surefire-only; IT tests had no DataSource without it.

**Test result:** 5 Surefire + 2 Failsafe = 7 tests passing, JaCoCo ≥ 90%.

---

## T-001 — refactor

**Phase:** refactor
**Date:** 2026-05-11

**Changes:** none required — structure was clean from GREEN.

`Customer`: private fields, package-private accessors, explicit `@Column` names per design spec,
`@Table` consistent with DDL. `CustomerRepository`: single-method interface.

**Test result:** 7/7 pass.

---

## T-001 — simplify

**Phase:** simplify
**Date:** 2026-05-11

**Changes:** none required.

No ternaries, no once-used helpers, no magic numbers. Test method names read as full
sentences. All gates (Spotless, Checkstyle, JaCoCo ≥ 90%, Surefire, Failsafe) pass.

**Test result:** 7/7 pass.

---

## T-004 — red

**Phase:** red
**Date:** 2026-05-11

**Files changed:**

- `sdd-ui/src/app/customer/customer-service.spec.ts` (created; later renamed from `customer.service.spec.ts` per naming convention)

**Red failure excerpt:**

```text
✘ [ERROR] Could not resolve "./customer-service"
    src/app/customer/customer-service.spec.ts:9:32
✘ [ERROR] TS2307: Cannot find module './customer-service' or its corresponding type declarations.
✘ [ERROR] TS2307: Cannot find module './customer' or its corresponding type declarations.
    src/app/customer/customer-service.spec.ts:15:7
```

**Tests written (T-004-T1):**

- `[AC-008]` POST to `/api/customers` returns `CustomerResponse` on 201
- `[AC-010, AC-012]` 400 response: `CustomerApiError` with `status: 400`, `isServerError: false`, `errors` array
- `[AC-011]` 409 response: `CustomerApiError` with `status: 409`, email field error
- `[AC-013]` 500 response: `CustomerApiError` with `status: 500`, `isServerError: true`, `errors: []`

---

## T-004 — green

**Phase:** green
**Date:** 2026-05-11

**Files changed:**

- `sdd-ui/src/app/customer/customer.ts` (created; renamed from `customer.model.ts` per naming convention)
- `sdd-ui/src/app/customer/customer-service.ts` (created; renamed from `customer.service.ts` per naming convention)

**Key decisions:**

- `CUSTOMERS_URL` extracted as module-level `const` — single source of truth for the endpoint
- `SERVER_ERROR_THRESHOLD = 500` named constant instead of magic number
- `toApiError` extracted as a pure module-level function — keeps the observable chain flat and readable
- `observe: 'response'` used for POST (not `httpResource`, which applies to GET data-fetching)
- `catchError` re-throws a `CustomerApiError` shape so components never re-parse HTTP status

**Test result:** 4/4 T-004 tests pass, 6/6 full suite (no regressions)

---

## T-004 — refactor

**Phase:** refactor
**Date:** 2026-05-11

**Files changed:** none — initial implementation was already well-structured

**Notes:** No structural changes required. `toApiError` helper and constants were cleanly separated from the start.

**Test result:** 6/6 pass

---

## T-004 — simplify

**Phase:** simplify
**Date:** 2026-05-11

**Files changed:** none — no ternary chains or clever tricks to untangle

**Notes:** `if/else` used from the start for the server-error guard. Code is readable at a glance.

**Test result:** 6/6 pass

---

## T-002 — red

**Phase:** red
**Date:** 2026-05-12

**Tests written (T-002-T1):**

- `CustomerServiceImplTest` (`@ExtendWith(MockitoExtension.class)`)
  - `[AC-008]` `createReturnsCustomerResponseWithId` — mocks repository, asserts CustomerResponse fields + assigned id (42L via reflection)
  - `[AC-010, AC-011]` `createThrowsDuplicateEmailExceptionWhenEmailExists` — existsByEmail returns true → DuplicateEmailException; save never called

**Red failure excerpt:**

```text
[ERROR] cannot find symbol: class CustomerRequest
[ERROR] cannot find symbol: class CustomerResponse
[ERROR] cannot find symbol: class CustomerServiceImpl
[ERROR] cannot find symbol: class DuplicateEmailException
```

Test-compile failed — no production service classes existed yet.

---

## T-002 — green

**Phase:** green
**Date:** 2026-05-12

**Files created:**

- `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerRequest.java`
- `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerResponse.java`
- `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerService.java`
- `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerServiceImpl.java`
- `sdd-api/src/main/java/com/loiane/sdd/customer/DuplicateEmailException.java`

**Infrastructure fixes required (outside files_in_scope but necessary):**

1. Added `spring-boot-starter-validation` to `pom.xml` — `spring-boot-starter-webmvc` does not pull in `jakarta.validation` transitively in Spring Boot 4; `@NotBlank`, `@Size`, `@Email`, `@Pattern` need it explicitly.
2. Added `sdd-api/src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` set to `mock-maker-subclass` — Mockito's inline mock maker generates JDK 25 class files (major version 70) that JaCoCo 0.8.13 cannot instrument; subclass mock maker avoids synthetic class generation.

**Test result:** 7/7 Surefire pass (1 SddApplicationTests + 2 CustomerServiceImplTest + 4 CustomerRepositoryTest), no regressions.

---

## T-002 — refactor

**Phase:** refactor
**Date:** 2026-05-12

**Changes:**

- Removed `CustomerService` interface — single implementation, no need for an abstraction layer per user convention.
- Merged logic into `CustomerService` (was `CustomerServiceImpl`); deleted `CustomerServiceImpl.java`.
- Renamed test class `CustomerServiceImplTest` → `CustomerServiceTest`; file renamed accordingly.

**Test result:** 7/7 pass.

---

## T-002 — simplify

**Phase:** simplify
**Date:** 2026-05-12

**Changes:** none required.

`toEntity` and `toResponse` private helpers are clean, flat, and readable. No ternary chains, no once-used helpers, no magic literals. All gates pass.

**Test result:** 7/7 pass.

---

## T-003 — red

**Phase:** red
**Date:** 2026-05-12

**Tests written (T-003-T1, T-003-T2):**

- `CustomerControllerTest` (`@WebMvcTest(CustomerController.class)`, `@MockitoBean CustomerService`)
  - `[AC-008]` `createCustomer_validRequest_returns201WithBody` — mocked service returns response; expects 201 + id, firstName, email in JSON body
  - `[AC-010, AC-012]` `createCustomer_blankFirstName_returns400WithErrors` — blank firstName triggers Bean Validation; expects 400 + `errors` array with field + message
  - `[AC-011]` `createCustomer_duplicateEmail_returns409WithEmailError` — service throws `DuplicateEmailException`; expects 409 + `errors[0].field == "email"`
  - `[AC-013]` `createCustomer_unexpectedException_returns500WithDetail` — service throws `RuntimeException`; expects 500 + `detail` present
- `CustomerControllerIT` (`@SpringBootTest(webEnvironment=RANDOM_PORT)`, Failsafe)
  - `[AC-008]` `createCustomer_validRequest_returns201WithId` — POST valid body end-to-end; expects 201 + positive id
  - `[AC-011]` `createCustomer_duplicateEmail_returns409` — POST same email twice; second call expects 409

**Discovery:** Spring Boot 4 relocated `TestRestTemplate` from `org.springframework.boot.test.web.client` to `org.springframework.boot.resttestclient` (module `spring-boot-resttestclient`). `@WebMvcTest` relocated to `org.springframework.boot.webmvc.test.autoconfigure`.

**Red failure excerpt:**

```text
[ERROR] cannot find symbol: class CustomerController
[ERROR] /CustomerControllerTest.java:[17,13] cannot find symbol
```

Test-compile failed — no production controller class existed yet.

---

## T-003 — green

**Phase:** green
**Date:** 2026-05-12

**Files created:**

- `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerController.java`
- `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerExceptionHandler.java`

**Key decisions:**

- `CustomerController` is package-private (`class`, not `public class`) per design spec.
- `@Valid @RequestBody` on the controller triggers Bean Validation before the service is called.
- `CustomerExceptionHandler` uses Spring's native `ProblemDetail` with `setProperty("errors", ...)` to attach the field error list.
- `DataIntegrityViolationException` → 409 is the concurrency fallback (ADR-002) alongside the proactive `DuplicateEmailException` → 409.
- `Exception` catch-all → 500 with a generic detail string (no internal detail leaked).
- `CustomerControllerIT` uses a plain `RestTemplate` with a no-throw `DefaultResponseErrorHandler` + `@LocalServerPort` — avoids `@AutoConfigureTestRestTemplate` which is broken under Java 25 (`@ConditionalOnMissingBean` type-deduction failure in `spring-boot-resttestclient` 4.0.6).

**Infrastructure fixes:**

- Pre-existing Checkstyle `LineLength` violations in `CustomerRepositoryTest` and `CustomerRepositoryIT` (both outside T-003 scope but blocking `mvn verify`) fixed by wrapping `@DisplayName` strings with `+` concatenation.

**Test result:** 11 Surefire + 4 Failsafe = 15 tests passing, 0 Checkstyle violations, JaCoCo ≥ 90%, BUILD SUCCESS.

---

## T-003 — refactor

**Phase:** refactor
**Date:** 2026-05-12

**Changes:**

- `CustomerExceptionHandler`: extracted `duplicateEmailConflict()` private helper — both `handleDuplicateEmail` and `handleDataIntegrity` had identical bodies; the helper eliminates the duplication without changing behavior.
- `CustomerController` and test classes: no structural changes required; they were already clean from GREEN.

**Test result:** 11 Surefire + 4 Failsafe = 15 tests passing, BUILD SUCCESS.

---

## T-003 — simplify

**Phase:** simplify
**Date:** 2026-05-12

**Changes:**

- `CustomerControllerIT`: replaced FQN references `org.springframework.http.client.ClientHttpResponse` and `java.io.IOException` inside the anonymous `DefaultResponseErrorHandler` with proper imports and simple names.
- `CustomerControllerIT`: simplified `new RestTemplate(new SimpleClientHttpRequestFactory())` to `new RestTemplate()` — the no-arg constructor already uses `SimpleClientHttpRequestFactory` by default.
- No changes to `CustomerController`, `CustomerExceptionHandler`, or `CustomerControllerTest` — all were already clear from REFACTOR.

**Test result:** 11 Surefire + 4 Failsafe = 15 tests passing, 0 Checkstyle violations, JaCoCo ≥ 90%, BUILD SUCCESS.

---

### T-005 — red

**Failure excerpt:**
```
✘ [ERROR] Could not resolve "./customer-create"
✘ [ERROR] TS2307: Cannot find module './customer-create' or its corresponding type declarations.
```

**Test written:** `customer-create.spec.ts` — 9 tests covering AC-001 through AC-007 (form fields present, submit disabled when invalid, required/pattern/email/phone inline errors, error clears on correction).

**Root cause:** `CustomerCreate` component did not exist yet.

---

### T-005 — green

**Production code written:**
- `customer-create.ts` — `CustomerCreate` standalone component with `ReactiveFormsModule`; `FormGroup` with five typed `FormControl`s; `NAME_PATTERN` and `PHONE_PATTERN` constants; stub `onSubmit()`.
- `customer-create.html` — Angular Material form with `@if` control-flow blocks keyed on `data-testid` attributes for test targeting.
- `customer-create.scss` — flex column layout, max-width 480px.
- `customer.routes.ts` — exports `customerRoutes: Routes = [{ path: 'new', component: CustomerCreate }]`.
- `app.routes.ts` — added lazy `{ path: 'customers', loadChildren: ... }` route.
- Installed `@angular/animations@^21.2.13` (required by `NoopAnimationsModule` / Angular Material).

**Test result:** 15/15 tests passing (3 test files); `ng build` succeeds with `customer-routes` as a lazy chunk.

---

### T-005 — refactor

**Changes:**
- Added typed getters `firstName`, `lastName`, `email`, `phone` to `CustomerCreate` class, backed by `this.form.controls.<field>`. Template now references the getter (`firstName.hasError(...)`) instead of `form.get('firstName')!` everywhere — eliminates non-null assertions and the repeated `form.get()` calls.

**Test result:** 15/15 tests passing.

---

### T-005 — simplify

**Changes:**
- Applied `prettier --write` to `customer-create.ts`, `customer-create.html`, `customer.routes.ts`, `app.routes.ts` — aligned formatting with project style (inline imports collapsed, HTML tag-close formatting). No logic changed.

**Test result:** 15/15 tests passing; `ng build` and `prettier --check` both clean.

---

### T-006 — red

**Failure excerpt:**
```
AssertionError: expected "vi.fn()" to be called with arguments
Number of calls: 0
```
`onSubmit()` was a no-op stub; `CustomerService`, `Router`, and `MatSnackBar` were not injected.

**Tests written:** Added `CustomerCreate — HTTP integration` describe block to `customer-create.spec.ts` — 5 tests covering AC-008 (service called once), AC-009 (success snackbar + navigate), AC-010/AC-012 (400 field errors mapped to form controls), AC-011 (409 mapped to email field), AC-013 (500 generic snackbar, form preserved, no navigate).

---

### T-006 — green

**Production code written:**
- `customer-create.ts` — injected `CustomerService`, `Router`, `MatSnackBar` via `inject()`; wired `onSubmit()` to subscribe to `customerService.create()`, calling `onSuccess()` or `onError()` handlers.
- `app.config.ts` — added `provideHttpClient()` and `provideAnimationsAsync()`.

**Test result:** 20/20 tests passing (3 test files); `ng build` succeeds.

---

### T-006 — refactor

**Changes:**
- Extracted `onSuccess()` and `onError()` as private methods — `onSubmit()` now reads at a single level of abstraction. `onError()` uses an early-return guard for `isServerError` before iterating field errors.

**Test result:** 20/20 tests passing.

---

### T-006 — simplify

**Changes:**
- Applied `prettier --write` to `customer-create.ts` and `customer-create.spec.ts` — collapsed subscribe object onto fewer lines, normalised import grouping. No logic changed.

**Test result:** 20/20 tests passing; `ng build` and `prettier --check` clean.

---
