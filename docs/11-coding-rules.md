# Coding Rules

## Purpose

This document defines the engineering principles and coding standards used throughout the project.

Its purpose is to ensure that all contributors, including AI assistants, produce code that is:

- maintainable;
- predictable;
- testable;
- secure;
- production-ready.

These rules apply to every part of the codebase unless explicitly documented otherwise.

---

# Living Document

This document evolves together with the project.

Whenever a recurring coding issue is identified, the corresponding rule should be added here.

Implementation should always follow the latest version of this document.

---

# General Principles

Every piece of code should satisfy the following goals:

- readability;
- simplicity;
- maintainability;
- correctness;
- explicitness;
- consistency.

Code is read far more often than it is written.

Always optimize for future readability.

---

# Production Ready

Every commit should be considered production-quality.

Temporary solutions are prohibited.

Examples include:

- TODO implementations without tracking;
- placeholder logic;
- "temporary" workarounds;
- unfinished branches of execution.

If a temporary solution is unavoidable, it must be explicitly documented.

---

# Simplicity

Prefer the simplest solution that fully satisfies the requirements.

Avoid unnecessary abstractions.

Avoid solving problems that do not yet exist.

---

# Single Responsibility

Every function, class and module should have one clear responsibility.

If a component performs multiple unrelated tasks, it should be split.

---

# Explicit Code

Code should be easy to understand without additional explanation.

Avoid hidden behavior.

Prefer explicit logic over clever solutions.

Readable code is preferred over shorter code.

---

# Type Safety

TypeScript should be used to its full potential.

Requirements:

- avoid `any`;
- prefer precise types;
- use discriminated unions where appropriate;
- use enums or literal unions intentionally;
- define interfaces or type aliases for business models.

If `any` is absolutely necessary, the reason must be documented.

---

# Naming

Names should clearly communicate intent.

Good names describe responsibility.

Avoid:

- vague names;
- unnecessary abbreviations;
- numbered variables;
- meaningless suffixes.

Examples of discouraged names:

- data
- info
- obj
- temp
- helper2
- utils_new

---

# Functions

Functions should:

- perform one task;
- have descriptive names;
- remain reasonably small;
- avoid unnecessary side effects.

If a function becomes difficult to understand, split it.

---

# Components

UI components should remain focused on presentation.

Business logic should remain outside UI whenever practical.

Reusable components should avoid knowledge of specific business workflows.

---

# Business Logic

Business logic belongs only where architecture defines it.

Business rules must never be duplicated.

Frontend should never implement Backend business decisions.

---

# API Communication

HTTP requests should remain isolated inside the API layer.

Components should never perform direct network communication.

API implementation details should not leak into UI.

---

# State Management

Store only the minimum required state.

Avoid duplicated state.

Derived state should be calculated instead of stored whenever practical.

---

# Error Handling

Errors should never be ignored.

Every recoverable error should be handled.

Unexpected failures should be logged appropriately.

User-facing messages should remain understandable.

Internal implementation details must never be exposed.

---

# Validation

Never trust external input.

Validation belongs at system boundaries.

Frontend validation improves user experience.

Backend validation guarantees correctness.

---

# Security

Security-related code must prioritize correctness over convenience.

Sensitive information must never:

- appear in logs;
- be exposed to Frontend;
- be hardcoded;
- be committed to version control.

---

# Duplication

Avoid code duplication whenever practical.

Before introducing new logic, check whether equivalent functionality already exists.

Shared behavior should be extracted only when it genuinely becomes shared.

Premature abstraction should be avoided.

---

# Dependencies

Every dependency should have a clear purpose.

Avoid introducing libraries for problems already solved by the existing codebase or the language itself.

Large dependencies require strong justification.

---

# Comments

Code should explain itself whenever possible.

Comments should explain:

- why;
- architectural decisions;
- non-obvious behavior.

Comments should not repeat what the code already says.

Outdated comments should be removed immediately.

---

# Dead Code

Unused code should not remain in the repository.

Examples include:

- unused functions;
- unreachable branches;
- obsolete files;
- commented-out implementations.

Version control preserves history.

The repository should contain only active code.

---

# Constants

Magic values should be avoided.

Meaningful constants improve readability.

Configuration belongs outside application logic whenever practical.

---

# Configuration

Configuration values should never be hardcoded.

Environment-specific behavior should remain configurable.

---

# Imports

Imports should remain organized and predictable.

Avoid unnecessary dependencies between unrelated modules.

Circular dependencies are prohibited.

---

# File Size

Files should remain reasonably small.

Very large files usually indicate multiple responsibilities.

When a file becomes difficult to navigate, consider splitting it.

There is no strict line limit, but readability always has priority.

---

# Folder Organization

Directory structure should reflect architecture rather than implementation details.

Related functionality should remain close together.

---

# Logging

Logs should provide operational value.

Logging should never expose:

- passwords;
- tokens;
- secrets;
- confidential user information.

Sensitive information should always be sanitized.

---

# Performance

Write correct code before optimizing.

Optimization should be based on measurable evidence.

Avoid premature optimization.

---

# Testing

New code should be designed with testing in mind.

Code should remain deterministic whenever practical.

Business logic should be isolated from infrastructure.

---

# Refactoring

Refactoring should improve:

- readability;
- maintainability;
- consistency.

Refactoring must not change business behavior unless explicitly intended.

---

# Documentation

Architectural changes require documentation updates.

Code and documentation should remain synchronized.

Documentation is considered part of the project.

---

# Pull Request Mindset

Every change should answer:

- Why is this change necessary?
- Is there a simpler solution?
- Does this follow project architecture?
- Does this introduce duplication?
- Does this create hidden complexity?
- Can another developer understand this quickly?

---

# AI Compatibility

Code should be understandable by both humans and AI assistants.

Prefer:

- explicit naming;
- small modules;
- predictable structure;
- clear responsibilities;
- strong typing.

Well-structured code improves future development.

---

# Relationship With Other Documents

These rules complement:

- Architecture
- Security
- Backend Architecture
- Frontend Architecture
- Project Structure
- Technology Stack

If implementation conflicts with these documents, architecture has higher priority.

---

# Out of Scope

This document intentionally does not define:

- formatting style;
- lint configuration;
- prettier configuration;
- framework-specific conventions;
- package manager configuration.

These topics are implementation details.

---

# Future Evolution

Coding standards should evolve together with the project.

New rules should be added only when they solve recurring engineering problems.

The objective is not to create more rules, but to improve code quality while keeping development predictable, maintainable and scalable.