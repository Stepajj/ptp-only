# Backend Architecture

## Purpose

This document describes the architecture of the Backend application.

It defines:

- responsibilities of Backend;
- application layers;
- communication between layers;
- dependency rules;
- architectural constraints.

Implementation details may evolve during development, but the architectural principles defined here must remain consistent.

---

# Living Document

This document is expected to evolve throughout the project.

Whenever Backend architecture changes, this document must be updated before implementation.

Implementation should always follow the current architecture.

---

# Backend Responsibilities

Backend is the central component of the system.

Its responsibilities include:

- user authentication;
- authorization;
- session management;
- validation;
- communication with external services;
- database access;
- business orchestration;
- file handling;
- security enforcement;
- error handling;
- logging.

Backend is the only trusted component exposed to the Internet.

---

# Architectural Principles

Backend follows the principles defined by the project documentation.

These include:

- Single Responsibility
- Separation of Concerns
- Security First
- Production Ready
- Documentation First
- Strict Type Safety

Every module must follow these principles.

---

# Layered Architecture

The Backend is organized into logical layers.

```text
HTTP Layer

↓

Controllers

↓

Services

↓

Repositories

↓

Database

↓

External Services
```

Each layer has a single responsibility.

Communication should move downward through the layers.

---

# HTTP Layer

Responsibilities:

- receive HTTP requests;
- route requests;
- apply middleware;
- invoke controllers.

The HTTP layer contains no business logic.

---

# Controllers

Controllers represent the entry point of application logic.

Responsibilities:

- receive validated requests;
- invoke services;
- return responses;
- map HTTP status codes.

Controllers should remain thin.

Controllers must never contain business logic.

---

# Services

Services contain business orchestration.

Responsibilities:

- execute business workflows;
- coordinate repositories;
- coordinate external integrations;
- apply business rules owned by this project.

Services should not depend on HTTP implementation.

---

# Repositories

Repositories are responsible for data persistence.

Responsibilities:

- read data;
- write data;
- abstract database implementation.

Repositories should never contain business logic.

---

# External Integrations

Communication with external systems occurs through dedicated integration modules.

Responsibilities:

- authentication;
- request execution;
- response mapping;
- error normalization;
- retry strategy.

External providers must never be accessed directly from business services.

---

# Validation

Validation occurs before business execution.

Validation includes:

- request structure;
- required fields;
- value constraints;
- permissions.

Invalid requests must never reach business logic.

---

# Authentication

Authentication is handled centrally.

Responsibilities include:

- identity verification;
- session validation;
- token verification;
- session lifecycle.

Authentication logic should never be duplicated.

---

# Authorization

Authorization determines access to protected resources.

Authorization checks occur before business execution.

Every protected operation must verify ownership of requested resources.

---

# Error Handling

Backend exposes one consistent error format.

Responsibilities include:

- mapping internal exceptions;
- mapping external failures;
- safe client responses;
- logging unexpected failures.

Internal implementation details must never be exposed.

---

# Logging

Backend should generate structured logs.

Typical log categories include:

- requests;
- authentication;
- validation;
- external integrations;
- errors;
- security events.

Sensitive information must never appear in logs.

---

# File Processing

Backend is responsible for secure file handling.

Typical responsibilities include:

- validation;
- temporary processing;
- forwarding to external services when required.

Uploaded files should never bypass validation.

---

# Database Access

Only repositories communicate with the database.

Business services should never execute database queries directly.

Database implementation details remain isolated inside the persistence layer.

---

# External API Access

Only dedicated integration modules communicate with external providers.

Neither Controllers nor Services should depend on provider-specific implementations.

Provider-specific details remain isolated.

---

# Dependency Rules

Allowed dependencies:

```text
Controller

↓

Service

↓

Repository

↓

Database
```

and

```text
Service

↓

External Integration
```

Forbidden dependencies include:

- Controller → Database
- Controller → External API
- Repository → HTTP
- Repository → Frontend
- External Integration → Frontend

Layer boundaries must not be violated.

---

# State Management

Backend owns application state related to:

- authentication;
- sessions;
- internal users;
- configuration.

Business state owned by external providers is accessed through integrations.

---

# Transactions

Operations involving multiple persistence steps should maintain consistency.

Transaction strategy depends on implementation technology.

Business workflows should avoid partial completion whenever possible.

---

# Background Tasks

Some operations may execute asynchronously.

Examples include:

- synchronization;
- cleanup;
- scheduled tasks;
- polling external services.

Background execution should remain isolated from request handling.

---

# Configuration

Application configuration should be externalized.

Configuration includes:

- environment variables;
- secrets;
- provider configuration;
- runtime settings.

Configuration values must never be hardcoded.

---

# Extensibility

Backend should support future growth.

Examples include:

- additional providers;
- administration modules;
- notification systems;
- analytics;
- audit functionality.

New modules should integrate without modifying existing architecture.

---

# Relationship With Other Documents

Backend architecture depends on:

- Project Overview
- Architecture
- Security
- Domain Model
- API Integration
- Database Design
- System Flows

Implementation should remain consistent with these documents.

---

# Out of Scope

This document intentionally does not define:

- framework implementation;
- folder structure;
- ORM implementation;
- HTTP library;
- deployment;
- API specification.

These topics are documented separately.

---

# Future Evolution

## Implemented Internal Contracts

The backend exposes authenticated internal adapters for the frontend:

- `GET /support/messages?after_id=<id>` and `POST /support/messages` proxy the documented OnlyP2P support operations.
- `POST /requests/:requestId/proof` validates and forwards the documented multipart proof upload.
- `GET /auth/sessions`, `DELETE /auth/sessions/:sessionId`, and `POST /auth/password` manage backend-owned sessions and password credentials.
- `PATCH /auth/profile` updates backend-owned `displayName` and nullable HTTPS `avatarUrl`; the response returns both custom avatar and Telegram photo separately.
- Telegram linking remains available through `POST /auth/link-telegram`; Telegram unlinking is intentionally absent until the product defines a re-authentication rule for Telegram-only accounts.
- `POST /auth/credentials` atomically adds the first identifier and bcrypt password for an authenticated Telegram-only user. It is rejected for users who already have local credentials.
- Public auth responses expose `telegramLinked` separately from `telegramUsername`, because Telegram usernames are optional.
- Refresh cookies use `SameSite=None` by default in production for a separately hosted frontend/backend pair; set `REFRESH_COOKIE_SECURE=true` in production.

Only the integration module communicates with OnlyP2P. Frontend code never uses `/op2p_api/*` directly.

Proof uploads are held in memory, limited to 25 MB, and accepted only for the documented video/PDF extensions and MIME types.

Backend architecture will evolve during the lifetime of the project.

Changes should preserve:

- architectural consistency;
- security;
- maintainability;
- separation of responsibilities;
- stable public interfaces.

Architecture should evolve by extension rather than redesign whenever possible.
