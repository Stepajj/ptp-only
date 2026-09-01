# Technology Stack

## Purpose

This document describes the preferred technology stack for the OP2P White Label project.

Its purpose is to explain the role of each technology category rather than enforce specific implementations.

Architecture always has higher priority than technology choices.

---

# Living Document

This document is expected to evolve during the project.

Technologies may be replaced when there is a clear technical benefit.

Changing a technology does not imply changing the architecture.

Whenever the stack changes significantly, this document should be updated.

---

# Technology Neutrality

This document describes preferred technologies, not mandatory ones.

The presence of a technology in this document does **not** require replacing an already working implementation.

AI assistants must never rewrite existing project code solely to match this document.

If the current implementation satisfies the project architecture and quality requirements, it should be preserved.

Technology changes should always be intentional and explicitly requested.

---

# Selection Principles

Every technology should satisfy most of the following goals:

- reliability;
- maintainability;
- long-term support;
- strong ecosystem;
- production readiness;
- TypeScript support;
- active community;
- good documentation.

Popularity alone is not a sufficient reason for adoption.

---

# Programming Language

Preferred:

- TypeScript

Reason:

Type safety, maintainability, developer experience and ecosystem support.

Equivalent alternatives may be used only when justified.

---

# Frontend Framework

Preferred category:

- React ecosystem

Typical implementations may include:

- React
- Next.js
- other React-based frameworks

Framework choice should not affect the overall project architecture.

---

# Backend Framework

Preferred category:

Modern TypeScript backend frameworks.

Possible examples include:

- Express
- Fastify
- NestJS
- Hono

The framework may change without affecting business logic or architecture.

---

# Database

Preferred category:

Relational database systems.

Typical examples include:

- PostgreSQL
- MySQL

The selected database should support:

- transactions;
- constraints;
- indexing;
- production workloads.

---

# ORM / Database Access

Preferred category:

Type-safe data access.

Possible examples include:

- Prisma
- Drizzle ORM
- TypeORM
- native SQL abstraction

The persistence layer should remain isolated from business logic.

---

# Authentication

Preferred approach:

Modern token-based authentication.

Possible implementations may include:

- JWT
- secure session cookies
- hybrid authentication strategies

Authentication implementation may evolve without changing application architecture.

---

# API Communication

Preferred category:

REST-based communication.

The transport mechanism may change if project requirements evolve.

Internal architecture should remain independent from transport protocols.

---

# HTTP Client

Preferred category:

Modern HTTP clients with strong TypeScript support.

Possible examples include:

- Fetch API
- Axios

Implementation choice should remain localized within the API layer.

---

# Validation

Preferred category:

Runtime schema validation with TypeScript integration.

Possible implementations include:

- Zod
- Valibot
- Yup

Validation strategy is more important than the specific library.

---

# State Management

Preferred category:

Lightweight predictable state management.

Possible implementations include:

- Zustand
- Redux Toolkit
- Context API
- other suitable solutions

Global state should remain minimal.

---

# Server State

Preferred category:

Dedicated server state management.

Possible implementations include:

- TanStack Query
- SWR

Server state should remain separate from application state.

---

# Styling

Preferred category:

Component-oriented styling.

Possible implementations include:

- CSS Modules
- Tailwind CSS
- SCSS
- other maintainable approaches

Styling methodology may evolve independently.

---

# Forms

Preferred category:

Reusable form management.

Possible implementations include:

- React Hook Form
- Formik
- native controlled forms

Form implementation should remain independent of business logic.

---

# File Upload

Preferred approach:

Native browser upload combined with Backend validation.

Implementation details depend on project requirements.

---

# Testing

Preferred categories:

- unit testing;
- integration testing;
- end-to-end testing.

Specific frameworks may change over time.

---

# Logging

Preferred category:

Structured logging.

Implementation depends on the deployment environment.

Sensitive information must never appear in logs.

---

# Documentation

Preferred format:

Markdown.

Documentation is treated as part of the source code.

Architecture documentation has higher priority than implementation comments.

---

# Development Environment

Preferred characteristics:

- reproducible;
- automated;
- easy onboarding;
- cross-platform.

Specific tooling may evolve.

---

# Build Tools

Preferred category:

Modern JavaScript build tooling.

Possible implementations include:

- Vite
- Turbopack
- Webpack

Selection depends on project requirements.

---

# Package Manager

Preferred category:

Modern JavaScript package managers.

Possible examples include:

- npm
- pnpm
- yarn

The selected package manager should be used consistently throughout the project.

---

# Version Control

Preferred:

Git.

The branching strategy is documented separately.

---

# Deployment

Deployment tooling depends on the target infrastructure.

Examples may include:

- Docker
- cloud platforms
- VPS
- CI/CD pipelines

Deployment strategy remains independent from application architecture.

---

# External Integrations

The project communicates with external providers through Backend.

Integration technologies should remain isolated from application business logic.

Replacing an external provider should require minimal architectural changes.

---

# Dependency Management

Dependencies should be selected carefully.

Every new dependency should provide clear value.

Unnecessary dependencies should be avoided.

Replacing a dependency should have minimal impact on the rest of the project.

---

# Relationship With Other Documents

This document complements:

- Architecture
- Backend Architecture
- Frontend Architecture
- Project Structure

Technology choices should never contradict architectural principles.

---

# Out of Scope

This document intentionally does not define:

- exact package versions;
- mandatory libraries;
- project configuration files;
- implementation details;
- coding conventions.

These topics are documented separately.

---

# Future Evolution

The technology stack is expected to evolve.

Future decisions should prioritize:

- maintainability;
- security;
- stability;
- developer productivity;
- compatibility with the existing architecture.

Technology should serve the architecture, never replace it.