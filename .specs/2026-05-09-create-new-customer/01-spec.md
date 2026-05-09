# Spec: 2026-05-09-create-new-customer — Create New Customer

> Owner: `spring-spec-author` · Phase 1 · Template: `.claude/templates/spec.template.md`
>
> **No invention.** If something is not in the source ticket, the conversation, or the codebase, log it as a `Q-NNN` and ask the user.

## Source

- Tracker: GitHub
- ID: loiane/sdd-spring-angular-example#1
- URL: https://github.com/loiane/sdd-spring-angular-example/issues/1
- Snapshot date: 2026-05-09
- Snapshot summary:
  > **Create New Customer** — As a sales or support user, I want to create a new customer from the application so that I can register customer data consistently and see validation errors before the record is saved.

## Goal

A sales or support user can open a Create Customer form, fill in contact details, and save the new record. The system enforces all field-level validation rules both in the browser (for immediate feedback) and on the server (for integrity guarantees), and it prevents duplicate email addresses across all customers. On a successful save the user receives a confirmation and is routed away from the form; on any error the user stays on the form with actionable error messages so no entered data is lost.

## Acceptance Criteria

### Form rendering

- AC-001: When a user navigates to the Create Customer page, the system shall display a form with the fields: First Name, Last Name, Email, Phone, and Company.
- AC-002: When a user navigates to the Create Customer page, the system shall display a submit button that is disabled until First Name, Last Name, and Email pass client-side validation.

### Inline field validation (client-side)

- AC-003: While a user leaves First Name, Last Name, or Email blank and moves focus away from that field, the system shall display an inline "This field is required" error adjacent to that field.
- AC-004: While a user enters a value in First Name or Last Name that contains digits or disallowed characters, the system shall display an inline format error without submitting the form.
- AC-005: While a user enters a value in Email that is not a valid email format, the system shall display an inline "Invalid email address" error without submitting the form.
- AC-006: While a user enters a value in Phone that contains characters other than digits, spaces, `+`, `(`, `)`, or `-`, the system shall display an inline format error without submitting the form.
- AC-007: When a user corrects a previously invalid field, the system shall immediately remove the inline error message for that field.

### Saving the record

- AC-008: When a user submits the form with all valid data, the system shall save the new customer record.
- AC-009: When the record is saved successfully, the system shall display a success confirmation and navigate the user to the customer list page.

### Validation errors on save (server-side)

- AC-010: When the user submits the form and a required field is missing, the system shall not save the record and shall display an error message identifying which fields need to be filled in.
- AC-011: When the user submits a form with an email that already belongs to another customer, the system shall not save the record and shall display an error message on the Email field indicating it is already in use.
- AC-012: When the user submits a form with a field value that is too long, the system shall not save the record and shall display an error message on the offending field.
- AC-013: When an unexpected error occurs during save, the system shall display a generic error message and keep the user on the form so no data is lost.

## Field Constraints Reference

| Field      | Required | Max length | Allowed characters / format                       |
|------------|----------|------------|---------------------------------------------------|
| First Name | yes      | 100        | Letters, hyphens, apostrophes; no digits          |
| Last Name  | yes      | 100        | Letters, hyphens, apostrophes; no digits          |
| Email      | yes      | 255        | Valid email format; unique across all customers   |
| Phone      | no       | 20         | Digits, spaces, `+`, `(`, `)`, `-` only           |
| Company    | no       | 150        | Free text                                         |

## Domain Entities and Relationships

### Entities

- **Customer** — purpose: represents a registered contact associated with a business; key business attributes: first name, last name, email (unique identifier within the system), phone (optional), company (optional).

### Relationships

- **Customer** is a standalone entity in this story. No relationships to other entities are in scope.

## Non-Goals

- Editing or updating an existing customer record.
- Deleting or archiving a customer.
- Searching or listing customers.
- Address, job title, or notes fields (deferred to a future story).
- Bulk / CSV import.
- Customer self-registration.

## Glossary

