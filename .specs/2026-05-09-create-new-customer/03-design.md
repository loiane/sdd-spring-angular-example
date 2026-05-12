# Design: 2026-05-09-create-new-customer — Create New Customer

> Owner: `spring-architect` · Phase 3 · Template: `.claude/templates/design.template.md`

## Inputs

- `01-spec.md` snapshot: 2026-05-09
- Stack:
  - Build tool: Maven
  - Java: 25 / Spring Boot: 4.0.6
  - DB engine: MySQL (`mysql-connector-j`)
  - Migration tool: Flyway (flyway-core + flyway-mysql already in `pom.xml`)
  - Testcontainers: absent — integration tests use docker-compose MySQL
  - Harness: Spotless (Google Java Format), Checkstyle, JaCoCo (90% line/branch), Surefire/Failsafe

## Architecture Overview

The feature is a full-stack vertical slice touching both `sdd-api` (Spring Boot 4 / Java 25) and `sdd-ui` (Angular 21). On the backend, a new `customer` feature package introduces a Flyway migration, a JPA entity, a Spring Data repository, a service interface + implementation, a `@RestController`, and an RFC 9457 exception handler. On the frontend, a new `customer/` feature directory adds a model file, an `HttpClient`-backed service, a reactive form component, and a lazy-loaded route registered at `/customers/new`. The two layers communicate via the `POST /api/customers` contract defined in the spec's Proposed API Contract section. See ADR-001 for the package structure decision and ADR-002 for the email uniqueness strategy.

## ADRs

- ADR-001: Feature-scoped package structure — status: **accepted** (updated: flat customer package, no api/internal split)
- ADR-002: Email uniqueness enforcement strategy — status: **accepted**

## Spring Component Map

> Feature package root: `com.loiane.sdd.customer`
> All classes live directly in the feature package. Optional sub-packages (`repository`, `service`, `controller`, `dto`) may be added when the feature grows large enough to warrant splitting.

| Feature    | Component                           | Responsibility                                                              |
|------------|-------------------------------------|-----------------------------------------------------------------------------|
| `customer` | `customer.CustomerService`          | Published interface — declares `create(CustomerRequest)`                    |
| `customer` | `customer.CustomerRequest`          | Immutable record carrying validated field values from the caller            |
| `customer` | `customer.CustomerResponse`         | Immutable record returned after a successful save                           |
| `customer` | `customer.Customer`                 | JPA entity; owns the database row                                           |
| `customer` | `customer.CustomerRepository`       | Spring Data `JpaRepository`; declares `existsByEmail`                       |
| `customer` | `customer.CustomerServiceImpl`      | Business logic: email uniqueness check + delegate to repository             |
| `customer` | `customer.DuplicateEmailException`  | Domain exception thrown when the email already exists                       |
| `customer` | `customer.CustomerController`       | `@RestController` — maps `POST /api/customers` to `CustomerService.create`  |
| `customer` | `customer.CustomerExceptionHandler` | `@RestControllerAdvice` — maps exceptions to RFC 9457 `ProblemDetail`       |

## Module Boundaries

- `customer` — package: `com.loiane.sdd.customer`; depends on: nothing (no other features exist yet); published events: none.
- ArchUnit rule to add (Phase 5): no cycles between top-level feature packages (`noClasses().that().resideInAPackage("com.loiane.sdd.customer..").should().dependOnClassesThat().resideInAPackage("com.loiane.sdd.<other-feature>..")`).

## Entity Relationship Model

| Entity     | Purpose                                  | Key attributes                                                                    | Relationships       | Persistence notes                                                          |
|------------|------------------------------------------|-----------------------------------------------------------------------------------|---------------------|----------------------------------------------------------------------------|
| `Customer` | Registered business contact              | `id` (generated PK), `firstName`, `lastName`, `email` (unique), `phone`, `company` | Standalone — none   | Aggregate root; `email` carries a DB-level `UNIQUE` constraint; `phone` and `company` are nullable |

## OpenAPI Sketch

```yaml
openapi: 3.1.0
info:
  title: SDD API
  version: 0.0.1

paths:
  /api/customers:
    post:
      summary: Create a new customer
      operationId: createCustomer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CustomerRequest'
      responses:
        '201':
          description: Customer created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerResponse'
        '400':
          description: Validation failure
          content:
            application/problem+json:
              schema:
                $ref: '#/components/schemas/ValidationProblem'
        '409':
          description: Email already in use
          content:
            application/problem+json:
              schema:
                $ref: '#/components/schemas/ValidationProblem'
        '500':
          description: Unexpected server error
          content:
            application/problem+json:
              schema:
                $ref: '#/components/schemas/Problem'

components:
  schemas:
    CustomerRequest:
      type: object
      required: [firstName, lastName, email]
      properties:
        firstName: { type: string, maxLength: 100, pattern: '^[\p{L}\-'']+$' }
        lastName:  { type: string, maxLength: 100, pattern: '^[\p{L}\-'']+$' }
        email:     { type: string, format: email, maxLength: 255 }
        phone:     { type: string, maxLength: 20, pattern: '^[0-9 +()\-]*$', nullable: true }
        company:   { type: string, maxLength: 150, nullable: true }

    CustomerResponse:
      type: object
      properties:
        id:        { type: integer, format: int64 }
        firstName: { type: string }
        lastName:  { type: string }
        email:     { type: string }
        phone:     { type: string, nullable: true }
        company:   { type: string, nullable: true }

    FieldError:
      type: object
      properties:
        field:   { type: string }
        message: { type: string }

    ValidationProblem:
      allOf:
        - $ref: '#/components/schemas/Problem'
        - type: object
          properties:
            errors:
              type: array
              items:
                $ref: '#/components/schemas/FieldError'

    Problem:
      type: object
      properties:
        type:   { type: string, format: uri }
        title:  { type: string }
        status: { type: integer }
        detail: { type: string }
```

