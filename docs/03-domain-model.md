# Domain Model

## Purpose

This document describes the business entities of the OP2P White Label project.

It defines:

- the concepts that exist within the system;
- the responsibility of each entity;
- relationships between entities;
- ownership of business data;
- lifecycle of major entities.

This document intentionally avoids implementation details such as database schemas, ORM models or API payloads.

It describes the domain, not the implementation.

---

# Living Document

The Domain Model is a living document.

Whenever the project requirements, external APIs or business processes change, this document must be updated before implementation.

Implementation should always follow the current version of the Domain Model.

---

# Domain Principles

The following principles apply to every entity.

- Every entity has one clear responsibility.
- Every entity has a single source of truth.
- Every entity has one owning system.
- Business entities are independent from implementation details.
- The same business concept must never be represented by multiple unrelated entities.

---

# Entity Ownership

Every entity belongs to exactly one owner.

Possible owners include:

- Backend
- Database
- Only P2P
- Frontend (temporary UI state only)

Ownership defines which system is allowed to modify the entity.

---

# Source of Truth

Every business entity has one authoritative source.

Data may be cached or temporarily stored for performance reasons, but only one system is considered the source of truth.

Duplicate ownership is prohibited.

---

# Core Entities

The project is expected to contain the following categories of entities.

## Identity

Represents authenticated users of the platform.

Typical responsibilities include:

- authentication;
- authorization;
- profile information;
- relationship with external systems.

Identity is owned by Backend.

---

## Session

Represents an authenticated user session.

Responsibilities include:

- authentication state;
- access control;
- session lifecycle.

Session data belongs to Backend.

---

## User Preferences

Represents user-specific settings that belong exclusively to this project.

Examples may include:

- language;
- interface preferences;
- application settings.

Business data from external systems must not be stored here.

---

## External Client

Represents the connection between this project and an external business system.

Responsibilities include:

- mapping internal users;
- maintaining relationships with external identifiers.

This entity belongs to Backend.

---

## Financial State

Represents financial information displayed to the user.

Examples may include:

- balance;
- reserved funds;
- statistics.

Financial calculations remain the responsibility of the external business system.

The project displays this information but does not own it.

---

## Funding

Represents operations related to increasing account balance.

The implementation may change depending on available payment methods.

Business processing belongs to the external provider.

---

## Payment Details

Represents user payment information required by the business platform.

Validation, lifecycle and business rules are defined by the external system.

---

## Transaction

Represents business operations performed by the external platform.

The project may display transaction information but is not responsible for executing business logic.

---

## Evidence

Represents supporting files or documents uploaded during dispute resolution or similar workflows.

Validation and secure storage are handled by Backend.

Business interpretation belongs to the external platform.

---

## Support

Represents communication between users and the support system.

The project acts as an interface while the business workflow is handled externally.

---

# Relationships

The exact implementation may evolve.

Conceptually the relationships are expected to follow these principles.

A user may have:

- one identity;
- one active authentication context;
- multiple business operations;
- multiple payment details;
- multiple support interactions.

External business entities remain associated with exactly one authenticated user.

---

# Entity Lifecycle

Every business entity has a lifecycle.

Typical lifecycle stages include:

- creation;
- update;
- active state;
- inactive state;
- completion;
- archival or removal.

Concrete lifecycle stages are defined by the corresponding business workflow and may evolve with project requirements.

---

# State Management

Every entity should exist in exactly one valid state at any point in time.

State transitions must be explicit.

Invalid transitions must be rejected by Backend.

Frontend should never assume state changes without confirmation from Backend.

---

# Business Rules

Business rules belong to the owner of the entity.

Examples:

- Authentication rules belong to Backend.
- Financial rules belong to Only P2P.
- Presentation rules belong to Frontend.

Business logic must never be duplicated across multiple layers.

---

# Data Persistence

Not every entity requires permanent storage.

Entities may be:

- persistent;
- temporary;
- derived from external systems;
- cached.

Persistence strategy is an implementation detail and is documented separately.

---

# Extensibility

The model is designed to evolve.

New entities may be introduced without redesigning existing concepts.

Extensions should:

- follow existing naming conventions;
- define ownership;
- define source of truth;
- define relationships;
- define lifecycle.

---

# Out of Scope

This document intentionally does not define:

- database schema;
- ORM models;
- API contracts;
- frontend components;
- backend services;
- folder structure;
- implementation technologies.

These topics are documented separately.

---

# Consistency Rules

When introducing a new business entity, the following questions must always be answered:

1. What problem does the entity solve?
2. Who owns the entity?
3. What is its source of truth?
4. Which other entities does it relate to?
5. What is its lifecycle?
6. Is permanent storage required?
7. Which system is allowed to modify it?

No new entity should be introduced until these questions have documented answers.

---

# Future Evolution

The business model is expected to evolve during the lifetime of the project.

Changes may be introduced due to:

- new customer requirements;
- external API changes;
- additional integrations;
- new business workflows;
- platform growth.

Whenever the domain changes, this document must be updated before implementation begins.