- **Customer** — a person or organization registered in the system with at minimum a name and email address.
- **Sales or support user** — the internal application user role that has access to create and manage customer records.
- **Client-side validation** — validation rules evaluated in the browser before the form is submitted to the server.
- **Server-side validation** — validation rules evaluated by the backend API when it receives a create-customer request.
- **Inline error** — a validation message rendered immediately adjacent to the field it describes, visible without scrolling or navigating.
- **Duplicate email** — an email address already stored for a different customer record.

## Assumptions

> Only assumptions explicitly stated by the user or the source ticket. The agent never adds assumptions silently.

- (none)

## Out-of-Band Inputs

> Anything provided by the user during the spec session that is not in the source ticket.

- (none)

## Open Questions

- (none — all questions resolved)

## Proposed API Contract

> Proposed per Q-002 resolution. Treat as accepted unless the user raises an objection before `/plan`.

**Endpoint:** `POST /api/customers`

**Request body** (`application/json`):

```json
{
  "firstName": "Jane",
  "lastName":  "Doe",
  "email":     "jane.doe@example.com",
  "phone":     "+1 (555) 123-4567",
  "company":   "Acme Corp"
}
```

`phone` and `company` are optional (may be omitted or `null`).

**Success — `201 Created`** (`application/json`):

```json
{
  "id":        1,
  "firstName": "Jane",
  "lastName":  "Doe",
  "email":     "jane.doe@example.com",
  "phone":     "+1 (555) 123-4567",
  "company":   "Acme Corp"
}
```

**Validation failure — `400 Bad Request`** (`application/problem+json`, RFC 9457):

```json
{
  "type":   "https://example.com/problems/validation-error",
  "title":  "Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation.",
  "errors": [
    { "field": "firstName", "message": "This field is required" },
    { "field": "email",     "message": "Invalid email address" }
  ]
}
```

**Duplicate email — `409 Conflict`** (`application/problem+json`, RFC 9457):

```json
{
  "type":   "https://example.com/problems/duplicate-email",
  "title":  "Email Already in Use",
  "status": 409,
  "detail": "The provided email address is already associated with another customer.",
  "errors": [
    { "field": "email", "message": "This email address is already in use" }
  ]
}
```

**Unexpected error — `500 Internal Server Error`** (`application/problem+json`, RFC 9457):

```json
{
  "type":   "https://example.com/problems/internal-error",
  "title":  "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred. Please try again later."
}
```

## Non-Functional Requirements

- **Latency:** The save action shall complete in under 500 ms at P95, measured end-to-end (from client form submission to the browser receiving the server response).
- **Uniqueness:** Email addresses shall be unique across all customer records; uniqueness shall be enforced at the database level.
- **Data integrity:** Required field and length constraints shall be enforced at both the client and the server independently.

## Resolved Questions

- Q-001 *(2026-05-09)* — Navigation target after successful save is **deferred**. AC-009's reference to "the customer list page" is retained as-is; the Angular route (`/customers`) will be wired when the Customer List story is implemented. No stub page is required for this story.
  - User input: *"ignore it for now"*

- Q-002 *(2026-05-09)* — API contract proposed (see **Proposed API Contract** section above): `POST /api/customers`, `201 Created` on success, RFC 9457 `application/problem+json` for `400`/`409`/`500` errors with a field-level `errors` array.
  - User input: *"make a suggestion"*

- Q-003 *(2026-05-09)* — Success confirmation (AC-009) shall use a **snackbar/toast** (Angular Material `MatSnackBar`), auto-dismissed after a short delay.
  - User input: *"snackbar is ok for this example"*

- Q-004 *(2026-05-09)* — Authentication and authorization are **out of scope** for this story. No Spring Security configuration or Angular route guards are required.
  - User input: *"out of scope for now"*

- Q-005 *(2026-05-09)* — The 500 ms P95 latency NFR is measured **end-to-end** (client form submission → browser receives server response).
  - User input: *"yes"*

## Sign-off

- [ ] All AC are atomic and testable.
- [ ] All `Q-NNN` are resolved or explicitly deferred-with-rationale.
- [ ] Source recorded.
- [ ] Reviewed by user on <!-- YYYY-MM-DD -->.
