# ADR-001: Feature-scoped package structure (flat feature package)

- **Status:** accepted (updated 2026-05-11 — supersedes original api/internal decision)
- **Date:** 2026-05-09 (updated: 2026-05-11)
- **Deciders:** loiane, `spring-architect`
- **Consulted:** —
- **Informed:** —

## Context and problem statement

The `sdd-api` codebase is greenfield — only `com.loiane.sdd.SddApplication` exists. Before writing the first real class, a package convention must be established. The convention determines how many layers are named, how cross-feature dependencies are governed, and how future ArchUnit rules can be expressed uniformly.

An initial decision (2026-05-09) chose an `api`/`internal` sub-package split within each feature. After implementing T-001 the user decided the sub-package split adds ceremony without benefit at this scale — a flat feature package is simpler and still supports ArchUnit cycle detection between features.

## Decision drivers

- Encapsulation: implementation details should not leak across feature boundaries.
- Scalability: the convention must work as additional features are added.
- Testability: `@WebMvcTest`, `@DataJpaTest`, and `@SpringBootTest` slices must load only the classes they need.
- ArchUnit enforceability: inter-feature cycles must be checkable with a single rule.
- Simplicity: no unnecessary package depth for a single-developer greenfield project.

## Considered options

1. **Feature-scoped packages with `api` / `internal` split** — each top-level feature owns `com.loiane.sdd.<feature>.api` (published surface) and `com.loiane.sdd.<feature>.internal` (private implementation).
2. **Layer-scoped packages** — `com.loiane.sdd.controller`, `com.loiane.sdd.service`, `com.loiane.sdd.repository`, etc.
3. **Flat feature package** — all classes in `com.loiane.sdd.<feature>` directly, with optional sub-packages (`repository`, `service`, `controller`, `dto`) added only when the feature grows large enough to warrant splitting.

## Decision outcome

Chosen option: **Option 3 — flat feature package**, because the `api`/`internal` split was deemed unnecessary overhead at this project size. Inter-feature encapsulation is still enforced by ArchUnit's cycle-free slice rule; Java package-private visibility (`class`, not `public class`) keeps internal classes out of the IDE autocomplete surface without requiring a separate sub-package.

For the `customer` feature this produces:

```
com.loiane.sdd.customer
  Customer                 (JPA entity — package-private)
  CustomerRepository       (Spring Data — package-private)
  CustomerRequest          (record — package-private)
  CustomerResponse         (record — package-private)
  CustomerService          (interface — package-private)
  CustomerServiceImpl      (implementation — package-private)
  CustomerController       (REST adapter — package-private)
  CustomerExceptionHandler (RFC 9457 advice — package-private)
  DuplicateEmailException  (domain exception — package-private)
```

Optional sub-packages (`repository`, `service`, `controller`, `dto`) may be introduced when the feature grows large enough to warrant splitting.

### Consequences

- Positive: simpler directory tree; less ceremony; no sub-package discipline required for small features.
- Positive: Java package-private still enforces visibility without an extra package layer.
- Positive: ArchUnit `slices().matching("com.loiane.sdd.(*)..").should().beFreeOfCycles()` still enforces inter-feature isolation.
- Negative / trade-offs: no ArchUnit rule prevents cross-feature calls within the same package; must rely on code review + cycle detection.

## Pros and cons of the options

### Option 1 — feature + api/internal

- Pro: enforces encapsulation at the package level; ArchUnit rule is trivial.
- Con: deeper package nesting; requires discipline when adding cross-cutting utilities; overhead for small features.

### Option 2 — layer-scoped

- Pro: familiar to developers from classic Spring tutorials.
- Con: impossible to prevent cross-feature coupling; layers cut across business concerns; hard to modularize later.

### Option 3 — flat feature package (chosen)

- Pro: zero ceremony for small features; package-private visibility still hides internals from the IDE.
- Pro: ArchUnit cycle rule still enforces inter-feature isolation.
- Con: no sub-package enforcement of internal vs. published surface within a feature.

## Links

- Related ADRs: ADR-002
- Source: `.specs/2026-05-09-create-new-customer/01-spec.md`
- Supersedes: original ADR-001 decision (2026-05-09)
