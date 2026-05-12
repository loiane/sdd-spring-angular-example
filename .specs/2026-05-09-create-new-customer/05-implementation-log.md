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
