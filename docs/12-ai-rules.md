# AI Development Guidelines

## Purpose

This document defines how AI assistants should behave while working on this project.

It is not a coding style guide.

It is a development workflow describing how AI should analyze problems, make decisions, generate code and update documentation.

These rules apply to every AI assistant contributing to the repository.

---

# Primary Objective

The primary objective is **not** to generate code quickly.

The primary objective is to help maintain a production-quality codebase.

Correctness, maintainability and consistency are always more important than speed.

---

# Project First

Every decision must consider the project as a whole.

Never optimize one file at the expense of the overall architecture.

Always preserve consistency across the entire repository.

---

# Documentation First

Before implementing any architectural change:

1. Read the relevant documentation.
2. Verify that the proposed implementation matches the documented architecture.
3. If the documentation is outdated, update the documentation first.
4. Only then implement the change.

Documentation is considered the primary source of truth.

---

# Think Before Coding

Never immediately start generating code.

First understand:

- the problem;
- the architecture;
- the affected modules;
- possible side effects;
- existing implementations.

Code generation begins only after sufficient understanding.

---

# Prefer Existing Solutions

Before creating:

- a new function;
- a new component;
- a new service;
- a new helper;
- a new type;
- a new utility;

search the project for an existing implementation.

Avoid duplication.

---

# Minimal Changes

Modify only what is necessary.

Do not rewrite unrelated files.

Do not reformat the project.

Do not rename modules without reason.

Do not introduce large refactors while implementing unrelated features.

Small focused changes are preferred.

---

# Preserve Architecture

Never change the architecture without explicit instruction.

Examples include:

- changing project structure;
- moving business logic between layers;
- introducing new architectural patterns;
- replacing core technologies.

Architecture evolves intentionally, never accidentally.

---

# Respect Module Boundaries

Every module has a defined responsibility.

Never move business logic into presentation layers.

Never bypass architectural layers.

Never introduce hidden dependencies.

---

# Do Not Guess

When important information is missing:

ask.

Never invent:

- business rules;
- API behavior;
- database schema;
- security requirements;
- user expectations.

Reasonable assumptions are acceptable only when explicitly identified as assumptions.

---

# Security Awareness

Treat security as a default concern.

Never expose:

- secrets;
- tokens;
- credentials;
- internal identifiers;
- sensitive configuration.

Never weaken security for implementation convenience.

---

# Strong Typing

Always preserve type safety.

Avoid:

- any;
- unsafe casting;
- disabling type checking.

Types should communicate intent.

---

# Keep Code Readable

Readable code is preferred over clever code.

Prefer:

- descriptive names;
- explicit logic;
- small functions;
- isolated responsibilities.

Future maintainability has priority.

---

# Avoid Premature Abstraction

Do not build generic frameworks before they are needed.

Solve today's problem well.

Generalize only after repeated use cases emerge.

---

# Avoid Overengineering

Do not introduce complexity without measurable benefit.

Choose the simplest solution that fully satisfies the requirements.

---

# Do Not Remove Unknown Code

If existing code is not understood:

do not delete it.

Investigate first.

Only remove code when its purpose is fully understood.

---

# Preserve Business Behavior

Refactoring must not change observable behavior unless explicitly requested.

Improving structure should not alter functionality.

---

# External Integrations

Never assume external APIs behave differently from their documentation.

If documentation is unclear:

highlight uncertainty.

Do not invent provider behavior.

---

# Error Handling

Never silently ignore errors.

Unexpected situations should be:

- detected;
- handled;
- logged appropriately.

Error handling is part of the implementation, not an optional enhancement.

---

# Logging

Log meaningful events.

Never log sensitive information.

Logs should assist debugging without leaking confidential data.

---

# Documentation Synchronization

Whenever architecture, behavior or workflow changes:

review whether documentation must also change.

Implementation and documentation should remain synchronized.

---

# Explain Trade-offs

When multiple reasonable solutions exist:

briefly explain:

- advantages;
- disadvantages;
- reasons for the selected approach.

Engineering decisions should remain understandable.

---

# Performance

Correctness comes first.

Optimize only after identifying a measurable need.

Avoid speculative optimization.

---

# Dependencies

Before adding a dependency ask:

- Is it necessary?
- Does the project already solve this problem?
- Can the language solve it?
- Is the maintenance cost justified?

Minimize dependency growth.

---

# Consistency

When modifying existing code:

follow the project's established patterns.

Do not introduce a different style inside the same project.

Consistency is more valuable than personal preference.

---

# Large Tasks

Large features should be implemented incrementally.

Each step should leave the project in a working state.

Avoid combining unrelated changes into a single implementation.

---

# Self Review

Before considering work complete, review the result.

Check:

- architecture;
- type safety;
- duplication;
- naming;
- security;
- documentation;
- unnecessary complexity.

Correct obvious issues before finishing.

---

# If Unsure

When uncertainty remains:

state it clearly.

Never present assumptions as facts.

Transparency is preferred over false confidence.

---

# Relationship With Other Documents

This document complements:

- Project Overview
- Architecture
- Security
- Domain Model
- API Integration
- Database Design
- Backend Architecture
- Frontend Architecture
- Project Structure
- Technology Stack
- Coding Rules

If conflicts occur, project documentation has higher priority than generated code.

---

# Future Evolution

These guidelines are expected to evolve together with the project.

Whenever recurring AI mistakes are identified, new rules should be added.

The objective is continuous improvement rather than increasing the number of rules.

---

# Final Principle

The AI assistant is a contributor to the project, not its architect.

Its responsibility is to implement the documented architecture faithfully, maintain consistency, protect security, minimize unnecessary changes and assist developers in building a production-quality system.