# Tasks: 2026-05-09-create-new-customer — Create New Customer

> Owner: `spring-architect` · Phase 3 · Template: `.claude/templates/tasks.template.md`
>
> One task ≈ 1–4 hours. Execute with `/build <task-id>`. Each task follows red → green → refactor → simplify.

## Inputs

- `03-design.md` snapshot: 2026-05-09

## Task Index

| ID    | Title                                                           | AC-IDs covered                                         | Depends on              | Layer    |
|-------|-----------------------------------------------------------------|--------------------------------------------------------|-------------------------|----------|
| T-001 | Customer persistence layer (entity + repo + Flyway)             | AC-008, AC-011, AC-012                                 | —                       | Backend  |
| T-002 | Customer service — create with business logic                   | AC-008, AC-010, AC-011, AC-012                         | T-001                   | Backend  |
| T-003 | Customer REST controller + RFC 9457 error handler               | AC-008, AC-010, AC-011, AC-012, AC-013                 | T-002                   | Backend  |
| T-004 | Angular customer model + HTTP service                           | AC-008, AC-010, AC-011, AC-012, AC-013                 | — (parallel with T-001) | Frontend |
| T-005 | Angular create-customer form + client-side validation + routing | AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007 | T-004                   | Frontend |
| T-006 | Angular HTTP integration, server error mapping, success flow    | AC-008, AC-009, AC-010, AC-011, AC-012, AC-013         | T-005                   | Frontend |

## AC Coverage Matrix

| AC    | T-001 | T-002 | T-003 | T-004 | T-005 | T-006 |
|-------|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
| AC-001 |      |       |       |       |  ✓   |       |
| AC-002 |      |       |       |       |  ✓   |       |
| AC-003 |      |       |       |       |  ✓   |       |
| AC-004 |      |       |       |       |  ✓   |       |
| AC-005 |      |       |       |       |  ✓   |       |
| AC-006 |      |       |       |       |  ✓   |       |
| AC-007 |      |       |       |       |  ✓   |       |
| AC-008 |  ✓  |  ✓   |  ✓   |  ✓   |       |  ✓   |
| AC-009 |      |       |       |       |       |  ✓   |
| AC-010 |      |  ✓   |  ✓   |  ✓   |       |  ✓   |
| AC-011 |  ✓  |  ✓   |  ✓   |  ✓   |       |  ✓   |
| AC-012 |  ✓  |  ✓   |  ✓   |  ✓   |       |  ✓   |
| AC-013 |      |       |  ✓   |  ✓   |       |  ✓   |

All 13 ACs covered. ✓

---

## Tasks

### T-001: Customer persistence layer (entity + repo + Flyway migration)

- **AC-IDs:** AC-008 (record can be saved), AC-011 (DB-level email uniqueness), AC-012 (DB-level length constraints)
- **Test-IDs:**
  - T-001-T1: `CustomerRepositoryTest` — `@DataJpaTest` + `@AutoConfigureTestDatabase(replace=NONE)` — save a valid customer; verify `existsByEmail` returns true for an existing email; verify saving a duplicate email throws `DataIntegrityViolationException`.
  - T-001-T2: `CustomerRepositoryIT` — `@SpringBootTest` + Failsafe — verifies Flyway migration runs cleanly and the table schema matches expectations (column presence, unique constraint name).
- **Files in scope:**
  - `sdd-api/src/main/resources/db/migration/V1__create_customer_table.sql`
  - `sdd-api/src/main/java/com/loiane/sdd/customer/Customer.java`
  - `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerRepository.java`
  - `sdd-api/src/test/java/com/loiane/sdd/customer/CustomerRepositoryTest.java`
  - `sdd-api/src/test/java/com/loiane/sdd/customer/CustomerRepositoryIT.java`