## Data Model + Migrations

- Tables affected: `customer` (new)
- Migration tool: **Flyway**
- Migration file: `sdd-api/src/main/resources/db/migration/V1__create_customer_table.sql`
- Reversibility: forward-only (DROP TABLE is the rollback; no data exists at initial deploy)

**Migration SQL:**

```sql
CREATE TABLE customer (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(20),
    company    VARCHAR(150),
    PRIMARY KEY (id),
    UNIQUE KEY uk_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**JPA entity column mapping:**

| Java field  | DB column    | Constraints               |
|-------------|--------------|---------------------------|
| `id`        | `id`         | `AUTO_INCREMENT`, PK      |
| `firstName` | `first_name` | `NOT NULL`, max 100       |
| `lastName`  | `last_name`  | `NOT NULL`, max 100       |
| `email`     | `email`      | `NOT NULL`, UNIQUE, max 255 |
| `phone`     | `phone`      | nullable, max 20          |
| `company`   | `company`    | nullable, max 150         |

## Bean Validation Constraints

Applied on `CustomerRequest` record (server-side) and mirrored in Angular validators (client-side):

| Field       | Constraints                                                                           |
|-------------|---------------------------------------------------------------------------------------|
| `firstName` | `@NotBlank`, `@Size(max=100)`, `@Pattern(regexp="[\\p{L}\\-']+")` — no digits        |
| `lastName`  | `@NotBlank`, `@Size(max=100)`, `@Pattern(regexp="[\\p{L}\\-']+")` — no digits        |
| `email`     | `@NotBlank`, `@Size(max=255)`, `@Email`                                               |
| `phone`     | `@Size(max=20)`, `@Pattern(regexp="[0-9 +()\\-]*")` — nullable, blank allowed        |
| `company`   | `@Size(max=150)` — nullable, free text                                                |

## RFC 9457 Error Mapping

| Scenario                        | HTTP Status | `type` suffix               | `errors` array |
|---------------------------------|-------------|-----------------------------|----------------|
| Bean validation failure         | 400         | `validation-error`          | One entry per failing field |
| Duplicate email (proactive)     | 409         | `duplicate-email`           | `[{field:"email", ...}]` |
| `DataIntegrityViolationException` (race) | 409 | `duplicate-email`     | `[{field:"email", ...}]` |
| Uncaught `Exception`            | 500         | `internal-error`            | absent |

## Angular Feature Structure

```
sdd-ui/src/app/customer/
├── customer.ts                          # CustomerRequest, CustomerResponse, ApiError interfaces
├── customer-service.ts                  # HttpClient POST /api/customers
├── customer-service.spec.ts             # HttpClientTestingModule unit tests
├── customer.routes.ts                   # { path: 'new', component: CustomerCreateComponent }
└── customer-create/
    ├── customer-create.ts               # ReactiveFormsModule form, validators, submit logic
    ├── customer-create.html             # mat-form-field, mat-error, mat-snack-bar trigger
    ├── customer-create.scss
    └── customer-create.spec.ts          # TestBed + Vitest: form rendering, validation, HTTP
```

Route registration:
- `sdd-ui/src/app/app.routes.ts` — add `{ path: 'customers', loadChildren: () => import('./customer/customer.routes') }`
- `sdd-ui/src/app/app.config.ts` — add `provideHttpClient()` and `provideAnimationsAsync()`

The `/customers/new` path renders `CustomerCreateComponent`. On success: `MatSnackBar.open(...)` then `Router.navigate(['/customers'])` (route deferred per Q-001).

## Security Posture

- AuthN: none (out of scope per Q-004 resolution)
- AuthZ: none (out of scope per Q-004 resolution)
- PII handled: `email`, `firstName`, `lastName`, `phone` — stored in MySQL; no additional encryption in scope for this story
- Secrets: database credentials via `application.properties` / docker-compose env vars (existing setup)

## Risks + Rollback

| Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|
| JaCoCo 90% gate fails on first build | Medium | Blocks CI | Write tests for all branches in `CustomerServiceImpl` and `CustomerExceptionHandler` before merging | Remove new classes from JaCoCo until coverage is added |
| `@Pattern` regex rejects valid Unicode names (e.g., accented letters) | Low | Incorrect rejection of valid users | `\p{L}` covers Unicode letters; test with É, ñ, ü in unit tests | Widen pattern to `[^0-9]+` as a conservative fallback |
| Flyway migration conflicts with a future V1 migration from another story | Low | Migration fails on startup | Coordinate migration numbering; use `V1__create_customer_table.sql` and reserve V2+ | Rename file to next available version |
| Docker-compose not running when integration tests execute | Medium | `*IT` tests fail with connection refused | Document prerequisite in README; CI must start compose before Failsafe | Skip IT tests with `-DskipITs` for local runs |

## Non-Functional Requirements

- **Latency:** save action ≤ 500 ms at P95, end-to-end (client submit → browser receives response).
- **Uniqueness:** `email` unique constraint enforced at the database level (DDL) plus a service-layer proactive check (ADR-002).
- **Coverage:** JaCoCo minimum 90% line and branch (existing gate); all new classes must satisfy this floor.

## Open Questions

- (none — all questions resolved in `01-spec.md`)

## Resolved Questions

- (none required at design level; all were resolved in spec phase)

## Sign-off

- [x] Every AC from `01-spec.md` is addressed by at least one component or task.
- [x] All `Q-NNN` resolved or deferred-with-rationale.
- [ ] Reviewed by user on <!-- YYYY-MM-DD -->.
