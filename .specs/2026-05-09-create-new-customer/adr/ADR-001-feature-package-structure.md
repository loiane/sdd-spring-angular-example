# ADR-001: Feature-scoped package structure (api / internal)

- **Status:** accepted
- **Date:** 2026-05-09
- **Deciders:** loiane, `spring-architect`
- **Consulted:** —
- **Informed:** —

## Context and problem statement

The `sdd-api` codebase is greenfield — only `com.loiane.sdd.SddApplication` exists. Before writing the first real class, a package convention must be established. The convention determines how many layers are named, how cross-feature dependencies are governed, and how future ArchUnit rules can be expressed uniformly.

## Decision drivers

- Encapsulation: internal implementation details must not be imported by other features.
- Scalability: the convention must work as additional features (e.g., orders, products) are added.
- Testability: `@WebMvcTest`, `@DataJpaTest`, and `@SpringBootTest` slices must be able to load only the classes they need.
- ArchUnit enforceability: the boundary between `api` and `internal` sub-packages must be checkable with a single rule.

## Considered options

1. **Feature-scoped packages with `api` / `internal` split** — each top-level feature owns `com.loiane.sdd.<feature>.api` (published surface) and `com.loiane.sdd.<feature>.internal` (private implementation).
2. **Layer-scoped packages** — `com.loiane.sdd.controller`, `com.loiane.sdd.service`, `com.loiane.sdd.repository`, etc.
3. **Flat package** — all classes in `com.loiane.sdd`.

## Decision outcome

Chosen option: **Option 1 — feature-scoped packages with `api` / `internal` split**, because it is the only option that allows ArchUnit to enforce inter-feature boundaries and hide implementation details as the codebase grows.

For the `customer` feature this produces:

```
com.loiane.sdd.customer.api
  CustomerService          (interface — published)
  CustomerRequest          (record — published)
  CustomerResponse         (record — published)

com.loiane.sdd.customer.internal
  Customer                 (JPA entity — private)
  CustomerRepository       (Spring Data — private)
  CustomerServiceImpl      (implementation — private)
  CustomerController       (REST adapter — private)
  CustomerExceptionHandler (RFC 9457 advice — private)
  DuplicateEmailException  (domain exception — private)
```

### Consequences

- Positive: clear ownership boundary; external features call `CustomerService` only; ArchUnit rule `noClasses().that().resideInAPackage("..internal..").should().beAccessedByClassesOutside(…)` is straightforward.
- Negative / trade-offs: slightly more directory depth than a flat structure; developers must remember to add new classes to the correct sub-package.

## Pros and cons of the options

### Option 1 — feature + api/internal

- Pro: enforces encapsulation; ArchUnit rule is trivial; aligns with DDD bounded-context thinking.
- Con: deeper package nesting; requires discipline when adding cross-cutting utilities.

### Option 2 — layer-scoped

- Pro: familiar to developers from classic Spring tutorials.
- Con: impossible to prevent cross-feature coupling; layers cut across business concerns; hard to modularize later.

### Option 3 — flat

- Pro: zero ceremony for a tiny app.
- Con: unmanageable at scale; no boundary enforcement possible.

## Links

- Related ADRs: ADR-002
- Source: `.specs/2026-05-09-create-new-customer/01-spec.md`
- Supersedes: —