- **Dependencies:** none
- **Gates after green:** `spotless:check`, `checkstyle:check`, `compile`, `test` (Surefire — unit/slice), `verify` (Failsafe — IT), `jacoco:check`
- **Rollback:** revert commit; drop `V1__create_customer_table.sql` and Flyway history entry if migration ran.
- **Notes:**
  - `@DataJpaTest` scans only JPA components; Flyway runs automatically within the slice if `@AutoConfigureTestDatabase(replace=NONE)` is set — docker-compose must be running.
  - The `Customer` entity uses `@GeneratedValue(strategy = GenerationType.IDENTITY)` for MySQL `AUTO_INCREMENT`.
  - `CustomerRepository` extends `JpaRepository<Customer, Long>` and declares `boolean existsByEmail(String email)`.
  - Column naming: Spring JPA camelCase → snake_case by default; explicit `@Column(name="first_name")` is optional but recommended for clarity.

---

### T-002: Customer service — create with business logic

- **AC-IDs:** AC-008 (service delegates save), AC-010 (bean validation on request), AC-011 (proactive email uniqueness check), AC-012 (bean validation max-length)
- **Test-IDs:**
  - T-002-T1: `CustomerServiceImplTest` — unit test with Mockito — happy path: returns `CustomerResponse` with assigned `id`; duplicate email: `CustomerRepository.existsByEmail` returns `true` → `DuplicateEmailException` thrown.
- **Files in scope:**
  - `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerRequest.java`
  - `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerResponse.java`
  - `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerService.java`
  - `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerServiceImpl.java`
  - `sdd-api/src/main/java/com/loiane/sdd/customer/DuplicateEmailException.java`
  - `sdd-api/src/test/java/com/loiane/sdd/customer/CustomerServiceImplTest.java`
- **Dependencies:** T-001
- **Gates after green:** `spotless:check`, `checkstyle:check`, `compile`, `test`, `jacoco:check`
- **Rollback:** revert commit; T-001 artifacts remain.
- **Notes:**
  - `CustomerRequest` is a Java record; Bean Validation annotations (`@NotBlank`, `@Size`, `@Email`, `@Pattern`) go on record components.
  - `CustomerResponse` is also a record: `(Long id, String firstName, String lastName, String email, String phone, String company)`.
  - `CustomerService` is an interface with a single method: `CustomerResponse create(CustomerRequest request)`.
  - `CustomerServiceImpl` is `@Service`; it is annotated `@Validated` so Spring triggers Bean Validation on `CustomerRequest` when called via the interface. The controller will also use `@Valid`, so validation runs at both layers.
  - `DuplicateEmailException` is an unchecked exception (`RuntimeException`).
  - Bean validation constraint messages should match the spec's exact wording where specified (e.g., "This field is required").

---

### T-003: Customer REST controller + RFC 9457 exception handler

- **AC-IDs:** AC-008 (endpoint saves and returns 201), AC-010 (400 on missing/invalid fields), AC-011 (409 on duplicate email), AC-012 (400 on oversized field), AC-013 (500 on unexpected error)
- **Test-IDs:**
  - T-003-T1: `CustomerControllerTest` — `@WebMvcTest(CustomerController.class)` — happy path (201 + body), validation failure (400 + `errors` array), duplicate email (409 + email field error), unexpected exception (500 + generic detail).
  - T-003-T2: `CustomerControllerIT` — `@SpringBootTest(webEnvironment=RANDOM_PORT)` + Failsafe — end-to-end: POST with valid body returns 201; POST with duplicate email returns 409.
- **Files in scope:**
  - `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerController.java`
  - `sdd-api/src/main/java/com/loiane/sdd/customer/CustomerExceptionHandler.java`
  - `sdd-api/src/test/java/com/loiane/sdd/customer/CustomerControllerTest.java`
  - `sdd-api/src/test/java/com/loiane/sdd/customer/CustomerControllerIT.java`
