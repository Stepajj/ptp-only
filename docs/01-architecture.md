# System Architecture

## Purpose

This document describes the high-level architecture of the OP2P White Label project.

It defines the responsibilities of each system component, the interaction between them, architectural boundaries and the rules that must not be violated during development.

This document is considered the primary architectural reference for the project.

---

# High-Level Architecture

The system consists of four logical components.

```text
                User
                  │
                  ▼
        Frontend (React / Next.js)
                  │
           HTTPS / REST API
                  │
                  ▼
        Backend (Express API)
          │                 │
          │                 │
          ▼                 ▼
     PostgreSQL        Only P2P API
```

Each component has a clearly defined responsibility.

No component should perform work that belongs to another layer.

---

# System Components

## Frontend

Frontend is responsible only for client-side functionality.

Responsibilities:

- Rendering the user interface.
- Navigation and routing.
- User interaction.
- Forms.
- Client-side validation.
- Managing UI state.
- Displaying server data.
- Sending requests to Backend.

Frontend is NOT responsible for:

- Business logic.
- Authentication logic.
- Access to Only P2P.
- Secret keys.
- Database access.
- Financial calculations.
- Security decisions.

Frontend communicates only with Backend.

---

## Backend

Backend is the central component of the system.

Responsibilities:

- User authentication.
- Authorization.
- Session management.
- JWT and Refresh Token management.
- Secure password storage.
- Validation of incoming requests.
- Communication with Only P2P API.
- Mapping internal users to Only P2P users.
- Database operations.
- Error handling.
- Logging.
- API protection.
- Business orchestration.

Backend never exposes internal secrets to the client.

Backend is the only component allowed to communicate with external services.

---

## Database

The database stores only data owned by this project.

Expected entities include:

- Users
- Authentication data
- Sessions
- Refresh Tokens
- User settings
- Internal service data

The database does NOT store:

- Only P2P balances
- Requests
- Bank requisites
- Support conversations
- Financial operations

These remain the responsibility of Only P2P.

---

## Only P2P

Only P2P remains the source of business functionality.

Responsibilities:

- Client balances.
- Top ups.
- Bank requisites.
- Requests.
- Payment processing.
- Proof verification.
- Support operators.

Our project never duplicates this business logic.

---

# Request Flow

Every request follows the same architecture.

```text
User

↓

Frontend

↓

Backend

↓

Only P2P API (if required)

↓

Backend

↓

Frontend

↓

User
```

The Frontend never communicates directly with Only P2P.

---

# Authentication Flow

Authentication exists only inside our Backend.

General flow:

```text
User

↓

Frontend

↓

Backend

↓

Authentication

↓

JWT / Refresh Token

↓

Protected API
```

When Backend needs information from Only P2P, it uses the mapped Only P2P user identifier associated with the authenticated user.

Frontend never stores or manages Only P2P credentials.

---

# Source of Truth

Different types of data belong to different systems.

| Data | Source of Truth |
|------|-----------------|
| Users | PostgreSQL |
| Passwords | PostgreSQL |
| Authentication | Backend |
| Sessions | Backend |
| User Settings | PostgreSQL |
| Only P2P User ID | PostgreSQL |
| Balance | Only P2P |
| Bank Requisites | Only P2P |
| Requests | Only P2P |
| Support Messages | Only P2P |

Data must never be duplicated without a documented reason.

---

# Responsibility Boundaries

## Frontend knows

- Backend API.
- UI state.
- Validation rules required for user experience.

Frontend does NOT know:

- Only P2P endpoints.
- api_id.
- secret_key.
- Internal Backend implementation.
- Database structure.

---

## Backend knows

- Internal database.
- Authentication.
- Only P2P API.
- External credentials.
- Business workflow.

Backend does NOT know:

- UI implementation.
- Styling.
- Component hierarchy.

---

## Only P2P knows

- Financial operations.
- Client balances.
- Requests.
- Support.

Only P2P does NOT know:

- Our authentication.
- Our database.
- Our frontend.
- Internal project implementation.

---

# Architectural Principles

The following principles apply to every module.

## Single Responsibility

Every module should have one clearly defined responsibility.

---

## Separation of Concerns

Presentation, business orchestration and persistence must remain separated.

---

## Security First

Security has priority over development speed.

Whenever there is a conflict between convenience and security, the secure solution must be chosen.

---

## Production Ready

Temporary architectural shortcuts are not allowed.

Every implemented solution should be suitable for production use.

---

## Documentation First

Architectural decisions must be documented before implementation.

Documentation is considered the primary source of project knowledge.

---

# Scalability

The architecture should allow future extension without redesign.

Examples include:

- Adding new payment providers.
- Adding additional external APIs.
- Adding an administration panel.
- Adding background jobs.
- Adding notification services.

Existing modules should require minimal modification.

---

# Architectural Constraints

The following rules are mandatory.

- Frontend never communicates directly with Only P2P.
- Backend is the only owner of external API credentials.
- Every external request passes through Backend.
- Every external request is validated.
- Every architectural change must be reflected in documentation.
- Every new module must follow the established architecture.
- Business logic must not be duplicated if it already exists in Only P2P.
- Secret keys must never leave Backend.

---

# Out of Scope

The architecture intentionally does not define:

- Concrete framework implementation.
- Folder structure.
- Technology-specific decisions.
- Database schema.
- API endpoint implementation.

These topics are documented separately.

---

# Future Evolution

This architecture is designed to evolve.

Implementation details may change during development.

Architectural principles defined in this document should remain stable throughout the lifetime of the project.

Any change affecting responsibilities or interaction between system components requires updating this document before implementation.