- **Dependencies:** T-002
- **Gates after green:** `spotless:check`, `checkstyle:check`, `compile`, `test`, `verify`, `jacoco:check`
- **Rollback:** revert commit; T-001 and T-002 artifacts remain.
- **Notes:**
  - `CustomerController` is package-private (`class`, not `public class`).
  - `@PostMapping` returns `ResponseEntity<CustomerResponse>` with `HttpStatus.CREATED`.
  - `CustomerExceptionHandler` uses Spring's native `ProblemDetail` (`org.springframework.http.ProblemDetail`). Custom `errors` property added via `pd.setProperty("errors", errorList)`.
  - Handle `MethodArgumentNotValidException` → 400; `DuplicateEmailException` → 409; `DataIntegrityViolationException` (where message contains email constraint name) → 409 as concurrency fallback (ADR-002); bare `Exception` → 500.
  - The `@WebMvcTest` slice requires `@MockBean CustomerService` since it cannot load the full context.
  - Integration test (`*IT`) uses `TestRestTemplate` or `RestClient`; docker-compose must be running.

---

### T-004: Angular customer model + HTTP service

- **AC-IDs:** AC-008 (HTTP POST triggers save), AC-010 (maps 400 field errors), AC-011 (maps 409 email error), AC-012 (maps 400 field errors), AC-013 (maps 500 to generic error)
- **Test-IDs:**
  - T-004-T1: `CustomerService` unit test with `HttpClientTestingModule` — happy path: POST to `/api/customers` returns `CustomerResponse`; 400 response: observable errors with field list; 409 response: observable errors with email field; 500 response: observable errors with generic flag.
- **Files in scope:**
  - `sdd-ui/src/app/customer/customer.ts`
  - `sdd-ui/src/app/customer/customer-service.ts`
  - `sdd-ui/src/app/customer/customer-service.spec.ts`
- **Dependencies:** T-003 (API contract must be agreed before service is coded)
- **Gates after green:** `prettier --check`, `ng build`, `vitest run`
- **Rollback:** revert commit.
- **Notes:**
  - `customer.ts` exports: `CustomerRequest`, `CustomerResponse`, `ApiFieldError`, `ApiProblem` interfaces.
  - `CustomerService` is `@Injectable({ providedIn: 'root' })`. Method signature: `create(request: CustomerRequest): Observable<CustomerResponse>`.
  - Error responses are caught in the service via `catchError`; the service re-throws a typed error object (or a custom `CustomerApiError` class) so the component can distinguish 400/409/500 without parsing HTTP status again.
  - Use `HttpClient.post<CustomerResponse>('/api/customers', request, { observe: 'response' })` to get the status code if needed for the 201 check.

---

### T-005: Angular create-customer form — structure + client-side validation + routing

- **AC-IDs:** AC-001 (form displays all five fields), AC-002 (submit disabled until required fields valid), AC-003 (required field inline error), AC-004 (name format inline error), AC-005 (email format inline error), AC-006 (phone format inline error), AC-007 (error removed when field corrected)
- **Test-IDs:**
  - T-005-T1: `CustomerCreateComponent` unit tests — form renders with all five fields; submit button disabled when form invalid; required-field error appears after blur on blank First Name/Last Name/Email; format error on First Name with digit; format error on Email with invalid string; format error on Phone with `#`; error disappears when field value is corrected.
- **Files in scope:**
  - `sdd-ui/src/app/customer/customer-create/customer-create.ts`
  - `sdd-ui/src/app/customer/customer-create/customer-create.html`
  - `sdd-ui/src/app/customer/customer-create/customer-create.scss`
  - `sdd-ui/src/app/customer/customer-create/customer-create.spec.ts`
  - `sdd-ui/src/app/customer/customer.routes.ts`
  - `sdd-ui/src/app/app.routes.ts`
- **Dependencies:** T-004 (model types; service injected but stubbed in this task's tests)
- **Gates after green:** `prettier --check`, `ng build`, `vitest run`
- **Rollback:** revert commit.
- **Notes:**
  - Use Angular `ReactiveFormsModule`; `FormGroup` with `FormControl` per field.
  - Validators: `firstName`/`lastName` → `[Validators.required, Validators.maxLength(100), Validators.pattern(/^[\p{L}\-']+$/u)]`; `email` → `[Validators.required, Validators.maxLength(255), Validators.email]`; `phone` → `[Validators.maxLength(20), Validators.pattern(/^[0-9 +()\-]*$/)]`; `company` → `[Validators.maxLength(150)]`.
  - Submit button: `[disabled]="form.invalid"`.
  - Inline errors: use `*ngIf="control.hasError('required') && control.touched"` (or Angular 17+ `@if`).
  - `customer.routes.ts` exports `customerRoutes: Routes = [{ path: 'new', component: CustomerCreate }]`.
  - `app.routes.ts`: add `{ path: 'customers', loadChildren: () => import('./customer/customer.routes').then(m => m.customerRoutes) }`.
  - Styling: use Angular Material `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`.
  - This task does NOT wire the HTTP call — the form's submit handler is a stub (`onSubmit(): void {}`); wired in T-006.

---

### T-006: Angular HTTP integration, server error mapping, and success flow

- **AC-IDs:** AC-008 (submit calls service and triggers save), AC-009 (snackbar on success + navigate), AC-010 (400 field errors displayed on correct fields), AC-011 (409 email error displayed on Email field), AC-012 (400 length error displayed on correct field), AC-013 (500 generic snackbar, form preserved)
- **Test-IDs:**
  - T-006-T1: `CustomerCreateComponent` integration tests with real `CustomerService` stub (spy or `jasmine.createSpyObj` / Vitest mock) — submit with valid data: `CustomerService.create` called once, snackbar opened, router navigated to `/customers`; 400 response: field-level errors appear on the correct form controls; 409 response: Email field shows "already in use" error; 500 response: generic snackbar shown, form values preserved.
- **Files in scope:**
  - `sdd-ui/src/app/customer/customer-create/customer-create.ts` (update — wire `onSubmit`)
  - `sdd-ui/src/app/customer/customer-create/customer-create.spec.ts` (update — add HTTP integration tests)
  - `sdd-ui/src/app/app.config.ts` (update — add `provideHttpClient()`, `provideAnimationsAsync()`)
- **Dependencies:** T-005
- **Gates after green:** `prettier --check`, `ng build`, `vitest run`
- **Rollback:** revert commit.
- **Notes:**
  - `onSubmit()` calls `this.customerService.create(this.form.value as CustomerRequest)`.
  - On success: `this.snackBar.open('Customer created successfully', 'Close', { duration: 3000 }); this.router.navigate(['/customers'])`.
  - On 400: iterate `error.errors`, call `this.form.get(fieldName)?.setErrors({ serverError: message })` for each field.
  - On 409: `this.form.get('email')?.setErrors({ serverError: 'This email address is already in use' })`.
  - On 500: `this.snackBar.open('An unexpected error occurred. Please try again later.', 'Close')` — do NOT reset the form.
  - Inject `MatSnackBar` and `Router` via constructor.
  - `app.config.ts` must include `provideHttpClient()` for `HttpClient` to be injectable and `provideAnimationsAsync()` for `MatSnackBar` animations.

---

## Cross-cutting items (handled in Phase 5)

- ArchUnit rule: `slices().matching("com.loiane.sdd.(*)..").should().beFreeOfCycles()` — enforces no cross-feature cycles (ADR-001).
- OpenAPI contract test: once SpringDoc is added, validate generated spec against the sketch in `03-design.md`.
- Property-based tests: consider for `CustomerRequest` pattern validators (random string generation).

## Open Questions

- (none)

## Resolved Questions

- (none required at task level)

## Sign-off

- [x] Every AC from `01-spec.md` is covered by at least one task (see AC Coverage Matrix).
- [x] Every task has Test-IDs and Files-in-scope.
- [x] Every task that touches `src/main/**` has at least one `src/test/**` file in scope.
- [x] All `Q-NNN` resolved or deferred-with-rationale.
- [ ] Reviewed by user on <!-- YYYY-MM-DD -->.
